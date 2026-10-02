namespace ELibraryApi.Dtos.Book
{
    public class BookDto
    {
        public int Id { get; set; }                          // Book id
        public string Title { get; set; } = string.Empty;    // Title
        public string Isbn { get; set; } = string.Empty;     // ISBN
        public string? Description { get; set; }             // Description
        public decimal Price { get; set; }                   // Price
        public int StockQuantity { get; set; }               // Stock
        public DateTime PublishedDate { get; set; }          // Publish date
        public string? CoverImageUrl { get; set; }           // Cover URL
        public int CategoryId { get; set; }                  // Category FK
        public string? CategoryName { get; set; }            // Denormalised category name for UI
        public List<string> AuthorNames { get; set; } = new();// List of author full names
        public double AverageRating { get; set; }            // Computed avg rating
        public int ReviewCount { get; set; }                 // Number of reviews
    }
}