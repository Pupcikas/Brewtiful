using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Brewtiful.Models;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Cors;
using System.Runtime.InteropServices;


[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IMongoCollection<User> _users;
    private readonly IMongoCollection<Cart> _carts;
    private readonly IConfiguration _configuration;
    private readonly JwtSettings _jwtSettings;

    public AuthController(IMongoClient client, IConfiguration configuration, IOptions<JwtSettings> jwtSettings)
    {
        var database = client.GetDatabase("Brewtiful");
        _users = database.GetCollection<User>("Users");
        _carts = database.GetCollection<Cart>("Carts");
        _configuration = configuration;
        _jwtSettings = jwtSettings.Value;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            Console.WriteLine("registerDto Email: " + registerDto.Email);
            Console.WriteLine("registerDto Password: " + registerDto.Password);
            Console.WriteLine("registerDto Role: " + registerDto.Role);
            Console.WriteLine("registerDto Name: " + registerDto.Name);
            Console.WriteLine("registerDto Username: " + registerDto.Username);


            if (registerDto == null || string.IsNullOrEmpty(registerDto.Email) || string.IsNullOrEmpty(registerDto.Password))
            {
                return BadRequest(new { message = "Email and password are required." });
            }

            var existingUser = await _users.Find(u => u.Email == registerDto.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return BadRequest(new { message = "User already exists." });
            }

            var role = string.IsNullOrEmpty(registerDto.Role) ? "User" : registerDto.Role;
            Console.WriteLine("Assigned role: " + role);
            if (role != "User" && role != "Admin")
            {
                return BadRequest(new { message = "Invalid role. Only 'User' and 'Admin' are allowed." });
            }

            var cart = new Cart
            {
            };
            _carts.InsertOne(cart);
            var user = new User
            {
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = role,
                Name = registerDto.Name,
                Username = registerDto.Username,
                RefreshTokens = new List<RefreshToken>(),
                CartId = cart.Id
            };

            await _users.InsertOneAsync(user);
            user = await _users.Find(u => u.Email == registerDto.Email).FirstOrDefaultAsync();
            // Check if user.Id is now populated
            if (user.Id == null)
            {
                return StatusCode(500, new { message = "Failed to generate user ID." });
            }

            var accessToken = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken(user);
            user.RefreshTokens.Add(refreshToken);

            //SetRefreshTokenCookie(refreshToken);
            return Ok(new { user });
        }
        catch (Exception ex)
        {
            // Log or output the exception details for debugging
            Console.WriteLine($"Exception: {ex.Message}");
            return StatusCode(500, new { message = "An internal server error occurred.", error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var user = await _users.Find(u => u.Email == loginDto.Email).FirstOrDefaultAsync();
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Remove expired or used refresh tokens
            user.RefreshTokens.RemoveAll(rt => rt.Expires <= DateTime.UtcNow || rt.IsUsed);

            var validRefreshToken = user.RefreshTokens.FirstOrDefault(rt => rt.Expires > DateTime.UtcNow && !rt.IsUsed);
            if (validRefreshToken == null)
            {
                var newRefreshToken = GenerateRefreshToken(user);
                user.RefreshTokens.Add(newRefreshToken);
                SetRefreshTokenCookie(newRefreshToken);
            }
            else
            {
                SetRefreshTokenCookie(validRefreshToken);
            }

            var accessToken = GenerateJwtToken(user);
            await _users.ReplaceOneAsync(u => u.Id == user.Id, user);

            return Ok(new { token = accessToken });
        }
        catch (ArgumentNullException ex)
        {
            return BadRequest(new { message = "Invalid input provided.", details = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "An error occurred during the login process.",
                exceptionType = ex.GetType().Name,
                details = ex.Message,
                stackTrace = ex.StackTrace
            });
        }


    }


    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        Console.WriteLine("Attempting to refresh token...");

        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshTokenValue))
        {
            Console.WriteLine("Refresh token missing in cookies.");
            return BadRequest(new { message = "Refresh token is missing." });
        }

        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(refreshTokenValue);
        var id = token.Claims.FirstOrDefault(claim => claim.Type == "sub")?.Value;

        if (string.IsNullOrEmpty(id))
        {
            Console.WriteLine($"Invalid refresh token: ID claim missing or empty. Token value: {refreshTokenValue}");
            return Unauthorized(new { message = "Invalid refresh token." });
        }

        var user = await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
        if (user == null)
        {
            Console.WriteLine("No user found with this ID.");
            return Unauthorized(new { message = "Invalid refresh token." });
        }

        var refreshToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshTokenValue);
        if (refreshToken == null || refreshToken.Expires <= DateTime.UtcNow || refreshToken.IsRevoked || refreshToken.IsUsed)
        {
            Console.WriteLine("Refresh token invalid or already used.");
            return Unauthorized(new { message = "Refresh token has expired or is no longer valid." });
        }

        refreshToken.IsUsed = true;
        user.RefreshTokens.RemoveAll(rt => rt.Expires <= DateTime.UtcNow || rt.IsUsed);

        var newAccessToken = GenerateJwtToken(user);
        var newRefreshToken = GenerateRefreshToken(user);

        user.RefreshTokens.Add(newRefreshToken);
        await _users.ReplaceOneAsync(u => u.Id == user.Id, user);

        SetRefreshTokenCookie(newRefreshToken);
        Console.WriteLine("New access token generated and returned.");
        return Ok(new { token = newAccessToken });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshTokenValue))
        {
            return BadRequest(new { message = "Refresh token is missing." });
        }

        var user = await _users.Find(u => u.RefreshTokens.Any()).FirstOrDefaultAsync();

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid refresh token." });
        }

        var refreshToken = user.RefreshTokens.FirstOrDefault(rt => BCrypt.Net.BCrypt.Verify(refreshTokenValue, rt.Token));

        if (refreshToken == null)
        {
            return Unauthorized(new { message = "Invalid refresh token." });
        }

        if (refreshToken.IsRevoked)
        {
            return Unauthorized(new { message = "Refresh token has already been revoked." });
        }

        refreshToken.IsRevoked = true;

        await _users.ReplaceOneAsync(u => u.Id == user.Id, user);

        Response.Cookies.Delete("refreshToken");

        return Ok(new { message = "Logged out successfully." });
    }


    private string GenerateJwtToken(User user, bool isRefreshToken = false)
    {
        Console.WriteLine("User Id: " + user.Id);
        Console.WriteLine("User Email: " + user.Email);
        Console.WriteLine("User Role: " + user.Role);


        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("role", user.Role)
        };

        var expiryDuration = isRefreshToken ? 7 : 2;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(isRefreshToken ? 7 : 0).AddMinutes(isRefreshToken ? 0 : 10),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    private RefreshToken GenerateRefreshToken(User user)
    {
        var token = GenerateJwtToken(user, true);
        return new RefreshToken
        {
            Token = token,
            Expires = DateTime.UtcNow.AddDays(7),
            Created = DateTime.UtcNow,
            IsRevoked = false,
            IsUsed = false
        };
    }

    private void SetRefreshTokenCookie(RefreshToken refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = refreshToken.Expires
        };
        Response.Cookies.Append("refreshToken", refreshToken.Token, cookieOptions);
    }

    [HttpGet("profile")]
    [Authorize(Roles = "Admin, User")]
    public async Task<IActionResult> GetProfile()
    {
        foreach (var claim in User.Claims)
        {
            Console.WriteLine($"Claim Type: {claim.Type}, Claim Value: {claim.Value}");
        }

        var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            userId = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
        }

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User ID not found in token claims." });
        }


        var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        return Ok(new
        {
            user.Name,
            user.Email,
            user.Username,
            user.Role
        });
    }
}
