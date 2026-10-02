using System.ComponentModel.DataAnnotations; // Validation

namespace ELibraryApi.Dtos.Category
{
    public class CreateCategoryDto
    {
        [Required, MaxLength(100)]                  // Name rules
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]                            // Description rules
        public string? Description { get; set; }
    }
}