using System.Text.Json.Serialization;

public class CategoryUpdateDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; }
}
