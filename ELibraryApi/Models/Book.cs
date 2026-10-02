using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELibraryApi.Models
{
    // A book in the catalog
    public class Book
    {
        [Key]
        public int Id { get; set; }     // PK

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;    // Title

        [Required, MaxLength(20)]
        public string Isbn { get; set; } = string.Empty;    // ISBN (will be UNIQUE)

        [MaxLength(2000)]
        public string? Description { get; set; }    // Optional log description

        [Column(TypeName ="decimal(18, 2)")]    // Money type
        [Range(0, 100000)]      // Price bounds
        public decimal Price { get; set; }  // Sale price

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }  // Inventory count

        public DateTime PublishedDate { get; set; } // When the book was published

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }  // Optional cover URL

        // FK to Category (3NF: we only store the Id, not the category name)
        public int CategoryId { get; set; }
        [ForeignKey(nameof(CategoryId))]
        public Category? Category { get; set; } // Navigation back to category

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Audit
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;  // Audit

        // M --- M with Author
        public List<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();

        // 1 --- M with Review
        public List<Review> Reviews { get; set; } = new List<Review>();
    }
}