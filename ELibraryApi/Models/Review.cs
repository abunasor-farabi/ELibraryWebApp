using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELibraryApi.Models
{
    // A user review on a book
    public class Review
    {
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string Title { get; set; } = string.Empty; // Review headline

        [Required, MaxLength(2000)]
        public string Content { get; set; } = string.Empty; // Review body

        [Range(1, 5)]
        public int Rating { get; set; } // Star rating (1-5)

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;  // Creation timestamp
        public DateTime? UpdatedOn { get; set; }    // Nullable updated timestamp

        // FK to Book
        public int BookId { get; set; }
        [ForeignKey(nameof(BookId))]
        public Book? Book { get; set; } // Navigation

        // FK to AppUser
        public string AppUserId { get; set; } = string.Empty;
        [ForeignKey(nameof(AppUserId))]
        public AppUser? AppUser { get; set; }   // Navigation
    }
}