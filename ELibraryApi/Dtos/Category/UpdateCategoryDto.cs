using System.ComponentModel.DataAnnotations; // Validation

namespace ELibraryApi.Dtos.Category
{
    public class UpdateCategoryDto
    {
        [Required, MaxLength(100)]                  // Same rules as create
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}