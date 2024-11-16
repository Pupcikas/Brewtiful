using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Brewtiful.Models;
using Microsoft.AspNetCore.Authorization;

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
        [HttpGet("{id}")]
        public ActionResult<Item> Get(int id)
        {
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


        // GET: api/Category/{categoryId}/Items
        [Authorize(Roles = "Admin,User")]
        [HttpGet("category/{categoryId}")]
        public ActionResult<List<Item>> GetByCategory(int categoryId)
        {
            var category = _categories.Find(c => c.Id == categoryId).FirstOrDefault();
            if (category == null)
                return NotFound();

            return _items.Find(item => item.CategoryId == categoryId).ToList();
        }

        // POST: api/Item
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public ActionResult<Item> Post([FromBody] Item item)
        {
            if (!ValidateItem(item, out var validationErrors))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "BadRequest",
                    Detail = string.Join(", ", validationErrors)
                });
            }

            var existingItem = _items.Find(i => i.Id == item.Id).FirstOrDefault();
            if (existingItem != null)
            {
                validationErrors.Add($"An item with ID {item.Id} already exists.");
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "BadRequest",
                    Detail = string.Join(", ", validationErrors)
                });
            }

            _items.InsertOne(item);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        // PUT: api/Item/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Item item)
        {
            var existingItem = _items.Find(i => i.Id == id).FirstOrDefault();
            if (existingItem == null)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Item with id:{id} not found."
                });

            if (!ValidateItem(item, out var validationErrors))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "BadRequest",
                    Detail = string.Join(", ", validationErrors)
                });
            }

            if (!ValidateIngredients(item.Ingredients, out var ingredientErrors))
            {
                validationErrors.AddRange(ingredientErrors);
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "BadRequest",
                    Detail = string.Join(", ", validationErrors)
                });
            }

            existingItem.Name = item.Name;
            existingItem.CategoryId = item.CategoryId;
            existingItem.Ingredients = item.Ingredients;
            existingItem.Price = item.Price;

            _items.ReplaceOne(i => i.Id == id, existingItem);

            UpdateIngredientItemIds(item.Ingredients, existingItem.Id);

            return NoContent();
        }

        private void UpdateIngredientItemIds(List<Ingredient> ingredients, int itemId)
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

        // DELETE: api/Item/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _items.DeleteOne(i => i.Id == id);
            if (result.DeletedCount == 0)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Item with id:{id} not found."
                });

            var cartItemsCollection = _database.GetCollection<CartItem>("CartItems");

            var cartItemFilter = Builders<CartItem>.Filter.Eq(ci => ci.ItemId, id);
            var cartItemsToRemove = cartItemsCollection.Find(cartItemFilter).ToList();

            foreach (var cartItem in cartItemsToRemove)
            {
                var cartsCollection = _database.GetCollection<Cart>("Carts");
                var cartFilter = Builders<Cart>.Filter.Eq(c => c._id, cartItem.CartId);
                var cart = cartsCollection.Find(cartFilter).FirstOrDefault();

                if (cart != null)
                {
                    cart.CartItems.RemoveAll(ci => ci.Id == cartItem.Id);
                    cartsCollection.ReplaceOne(c => c._id == cart._id, cart);
                }

                cartItemsCollection.DeleteOne(ci => ci.Id == cartItem.Id);
            }

            return NoContent();
        }

        private void LoadIngredients(Item item)
        {
            if (item.IngredientNames == null || item.IngredientNames.Count == 0)
                return;

            var ingredientFilter = Builders<Ingredient>.Filter.In(i => i.Name, item.IngredientNames);
            var ingredients = _ingredients.Find(ingredientFilter).ToList();

            item.Ingredients = ingredients;
        }
    }
}