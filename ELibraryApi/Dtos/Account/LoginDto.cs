using System.ComponentModel.DataAnnotations; // Validation

namespace ELibraryApi.Dtos.Account
{
    public class LoginDto
    {
        [Required]                                  // Username required
        public string Username { get; set; } = string.Empty;

        [Required]                                  // Password required
        public string Password { get; set; } = string.Empty;
    }
}