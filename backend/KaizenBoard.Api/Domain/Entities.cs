namespace KaizenBoard.Api.Domain;

public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
}

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Author;
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class Proposal
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Problem { get; set; } = string.Empty;
    public string Idea { get; set; } = string.Empty;
    public string ExpectedEffect { get; set; } = string.Empty;
    public ProposalStatus Status { get; set; } = ProposalStatus.Draft;

    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public int? AssigneeId { get; set; }
    public User? Assignee { get; set; }

    public string? ExpertEffectAssessment { get; set; }
    public string? ExpertRiskAssessment { get; set; }
    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime StatusChangedAt { get; set; } = DateTime.UtcNow;
    public bool OverdueNotified { get; set; }

    public ICollection<ProposalHistory> History { get; set; } = new List<ProposalHistory>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}

public class ProposalHistory
{
    public int Id { get; set; }
    public int ProposalId { get; set; }
    public Proposal Proposal { get; set; } = null!;

    public ProposalStatus FromStatus { get; set; }
    public ProposalStatus ToStatus { get; set; }

    public int ChangedById { get; set; }
    public User ChangedBy { get; set; } = null!;

    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Comment
{
    public int Id { get; set; }
    public int ProposalId { get; set; }
    public Proposal Proposal { get; set; } = null!;

    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? ProposalId { get; set; }
    public Proposal? Proposal { get; set; }

    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
