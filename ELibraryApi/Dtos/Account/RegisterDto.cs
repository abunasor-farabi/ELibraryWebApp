using System.ComponentModel.DataAnnotations; // For validation attributes

namespace ELibraryApi.Dtos.Account
{
    public class RegisterDto
    {
        [Required]                                     // Must be present
        [MinLength(3), MaxLength(30)]                  // Username length rules
        public string Username { get; set; } = string.Empty;

        [Required]                                     // Must be present
        [EmailAddress]                                 // Must look like an email
        public string Email { get; set; } = string.Empty;

        [Required]                                     // Must be present
        [MinLength(8)]                                 // Minimum password length
        public string Password { get; set; } = string.Empty;

        // Optional: client can request a role at signup (only Admin can grant Admin)
        public string? Role { get; set; }
    }
}