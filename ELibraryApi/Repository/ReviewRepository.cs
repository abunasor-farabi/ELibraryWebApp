using ELibraryApi.Data;
using ELibraryApi.Helpers;
using ELibraryApi.Interfaces;
using ELibraryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ELibraryApi.Repository
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ApplicationDbContext _context; // DbContext

        public ReviewRepository(ApplicationDbContext context) => _context = context;

        public async Task<Review> CreateAsync(Review review)
        {
            await _context.Reviews.AddAsync(review);    // Stage
            await _context.SaveChangesAsync();      // Commit
            return review;              // Return with Id
        }

        public async Task<Review?> DeleteAsync(int id)
        {
            var existing = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);
            if (existing == null) return null;      // Not found

            _context.Reviews.Remove(existing);      // Stage delete
            await _context.SaveChangesAsync();      // Commit
            return existing;                        // Return
        }

        // Paginated reviews for one book
        public async Task<PagedResult<Review>> GetByBookAsync(int bookId, QueryObject query)
        {
            var queryable = _context.Reviews
                .AsNoTracking()
                .Include(r => r.AppUser)        // Reviewer info
                .Where(r => r.BookId == bookId) // Restrict to book
                .AsQueryable();
            
            // Sort newest first by default
            queryable = query.IsDescending
                ?  queryable.OrderBy(r => r.CreatedOn)
                : queryable.OrderByDescending(r => r.CreatedOn);
            
            var totlaCount = await queryable.CountAsync();  // Count total

            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();     // Paged items
            
            return new PagedResult<Review>
            {
                Items = items,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totlaCount
            };
        }

        public async Task<Review?> GetByIdAsync(int id) => 
            await _context.Reviews.AsNoTracking().Include(r => r.AppUser).FirstOrDefaultAsync(r => r.Id == id);
        public async Task<Review?> UpdateAsync(int id, Review updated)
        {
            var existing = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);
            if (existing == null) return null;  // Not found

            existing.Title = updated.Title;     // Copy
            existing.Content = updated.Content; // Copy
            existing.Rating = updated.Rating;   // Copy
            existing.UpdatedOn = DateTime.UtcNow;  // Touch timestamp

            await _context.SaveChangesAsync();  // Persist
            return existing;                    // Return
        }
    }
}