using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using Brewtiful.Models;

namespace Brewtiful.Controllers
{
    [Route("api/Ingredient")]
    [ApiController]
    public class IngredientController : ControllerBase
    {
        private readonly IMongoCollection<Ingredient> _ingredients;
        private readonly IMongoDatabase _database;

        public IngredientController(IMongoDatabase database)
        {
            _database = database;
            _ingredients = database.GetCollection<Ingredient>("Ingredients");
        }

        // GET: api/Ingredient
        [HttpGet]
        public ActionResult<List<Ingredient>> Get()
        {
            return _ingredients.Find(ingredient => true).ToList();
        }

        // GET: api/Ingredient/{id}
        [HttpGet("{id}")]
        public ActionResult<Ingredient> Get(int id)
        {
            var ingredient = _ingredients.Find(i => i.Id == id).FirstOrDefault();
            if (ingredient == null)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Ingredient with id:{id} not found."
                });
            return ingredient;
        }

        // POST: api/Ingredient
        [HttpPost]
        public ActionResult<Ingredient> Post([FromBody] Ingredient ingredient)
        {
            var validationResponse = ValidateIngredient(ingredient);
            if (validationResponse != null)
            {
                return validationResponse; // Return the response from validation
            }

            var existingIngredient = _ingredients.Find(i => i.Id == ingredient.Id).FirstOrDefault();
            if (existingIngredient != null)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = $"Ingredient with id:{ingredient.Id} already exists."
                });
            }

            _ingredients.InsertOne(ingredient);
            return CreatedAtAction(nameof(Get), new { id = ingredient.Id }, ingredient);
        }

        // PUT: api/Ingredient/{id}
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Ingredient updatedIngredient)
        {
            var existingIngredient = _ingredients.Find(i => i.Id == id).FirstOrDefault();
            if (existingIngredient == null)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Ingredient with id:{id} not found."
                });

            var validationResponse = ValidateIngredient(updatedIngredient);
            if (validationResponse != null)
            {
                return validationResponse; // Return the response from validation
            }

            existingIngredient.Name = updatedIngredient.Name;
            existingIngredient.DefaultQuantity = updatedIngredient.DefaultQuantity;
            existingIngredient.ExtraCost = updatedIngredient.ExtraCost;

            _ingredients.ReplaceOne(i => i.Id == id, existingIngredient);

            var itemsCollection = _database.GetCollection<Item>("Items");
            var itemsToUpdate = itemsCollection.Find(i => i.Ingredients.Any(ing => ing.Id == id)).ToList();

            foreach (var item in itemsToUpdate)
            {
                item.Ingredients = item.Ingredients.Select(ing =>
                {
                    if (ing.Id == id)
                    {
                        ing.Name = existingIngredient.Name;
                        ing.DefaultQuantity = existingIngredient.DefaultQuantity;
                        ing.ExtraCost = existingIngredient.ExtraCost;
                    }
                    return ing;
                }).ToList();

                itemsCollection.ReplaceOne(i => i.Id == item.Id, item);
            }

            var cartItemsCollection = _database.GetCollection<CartItem>("CartItems");
            var cartItemsToUpdate = cartItemsCollection.Find(ci => ci.Item.Ingredients.Any(ing => ing.Id == id)).ToList();

            foreach (var cartItem in cartItemsToUpdate)
            {
                cartItem.Item.Ingredients = cartItem.Item.Ingredients.Select(ing =>
                {
                    if (ing.Id == id)
                    {
                        ing.Name = existingIngredient.Name;
                        ing.DefaultQuantity = existingIngredient.DefaultQuantity;
                        ing.ExtraCost = existingIngredient.ExtraCost;
                    }
                    return ing;
                }).ToList();

                cartItemsCollection.ReplaceOne(ci => ci.Id == cartItem.Id, cartItem);
            }

            var cartsCollection = _database.GetCollection<Cart>("Carts");
            var cartsToUpdate = cartsCollection.Find(c => c.CartItems.Any(ci => ci.ItemId == id)).ToList();

            foreach (var cart in cartsToUpdate)
            {
                cart.CartItems = cart.CartItems.Select(ci =>
                {
                    if (ci.ItemId == id)
                    {
                        ci.Item = itemsCollection.Find(i => i.Id == ci.ItemId).FirstOrDefault();
                    }
                    return ci;
                }).ToList();

                cartsCollection.ReplaceOne(c => c._id == cart._id, cart);
            }

            return NoContent();
        }

        // DELETE: api/Ingredient/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _ingredients.DeleteOne(i => i.Id == id);
            if (result.DeletedCount == 0)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Ingredient with id:{id} not found."
                });
            return NoContent();
        }

        private ActionResult ValidateIngredient(Ingredient ingredient)
        {
            if (string.IsNullOrWhiteSpace(ingredient.Name) || ingredient.Name.Length > 20 ||
                !Regex.IsMatch(ingredient.Name, @"^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]+$"))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Validation Error",
                    Detail = "Name must consist of only English or Lithuanian letters and spaces, and be a maximum of 20 characters long."
                });
            }

            if (ingredient.DefaultQuantity <= 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Validation Error",
                    Detail = "Default Quantity must be a positive number."
                });
            }

            if (ingredient.ExtraCost < 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Validation Error",
                    Detail = "Extra Cost must be 0 or a positive number."
                });
            }

            return null; // No validation errors
        }
    }
}
