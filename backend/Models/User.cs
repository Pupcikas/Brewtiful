using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Brewtiful.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Name { get; set; }

        [BsonElement("UserName")]
        public string Username { get; set; } = "New User";

        [BsonElement("Email")]
        public string Email { get; set; }

        [BsonElement("Password")]
        public string Password { get; set; }

        public int Points { get; set; }

        [BsonElement("Role")]
        public string Role { get; set; } = "User";

        [BsonElement("Carts")]
        public Cart? Carts { get; set; } = new Cart();


        [BsonElement("Token")]
        public string? Token { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}