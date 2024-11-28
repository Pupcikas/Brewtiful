// Models/CartItemDto.cs
using System.Collections.Generic;

namespace Brewtiful.Models
{
    public class CartItemDto
    {
        public int ItemId { get; set; }
        public int Quantity { get; set; } = 1;
        public Dictionary<int, int> IngredientQuantities { get; set; } = new Dictionary<int, int>();
    }
}
