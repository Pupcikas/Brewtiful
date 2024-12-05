// Controllers/CartController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Brewtiful.Models;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FluentValidation;

namespace Brewtiful.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "User,Admin")]
    public class CartController : ControllerBase
    {
        private readonly IMongoCollection<Cart> _carts;
        private readonly IMongoCollection<Item> _items;
        private readonly IMongoCollection<Ingredient> _ingredients;

        public CartController(IMongoDatabase database)
        {
            _carts = database.GetCollection<Cart>("Carts");
            _items = database.GetCollection<Item>("Items");
            _ingredients = database.GetCollection<Ingredient>("Ingredients");
        }

        [HttpGet]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<CartDto>> GetCart()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User not authenticated." });

                var cart = await _carts.Find(c => c.UserId == userId && c.Status == "Active").FirstOrDefaultAsync();
                if (cart == null)
                {
                    cart = new Cart
                    {
                        UserId = userId,
                        Items = new List<CartItem>() // Initialize Items
                    };
                    await _carts.InsertOneAsync(cart);
                }

                var itemIds = cart.Items?.Select(ci => ci.ItemId).ToList() ?? new List<string>();
                if (!itemIds.Any())
                {
                    var emptyCartDto = new CartDto
                    {
                        Id = cart.Id,
                        UserId = cart.UserId,
                        Items = new List<EnrichedCartItem>(),
                        Status = cart.Status,
                        CreatedAt = cart.CreatedAt,
                        CheckedOutAt = cart.CheckedOutAt
                    };
                    return Ok(emptyCartDto);
                }

                var items = await _items.Find(i => itemIds.Contains(i.Id)).ToListAsync();
                if (items == null)
                {
                    return StatusCode(500, new { message = "Error fetching items from the database." });
                }

                var allIngredientIds = items.SelectMany(i => i.IngredientIds).Distinct().ToList();
                var ingredients = await _ingredients.Find(ing => allIngredientIds.Contains(ing.Id)).ToListAsync();
                var ingredientDict = ingredients.ToDictionary(ing => ing.Id, ing => ing);

                var enrichedItems = cart.Items.Select(cartItem =>
                {
                    var item = items.FirstOrDefault(i => i.Id.Equals(cartItem.ItemId));
                    if (item == null)
                        return null;

                    double totalPrice = item.Price;
                    var ingredientsInfo = new List<IngredientInfo>();
                    var ingredientNameQuantities = new Dictionary<string, int>();

                    foreach (var ingredientId in item.IngredientIds)
                    {
                        if (ingredientDict.TryGetValue(ingredientId, out var ingredient))
                        {
                            // Use the quantities from the cart item, not the defaults
                            string ingredientIdStr = ingredientId.ToString();

                            int quantity = cartItem.IngredientQuantities != null && cartItem.IngredientQuantities.ContainsKey(ingredientIdStr)
                                ? cartItem.IngredientQuantities[ingredientIdStr]
                                : ingredient.DefaultQuantity;

                            int extraQuantity = Math.Max(0, quantity - ingredient.DefaultQuantity);
                            totalPrice += extraQuantity * ingredient.ExtraCost;

                            ingredientsInfo.Add(new IngredientInfo
                            {
                                Id = ingredient.Id,
                                Name = ingredient.Name,
                                Quantity = quantity,
                                DefaultQuantity = ingredient.DefaultQuantity
                            });

                            ingredientNameQuantities[ingredient.Name] = quantity;
                        }
                    }

                    return new EnrichedCartItem
                    {
                        Id = item.Id,
                        Name = item.Name,
                        Price = item.Price,
                        TotalPrice = totalPrice,
                        IngredientsInfo = ingredientsInfo,
                        IngredientQuantities = ingredientNameQuantities
                    };
                })
                .Where(e => e != null)
                .ToList();





                var cartDto = new CartDto
                {
                    Id = cart.Id,
                    UserId = cart.UserId,
                    Items = enrichedItems,
                    Status = cart.Status,
                    CreatedAt = cart.CreatedAt,
                    CheckedOutAt = cart.CheckedOutAt
                };

                return Ok(cartDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred while processing your request." });
            }
        }



        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] CartItemDto cartItemDto)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User not authenticated." });

                var cart = await _carts.Find(c => c.UserId == userId && c.Status == "Active").FirstOrDefaultAsync();
                if (cart == null)
                {
                    cart = new Cart { UserId = userId, Items = new List<CartItem>() };
                    await _carts.InsertOneAsync(cart);
                }

                // Check for identical item (same ItemId and IngredientQuantities)
                var existingItem = cart.Items.FirstOrDefault(ci =>
                    ci.ItemId == cartItemDto.ItemId &&
                    ci.IngredientQuantities.Count == cartItemDto.IngredientQuantities.Count &&
                    !ci.IngredientQuantities.Except(cartItemDto.IngredientQuantities).Any()
                );

                if (existingItem != null)
                {
                    existingItem.Quantity += cartItemDto.Quantity;
                }
                else
                {
                    cart.Items.Add(new CartItem
                    {
                        ItemId = cartItemDto.ItemId,
                        Quantity = cartItemDto.Quantity,
                        IngredientQuantities = cartItemDto.IngredientQuantities // Preserve provided quantities
                    });
                }

                await _carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);

                return Ok(new { message = "Item added to cart successfully." });
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





        // Helper method to fetch the ingredient name-to-ID mapping
        private async Task<Dictionary<string, int>> GetIngredientNameToIdMapAsync()
        {
            // Assuming you have a collection or service to fetch ingredient data
            var ingredients = await _ingredients.Find(_ => true).ToListAsync();
            return ingredients.ToDictionary(ing => ing.Name, ing => ing.Id);
        }


        // POST: api/Cart/remove
        [HttpPost("remove")]
        public async Task<IActionResult> RemoveFromCart([FromBody] RemoveCartItemDto removeDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated." });

            var cart = await _carts.Find(c => c.UserId == userId && c.Status == "Active").FirstOrDefaultAsync();
            if (cart == null)
                return NotFound(new { message = "Cart not found." });

            var item = cart.Items.FirstOrDefault(i => i.ItemId.Equals(removeDto.ItemId));
            if (item == null)
                return NotFound(new { message = "Item not found in cart." });

            cart.Items.Remove(item);

            var update = Builders<Cart>.Update.Set(c => c.Items, cart.Items);
            await _carts.UpdateOneAsync(c => c.Id == cart.Id, update);

            return Ok(new { message = "Item removed from cart successfully." });
        }
    }
}
