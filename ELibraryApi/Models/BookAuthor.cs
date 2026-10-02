using System.ComponentModel.DataAnnotations.Schema; // For composite-key annotations

namespace ELibraryApi.Models
{
    // Junction table for the Book ↔ Author many-to-many relationship
    public class BookAuthor
    {
        public int BookId { get; set; }    // FK to Book
        public Book? Book { get; set; }    // Navigation to Book

        public int AuthorId { get; set; }  // FK to Author
        public Author? Author { get; set; }// Navigation to Author
    }
}