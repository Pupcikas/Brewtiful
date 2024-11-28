namespace Brewtiful.Models
{
    public class CartDto
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public List<EnrichedCartItem> Items { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? CheckedOutAt { get; set; }
    }

    public class EnrichedCartItem
    {
        public int Id { get; set; } // ItemId
        public string Name { get; set; }
        public double Price { get; set; }
        public double TotalPrice { get; set; }
        public List<IngredientInfo> IngredientsInfo { get; set; }
        public Dictionary<int, int> IngredientQuantities { get; set; }
    }

    public class IngredientInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public int DefaultQuantity { get; set; }
    }
}