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
    }
}