using KaizenBoard.Api.Data;
using KaizenBoard.Api.Domain;
using KaizenBoard.Api.Dtos;
using KaizenBoard.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KaizenBoard.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = $"{nameof(UserRole.Coordinator)},{nameof(UserRole.DepartmentHead)},{nameof(UserRole.Admin)}")]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
    {
        var proposals = await db.Proposals
            .Include(p => p.History)
            .Where(p => p.Status != ProposalStatus.Draft)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var total = proposals.Count;
        var implemented = proposals.Count(p => p.Status == ProposalStatus.Implemented);
        var inWork = proposals.Count(p => p.Status is ProposalStatus.Accepted or ProposalStatus.InProgress);
        var overdue = proposals.Count(p => ProposalWorkflowService.IsOverdue(p, now));

        var conversion = total == 0 ? 0 : Math.Round((double)implemented / total * 100, 1);

        var reviewDurations = new List<double>();
        foreach (var p in proposals)
        {
            var decision = p.History
                .Where(h => h.FromStatus == ProposalStatus.UnderReview)
                .OrderBy(h => h.CreatedAt)
                .FirstOrDefault();

            if (decision is not null)
            {
                reviewDurations.Add(Math.Max(0.1, (decision.CreatedAt - p.CreatedAt).TotalDays));
            }
        }

        var avgReviewDays = reviewDurations.Count == 0
            ? 0
            : Math.Round(reviewDurations.Average(), 1);

        var byStatus = Enum.GetValues<ProposalStatus>()
            .Select(s => new StatusCountDto(s, proposals.Count(p => p.Status == s)))
            .ToList();

        return Ok(new DashboardSummaryDto(
            total,
            implemented,
            inWork,
            overdue,
            conversion,
            avgReviewDays,
            byStatus
        ));
    }
}
