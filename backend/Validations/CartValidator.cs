using FluentValidation;
using Brewtiful.Models;

namespace Brewtiful.Validation
{
    public class CartValidator : AbstractValidator<Cart>
    {
        public CartValidator()
        {
            // ID must be a positive number
            RuleFor(cart => cart._id)
                .GreaterThan(0)
                .WithMessage("ID must be a positive number.")
                .When(cart => cart._id != 0); // Optional: Apply only if ID is provided

            // Status must be Active, Pending, or Complete
            RuleFor(cart => cart.Status)
                .Must(status => status == "Active" || status == "Pending" || status == "Complete")
                .WithMessage("Status must be either 'Active', 'Pending', or 'Complete'.");

            // isSelected must be either true or false
            RuleFor(cart => cart.IsSelected)
                .Must(val => val == true || val == false)
                .WithMessage("isSelected must be either true or false.");

            // Name should match the pattern "{userName}'s Cart"
            RuleFor(cart => cart.Name)
                .NotEmpty().WithMessage("Name must not be empty.")
                .Matches(@"^[\w\s]+\'s Cart$").WithMessage("The name must be in the format '{username}'s Cart'.");
        }

        public void ValidateUser(Cart cart, User user)
        {
            // Validate user password (example criteria)
            RuleFor(cart => user.Password)
                .NotEmpty().WithMessage("Password must not be empty.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long.");

            // Validate user points (example criteria)
            RuleFor(cart => user.Points)
                .GreaterThanOrEqualTo(0).WithMessage("Points must be a non-negative value.");

            // Validate user role (example criteria)
            RuleFor(cart => user.Role)
                .Must(role => role == "Admin" || role == "User")
                .WithMessage("Role must be either 'Admin' or 'User'.");
        }

        public void ValidateUserName(Cart cart, string userName)
        {
            // Correctly matches the format "{userName}'s Cart"
            RuleFor(cart => cart.Name)
                .Matches($@"^{userName}'s Cart$")
                .WithMessage($"The name must be '{userName}'s Cart'.");
        }
    }
}