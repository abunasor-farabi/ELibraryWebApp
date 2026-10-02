using System.ComponentModel.DataAnnotations; // Validation

namespace ELibraryApi.Dtos.Book
{
    // Same shape as CreateBookDto
    public class UpdateBookDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Isbn { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Range(0, 100000)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        public DateTime PublishedDate { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public List<int> AuthorIds { get; set; } = new();
    }
}