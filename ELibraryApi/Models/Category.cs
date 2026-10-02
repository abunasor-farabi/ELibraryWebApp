using System.ComponentModel.DataAnnotations;

namespace ELibraryApi.Models
{
    // Category of books (e.g. "Science Fiction", "History")
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]      // Not null
        [MaxLength(100)]        // Varchar(100)
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]        // Optional description
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Audit field

        // Navigation: one category has many books (1 --> M)
        public List<Book> Books { get; set; } = new List<Book>();
    }
}