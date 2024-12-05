// Models/Order.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;
using System;
using System.Collections.Generic;

namespace Brewtiful.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum OrderStatus
    {
        Pending,
        Processing,
        Completed,
        Cancelled
    }

    public class OrderItem
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public List<IngredientDetail> Ingredients { get; set; }
        public double Price { get; set; }
        public int Quantity { get; set; }
    }

    public class IngredientDetail
    {
        public int IngredientId { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public double ExtraCost { get; set; }
    }

    public class Order
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string UserId { get; set; }

        public List<OrderItem> Items { get; set; } = new List<OrderItem>();

        public double TotalAmount { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
