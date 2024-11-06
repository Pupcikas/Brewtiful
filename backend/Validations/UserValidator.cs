using FluentValidation;
using Brewtiful.Models;

public class UserValidator : AbstractValidator<User>
{
    public UserValidator()
    {
        RuleFor(user => user.Password)
            .NotEmpty().WithMessage("Password must not be empty.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email is required.");

        RuleFor(user => user.Name)
                    .NotEmpty().WithMessage("Name is required.")
                    .MaximumLength(20).WithMessage("Name must be at most 20 characters long.")
                    .Matches(@"^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]+$").WithMessage("Name must consist of only English and Lithuanian letters and can contain two words.");
    }
}
