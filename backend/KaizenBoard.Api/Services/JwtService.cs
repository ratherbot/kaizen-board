using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KaizenBoard.Api.Domain;
using Microsoft.IdentityModel.Tokens;

namespace KaizenBoard.Api.Services;

public class JwtService(IConfiguration configuration)
{
    public string GenerateToken(User user)
    {
        var key = configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing");
        var issuer = configuration["Jwt:Issuer"] ?? "KaizenBoard.Api";
        var audience = configuration["Jwt:Audience"] ?? "KaizenBoard.Web";
        var expireHours = int.TryParse(configuration["Jwt:ExpireHours"], out var h) ? h : 24;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("department_id", user.DepartmentId.ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expireHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
