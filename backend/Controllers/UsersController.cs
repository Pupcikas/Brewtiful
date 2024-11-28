using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Brewtiful.Models;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Brewtiful.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IMongoCollection<User> _users;

        public UsersController(IMongoClient client)
        {
            var database = client.GetDatabase("Brewtiful");
            _users = database.GetCollection<User>("Users");
        }

        // GET: api/users
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            try
            {
                var users = await _users.Find(_ => true).ToListAsync();

                if (users == null || !users.Any())
                {
                    return NotFound(new { message = "No users found." });
                }

                var userDtos = users.Select(user => new UserDto
                {
                    Id = user.Id ?? "N/A",
                    Name = user.Name ?? "N/A",
                    Username = user.Username ?? "N/A",
                    Email = user.Email ?? "N/A",
                    Role = user.Role ?? "N/A",
                    Points = user.Points ?? 0,
                }).ToList();

                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                // Log the exception details
                Console.WriteLine($"Exception in GetUsers: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "An error occurred while retrieving users.", error = ex.Message });
            }
        }


        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var deleteResult = await _users.DeleteOneAsync(u => u.Id == id);

            if (deleteResult.DeletedCount == 0)
            {
                return NotFound(new { message = $"User with ID {id} not found." });
            }

            // Optionally, remove user-related data from other collections (e.g., Orders, Carts)
            // Implement cascading deletions here if necessary

            return NoContent();
        }
    }
}
