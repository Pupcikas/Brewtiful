using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Brewtiful.Validation;
using Brewtiful.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using FluentValidation;

namespace Brewtiful.Controllers
{
    [Route("api/Cart")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly IMongoCollection<Cart> _carts;
        private readonly IMongoCollection<Item> _items;
        private readonly IMongoCollection<User> _users;
        private readonly CartValidator _validator;
        private readonly UserValidator _userValidator;

        public CartController(IMongoDatabase database, CartValidator validator, UserValidator userValidator)
        {
            _carts = database.GetCollection<Cart>("Carts");
            _items = database.GetCollection<Item>("Items");
            _users = database.GetCollection<User>("Users");
            _validator = validator;
            _userValidator = userValidator;
        }

        // GET: api/Cart
        [HttpGet]
        public ActionResult<List<Cart>> Get()
        {
            return _carts.Find(cart => true).ToList();
        }

        // GET: api/Cart/{id}
        [HttpGet("{id}")]
        public ActionResult<Cart> Get(int id)
        {
            var cart = _carts.Find(c => c._id == id).FirstOrDefault();
            if (cart == null)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Cart with id:{id} not found."
                });
            return cart;
        }

        // POST: api/Cart
        [HttpPost]
        public ActionResult<Cart> Post([FromBody] Cart cart)
        {
            if (cart == null)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "BadRequest",
                    Detail = $"Invalid cart data"
                });
            }

            var user = _users.Find(u => u.Id.Equals(cart.UserId)).FirstOrDefault();
            if (user == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"User associated with User ID {cart.UserId} not found."
                });
            }

            _validator.ValidateUserName(cart, user.Name);
            var validationResult = _validator.Validate(cart);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            _carts.InsertOne(cart);
            return CreatedAtAction(nameof(Get), new { id = cart._id }, cart);
        }

        // PUT: api/Cart/{id}
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Cart cart)
        {
            var existingCart = _carts.Find(c => c._id == id).FirstOrDefault();
            if (existingCart == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Cart with ID {id} not found."
                });
            }

            var user = _users.Find(u => u.Id.Equals(existingCart.UserId)).FirstOrDefault();
            if (user == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"User associated with Cart ID {id} not found."
                });
            }

            _validator.ValidateUserName(cart, user.Name);
            var validationResult = _validator.Validate(cart);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            _carts.ReplaceOne(c => c._id == id, cart);

            return Ok(cart);
        }

        // DELETE: api/Cart/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _carts.DeleteOne(c => c._id == id);
            if (result.DeletedCount == 0)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Cart with id:{id} not found."
                });

            return NoContent();
        }

        // POST: api/Cart/AddCustomItem
        [HttpPost("addcustomitem")]
        public ActionResult AddCustomItem([FromBody] AddCustomItemRequest request)
        {
            var cart = _carts.Find(c => c._id == request.CartId).FirstOrDefault();
            if (cart == null)
                return NotFound(new { message = "Cart not found" });

            var item = _items.Find(i => i.Id == request.ItemId).FirstOrDefault();
            if (item == null)
                return NotFound(new { message = "Item not found" });

            double totalPrice = item.Price;

            foreach (var modIngredient in request.ModifiedIngredients)
            {
                var baseIngredient = item.Ingredients.FirstOrDefault(i => i.Name == modIngredient.Name);
                if (baseIngredient != null && modIngredient.Quantity > baseIngredient.DefaultQuantity)
                {
                    int extraQuantity = modIngredient.Quantity - baseIngredient.DefaultQuantity;
                    totalPrice += extraQuantity * baseIngredient.ExtraCost;
                }
            }

            var cartItem = new CartItem
            {
                ItemId = item.Id,
                Item = item,
                Count = request.Count,
                ModifiedIngredients = request.ModifiedIngredients,
                TotalPrice = totalPrice * request.Count
            };

            cart.CartItems.Add(cartItem);

            _carts.ReplaceOne(c => c._id == cart._id, cart);

            return Ok(new { message = "Item added to cart", totalPrice = cartItem.TotalPrice });
        }
    }

    public class AddCustomItemRequest
    {
        public int CartId { get; set; }
        public int ItemId { get; set; }
        public int Count { get; set; }
        public List<ModifiedIngredient> ModifiedIngredients { get; set; }
    }
}