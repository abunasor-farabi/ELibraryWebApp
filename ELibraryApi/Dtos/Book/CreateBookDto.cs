using System.ComponentModel.DataAnnotations; // Validation

namespace ELibraryApi.Dtos.Book
{
    public class CreateBookDto
    {
        [Required, MaxLength(200)]                    // Title required
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(20)]                     // ISBN required
        public string Isbn { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }      // Optional

        [Range(0, 100000)]                            // Non-negative price
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]                      // Non-negative stock
        public int StockQuantity { get; set; }

        public DateTime PublishedDate { get; set; }   // Required publish date

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }    // Optional cover

        [Required]                                    // Category FK required
        public int CategoryId { get; set; }

        // At least one author is expected
        public List<int> AuthorIds { get; set; } = new();
    }
}