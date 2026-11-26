using System.Security.Claims;
using KaizenBoard.Api.Data;
using KaizenBoard.Api.Domain;
using KaizenBoard.Api.Dtos;
using KaizenBoard.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KaizenBoard.Api.Controllers;

[ApiController]
[Route("api/proposals")]
[Authorize]
public class ProposalsController(AppDbContext db, ProposalWorkflowService workflow) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private UserRole CurrentUserRole => Enum.Parse<UserRole>(User.FindFirstValue(ClaimTypes.Role)!);

    [HttpGet]
    public async Task<ActionResult<List<ProposalListItemDto>>> GetAll(
        [FromQuery] ProposalStatus? status,
        [FromQuery] int? departmentId,
        [FromQuery] int? authorId,
        [FromQuery] string? search,
        [FromQuery] bool onlyMine = false,
        [FromQuery] bool onlyOverdue = false)
    {
        var userId = CurrentUserId;
        var role = CurrentUserRole;

        var query = db.Proposals
            .Include(p => p.Department)
            .Include(p => p.Author)
            .Include(p => p.Assignee)
            .Include(p => p.Comments)
            .AsQueryable();

        // Черновики видит только автор (и координатор/администратор)
        if (role is not UserRole.Coordinator and not UserRole.Admin)
        {
            query = query.Where(p => p.Status != ProposalStatus.Draft || p.AuthorId == userId);
        }

        if (onlyMine)
            query = query.Where(p => p.AuthorId == userId);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (departmentId.HasValue)
            query = query.Where(p => p.DepartmentId == departmentId.Value);

        if (authorId.HasValue)
            query = query.Where(p => p.AuthorId == authorId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(term) ||
                p.Problem.ToLower().Contains(term) ||
                p.Idea.ToLower().Contains(term));
        }

        var items = await query
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var result = items
            .Select(p => new ProposalListItemDto(
                p.Id,
                p.Title,
                p.Problem,
                p.ExpectedEffect,
                p.Status,
                p.DepartmentId,
                p.Department.Name,
                p.AuthorId,
                p.Author.FullName,
                p.AssigneeId,
                p.Assignee?.FullName,
                p.CreatedAt,
                p.StatusChangedAt,
                ProposalWorkflowService.IsOverdue(p, now),
                p.Comments.Count
            ))
            .Where(dto => !onlyOverdue || dto.IsOverdue)
            .ToList();

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProposalDetailDto>> GetById(int id)
    {
        var proposal = await LoadProposalDetailAsync(id);
        if (proposal is null)
            return NotFound(new { message = "Предложение не найдено." });

        var userId = CurrentUserId;
        var role = CurrentUserRole;

        if (proposal.Status == ProposalStatus.Draft &&
            proposal.AuthorId != userId &&
            role is not UserRole.Coordinator and not UserRole.Admin)
        {
            return Forbid();
        }

        return Ok(MapToDetailDto(proposal, userId, role));
    }

    [HttpPost]
    public async Task<ActionResult<ProposalDetailDto>> Create([FromBody] CreateProposalRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) ||
            string.IsNullOrWhiteSpace(request.Problem) ||
            string.IsNullOrWhiteSpace(request.Idea) ||
            string.IsNullOrWhiteSpace(request.ExpectedEffect))
        {
            return BadRequest(new { message = "Заполните все обязательные поля: заголовок, проблема, идея, ожидаемый эффект." });
        }

        var now = DateTime.UtcNow;
        var initialStatus = request.SubmitImmediately ? ProposalStatus.UnderReview : ProposalStatus.Draft;

        var proposal = new Proposal
        {
            Title = request.Title.Trim(),
            Problem = request.Problem.Trim(),
            Idea = request.Idea.Trim(),
            ExpectedEffect = request.ExpectedEffect.Trim(),
            DepartmentId = request.DepartmentId,
            AuthorId = CurrentUserId,
            Status = initialStatus,
            CreatedAt = now,
            UpdatedAt = now,
            StatusChangedAt = now
        };

        db.Proposals.Add(proposal);
        await db.SaveChangesAsync();

        if (request.SubmitImmediately)
        {
            db.ProposalHistory.Add(new ProposalHistory
            {
                ProposalId = proposal.Id,
                FromStatus = ProposalStatus.Draft,
                ToStatus = ProposalStatus.UnderReview,
                ChangedById = CurrentUserId,
                Comment = "Предложение подано на рассмотрение",
                CreatedAt = now
            });

            var heads = await db.Users
                .Where(u => u.Role == UserRole.DepartmentHead && u.DepartmentId == proposal.DepartmentId && u.IsActive)
                .Select(u => u.Id)
                .ToListAsync();

            foreach (var headId in heads)
            {
                db.Notifications.Add(new Notification
                {
                    UserId = headId,
                    ProposalId = proposal.Id,
                    Message = $"Поступило новое кайдзен-предложение: «{proposal.Title}»."
                });
            }

            await db.SaveChangesAsync();
        }

        var loaded = await LoadProposalDetailAsync(proposal.Id);
        return CreatedAtAction(nameof(GetById), new { id = proposal.Id }, MapToDetailDto(loaded!, CurrentUserId, CurrentUserRole));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProposalDetailDto>> Update(int id, [FromBody] UpdateProposalRequest request)
    {
        var proposal = await db.Proposals.FindAsync(id);
        if (proposal is null)
            return NotFound();

        if (proposal.AuthorId != CurrentUserId && CurrentUserRole != UserRole.Coordinator)
            return Forbid();

        if (proposal.Status is not ProposalStatus.Draft and not ProposalStatus.NeedsRevision)
            return BadRequest(new { message = "Редактировать можно только черновик или предложение на доработке." });

        proposal.Title = request.Title.Trim();
        proposal.Problem = request.Problem.Trim();
        proposal.Idea = request.Idea.Trim();
        proposal.ExpectedEffect = request.ExpectedEffect.Trim();
        proposal.DepartmentId = request.DepartmentId;
        proposal.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var loaded = await LoadProposalDetailAsync(id);
        return Ok(MapToDetailDto(loaded!, CurrentUserId, CurrentUserRole));
    }

    [HttpPost("{id:int}/transition")]
    public async Task<ActionResult<ProposalDetailDto>> Transition(int id, [FromBody] TransitionProposalRequest request)
    {
        var proposal = await db.Proposals.FindAsync(id);
        if (proposal is null)
            return NotFound();

        var userId = CurrentUserId;
        var role = CurrentUserRole;

        var (isValid, error, _) = workflow.ValidateTransition(proposal, request.TargetStatus, userId, role, request.Comment);
        if (!isValid)
            return BadRequest(new { message = error });

        var fromStatus = proposal.Status;
        var now = DateTime.UtcNow;

        proposal.Status = request.TargetStatus;
        proposal.UpdatedAt = now;
        proposal.StatusChangedAt = now;
        proposal.OverdueNotified = false;

        if (request.AssigneeId.HasValue)
            proposal.AssigneeId = request.AssigneeId.Value;

        if (request.TargetStatus == ProposalStatus.Rejected)
            proposal.RejectionReason = request.Comment?.Trim();

        db.ProposalHistory.Add(new ProposalHistory
        {
            ProposalId = proposal.Id,
            FromStatus = fromStatus,
            ToStatus = request.TargetStatus,
            ChangedById = userId,
            Comment = request.Comment?.Trim(),
            CreatedAt = now
        });

        await CreateTransitionNotificationsAsync(proposal, request.TargetStatus, userId);
        await db.SaveChangesAsync();

        var loaded = await LoadProposalDetailAsync(id);
        return Ok(MapToDetailDto(loaded!, userId, role));
    }

    [HttpPut("{id:int}/assessment")]
    [Authorize(Roles = $"{nameof(UserRole.Expert)},{nameof(UserRole.Coordinator)}")]
    public async Task<ActionResult<ProposalDetailDto>> UpdateAssessment(int id, [FromBody] ExpertAssessmentRequest request)
    {
        var proposal = await db.Proposals.FindAsync(id);
        if (proposal is null)
            return NotFound();

        proposal.ExpertEffectAssessment = request.EffectAssessment.Trim();
        proposal.ExpertRiskAssessment = request.RiskAssessment.Trim();
        proposal.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var loaded = await LoadProposalDetailAsync(id);
        return Ok(MapToDetailDto(loaded!, CurrentUserId, CurrentUserRole));
    }

    [HttpPost("{id:int}/comments")]
    public async Task<ActionResult<CommentDto>> AddComment(int id, [FromBody] AddCommentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { message = "Текст комментария не может быть пустым." });

        var proposal = await db.Proposals.FindAsync(id);
        if (proposal is null)
            return NotFound();

        var userId = CurrentUserId;
        var comment = new Comment
        {
            ProposalId = id,
            AuthorId = userId,
            Text = request.Text.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        db.Comments.Add(comment);

        if (proposal.AuthorId != userId)
        {
            db.Notifications.Add(new Notification
            {
                UserId = proposal.AuthorId,
                ProposalId = proposal.Id,
                Message = $"Новый комментарий к предложению «{proposal.Title}»."
            });
        }

        await db.SaveChangesAsync();

        var author = await db.Users.FindAsync(userId);
        return Ok(new CommentDto(comment.Id, userId, author!.FullName, author.Role, comment.Text, comment.CreatedAt));
    }

    private async Task<Proposal?> LoadProposalDetailAsync(int id) =>
        await db.Proposals
            .Include(p => p.Department)
            .Include(p => p.Author)
            .Include(p => p.Assignee)
            .Include(p => p.History).ThenInclude(h => h.ChangedBy)
            .Include(p => p.Comments).ThenInclude(c => c.Author)
            .FirstOrDefaultAsync(p => p.Id == id);

    private ProposalDetailDto MapToDetailDto(Proposal p, int userId, UserRole role)
    {
        var canEdit = (p.Status is ProposalStatus.Draft or ProposalStatus.NeedsRevision) &&
                      (p.AuthorId == userId || role == UserRole.Coordinator);
        var canAssess = role is UserRole.Expert or UserRole.Coordinator;

        return new ProposalDetailDto(
            p.Id,
            p.Title,
            p.Problem,
            p.Idea,
            p.ExpectedEffect,
            p.Status,
            p.DepartmentId,
            p.Department.Name,
            p.AuthorId,
            p.Author.FullName,
            p.AssigneeId,
            p.Assignee?.FullName,
            p.ExpertEffectAssessment,
            p.ExpertRiskAssessment,
            p.RejectionReason,
            p.CreatedAt,
            p.UpdatedAt,
            p.StatusChangedAt,
            ProposalWorkflowService.IsOverdue(p, DateTime.UtcNow),
            canEdit,
            canAssess,
            workflow.GetAvailableTransitions(p, userId, role),
            p.History
                .OrderByDescending(h => h.CreatedAt)
                .Select(h => new ProposalHistoryDto(
                    h.Id, h.FromStatus, h.ToStatus, h.ChangedById, h.ChangedBy.FullName, h.Comment, h.CreatedAt))
                .ToList(),
            p.Comments
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentDto(
                    c.Id, c.AuthorId, c.Author.FullName, c.Author.Role, c.Text, c.CreatedAt))
                .ToList()
        );
    }

    private async Task CreateTransitionNotificationsAsync(Proposal proposal, ProposalStatus targetStatus, int actorId)
    {
        var recipients = new HashSet<int>();
        var statusLabel = ProposalWorkflowService.GetStatusRussianName(targetStatus);

        if (proposal.AuthorId != actorId)
            recipients.Add(proposal.AuthorId);

        if (targetStatus == ProposalStatus.InProgress && proposal.AssigneeId.HasValue && proposal.AssigneeId != actorId)
            recipients.Add(proposal.AssigneeId.Value);

        if (targetStatus is ProposalStatus.UnderExpertise or ProposalStatus.Accepted or ProposalStatus.Implemented)
        {
            var heads = await db.Users
                .Where(u => u.Role == UserRole.DepartmentHead && u.DepartmentId == proposal.DepartmentId && u.IsActive)
                .Select(u => u.Id)
                .ToListAsync();
            foreach (var h in heads.Where(h => h != actorId))
                recipients.Add(h);
        }

        if (targetStatus == ProposalStatus.Implemented)
        {
            var coords = await db.Users
                .Where(u => u.Role == UserRole.Coordinator && u.IsActive)
                .Select(u => u.Id)
                .ToListAsync();
            foreach (var c in coords.Where(c => c != actorId))
                recipients.Add(c);
        }

        foreach (var recipientId in recipients)
        {
            db.Notifications.Add(new Notification
            {
                UserId = recipientId,
                ProposalId = proposal.Id,
                Message = $"Предложение «{proposal.Title}» переведено в статус «{statusLabel}»."
            });
        }
    }
}
