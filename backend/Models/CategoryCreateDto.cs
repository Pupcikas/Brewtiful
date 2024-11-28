using System.Text.Json.Serialization;

public class CategoryCreateDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; }
}
