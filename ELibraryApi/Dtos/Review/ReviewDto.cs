namespace ELibraryApi.Dtos.Review
{
    public class ReviewDto
    {
        public int Id { get; set; }                         // Review id
        public string Title { get; set; } = string.Empty;   // Headline
        public string Content { get; set; } = string.Empty; // Body
        public int Rating { get; set; }                     // 1-5 stars
        public DateTime CreatedOn { get; set; }             // Created at
        public DateTime? UpdatedOn { get; set; }            // Updated at
        public int BookId { get; set; }                     // FK to Book
        public string? UserName { get; set; }               // Reviewer display name
    }
}