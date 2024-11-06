using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Brewtiful.Models
{
    public class CartItem
    {
        [BsonId]
        public int Id { get; set; }
        public int Count { get; set; }

        public int ItemId { get; set; }
        public Item Item { get; set; }

        public int CartId { get; set; }

        [BsonIgnore]
        public Cart Cart { get; set; }

        public List<ModifiedIngredient> ModifiedIngredients { get; set; }
        public double TotalPrice { get; set; }
    }

    public class ModifiedIngredient
    {
        public string Name { get; set; }
        public int Quantity { get; set; }
    }
}