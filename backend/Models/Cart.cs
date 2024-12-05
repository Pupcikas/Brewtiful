// Models/Cart.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace Brewtiful.Models
{
    public class CartItem
    {
        public string ItemId { get; set; }
        public int Quantity { get; set; } = 1;
        public Dictionary<string, int> IngredientQuantities { get; set; } = new Dictionary<string, int>();
    }

    public class Cart
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string UserId { get; set; }

        public List<CartItem> Items { get; set; } = new List<CartItem>();

        public string Status { get; set; } = "Active"; // Active, CheckedOut

        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CheckedOutAt { get; set; }
    }
}
