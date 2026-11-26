using System.Security.Claims;
using KaizenBoard.Api.Data;
using KaizenBoard.Api.Dtos;
using KaizenBoard.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KaizenBoard.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, JwtService jwtService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Неверный e-mail или пароль." });

        var token = jwtService.GenerateToken(user);
        return Ok(new AuthResponse(token, new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.DepartmentId,
            user.Department.Name,
            user.IsActive
        )));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return Unauthorized();

        return Ok(new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.DepartmentId,
            user.Department.Name,
            user.IsActive
        ));
    }
}
