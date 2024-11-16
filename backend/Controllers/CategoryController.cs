using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authorization;

using Brewtiful.Models;

namespace Brewtiful.Controllers
{
    [Route("api/Category")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly IMongoDatabase _database;
        private readonly IMongoCollection<Category> _categories;
        private readonly IMongoCollection<Ingredient> _ingredients;
        private readonly IMongoCollection<Item> _items;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(IMongoDatabase database, ILogger<CategoryController> logger)
        {
            _database = database;
            _categories = database.GetCollection<Category>("Categories");
            _ingredients = database.GetCollection<Ingredient>("Ingredients");
            _items = database.GetCollection<Item>("Items");
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
        public ActionResult<Category> Post([FromBody] Category category)
        {
            try
            {
                if (category == null || string.IsNullOrWhiteSpace(category.Name))
                {
                    return BadRequest(new ProblemDetails
                    {
                        Status = 400,
                        Title = "Bad Request",
                        Detail = "Invalid category or missing data."
                    });
                }

                // Use MongoDB filter builder for compatibility
                var filter = Builders<Category>.Filter.Eq(c => c.Name, category.Name);
                var existingCategoryByName = _categories.Find(filter).FirstOrDefault();

                if (existingCategoryByName != null)
                {
                    return BadRequest(new ProblemDetails
                    {
                        Status = 400,
                        Title = "Bad Request",
                        Detail = $"A category with the name '{category.Name}' already exists."
                    });
                }

                // Generate a new unique ID (consider using MongoDB's ObjectId)
                var allCategories = _categories.Find(FilterDefinition<Category>.Empty).ToList();
                int maxId = allCategories.Any() ? allCategories.Max(c => c.Id) : 0;
                category.Id = maxId + 1;

                if (!IsValidCategoryName(category.Name))
                {
                    return BadRequest(new ProblemDetails
                    {
                        Status = 400,
                        Title = "Bad Request",
                        Detail = "Category name must consist of only letters and be a maximum of 20 characters."
                    });
                }

                _categories.InsertOne(category);
                return CreatedAtAction(nameof(Get), new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                // Log the exception (ensure _logger is initialized)
                _logger.LogError(ex, "An error occurred while creating the category.");

                // Return a generic 500 error response
                return StatusCode(500, new ProblemDetails
                {
                    Status = 500,
                    Title = "Internal Server Error",
                    Detail = "An unexpected error occurred while processing your request."
                });
            }
        }





        // PUT: api/Category/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Category updatedCategory)
        {
            var existingCategory = _categories.Find(c => c.Id == id).FirstOrDefault();
            if (existingCategory == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Category with id:{id} not found."
                });
            }

            if (!IsValidCategoryName(updatedCategory.Name))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = "Category name must consist of only letters and be a maximum of 20 characters."
                });
            }

            existingCategory.Name = updatedCategory.Name;

            _categories.ReplaceOne(c => c.Id == id, existingCategory);

            var itemsCollection = _database.GetCollection<Item>("Items");
            var filter = Builders<Item>.Filter.Eq(i => i.CategoryId, id);
            var itemsToUpdate = itemsCollection.Find(filter).ToList();

            foreach (var item in itemsToUpdate)
            {
                item.Category = existingCategory;
                itemsCollection.ReplaceOne(i => i.Id == item.Id, item);
            }

            var cartsCollection = _database.GetCollection<Cart>("Carts");
            foreach (var item in itemsToUpdate)
            {
                var cartFilter = Builders<Cart>.Filter.ElemMatch(c => c.CartItems, ci => ci.ItemId == item.Id);
                var cartsToUpdate = cartsCollection.Find(cartFilter).ToList();

                foreach (var cart in cartsToUpdate)
                {
                    foreach (var cartItem in cart.CartItems)
                    {
                        if (cartItem.ItemId == item.Id)
                        {
                            cartItem.Item = item;
                            cartItem.TotalPrice = item.Price * cartItem.Count;
                        }
                    }

                    cartsCollection.ReplaceOne(c => c._id == cart._id, cart);
                }
            }

            var cartItemsCollection = _database.GetCollection<CartItem>("CartItems");
            foreach (var item in itemsToUpdate)
            {
                var cartItemFilter = Builders<CartItem>.Filter.Eq(ci => ci.ItemId, item.Id);
                var cartItemsToUpdate = cartItemsCollection.Find(cartItemFilter).ToList();

                foreach (var cartItem in cartItemsToUpdate)
                {
                    if (cartItem.Item == null)
                    {
                        cartItem.Item = new Item();
                    }
                    cartItem.Item.Category = existingCategory;
                    cartItemsCollection.ReplaceOne(ci => ci.Id == cartItem.Id, cartItem);
                }
            }

            return Ok(existingCategory);
        }


        // DELETE: api/Category/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var categoryToDelete = _categories.Find(c => c.Id == id).FirstOrDefault();
            if (categoryToDelete == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Category with id:{id} not found."
                });
            }

            var itemsCollection = _database.GetCollection<Item>("Items");
            var itemsToDelete = itemsCollection.Find(i => i.CategoryId == id).ToList();

            if (!itemsToDelete.Any())
            {
                var result = _categories.DeleteOne(c => c.Id == id);
                if (result.DeletedCount == 0)
                {
                    return NotFound();
                }

                return NoContent();
            }

            var itemIdsToDelete = itemsToDelete.Select(i => i.Id).ToList();

            var cartsCollection = _database.GetCollection<Cart>("Carts");

            foreach (var itemId in itemIdsToDelete)
            {
                var updateDefinition = Builders<Cart>.Update.PullFilter(c => c.CartItems, ci => ci.ItemId == itemId);
                var updateResult = cartsCollection.UpdateMany(c => c.CartItems.Any(ci => ci.ItemId == itemId), updateDefinition);
            }

            var deleteFilter = Builders<Item>.Filter.Eq(i => i.CategoryId, id);
            var deleteResult = itemsCollection.DeleteMany(deleteFilter);

            var cartItemsCollection = _database.GetCollection<CartItem>("CartItems");
            var cartItemsDeleteFilter = Builders<CartItem>.Filter.In(ci => ci.ItemId, itemIdsToDelete);
            var cartItemsDeleteResult = cartItemsCollection.DeleteMany(cartItemsDeleteFilter);

            var categoryDeleteResult = _categories.DeleteOne(c => c.Id == id);
            if (categoryDeleteResult.DeletedCount == 0)
            {
                return NotFound();
            }

            return NoContent();
        }

        private bool IsValidCategoryName(string name)
        {
            if (string.IsNullOrWhiteSpace(name) || name.Length > 20)
            {
                return false;
            }

            return Regex.IsMatch(name, @"^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ]+$");
        }

        // GET: api/Category/FullHierarchy
        [Authorize(Roles = "Admin,User")]
        [HttpGet("FullHierarchy")]
        public ActionResult<List<Category>> GetFullHierarchy()
        {
            var categories = _categories.Find(c => true).ToList();
            if (categories == null || !categories.Any())
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = "No categories found."
                });
            }

            foreach (var category in categories)
            {
                var items = _items.Find(i => i.CategoryId == category.Id).ToList(); // Adjusted to filter by CategoryId
                foreach (var item in items)
                {
                    LoadIngredients(item);
                }
                category.Items = items;
            }

            return Ok(categories);
        }

        // GET: api/Category/{categoryId}/Item/{itemId}/FullHierarchy
        [Authorize(Roles = "Admin,User")]
        [HttpGet("{categoryId}/Item/{itemId}/FullHierarchy")]
        public ActionResult<Item> GetItemHierarchy(int categoryId, int itemId)
        {
            var item = _items.Find(i => i.Id == itemId && i.CategoryId == categoryId).FirstOrDefault();
            if (item == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Item with id:{itemId} not found in category id:{categoryId}."
                });
            }

            var category = _categories.Find(i => i.Id == categoryId).FirstOrDefault();
            if (category == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Category with id:{categoryId} not found."
                });
            }

            LoadIngredients(item);

            return Ok(item);
        }

        // GET: api/Category/{categoryId}/Item/{itemId}/Ingredient/{ingredientId}
        [Authorize(Roles = "Admin,User")]
        [HttpGet("{categoryId}/Item/{itemId}/Ingredient/{ingredientId}")]
        public ActionResult<Ingredient> GetIngredientHierarchy(int categoryId, int itemId, int ingredientId)
        {
            var item = _items.Find(i => i.Id == itemId && i.CategoryId == categoryId).FirstOrDefault();
            if (item == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Item with id:{itemId} not found in category id:{categoryId}."
                });
            }

            var ingredient = item.Ingredients.FirstOrDefault(ing => ing.Id == ingredientId);
            if (ingredient == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Ingredient with id:{ingredientId} not found in item id:{itemId}."
                });
            }

            var category = _categories.Find(i => i.Id == categoryId).FirstOrDefault();
            if (category == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Category with id:{categoryId} not found."
                });
            }

            return Ok(new
            {
                CategoryId = categoryId,
                CategoryName = category.Name,
                ItemId = item.Id,
                ItemName = item.Name,
                Ingredient = ingredient
            });
        }

        private void LoadIngredients(Item item)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            var ingredients = _ingredients.Find(ing => ing.ItemIds.Contains(item.Id)).ToList();
            item.Ingredients = ingredients;
            item.IngredientNames = ingredients.Select(ing => ing.Name).ToList();
        }

    }
}
