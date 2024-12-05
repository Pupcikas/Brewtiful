// Models/CartItemDto.cs
using System.Collections.Generic;

namespace Brewtiful.Models
{
    public class CartItemDto
    {
        public string ItemId { get; set; }
        public int Quantity { get; set; } = 1;
        public Dictionary<string, int> IngredientQuantities { get; set; } = new Dictionary<string, int>();
    }
}

