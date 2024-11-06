using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Brewtiful.Models
{
    public class Category
    {
        [BsonId]
        public int Id { get; set; }
        public string Name { get; set; }

        [JsonIgnore]
        public List<Item>? Items { get; set; }
    }
}