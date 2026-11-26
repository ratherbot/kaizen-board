using KaizenBoard.Api.Domain;
using KaizenBoard.Api.Dtos;

namespace KaizenBoard.Api.Services;

public record TransitionRule(
    ProposalStatus From,
    ProposalStatus To,
    string Label,
    UserRole[] AllowedRoles,
    bool RequiresComment = false,
    bool AllowsAssignee = false,
    bool OnlyAuthor = false,
    bool OnlyAssignee = false
);

public class ProposalWorkflowService
{
    private static readonly IReadOnlyList<TransitionRule> Rules =
    [
        new(ProposalStatus.Draft, ProposalStatus.UnderReview, "Отправить на рассмотрение",
            [UserRole.Author, UserRole.DepartmentHead, UserRole.Expert, UserRole.Coordinator, UserRole.Admin],
            OnlyAuthor: true),

        new(ProposalStatus.UnderReview, ProposalStatus.UnderExpertise, "Направить на экспертизу",
            [UserRole.DepartmentHead, UserRole.Coordinator]),
        new(ProposalStatus.UnderReview, ProposalStatus.NeedsRevision, "Вернуть на доработку",
            [UserRole.DepartmentHead, UserRole.Coordinator], RequiresComment: true),
        new(ProposalStatus.UnderReview, ProposalStatus.Rejected, "Отклонить",
            [UserRole.DepartmentHead, UserRole.Coordinator], RequiresComment: true),

        new(ProposalStatus.NeedsRevision, ProposalStatus.UnderReview, "Повторно отправить на рассмотрение",
            [UserRole.Author, UserRole.DepartmentHead, UserRole.Expert, UserRole.Coordinator, UserRole.Admin],
            OnlyAuthor: true),

        new(ProposalStatus.UnderExpertise, ProposalStatus.Accepted, "Принять в работу",
            [UserRole.Expert, UserRole.Coordinator], AllowsAssignee: true),
        new(ProposalStatus.UnderExpertise, ProposalStatus.Rejected, "Отклонить",
            [UserRole.Expert, UserRole.Coordinator], RequiresComment: true),

        new(ProposalStatus.Accepted, ProposalStatus.InProgress, "Передать во внедрение",
            [UserRole.Coordinator, UserRole.DepartmentHead], AllowsAssignee: true),

        new(ProposalStatus.InProgress, ProposalStatus.Implemented, "Отметить как внедрено",
            [UserRole.Coordinator, UserRole.DepartmentHead, UserRole.Author, UserRole.Expert],
            OnlyAssignee: true)
    ];

    public static bool IsOverdue(Proposal proposal, DateTime utcNow)
    {
        if (proposal.Status != ProposalStatus.UnderReview)
            return false;

        return CountBusinessDays(proposal.StatusChangedAt.Date, utcNow.Date) > 5;
    }

    public static int CountBusinessDays(DateTime startDate, DateTime endDate)
    {
        if (endDate <= startDate)
            return 0;

        int businessDays = 0;
        var current = startDate.AddDays(1);
        while (current <= endDate)
        {
            if (current.DayOfWeek is not DayOfWeek.Saturday and not DayOfWeek.Sunday)
                businessDays++;
            current = current.AddDays(1);
        }

        return businessDays;
    }

    public List<AvailableTransitionDto> GetAvailableTransitions(Proposal proposal, int userId, UserRole role)
    {
        var result = new List<AvailableTransitionDto>();

        foreach (var rule in Rules.Where(r => r.From == proposal.Status))
        {
            if (IsAllowed(rule, proposal, userId, role))
            {
                result.Add(new AvailableTransitionDto(
                    rule.To,
                    rule.Label,
                    rule.RequiresComment,
                    rule.AllowsAssignee
                ));
            }
        }

        return result;
    }

    public (bool IsValid, string? Error, TransitionRule? Rule) ValidateTransition(
        Proposal proposal,
        ProposalStatus targetStatus,
        int userId,
        UserRole role,
        string? comment)
    {
        var rule = Rules.FirstOrDefault(r => r.From == proposal.Status && r.To == targetStatus);
        if (rule is null)
            return (false, $"Переход из статуса {proposal.Status} в {targetStatus} не предусмотрен маршрутом.", null);

        if (!IsAllowed(rule, proposal, userId, role))
            return (false, "У вашей роли недостаточно прав для выполнения этого перехода.", null);

        if (rule.RequiresComment && string.IsNullOrWhiteSpace(comment))
            return (false, "Для данного перехода обязательно указать причину в комментарии.", null);

        return (true, null, rule);
    }

    private static bool IsAllowed(TransitionRule rule, Proposal proposal, int userId, UserRole role)
    {
        if (role == UserRole.Coordinator)
            return true;

        if (!rule.AllowedRoles.Contains(role))
            return false;

        if (rule.OnlyAuthor && proposal.AuthorId != userId)
            return false;

        if (rule.OnlyAssignee && proposal.AssigneeId != userId && role != UserRole.DepartmentHead)
            return false;

        return true;
    }

    public static string GetStatusRussianName(ProposalStatus status) => status switch
    {
        ProposalStatus.Draft => "Черновик",
        ProposalStatus.UnderReview => "На рассмотрении",
        ProposalStatus.NeedsRevision => "На доработке",
        ProposalStatus.UnderExpertise => "На экспертизе",
        ProposalStatus.Accepted => "Принято в работу",
        ProposalStatus.InProgress => "Внедряется",
        ProposalStatus.Implemented => "Внедрено",
        ProposalStatus.Rejected => "Отклонено",
        _ => status.ToString()
    };
}
