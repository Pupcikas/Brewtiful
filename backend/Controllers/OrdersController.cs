// Controllers/OrdersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Brewtiful.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Brewtiful.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "User,Admin")]
    public class OrdersController : ControllerBase
    {
        private readonly IMongoCollection<Order> _orders;
        private readonly IMongoCollection<Cart> _carts;
        private readonly IMongoCollection<Item> _items;
        private readonly IMongoCollection<Ingredient> _ingredients;
        private readonly IMongoCollection<User> _users;

        public OrdersController(IMongoDatabase database)
        {
            _orders = database.GetCollection<Order>("Orders");
            _carts = database.GetCollection<Cart>("Carts");
            _items = database.GetCollection<Item>("Items");
            _ingredients = database.GetCollection<Ingredient>("Ingredients");
            _users = database.GetCollection<User>("Users");
        }

        // Controllers/OrdersController.cs
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<Order>>> GetAllOrders([FromQuery] string status = null)
        {
            // If a status is provided, filter by status
            if (!string.IsNullOrEmpty(status))
            {
                // Try to parse the status string to the OrderStatus enum
                if (!Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
                {
                    return BadRequest(new { message = "Invalid status value." });
                }

                var orders = await _orders.Find(o => o.Status == parsedStatus)
                                          .SortByDescending(o => o.CreatedAt)
                                          .ToListAsync();
                return Ok(orders);
            }
            else
            {
                // If no status is provided, return all orders
                var orders = await _orders.Find(_ => true)
                                          .SortByDescending(o => o.CreatedAt)
                                          .ToListAsync();
                return Ok(orders);
            }
        }


        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusModel updateModel)
        {
            if (!Enum.TryParse<OrderStatus>(updateModel.Status, true, out var newStatus))
            {
                return BadRequest(new { message = "Invalid status value." });
            }

            var update = Builders<Order>.Update
                .Set(o => o.Status, newStatus)
                .Set(o => o.UpdatedAt, DateTime.UtcNow);

            var result = await _orders.UpdateOneAsync(o => o.Id == id, update);

            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Order not found." });
            }

            return Ok(new { message = "Order status updated successfully." });
        }



        // POST: api/Orders/checkout
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout()
        {
            // Retrieve the current user's ID
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated." });
            }

            // Fetch the user's cart
            var userCart = await _carts.Find(c => c.UserId == userId && c.Status == "Active").FirstOrDefaultAsync();
            if (userCart == null || userCart.Items == null || !userCart.Items.Any())
            {
                return BadRequest(new { message = "Cart is empty." });
            }

            // Prepare the order
            var order = new Order
            {
                UserId = userId,
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Items = new List<OrderItem>()
            };

            double totalAmount = 0;

            foreach (var cartItem in userCart.Items)
            {
                var item = await _items.Find(i => i.Id == cartItem.ItemId).FirstOrDefaultAsync();
                if (item == null)
                {
                    return BadRequest(new { message = $"Item with ID {cartItem.ItemId} not found." });
                }

                // Fetch ingredient details
                var ingredientDetails = new List<IngredientDetail>();
                foreach (var ingredientId in item.IngredientIds)
                {
                    var ingredient = await _ingredients.Find(ing => ing.Id == ingredientId).FirstOrDefaultAsync();
                    if (ingredient != null)
                    {
                        int quantity = cartItem.IngredientQuantities.ContainsKey(ingredientId)
                            ? cartItem.IngredientQuantities[ingredientId]
                            : ingredient.DefaultQuantity;

                        ingredientDetails.Add(new IngredientDetail
                        {
                            IngredientId = ingredient.Id,
                            Name = ingredient.Name,
                            Quantity = quantity,
                            ExtraCost = ingredient.ExtraCost
                        });
                    }
                }

                double itemTotal = item.Price;
                foreach (var ing in ingredientDetails)
                {
                    int extraQuantity = Math.Max(0, ing.Quantity - _ingredients.Find(i => i.Id == ing.IngredientId).FirstOrDefault().DefaultQuantity);
                    itemTotal += extraQuantity * ing.ExtraCost;
                }

                order.Items.Add(new OrderItem
                {
                    ItemId = item.Id,
                    ItemName = item.Name,
                    Ingredients = ingredientDetails,
                    Price = itemTotal,
                    Quantity = cartItem.Quantity
                });

                totalAmount += itemTotal * cartItem.Quantity;
            }

            order.TotalAmount = totalAmount;

            // Insert the order into the database
            await _orders.InsertOneAsync(order);

            // Update the cart status to 'CheckedOut'
            var update = Builders<Cart>.Update.Set(c => c.Status, "CheckedOut").Set(c => c.CheckedOutAt, DateTime.UtcNow);
            await _carts.UpdateOneAsync(c => c.Id == userCart.Id, update);

            return Ok(new { message = "Checkout successful.", orderId = order.Id });
        }

        // GET: api/Orders
        [HttpGet]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<List<Order>>> GetUserOrders()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated." });
            }

            var orders = await _orders.Find(o => o.UserId == userId).SortByDescending(o => o.CreatedAt).ToListAsync();

            return Ok(orders);
        }

        // GET: api/Orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrderById(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated." });
            }

            var order = await _orders.Find(o => o.Id == id && o.UserId == userId).FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            return Ok(order);
        }

        // Optionally, implement endpoints to update order status (Admin only)
        // ...
    }
}
