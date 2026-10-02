namespace ELibraryApi.Dtos.Category
{
    // Returned by GET endpoints (never exposes EF internals)
    public class CategoryDto
    {
        public int Id { get; set; }                     // Category id
        public string Name { get; set; } = string.Empty;// Name
        public string? Description { get; set; }        // Description
        public DateTime CreatedAt { get; set; }         // Created timestamp
        public int BookCount { get; set; }              // Computed count of books
    }
}