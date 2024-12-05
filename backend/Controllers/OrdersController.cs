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

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout()
        {
            // Retrieve the current user's ID
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated." });
            }

            // Fetch the user's active cart
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

            // Fetch items and ingredients to process the cart
            var itemIds = userCart.Items.Select(ci => ci.ItemId).Distinct().ToList();
            var items = await _items.Find(i => itemIds.Contains(i.Id)).ToListAsync();

            var allIngredientIds = items.SelectMany(i => i.IngredientIds).Distinct().ToList();
            var ingredients = await _ingredients.Find(ing => allIngredientIds.Contains(ing.Id)).ToListAsync();
            var ingredientDict = ingredients.ToDictionary(ing => ing.Id, ing => ing);

            // Process each cart item
            foreach (var cartItem in userCart.Items)
            {
                var item = items.FirstOrDefault(i => i.Id == cartItem.ItemId);
                if (item == null)
                {
                    return BadRequest(new { message = $"Item with ID {cartItem.ItemId} not found." });
                }

                var ingredientDetails = new List<IngredientDetail>();
                double itemTotal = item.Price;

                foreach (var ingredientId in item.IngredientIds)
                {
                    if (ingredientDict.TryGetValue(ingredientId, out var ingredient))
                    {
                        // Use the actual quantities from the cart item
                        string ingredientIdStr = ingredientId.ToString(); // Match key format (ID as string)

                        int quantity = cartItem.IngredientQuantities != null &&
                                       cartItem.IngredientQuantities.ContainsKey(ingredientIdStr)
                            ? cartItem.IngredientQuantities[ingredientIdStr] // Use quantity from cart
                            : ingredient.DefaultQuantity; // Fallback to default

                        int extraQuantity = Math.Max(0, quantity - ingredient.DefaultQuantity);
                        itemTotal += extraQuantity * ingredient.ExtraCost;

                        ingredientDetails.Add(new IngredientDetail
                        {
                            IngredientId = ingredient.Id,
                            Name = ingredient.Name,
                            Quantity = quantity,
                            ExtraCost = ingredient.ExtraCost
                        });
                    }
                }

                // Add the processed item to the order
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

            // Set the total amount of the order
            order.TotalAmount = totalAmount;

            // Save the order to the database
            await _orders.InsertOneAsync(order);

            // Update the cart status to 'CheckedOut'
            var update = Builders<Cart>.Update
                .Set(c => c.Status, "CheckedOut")
                .Set(c => c.CheckedOutAt, DateTime.UtcNow);
            await _carts.UpdateOneAsync(c => c.Id == userCart.Id, update);

            return Ok(new { message = "Checkout successful.", orderId = order.Id });
        }





        [HttpGet]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<List<OrderDto>>> GetUserOrders()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                var orders = await _orders.Find(o => o.UserId == userId)
                                          .SortByDescending(o => o.CreatedAt)
                                          .ToListAsync();

                if (!orders.Any())
                {
                    return Ok(new List<OrderDto>()); // Return empty list if no orders found
                }

                // Fetch items and ingredients to enrich the response
                var itemIds = orders.SelectMany(o => o.Items.Select(i => i.ItemId)).Distinct().ToList();
                var items = await _items.Find(i => itemIds.Contains(i.Id)).ToListAsync();

                var allIngredientIds = items.SelectMany(i => i.IngredientIds).Distinct().ToList();
                var ingredients = await _ingredients.Find(ing => allIngredientIds.Contains(ing.Id)).ToListAsync();
                var ingredientDict = ingredients.ToDictionary(ing => ing.Id, ing => ing);

                // Enrich orders with detailed information
                var enrichedOrders = orders.Select(order =>
                {
                    var enrichedItems = order.Items.Select(orderItem =>
                    {
                        var item = items.FirstOrDefault(i => i.Id == orderItem.ItemId);
                        if (item == null) return null;

                        var enrichedIngredients = orderItem.Ingredients.Select(ing =>
                        {
                            if (ingredientDict.TryGetValue(ing.IngredientId, out var ingredient))
                            {
                                return new IngredientDetail
                                {
                                    IngredientId = ingredient.Id,
                                    Name = ingredient.Name,
                                    Quantity = ing.Quantity,
                                    ExtraCost = ing.ExtraCost
                                };
                            }
                            return ing;
                        }).ToList();

                        return new OrderItem
                        {
                            ItemId = item.Id,
                            ItemName = item.Name,
                            Ingredients = enrichedIngredients,
                            Price = orderItem.Price,
                            Quantity = orderItem.Quantity
                        };
                    }).Where(e => e != null).ToList();

                    return new OrderDto
                    {
                        Id = order.Id,
                        UserId = order.UserId,
                        Status = order.Status,
                        CreatedAt = order.CreatedAt,
                        Items = enrichedItems,
                        TotalAmount = order.TotalAmount
                    };
                }).ToList();

                return Ok(enrichedOrders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ProblemDetails
                {
                    Status = 500,
                    Title = "Internal Server Error",
                    Detail = ex.Message,
                    Instance = HttpContext.Request.Path
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(string id)
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

            // Fetch items and ingredients to enrich the response
            var itemIds = order.Items.Select(i => i.ItemId).Distinct().ToList();
            var items = await _items.Find(i => itemIds.Contains(i.Id)).ToListAsync();

            var allIngredientIds = items.SelectMany(i => i.IngredientIds).Distinct().ToList();
            var ingredients = await _ingredients.Find(ing => allIngredientIds.Contains(ing.Id)).ToListAsync();
            var ingredientDict = ingredients.ToDictionary(ing => ing.Id, ing => ing);

            // Enrich the order with detailed information
            var enrichedItems = order.Items.Select(orderItem =>
            {
                var item = items.FirstOrDefault(i => i.Id == orderItem.ItemId);
                if (item == null) return null;

                var enrichedIngredients = orderItem.Ingredients.Select(ing =>
                {
                    if (ingredientDict.TryGetValue(ing.IngredientId, out var ingredient))
                    {
                        return new IngredientDetail
                        {
                            IngredientId = ingredient.Id,
                            Name = ingredient.Name,
                            Quantity = ing.Quantity,
                            ExtraCost = ing.ExtraCost
                        };
                    }
                    return ing;
                }).ToList();

                return new OrderItem
                {
                    ItemId = item.Id,
                    ItemName = item.Name,
                    Ingredients = enrichedIngredients,
                    Price = orderItem.Price,
                    Quantity = orderItem.Quantity
                };
            }).Where(e => e != null).ToList();

            var enrichedOrder = new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                Items = enrichedItems,
                TotalAmount = order.TotalAmount
            };

            return Ok(enrichedOrder);
        }



    }
}
