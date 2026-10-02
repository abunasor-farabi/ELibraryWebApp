using System.ComponentModel.DataAnnotations; // Validation

namespace ELibraryApi.Dtos.Review
{
    public class CreateReviewDto
    {
        [Required, MinLength(5), MaxLength(150)]      // Title rules
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(5), MaxLength(2000)]     // Content rules
        public string Content { get; set; } = string.Empty;

        [Range(1, 5)]                                 // Stars 1-5
        public int Rating { get; set; }
    }
}