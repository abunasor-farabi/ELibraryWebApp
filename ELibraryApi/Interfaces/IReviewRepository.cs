using ELibraryApi.Helpers;  // Query Object, PagedResult
using ELibraryApi.Models;   // Review

namespace ELibraryApi.Interfaces
{
    public interface IReviewRepository
    {
        Task<PagedResult<Review>> GetByBookAsync(int bookId, QueryObject query);    // Reviews for a book
        Task<Review?> GetByIdAsync(int id);     // Single review
        Task<Review> CreateAsync(Review review);    // Create
        Task<Review?> UpdateAsync(int id, Review updated);  // Update
        Task<Review?> DeleteAsync(int id);      // Delete
    }
}