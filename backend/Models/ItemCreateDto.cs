using System.Text.Json.Serialization;

public class ItemCreateDto : IItemDto
{
    public string Name { get; set; }
    public int CategoryId { get; set; }
    public double Price { get; set; }

    [JsonPropertyName("ingredientIds")]
    public List<int> IngredientIds { get; set; } = new List<int>();

    public IFormFile? Picture { get; set; }
}
