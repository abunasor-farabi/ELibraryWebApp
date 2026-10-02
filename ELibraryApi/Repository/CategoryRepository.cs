using ELibraryApi.Data;
using ELibraryApi.Helpers;
using ELibraryApi.Interfaces;
using ELibraryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ELibraryApi.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context; // Injected DbCOntext

        // DI: context comes from the container
        public CategoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        // Insert a new category
        public async Task<Category> CreateAsync(Category category)
        {
            await _context.Categories.AddAsync(category);   // State
            await _context.SaveChangesAsync();      // Commit
            return category;        // Return with generated Id
        }
        // Delete a category
        public async Task<Category?> DeleteAsync(int id)
        {
            var existing = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);

            if (existing == null) return null;  // Not found

            _context.Categories.Remove(existing);   // Stage removal
            await _context.SaveChangesAsync();      // Commit
            return existing;
        }

        // Existance check
        public Task<bool> ExistsAsync(int id) => 
            _context.Categories.AnyAsync(c => c.Id == id);

        // Paginated, searchable list
        public async Task<PagedResult<Category>> GetAllAsync(QueryObject query)
        {
            // Start with the Categories table (read-only, no tracking for pref)
            var queryable = _context.Categories.AsNoTracking().AsQueryable();

            // Filter: text search on Name
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                queryable = queryable.Where(c => c.Name.Contains(query.Search));
            }

            // Sort: name ascending by default; support descending
            queryable = query.IsDescending 
                ? queryable.OrderByDescending(c => c.Name) 
                : queryable.OrderBy(c => c.Name);

            // Total before pagination - needed for PagedResult
            var totalCount = await queryable.CountAsync();
            
            // Skip/Take for the requested page
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();
            
            //  Wrap in PagedResult
            return new PagedResult<Category>
            {
                Items = items,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totalCount
            };
        }

        // Fetch by id (no tracking)
        public async Task<Category?> GetByIdAsync(int id) =>
            await _context.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);

        // Fetch by name (case - insensitive via ToLower)
        public async Task<Category?> GetByNameAsync(string name) => 
            await _context.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());

        
        // Update an existing category
        public async Task<Category?> UpdateAsync(int id, Category updated)
        {
            // Load the tracked entity so EF can detect changes
            var existing = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);

            if (existing == null) return null;      // Not found

            existing.Name = updated.Name;       // Copy fields
            existing.Description = updated.Description; // Copy fields

            await _context.SaveChangesAsync();      // Persist
            return existing;        // Return updated entity
        }

    }
}