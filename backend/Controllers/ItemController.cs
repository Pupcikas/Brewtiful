using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Brewtiful.Models;
using Microsoft.AspNetCore.Authorization;
using System.IO;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

using Microsoft.AspNetCore.Http;

namespace Brewtiful.Controllers
{
    [Route("api/Item")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly IMongoDatabase _database;
        private readonly IMongoCollection<Item> _items;
        private readonly IMongoCollection<Category> _categories;
        private readonly IMongoCollection<Ingredient> _ingredients;

        public ItemController(IMongoDatabase database)
        {
            _database = database;
            _items = database.GetCollection<Item>("Items");
            _categories = database.GetCollection<Category>("Categories");
            _ingredients = database.GetCollection<Ingredient>("Ingredients");
        }

        // GET: api/Item
        [Authorize(Roles = "Admin,User")]
        [HttpGet]
        public ActionResult<List<Item>> Get()
        {
            var items = _items.Find(item => true).ToList();
            foreach (var item in items)
            {
                LoadIngredients(item);
            }
            return items;
        }

        // GET: api/Item/{id}
        [Authorize(Roles = "Admin,User")]
        [HttpGet("{id:length(24)}")]
        public ActionResult<Item> Get(string id)
        {
            if (!ObjectId.TryParse(id, out ObjectId objectId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = "Invalid ID format."
                });
            }

            var item = _items.Find(i => i.Id == id).FirstOrDefault();
            if (item == null)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Item with id:{id} not found."
                });

            LoadIngredients(item);
            return item;
        }

        // GET: api/Item/category/{categoryId}/Items
        [Authorize(Roles = "Admin,User")]
        [HttpGet("category/{categoryId}")]
        public ActionResult<List<Item>> GetByCategory(int categoryId)
        {
            var category = _categories.Find(c => c.Id == categoryId).FirstOrDefault();
            if (category == null)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Category with id:{categoryId} not found."
                });

            var items = _items.Find(item => item.CategoryId == categoryId).ToList();
            foreach (var item in items)
            {
                LoadIngredients(item);
            }
            return items;
        }

        // POST: api/Item
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Item>> Post([FromForm] ItemCreateDto itemDto)
        {
            try
            {
                // Existing validation logic
                if (!ValidateItemDto(itemDto, out var validationErrors))
                {
                    return BadRequest(new ProblemDetails
                    {
                        Status = 400,
                        Title = "Bad Request",
                        Detail = string.Join(", ", validationErrors)
                    });
                }

                if (!ValidateIngredientIds(itemDto.IngredientIds, out var ingredientErrors))
                {
                    validationErrors.AddRange(ingredientErrors);
                    return BadRequest(new ProblemDetails
                    {
                        Status = 400,
                        Title = "Bad Request",
                        Detail = string.Join(", ", validationErrors)
                    });
                }

                // Creating the new item
                var newItem = new Item
                {
                    Name = itemDto.Name,
                    CategoryId = itemDto.CategoryId,
                    Price = itemDto.Price,
                    IngredientIds = itemDto.IngredientIds
                };

                // Handling the picture upload
                if (itemDto.Picture != null && itemDto.Picture.Length > 0)
                {
                    var fileName = $"{Guid.NewGuid()}_{itemDto.Picture.FileName}";
                    var filePath = Path.Combine("wwwroot/images/items", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath));

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await itemDto.Picture.CopyToAsync(stream);
                    }

                    newItem.PictureUrl = $"/images/items/{fileName}";
                }

                // Inserting the item into the repository
                _items.InsertOne(newItem);

                // Updating ingredient item IDs
                UpdateIngredientItemIds(itemDto.IngredientIds, newItem.Id);

                // Returning the created item
                return CreatedAtAction(nameof(Get), new { id = newItem.Id }, newItem);
            }
            catch (Exception ex)
            {
                // Returning a detailed ProblemDetails response
                return StatusCode(500, new ProblemDetails
                {
                    Status = 500,
                    Title = "Internal Server Error",
                    Detail = ex.Message, // Consider omitting in production
                    Instance = HttpContext.Request.Path
                });
            }
        }

        // PUT: api/Item/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Put(string id, [FromForm] ItemUpdateDto itemDto)
        {
            if (!ObjectId.TryParse(id, out ObjectId objectId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = "Invalid ID format."
                });
            }

            var existingItem = _items.Find(i => i.Id == id).FirstOrDefault();
            if (existingItem == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Item with id:{id} not found."
                });
            }

            if (!ValidateItemDto(itemDto, out var validationErrors))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = string.Join(", ", validationErrors)
                });
            }

            if (!ValidateIngredientIds(itemDto.IngredientIds, out var ingredientErrors))
            {
                validationErrors.AddRange(ingredientErrors);
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = string.Join(", ", validationErrors)
                });
            }

            existingItem.Name = itemDto.Name;
            existingItem.CategoryId = itemDto.CategoryId;
            existingItem.Price = itemDto.Price;
            existingItem.IngredientIds = itemDto.IngredientIds;

            if (itemDto.Picture != null && itemDto.Picture.Length > 0)
            {
                // Save the new picture
                var fileName = $"{Guid.NewGuid()}_{itemDto.Picture.FileName}";
                var filePath = Path.Combine("wwwroot/images/items", fileName);

                Directory.CreateDirectory(Path.GetDirectoryName(filePath));

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await itemDto.Picture.CopyToAsync(stream);
                }

                // Optionally delete the old picture file if it exists

                // Update the PictureUrl
                existingItem.PictureUrl = $"/images/items/{fileName}";
            }

            _items.ReplaceOne(i => i.Id == id, existingItem);

            UpdateIngredientItemIds(itemDto.IngredientIds, existingItem.Id);

            return NoContent();
        }

        // DELETE: api/Item/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:length(24)}")]
        public IActionResult Delete(string id)
        {
            if (!ObjectId.TryParse(id, out ObjectId objectId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = "Invalid ID format."
                });
            }

            var result = _items.DeleteOne(i => i.Id == id);
            if (result.DeletedCount == 0)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Item with id:{id} not found."
                });
            return NoContent();
        }

        // Helper Methods

        private bool ValidateItemDto(IItemDto itemDto, out List<string> validationErrors)
        {
            validationErrors = new List<string>();

            if (itemDto.Price <= 0)
            {
                validationErrors.Add("Price must be a positive number.");
            }

            var category = _categories.Find(c => c.Id == itemDto.CategoryId).FirstOrDefault();
            if (category == null)
            {
                validationErrors.Add("The specified category does not exist.");
            }

            if (!IsValidName(itemDto.Name))
            {
                validationErrors.Add("Item name can only contain English and Lithuanian letters.");
            }

            return !validationErrors.Any();
        }

        private bool ValidateIngredientIds(List<int> ingredientIds, out List<string> validationErrors)
        {
            validationErrors = new List<string>();
            foreach (var ingredientId in ingredientIds)
            {
                var existingIngredient = _ingredients.Find(i => i.Id == ingredientId).FirstOrDefault();
                if (existingIngredient == null)
                {
                    validationErrors.Add($"Ingredient with ID {ingredientId} does not exist.");
                }
            }

            return !validationErrors.Any();
        }

        private void UpdateIngredientItemIds(List<int> ingredientIds, string itemId)
        {
            foreach (var ingredientId in ingredientIds)
            {
                var existingIngredient = _ingredients.Find(i => i.Id == ingredientId).FirstOrDefault();
                if (existingIngredient != null)
                {
                    if (!existingIngredient.ItemIds.Contains(itemId))
                    {
                        existingIngredient.ItemIds.Add(itemId);
                        _ingredients.ReplaceOne(i => i.Id == existingIngredient.Id, existingIngredient);
                    }
                }
            }
        }

        private void UpdateIngredientItemIds(List<Ingredient> ingredients, string itemId)
        {
            foreach (var ingredient in ingredients)
            {
                var existingIngredient = _ingredients.Find(i => i.Id == ingredient.Id).FirstOrDefault();
                if (existingIngredient != null)
                {
                    if (!existingIngredient.ItemIds.Contains(itemId))
                    {
                        existingIngredient.ItemIds.Add(itemId);
                        _ingredients.ReplaceOne(i => i.Id == existingIngredient.Id, existingIngredient);
                    }
                }
            }
        }

        private bool ValidateIngredients(List<Ingredient> ingredients, out List<string> validationErrors)
        {
            validationErrors = new List<string>();

            foreach (var ingredient in ingredients)
            {
                var existingIngredient = _ingredients.Find(i => i.Id == ingredient.Id).FirstOrDefault();
                if (existingIngredient == null)
                {
                    validationErrors.Add($"Ingredient with ID {ingredient.Id} does not exist.");
                }
            }

            return !validationErrors.Any();
        }

        private bool ValidateItem(Item item, out List<string> validationErrors)
        {
            validationErrors = new List<string>();

            if (item.Price <= 0)
            {
                validationErrors.Add("Price must be a positive number.");
            }

            var category = _categories.Find(c => c.Id == item.CategoryId).FirstOrDefault();
            if (category == null)
            {
                validationErrors.Add("The specified category does not exist.");
            }

            if (!IsValidName(item.Name))
            {
                validationErrors.Add("Item name can only contain English and Lithuanian letters.");
            }

            return !validationErrors.Any();
        }

        private bool IsValidName(string name)
        {
            var regex = new Regex(@"^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]+$");
            return regex.IsMatch(name);
        }

        private void LoadIngredients(Item item)
        {
            if (item.IngredientIds == null || item.IngredientIds.Count == 0)
                return;

            var ingredients = _ingredients.Find(i => item.IngredientIds.Contains(i.Id)).ToList();

            item.Ingredients = ingredients;
        }
    }
}
