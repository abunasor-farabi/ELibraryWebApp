using System.ComponentModel.DataAnnotations; // Validation

namespace ELibraryApi.Dtos.Author
{
    public class CreateAuthorDto
    {
        [Required, MaxLength(80)]                    // First name rules
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(80)]                    // Last name rules
        public string LastName { get; set; } = string.Empty;

        [MaxLength(80)]
        public string? Country { get; set; }          // Optional

        [MaxLength(1000)]
        public string? Bio { get; set; }              // Optional

        public DateTime? BirthDate { get; set; }      // Optional
    }
}