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
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public ActionResult<List<Cart>> Get()
        {
            return _carts.Find(cart => true).ToList();
        }

        // GET: api/Cart/{id}
        [Authorize(Roles = "User")]
        [HttpGet("{id}")]
        public ActionResult<Cart> Get(string id)
        {
            var cart = _carts.Find(c => c.Id == id).FirstOrDefault();
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
        [Authorize(Roles = "Admin")]
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

            _carts.InsertOne(cart);
            return CreatedAtAction(nameof(Get), new { id = cart.Id }, cart);
        }

        // PUT: api/Cart/{id}
        [Authorize(Roles = "User")]
        [HttpPut("{id}")]
        public IActionResult Put(string id, [FromBody] Cart cart)
        {
            var existingCart = _carts.Find(c => c.Id == id).FirstOrDefault();
            if (existingCart == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Cart with ID {id} not found."
                });
            }

            _carts.ReplaceOne(c => c.Id == id, cart);

            return Ok(cart);
        }

        // DELETE: api/Cart/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            var result = _carts.DeleteOne(c => c.Id == id);
            if (result.DeletedCount == 0)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Cart with id:{id} not found."
                });

            return NoContent();
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