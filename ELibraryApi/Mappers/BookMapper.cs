using ELibraryApi.Dtos.Book;
using ELibraryApi.Models;

namespace ELibraryApi.Mappers
{
    public static class BookMapper
    {
        public static BookDto ToBookDto(this Book b)
        {
            return new BookDto
            {
                Id = b.Id,
                Title = b.Title,
                Isbn = b.Isbn,
                Description = b.Description,
                Price = b.Price,
                StockQuantity = b.StockQuantity,
                PublishedDate = b.PublishedDate,
                CoverImageUrl = b.CoverImageUrl,
                CategoryId = b.CategoryId,
                CategoryName = b.Category?.Name,        // From nav (may be null)
                AuthorNames = b.BookAuthors?            // Author names
                        .Where(ba => ba.Author != null) // Guard nulls
                        .Select(ba => $"{ba.Author!.FirstName} {ba.Author!.LastName}") // Compose
                        .ToList() ?? new List<string>(),// Empty fallback
                
                AverageRating = b.Reviews != null && b.Reviews.Count > 0    // Avg
                        ? b.Reviews.Average(r => r.Rating)      // Compute
                        : 0,
                ReviewCount = b.Reviews?.Count ?? 0     // Count
            };
        }
    }
}