using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Brewtiful.Models;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace Brewtiful.Controllers
{
    [Route("api/Ingredient")]
    [ApiController]
    public class IngredientController : ControllerBase
    {
        private readonly IMongoCollection<Ingredient> _ingredients;
        private readonly IMongoDatabase _database;

        public IngredientController(IMongoDatabase database)
        {
            _database = database;
            _ingredients = database.GetCollection<Ingredient>("Ingredients");
        }

        // GET: api/Ingredient
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public ActionResult<List<Ingredient>> Get()
        {
            try
            {
                return _ingredients.Find(ingredient => true).ToList();
            }
            catch (Exception ex)
            {
                // Log the exception (implement logging as needed)
                return StatusCode(500, new ProblemDetails
                {
                    Status = 500,
                    Title = "Internal Server Error",
                    Detail = ex.Message
                });
            }
        }

        // GET: api/Ingredient/{id}
        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public ActionResult<Ingredient> Get(int id)
        {
            var ingredient = _ingredients.Find(i => i.Id == id).FirstOrDefault();
            if (ingredient == null)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Ingredient with id:{id} not found."
                });
            return ingredient;
        }

        // POST: api/Ingredient
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public ActionResult<Ingredient> Post([FromBody] IngredientCreateDto ingredientDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var validationResponse = ValidateIngredientDto(ingredientDto);
            if (validationResponse != null)
            {
                return validationResponse; // Return the response from validation
            }

            var newIngredient = new Ingredient
            {
                Id = GenerateNewId(),
                Name = ingredientDto.Name,
                DefaultQuantity = ingredientDto.DefaultQuantity,
                ExtraCost = ingredientDto.ExtraCost,
            };

            _ingredients.InsertOne(newIngredient);
            return CreatedAtAction(nameof(Get), new { id = newIngredient.Id }, newIngredient);
        }

        // PUT: api/Ingredient/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] IngredientUpdateDto updatedIngredientDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingIngredient = _ingredients.Find(i => i.Id == id).FirstOrDefault();
            if (existingIngredient == null)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Ingredient with id:{id} not found."
                });

            var validationResponse = ValidateIngredientDto(updatedIngredientDto);
            if (validationResponse != null)
            {
                return validationResponse; // Return the response from validation
            }

            existingIngredient.Name = updatedIngredientDto.Name;
            existingIngredient.DefaultQuantity = updatedIngredientDto.DefaultQuantity;
            existingIngredient.ExtraCost = updatedIngredientDto.ExtraCost;

            _ingredients.ReplaceOne(i => i.Id == id, existingIngredient);

            // Update related items (if necessary)
            // Implement logic to update items that use this ingredient, if required

            return NoContent();
        }

        // DELETE: api/Ingredient/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _ingredients.DeleteOne(i => i.Id == id);
            if (result.DeletedCount == 0)
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Not Found",
                    Detail = $"Ingredient with id:{id} not found."
                });
            return NoContent();
        }

        private ActionResult ValidateIngredientDto(IngredientCreateDto ingredientDto)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(ingredientDto.Name) || ingredientDto.Name.Length > 20 ||
                !Regex.IsMatch(ingredientDto.Name, @"^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]+$"))
            {
                errors.Add("Name must consist of only English or Lithuanian letters and spaces, and be a maximum of 20 characters long.");
            }

            if (ingredientDto.DefaultQuantity <= 0)
            {
                errors.Add("Default Quantity must be a positive number.");
            }

            if (ingredientDto.ExtraCost < 0)
            {
                errors.Add("Extra Cost must be 0 or a positive number.");
            }

            if (errors.Any())
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Validation Error",
                    Detail = string.Join(" ", errors)
                });
            }

            return null; // No validation errors
        }

        private ActionResult ValidateIngredientDto(IngredientUpdateDto ingredientDto)
        {
            // Same validation as for create DTO
            return ValidateIngredientDto(new IngredientCreateDto
            {
                Name = ingredientDto.Name,
                DefaultQuantity = ingredientDto.DefaultQuantity,
                ExtraCost = ingredientDto.ExtraCost
            });
        }

        private int GenerateNewId()
        {
            var maxId = _ingredients.Find(ingredient => true).SortByDescending(ingredient => ingredient.Id).Limit(1).FirstOrDefault()?.Id ?? 0;
            return maxId + 1;
        }
    }
}
