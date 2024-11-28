using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Brewtiful.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;

namespace Brewtiful.Controllers
{
    [Route("api/Category")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly IMongoCollection<Category> _categories;
        private readonly IMongoCollection<Item> _items;
        private readonly IMongoCollection<Cart> _carts; // If you have a Cart collection
        private readonly IMongoDatabase _database;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(IMongoDatabase database, ILogger<CategoryController> logger)
        {
            _database = database;
            _categories = database.GetCollection<Category>("Categories");
            _items = database.GetCollection<Item>("Items");
            _carts = database.GetCollection<Cart>("Carts"); // If applicable
            _logger = logger;
        }

        // GET: api/Category
        [Authorize(Roles = "Admin,User")]
        [HttpGet]
        public ActionResult<List<Category>> Get()
        {
            return _categories.Find(category => true).ToList();
        }

        // GET: api/Category/{id}
        [Authorize(Roles = "Admin,User")]
        [HttpGet("{id}")]
        public ActionResult<Category> Get(int id)
        {
            var category = _categories.Find(c => c.Id == id).FirstOrDefault();
            if (category == null)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Category with id:{id} not found."
                });
            return category;
        }

        // POST: api/Category
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public ActionResult<Category> Post([FromBody] CategoryCreateDto categoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newCategory = new Category
            {
                Id = GenerateNewId(),
                Name = categoryDto.Name,
            };

            _categories.InsertOne(newCategory);
            return CreatedAtAction(nameof(Get), new { id = newCategory.Id }, newCategory);
        }

        // PUT: api/Category/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] CategoryUpdateDto updatedCategoryDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingCategory = _categories.Find(c => c.Id == id).FirstOrDefault();
                if (existingCategory == null)
                    return NotFound(new ProblemDetails
                    {
                        Status = 404,
                        Title = "Not Found",
                        Detail = $"Category with id:{id} not found."
                    });

                existingCategory.Name = updatedCategoryDto.Name;

                _categories.ReplaceOne(c => c.Id == id, existingCategory);

                // Update related items if necessary

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating Category ID {Id}", id);

                return StatusCode(500, new ProblemDetails
                {
                    Status = 500,
                    Title = "Internal Server Error",
                    Detail = "An unexpected error occurred while processing your request."
                });
            }
        }

        // DELETE: api/Category/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            // Delete the category
            var categoryDeleteResult = _categories.DeleteOne(c => c.Id == id);
            if (categoryDeleteResult.DeletedCount == 0)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Category with id:{id} not found."
                });
            }

            // Delete items associated with the deleted category
            var itemsFilter = Builders<Item>.Filter.Eq(i => i.CategoryId, id);
            var itemsToDelete = _items.Find(itemsFilter).ToList();

            if (itemsToDelete.Any())
            {
                _logger.LogInformation("Deleting {Count} items associated with Category ID {CategoryId}", itemsToDelete.Count, id);

                // Delete the items
                var itemsDeleteResult = _items.DeleteMany(itemsFilter);

                // Remove these items from any carts (if you have a Cart collection)
                var itemIdsToDelete = itemsToDelete.Select(i => i.Id).ToList();

                // Similarly, handle orders or other related collections if necessary
            }

            return NoContent();
        }

        private int GenerateNewId()
        {
            var maxId = _categories.Find(category => true).SortByDescending(category => category.Id).Limit(1).FirstOrDefault()?.Id ?? 0;
            return maxId + 1;
        }
    }
}
