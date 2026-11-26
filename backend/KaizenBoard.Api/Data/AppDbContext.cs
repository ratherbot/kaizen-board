using KaizenBoard.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace KaizenBoard.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Proposal> Proposals => Set<Proposal>();
    public DbSet<ProposalHistory> ProposalHistory => Set<ProposalHistory>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Department>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<User>(e =>
        {
            e.Property(x => x.FullName).HasMaxLength(200).IsRequired();
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();
            e.HasOne(x => x.Department)
                .WithMany(d => d.Users)
                .HasForeignKey(x => x.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Proposal>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(250).IsRequired();
            e.Property(x => x.Problem).IsRequired();
            e.Property(x => x.Idea).IsRequired();
            e.Property(x => x.ExpectedEffect).IsRequired();

            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.DepartmentId);
            e.HasIndex(x => x.AuthorId);

            e.HasOne(x => x.Department)
                .WithMany(d => d.Proposals)
                .HasForeignKey(x => x.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Author)
                .WithMany()
                .HasForeignKey(x => x.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Assignee)
                .WithMany()
                .HasForeignKey(x => x.AssigneeId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ProposalHistory>(e =>
        {
            e.HasOne(x => x.Proposal)
                .WithMany(p => p.History)
                .HasForeignKey(x => x.ProposalId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.ChangedBy)
                .WithMany()
                .HasForeignKey(x => x.ChangedById)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Comment>(e =>
        {
            e.Property(x => x.Text).IsRequired();
            e.HasOne(x => x.Proposal)
                .WithMany(p => p.Comments)
                .HasForeignKey(x => x.ProposalId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Author)
                .WithMany()
                .HasForeignKey(x => x.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Notification>(e =>
        {
            e.Property(x => x.Message).HasMaxLength(500).IsRequired();
            e.HasIndex(x => new { x.UserId, x.IsRead });

            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Proposal)
                .WithMany()
                .HasForeignKey(x => x.ProposalId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
