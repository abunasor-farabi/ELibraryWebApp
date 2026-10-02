using System.ComponentModel.DataAnnotations; // Validation

namespace ELibraryApi.Dtos.Author
{
    // Same shape as CreateAuthorDto (kept as its own class for future evolution)
    public class UpdateAuthorDto
    {
        [Required, MaxLength(80)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(80)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(80)]
        public string? Country { get; set; }

        [MaxLength(1000)]
        public string? Bio { get; set; }

        public DateTime? BirthDate { get; set; }
    }
}