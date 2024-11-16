using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using Brewtiful.Models;
using Microsoft.AspNetCore.Authorization;

namespace Brewtiful.Controllers
{
    [Route("api/CartItem")]
    [ApiController]
    public class CartItemController : ControllerBase
    {
        private readonly IMongoDatabase _database;
        private readonly IMongoCollection<CartItem> _cartItems;

        public CartItemController(IMongoDatabase database)
        {
            _database = database;
            _cartItems = database.GetCollection<CartItem>("CartItems");
        }

        // GET: api/CartItem
        [Authorize(Roles = "User")]
        [HttpGet]
        public ActionResult<List<CartItem>> Get()
        {
            return _cartItems.Find(cartItem => true).ToList();
        }

        // GET: api/CartItem/{id}
        [Authorize(Roles = "User")]
        [HttpGet("{id}")]
        public ActionResult<CartItem> GetById(int id)
        {
            var cartItem = _cartItems.Find(c => c.Id == id).FirstOrDefault();
            if (cartItem == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"CartItem with id:{id} not found."
                });
            }
            return cartItem;
        }

        // POST: api/CartItem
        [Authorize(Roles = "User")]
        [HttpPost]
        public ActionResult<CartItem> Post([FromBody] CartItem cartItem)
        {
            if (cartItem.Count <= 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = "Count has to be a positive number."
                });
            }

            var itemsCollection = _database.GetCollection<Item>("Items");
            var item = itemsCollection.Find(i => i.Id == cartItem.ItemId).FirstOrDefault();
            if (item == null)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = "Item not found."
                });
            }

            var cartsCollection = _database.GetCollection<Cart>("Carts");
            var cart = cartsCollection.Find(c => c._id == cartItem.CartId).FirstOrDefault();
            if (cart == null)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = "Cart not found."
                });
            }

            foreach (var modIngredient in cartItem.ModifiedIngredients)
            {
                var ingredientExists = item.Ingredients.Any(i => i.Name.Equals(modIngredient.Name, StringComparison.OrdinalIgnoreCase));
                if (!ingredientExists)
                {
                    return BadRequest(new ProblemDetails
                    {
                        Status = 400,
                        Title = "Bad Request",
                        Detail = $"Ingredient '{modIngredient.Name}' does not match existing ingredients."
                    });
                }
            }

            double totalPrice = CalculateTotalPrice(cartItem);
            if (totalPrice < 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = "Total price cannot be negative."
                });
            }
            cartItem.TotalPrice = totalPrice;

            _cartItems.InsertOne(cartItem);

            cart.CartItems.Add(cartItem);
            cartsCollection.ReplaceOne(c => c._id == cart._id, cart);

            return CreatedAtAction(nameof(Get), new { id = cartItem.Id }, cartItem);
        }


        // PUT: api/CartItem/{id}
        [Authorize(Roles = "User")]
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] CartItem updatedCartItem)
        {
            if (updatedCartItem == null || updatedCartItem.Id != id)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = "Invalid cart item or ID mismatch."
                });
            }

            var itemsCollection = _database.GetCollection<Item>("Items");
            var item = itemsCollection.Find(i => i.Id == updatedCartItem.ItemId).FirstOrDefault();
            if (item == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = "Item not found."
                });
            }

            var cartsCollection = _database.GetCollection<Cart>("Carts");
            var cart = cartsCollection.Find(c => c._id == updatedCartItem.CartId).FirstOrDefault();
            if (cart == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = "Cart not found."
                });
            }

            foreach (var modIngredient in updatedCartItem.ModifiedIngredients)
            {
                var ingredientExists = item.Ingredients.Any(i => i.Name.Equals(modIngredient.Name, StringComparison.OrdinalIgnoreCase));
                if (!ingredientExists)
                {
                    return BadRequest(new ProblemDetails
                    {
                        Status = 400,
                        Title = "Bad Request",
                        Detail = $"Ingredient '{modIngredient.Name}' does not match existing ingredients."
                    });
                }
            }

            updatedCartItem.TotalPrice = CalculateTotalPrice(updatedCartItem);
            if (updatedCartItem.TotalPrice < 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Bad Request",
                    Detail = "Total price cannot be negative."
                });
            }

            var result = _cartItems.ReplaceOne(c => c.Id == id, updatedCartItem);
            if (result.ModifiedCount == 0)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"CartItem with id:{id} not found."
                });
            }

            return Ok(updatedCartItem);
        }

        private double CalculateTotalPrice(CartItem cartItem)
        {
            double totalPrice = cartItem.Item.Price * cartItem.Count;

            foreach (var modIngredient in cartItem.ModifiedIngredients)
            {
                var baseIngredient = cartItem.Item.Ingredients.FirstOrDefault(i => i.Name == modIngredient.Name);
                if (baseIngredient != null && modIngredient.Quantity > baseIngredient.DefaultQuantity)
                {
                    int extraQuantity = modIngredient.Quantity - baseIngredient.DefaultQuantity;
                    totalPrice += extraQuantity * baseIngredient.ExtraCost;
                }
            }

            return totalPrice;
        }

        // DELETE: api/CartItem/{id}
        [Authorize(Roles = "User")]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _cartItems.DeleteOne(c => c.Id == id);
            if (result.DeletedCount == 0)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"CartItem with id:{id} not found."
                });

            return NoContent();
        }
    }
}