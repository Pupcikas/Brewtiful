using System.Text.Json.Serialization;

public class IngredientUpdateDto
{
    public string Name { get; set; }
    public int DefaultQuantity { get; set; }
    public double ExtraCost { get; set; }
}
