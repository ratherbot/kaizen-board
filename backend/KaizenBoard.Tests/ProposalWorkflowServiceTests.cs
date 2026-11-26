using KaizenBoard.Api.Domain;
using KaizenBoard.Api.Services;
using Xunit;

namespace KaizenBoard.Tests;

public class ProposalWorkflowServiceTests
{
    private readonly ProposalWorkflowService _workflow = new();

    [Fact]
    public void Reject_WithoutComment_ShouldFail()
    {
        var proposal = new Proposal
        {
            Id = 1,
            AuthorId = 10,
            Status = ProposalStatus.UnderReview
        };

        var (isValid, error, _) = _workflow.ValidateTransition(
            proposal,
            ProposalStatus.Rejected,
            userId: 20,
            role: UserRole.DepartmentHead,
            comment: "   ");

        Assert.False(isValid);
        Assert.NotNull(error);
    }

    [Fact]
    public void Reject_WithComment_ByDepartmentHead_ShouldSucceed()
    {
        var proposal = new Proposal
        {
            Id = 1,
            AuthorId = 10,
            Status = ProposalStatus.UnderReview
        };

        var (isValid, error, _) = _workflow.ValidateTransition(
            proposal,
            ProposalStatus.Rejected,
            userId: 20,
            role: UserRole.DepartmentHead,
            comment: "Дублирует действующий стандарт цеха");

        Assert.True(isValid);
        Assert.Null(error);
    }

    [Fact]
    public void Author_CannotMoveDirectlyToImplemented()
    {
        var proposal = new Proposal
        {
            Id = 1,
            AuthorId = 10,
            Status = ProposalStatus.UnderReview
        };

        var (isValid, _, _) = _workflow.ValidateTransition(
            proposal,
            ProposalStatus.Implemented,
            userId: 10,
            role: UserRole.Author,
            comment: null);

        Assert.False(isValid);
    }

    [Fact]
    public void OverdueCheck_ShouldCountOnlyBusinessDays()
    {
        // Понедельник -> следующий понедельник = 5 рабочих дней (не просрочено)
        var monday = new DateTime(2026, 11, 2, 10, 0, 0, DateTimeKind.Utc);
        var nextMonday = new DateTime(2026, 11, 9, 10, 0, 0, DateTimeKind.Utc);
        var nextTuesday = new DateTime(2026, 11, 10, 10, 0, 0, DateTimeKind.Utc);

        var proposal = new Proposal
        {
            Status = ProposalStatus.UnderReview,
            StatusChangedAt = monday
        };

        Assert.False(ProposalWorkflowService.IsOverdue(proposal, nextMonday));
        Assert.True(ProposalWorkflowService.IsOverdue(proposal, nextTuesday));
    }
}
