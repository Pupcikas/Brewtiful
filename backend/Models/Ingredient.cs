using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Brewtiful.Models
{
    public class Ingredient
    {
        [BsonId]
        [BsonRepresentation(BsonType.Int32)]
        public int Id { get; set; }
        public string Name { get; set; }
        public int DefaultQuantity { get; set; }
        public double ExtraCost { get; set; }
        public List<string> ItemIds { get; set; } = new List<string>();
    }
}
