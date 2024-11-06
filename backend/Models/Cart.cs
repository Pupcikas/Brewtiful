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
    public class Cart
    {
        [BsonId]
        public int _id { get; set; }
        public string Name { get; set; }
        public bool IsSelected { get; set; }

        public List<CartItem> CartItems { get; set; }
        public string UserId { get; set; }

        [BsonIgnore]
        public User User { get; set; }

        public string Status { get; set; }
    }
}