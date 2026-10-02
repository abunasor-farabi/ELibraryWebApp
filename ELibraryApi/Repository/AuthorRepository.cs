using ELibraryApi.Data;
using ELibraryApi.Helpers;
using ELibraryApi.Interfaces;
using ELibraryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ELibraryApi.Repository
{
    public class AuthorRepository : IAuthorRepository
    {
        private readonly ApplicationDbContext _context; // Inject DbContext

        public AuthorRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Author> CreateAsync(Author author)
        {
            await _context.Authors.AddAsync(author);    // Stage
            await _context.SaveChangesAsync();          // Commit
            return author;          // Return with Id
        }

        public async Task<Author?> DeleteAsync(int id)
        {
            var existing = await _context.Authors.FirstOrDefaultAsync(a => a.Id == id);
            if (existing == null) return null;      // Not found

            _context.Authors.Remove(existing);      // Stage delete
            await _context.SaveChangesAsync();      // Commit
            return existing;                        // Return removed
        }

        public Task<bool> ExistsAsync(int id) => 
            _context.Authors.AnyAsync(a => a.Id == id); // Existence check


        // Paginated, searchable list
        public async Task<PagedResult<Author>> GetAllAsync(QueryObject query)
        {
            var queryable = _context.Authors.AsNoTracking().AsQueryable();  // Base

            // Text search over first + last name
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.ToLower();   // Local var for EF translation
                queryable = queryable.Where(a => a.FirstName.ToLower().Contains(s) 
                                                || a.LastName.ToLower().Contains(s));
            }

            // Sort by LastName then FirstName
            queryable = query.IsDescending
                ? queryable.OrderByDescending(a => a.LastName).ThenByDescending(a => a.FirstName)
                : queryable.OrderBy(a => a.LastName).ThenBy(a => a.FirstName);

            var totalCount = await queryable.CountAsync();  // Count total

            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();     // Paged items

            return new PagedResult<Author>
            {
                Items = items,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totalCount
            };
        }

        public async Task<Author?> GetByIdAsync(int id) => 
            await _context.Authors.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);

        // Bulk fetch - used to attach authors when creating books
        public async Task<List<Author>> GetByIdsAsync(List<int> ids) =>
            await _context.Authors.Where(a => ids.Contains(a.Id)).ToListAsync();

        public async Task<Author?> UpdateAsync(int id, Author updated)
        {
            var existing = await _context.Authors.FirstOrDefaultAsync(a => a.Id == id);
            if (existing == null) return null;      // Not found

            existing.FirstName = updated.FirstName; // Copy fields
            existing.LastName = updated.LastName;   // Copy fields
            existing.Country = updated.Country;     // Copy fields
            existing.Bio = updated.Bio;             // Copy fields
            existing.BirthDate = updated.BirthDate; // Copy fields

            await _context.SaveChangesAsync();      // Persist
            return existing;
        }
    }
}