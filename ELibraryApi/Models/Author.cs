using System.ComponentModel.DataAnnotations; // Data annotations

namespace ELibraryApi.Models
{
    // An author of books
    public class Author
    {
        [Key]
        public int Id { get; set; }              // PK

        [Required, MaxLength(80)]
        public string FirstName { get; set; } = string.Empty;   // First name

        [Required, MaxLength(80)]
        public string LastName { get; set; } = string.Empty;    // Last name

        [MaxLength(80)]
        public string? Country { get; set; }                    // Country of origin

        [MaxLength(1000)]
        public string? Bio { get; set; }                        // Short biography

        public DateTime? BirthDate { get; set; }                // Optional birth date

        // Navigation: M-M through BookAuthor junction
        public List<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
    }
}