using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace Brewtiful.Models
{
    public class Item
    {
        [BsonId]
        public int Id { get; set; }
        public string Name { get; set; }
        public int CategoryId { get; set; }

        [BsonIgnore]
        public Category? Category { get; set; }

        public List<int> IngredientIds { get; set; } = new List<int>();

        public List<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
        public double Price { get; set; }

        public string? PictureUrl { get; set; }
    }
}