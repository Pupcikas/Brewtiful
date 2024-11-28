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

        // GET: api/Cart
        [HttpGet]
        public async Task<ActionResult<CartDto>> GetCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated." });

            var cart = await _carts.Find(c => c.UserId == userId && c.Status == "Active").FirstOrDefaultAsync();
            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                await _carts.InsertOneAsync(cart);
            }

            // Fetch all items in the cart
            var itemIds = cart.Items.Select(ci => ci.ItemId).ToList();
            var items = await _items.Find(i => itemIds.Contains(i.Id)).ToListAsync();

            // Fetch all ingredients to minimize database calls
            var allIngredientIds = items.SelectMany(i => i.IngredientIds).Distinct().ToList();
            var ingredients = await _ingredients.Find(ing => allIngredientIds.Contains(ing.Id)).ToListAsync();
            var ingredientDict = ingredients.ToDictionary(ing => ing.Id, ing => ing);

            // Enrich cart items with item details
            var enrichedItems = cart.Items.Select(cartItem =>
            {
                var item = items.FirstOrDefault(i => i.Id == cartItem.ItemId);
                if (item == null)
                    return null; // Or handle missing items appropriately

                // Calculate total price for the item
                double totalPrice = item.Price;
                var ingredientsInfo = new List<IngredientInfo>();

                foreach (var ingredientId in item.IngredientIds)
                {
                    if (ingredientDict.TryGetValue(ingredientId, out var ingredient))
                    {
                        int quantity = cartItem.IngredientQuantities.ContainsKey(ingredientId)
                            ? cartItem.IngredientQuantities[ingredientId]
                            : ingredient.DefaultQuantity;

                        int extraQuantity = quantity > ingredient.DefaultQuantity ? quantity - ingredient.DefaultQuantity : 0;
                        totalPrice += extraQuantity * ingredient.ExtraCost;

                        ingredientsInfo.Add(new IngredientInfo
                        {
                            Id = ingredient.Id,
                            Name = ingredient.Name,
                            Quantity = quantity,
                            DefaultQuantity = ingredient.DefaultQuantity
                        });
                    }
                }

                return new EnrichedCartItem
                {
                    Id = item.Id,
                    Name = item.Name,
                    Price = item.Price,
                    TotalPrice = totalPrice,
                    IngredientsInfo = ingredientsInfo,
                    IngredientQuantities = cartItem.IngredientQuantities
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

        // POST: api/Cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] CartItemDto cartItemDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated." });

            var cart = await _carts.Find(c => c.UserId == userId && c.Status == "Active").FirstOrDefaultAsync();
            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                await _carts.InsertOneAsync(cart);
            }

            // Check if the item already exists in the cart
            var existingItem = cart.Items.FirstOrDefault(i => i.ItemId == cartItemDto.ItemId);
            if (existingItem != null)
            {
                existingItem.Quantity += cartItemDto.Quantity;
                foreach (var kvp in cartItemDto.IngredientQuantities)
                {
                    if (existingItem.IngredientQuantities.ContainsKey(kvp.Key))
                        existingItem.IngredientQuantities[kvp.Key] += kvp.Value;
                    else
                        existingItem.IngredientQuantities[kvp.Key] = kvp.Value;
                }
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    ItemId = cartItemDto.ItemId,
                    Quantity = cartItemDto.Quantity,
                    IngredientQuantities = cartItemDto.IngredientQuantities
                });
            }

            var update = Builders<Cart>.Update.Set(c => c.Items, cart.Items);
            await _carts.UpdateOneAsync(c => c.Id == cart.Id, update);

            return Ok(new { message = "Item added to cart successfully." });
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

            var item = cart.Items.FirstOrDefault(i => i.ItemId == removeDto.ItemId);
            if (item == null)
                return NotFound(new { message = "Item not found in cart." });

            cart.Items.Remove(item);

            var update = Builders<Cart>.Update.Set(c => c.Items, cart.Items);
            await _carts.UpdateOneAsync(c => c.Id == cart.Id, update);

            return Ok(new { message = "Item removed from cart successfully." });
        }
    }
}
