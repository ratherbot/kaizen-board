using KaizenBoard.Api.Domain;

namespace KaizenBoard.Api.Dtos;

public record LoginRequest(string Email, string Password);

public record AuthResponse(string Token, UserDto User);

public record DepartmentDto(int Id, string Name);

public record UserDto(
    int Id,
    string FullName,
    string Email,
    UserRole Role,
    int DepartmentId,
    string DepartmentName,
    bool IsActive
);

public record CreateUserRequest(
    string FullName,
    string Email,
    string Password,
    UserRole Role,
    int DepartmentId
);

public record UpdateUserRequest(
    string FullName,
    UserRole Role,
    int DepartmentId,
    bool IsActive
);

public record CreateDepartmentRequest(string Name);

public record AvailableTransitionDto(
    ProposalStatus TargetStatus,
    string Label,
    bool RequiresComment,
    bool AllowsAssignee
);

public record ProposalListItemDto(
    int Id,
    string Title,
    string Problem,
    string ExpectedEffect,
    ProposalStatus Status,
    int DepartmentId,
    string DepartmentName,
    int AuthorId,
    string AuthorName,
    int? AssigneeId,
    string? AssigneeName,
    DateTime CreatedAt,
    DateTime StatusChangedAt,
    bool IsOverdue,
    int CommentsCount
);

public record ProposalHistoryDto(
    int Id,
    ProposalStatus FromStatus,
    ProposalStatus ToStatus,
    int ChangedById,
    string ChangedByName,
    string? Comment,
    DateTime CreatedAt
);

public record CommentDto(
    int Id,
    int AuthorId,
    string AuthorName,
    UserRole AuthorRole,
    string Text,
    DateTime CreatedAt
);

public record ProposalDetailDto(
    int Id,
    string Title,
    string Problem,
    string Idea,
    string ExpectedEffect,
    ProposalStatus Status,
    int DepartmentId,
    string DepartmentName,
    int AuthorId,
    string AuthorName,
    int? AssigneeId,
    string? AssigneeName,
    string? ExpertEffectAssessment,
    string? ExpertRiskAssessment,
    string? RejectionReason,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime StatusChangedAt,
    bool IsOverdue,
    bool CanEdit,
    bool CanAssess,
    List<AvailableTransitionDto> AvailableTransitions,
    List<ProposalHistoryDto> History,
    List<CommentDto> Comments
);

public record CreateProposalRequest(
    string Title,
    string Problem,
    string Idea,
    string ExpectedEffect,
    int DepartmentId,
    bool SubmitImmediately
);

public record UpdateProposalRequest(
    string Title,
    string Problem,
    string Idea,
    string ExpectedEffect,
    int DepartmentId
);

public record TransitionProposalRequest(
    ProposalStatus TargetStatus,
    string? Comment,
    int? AssigneeId
);

public record ExpertAssessmentRequest(
    string EffectAssessment,
    string RiskAssessment
);

public record AddCommentRequest(string Text);

public record NotificationDto(
    int Id,
    int? ProposalId,
    string Message,
    bool IsRead,
    DateTime CreatedAt
);

public record StatusCountDto(ProposalStatus Status, int Count);

public record DashboardSummaryDto(
    int TotalProposals,
    int ImplementedCount,
    int InWorkCount,
    int OverdueReviewCount,
    double ConversionRatePercent,
    double AverageReviewDays,
    List<StatusCountDto> ByStatus
);
