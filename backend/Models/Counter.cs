using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Brewtiful.Models
{
    public class Counter
    {
        [BsonId]
        public string Id { get; set; } = null!; // e.g., "ItemId"

        public int SequenceValue { get; set; }
    }
}
