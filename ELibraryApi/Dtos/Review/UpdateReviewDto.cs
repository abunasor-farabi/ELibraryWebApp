using System.ComponentModel.DataAnnotations; // Validation

namespace ELibraryApi.Dtos.Review
{
    public class UpdateReviewDto
    {
        [Required, MinLength(5), MaxLength(150)]      // Same rules as create
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(5), MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; }
    }
}