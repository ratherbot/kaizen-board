using KaizenBoard.Api.Data;
using KaizenBoard.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace KaizenBoard.Api.Services;

public class OverdueCheckBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<OverdueCheckBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckOverdueProposalsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ошибка при проверке просроченных предложений");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task CheckOverdueProposalsAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;
        var candidates = await db.Proposals
            .Where(p => p.Status == ProposalStatus.UnderReview && !p.OverdueNotified)
            .ToListAsync(ct);

        var overdue = candidates.Where(p => ProposalWorkflowService.IsOverdue(p, now)).ToList();
        if (overdue.Count == 0)
            return;

        var coordinators = await db.Users
            .Where(u => u.Role == UserRole.Coordinator && u.IsActive)
            .Select(u => u.Id)
            .ToListAsync(ct);

        foreach (var proposal in overdue)
        {
            proposal.OverdueNotified = true;
            foreach (var coordId in coordinators)
            {
                db.Notifications.Add(new Notification
                {
                    UserId = coordId,
                    ProposalId = proposal.Id,
                    Message = $"Напоминание: предложение «{proposal.Title}» находится на рассмотрении более 5 рабочих дней."
                });
            }
        }

        await db.SaveChangesAsync(ct);
    }
}
