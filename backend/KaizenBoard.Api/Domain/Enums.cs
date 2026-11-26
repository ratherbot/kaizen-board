namespace KaizenBoard.Api.Domain;

public enum UserRole
{
    Author = 1,
    DepartmentHead = 2,
    Expert = 3,
    Coordinator = 4,
    Admin = 5
}

public enum ProposalStatus
{
    Draft = 1,           // Черновик
    UnderReview = 2,     // На рассмотрении
    NeedsRevision = 3,   // На доработке
    UnderExpertise = 4,  // На экспертизе
    Accepted = 5,        // Принято в работу
    InProgress = 6,      // Внедряется
    Implemented = 7,     // Внедрено
    Rejected = 8         // Отклонено
}
