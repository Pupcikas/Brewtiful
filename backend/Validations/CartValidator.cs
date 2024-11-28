using FluentValidation;
using Brewtiful.Models;

namespace Brewtiful.Validation
{
    public class CartValidator : AbstractValidator<Cart>
    {
        public CartValidator()
        {
            // Status must be Active, Pending, or Complete
            RuleFor(cart => cart.Status)
                .Must(status => status == "Active" || status == "Pending" || status == "Complete")
                .WithMessage("Status must be either 'Active', 'Pending', or 'Complete'.");

            // isSelected must be either true or false
            RuleFor(cart => cart.IsSelected)
                .Must(val => val == true || val == false)
                .WithMessage("isSelected must be either true or false.");
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
    }
}