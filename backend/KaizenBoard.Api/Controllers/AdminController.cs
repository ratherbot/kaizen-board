using KaizenBoard.Api.Data;
using KaizenBoard.Api.Domain;
using KaizenBoard.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KaizenBoard.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class AdminController(AppDbContext db) : ControllerBase
{
    [HttpGet("departments")]
    public async Task<ActionResult<List<DepartmentDto>>> GetDepartments()
    {
        var list = await db.Departments
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto(d.Id, d.Name))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("departments")]
    [Authorize(Roles = $"{nameof(UserRole.Coordinator)},{nameof(UserRole.Admin)}")]
    public async Task<ActionResult<DepartmentDto>> CreateDepartment([FromBody] CreateDepartmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Название подразделения обязательно." });

        var dep = new Department { Name = request.Name.Trim() };
        db.Departments.Add(dep);
        await db.SaveChangesAsync();
        return Ok(new DepartmentDto(dep.Id, dep.Name));
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        var list = await db.Users
            .Include(u => u.Department)
            .OrderBy(u => u.FullName)
            .Select(u => new UserDto(
                u.Id, u.FullName, u.Email, u.Role, u.DepartmentId, u.Department.Name, u.IsActive))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("users")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email.ToLower() == email))
            return Conflict(new { message = "Пользователь с таким e-mail уже существует." });

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            DepartmentId = request.DepartmentId,
            IsActive = true
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var dep = await db.Departments.FindAsync(user.DepartmentId);
        return Ok(new UserDto(user.Id, user.FullName, user.Email, user.Role, user.DepartmentId, dep!.Name, user.IsActive));
    }

    [HttpPut("users/{id:int}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        var user = await db.Users.Include(u => u.Department).FirstOrDefaultAsync(u => u.Id == id);
        if (user is null)
            return NotFound();

        user.FullName = request.FullName.Trim();
        user.Role = request.Role;
        user.DepartmentId = request.DepartmentId;
        user.IsActive = request.IsActive;

        await db.SaveChangesAsync();
        var dep = await db.Departments.FindAsync(user.DepartmentId);
        return Ok(new UserDto(user.Id, user.FullName, user.Email, user.Role, user.DepartmentId, dep!.Name, user.IsActive));
    }
}
