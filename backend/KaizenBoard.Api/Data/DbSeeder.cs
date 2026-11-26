using KaizenBoard.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace KaizenBoard.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        if (await db.Departments.AnyAsync())
            return;

        var depProd = new Department { Name = "Производственный цех №1" };
        var depEng = new Department { Name = "Конструкторско-технологический отдел" };
        var depLog = new Department { Name = "Логистика и склад" };
        var depSafety = new Department { Name = "Охрана труда и качество" };

        db.Departments.AddRange(depProd, depEng, depLog, depSafety);
        await db.SaveChangesAsync();

        var defaultPassword = BCrypt.Net.BCrypt.HashPassword("kaizen123");

        var author = new User
        {
            FullName = "Иван Петров",
            Email = "author@plasma.ru",
            PasswordHash = defaultPassword,
            Role = UserRole.Author,
            DepartmentId = depProd.Id
        };
        var head = new User
        {
            FullName = "Алексей Смирнов",
            Email = "head@plasma.ru",
            PasswordHash = defaultPassword,
            Role = UserRole.DepartmentHead,
            DepartmentId = depProd.Id
        };
        var expert = new User
        {
            FullName = "Елена Волкова",
            Email = "expert@plasma.ru",
            PasswordHash = defaultPassword,
            Role = UserRole.Expert,
            DepartmentId = depEng.Id
        };
        var coordinator = new User
        {
            FullName = "Ольга Соколова",
            Email = "coordinator@plasma.ru",
            PasswordHash = defaultPassword,
            Role = UserRole.Coordinator,
            DepartmentId = depSafety.Id
        };
        var admin = new User
        {
            FullName = "Дмитрий Кузнецов",
            Email = "admin@plasma.ru",
            PasswordHash = defaultPassword,
            Role = UserRole.Admin,
            DepartmentId = depEng.Id
        };

        db.Users.AddRange(author, head, expert, coordinator, admin);
        await db.SaveChangesAsync();

        var now = DateTime.UtcNow;

        var p1 = new Proposal
        {
            Title = "Цветовая маркировка оснастки на участке плазменной резки",
            Problem = "Операторы тратят 10–15 минут в смену на поиск нужных сопел и электродов в общем шкафу.",
            Idea = "Внедрить теневую доску с цветовой маркировкой по диаметру сопла и закрепить ячейки за каждым станком.",
            ExpectedEffect = "Сокращение времени переналадки на 12 минут в смену, снижение числа ошибок установки оснастки.",
            Status = ProposalStatus.UnderReview,
            DepartmentId = depProd.Id,
            AuthorId = author.Id,
            CreatedAt = now.AddDays(-8),
            UpdatedAt = now.AddDays(-8),
            StatusChangedAt = now.AddDays(-8)
        };

        var p2 = new Proposal
        {
            Title = "QR-бирки для быстрого списания расходников со склада",
            Problem = "Списание комплектующих ведется на бумажных бланках, данные попадают в учет с задержкой 2–3 дня.",
            Idea = "Разместить QR-коды на стеллажах и сканировать их при выдаче со склада в цех.",
            ExpectedEffect = "Актуальные остатки в реальном времени и экономия 4 часов работы кладовщика в неделю.",
            Status = ProposalStatus.UnderExpertise,
            DepartmentId = depLog.Id,
            AuthorId = author.Id,
            CreatedAt = now.AddDays(-5),
            UpdatedAt = now.AddDays(-3),
            StatusChangedAt = now.AddDays(-3)
        };

        var p3 = new Proposal
        {
            Title = "Чек-лист ежедневной проверки вентиляции перед запуском смены",
            Problem = "Засорение фильтров выявляется только после снижения тяги во время работы.",
            Idea = "Добавить короткий чек-лист из 4 пунктов с контролем перепада давления перед началом смены.",
            ExpectedEffect = "Снижение внеплановых простоев оборудования и улучшение условий труда.",
            Status = ProposalStatus.InProgress,
            DepartmentId = depSafety.Id,
            AuthorId = head.Id,
            AssigneeId = author.Id,
            ExpertEffectAssessment = "Высокий эффект: предотвращает простой линии стоимостью ~45 тыс. руб./смена.",
            ExpertRiskAssessment = "Низкий риск, дополнительных закупок не требуется.",
            CreatedAt = now.AddDays(-14),
            UpdatedAt = now.AddDays(-2),
            StatusChangedAt = now.AddDays(-2)
        };

        var p4 = new Proposal
        {
            Title = "Стандартизация шаблона маршрутной карты изделия",
            Problem = "Разные технологи оформляют примечания в разных местах, сборщики пропускают важные допуски.",
            Idea = "Утвердить единый шаблон маршрутной карты с выделенным блоком критических допусков.",
            ExpectedEffect = "Снижение брака при сборке на 15%.",
            Status = ProposalStatus.Implemented,
            DepartmentId = depEng.Id,
            AuthorId = expert.Id,
            AssigneeId = expert.Id,
            ExpertEffectAssessment = "Подтверждено снижение возвратов на доработку.",
            ExpertRiskAssessment = "Риски отсутствуют.",
            CreatedAt = now.AddDays(-25),
            UpdatedAt = now.AddDays(-4),
            StatusChangedAt = now.AddDays(-4)
        };

        db.Proposals.AddRange(p1, p2, p3, p4);
        await db.SaveChangesAsync();

        db.ProposalHistory.AddRange(
            new ProposalHistory
            {
                ProposalId = p1.Id,
                FromStatus = ProposalStatus.Draft,
                ToStatus = ProposalStatus.UnderReview,
                ChangedById = author.Id,
                Comment = "Отправлено на рассмотрение",
                CreatedAt = p1.CreatedAt
            },
            new ProposalHistory
            {
                ProposalId = p2.Id,
                FromStatus = ProposalStatus.UnderReview,
                ToStatus = ProposalStatus.UnderExpertise,
                ChangedById = head.Id,
                Comment = "Передано технологу на оценку эффекта",
                CreatedAt = p2.StatusChangedAt
            },
            new ProposalHistory
            {
                ProposalId = p3.Id,
                FromStatus = ProposalStatus.Accepted,
                ToStatus = ProposalStatus.InProgress,
                ChangedById = coordinator.Id,
                Comment = "Назначен ответственный за внедрение",
                CreatedAt = p3.StatusChangedAt
            }
        );

        db.Comments.Add(new Comment
        {
            ProposalId = p2.Id,
            AuthorId = expert.Id,
            Text = "Хорошая инициатива, уточню совместимость сканеров с текущим складом и оставлю оценку.",
            CreatedAt = now.AddDays(-2)
        });

        db.Notifications.Add(new Notification
        {
            UserId = author.Id,
            ProposalId = p2.Id,
            Message = "Ваше предложение «QR-бирки для быстрого списания расходников со склада» переведено в статус «На экспертизе».",
            IsRead = false,
            CreatedAt = now.AddDays(-3)
        });

        await db.SaveChangesAsync();
    }
}
