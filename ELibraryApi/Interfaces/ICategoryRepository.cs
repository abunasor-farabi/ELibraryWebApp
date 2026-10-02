using ELibraryApi.Helpers;
using ELibraryApi.Models;

namespace ELibraryApi.Interfaces
{
    public interface ICategoryRepository
    {
        Task<PagedResult<Category>> GetAllAsync(QueryObject query); // Paginated List
        Task<Category?> GetByIdAsync(int id);      // Single by id
        Task<Category?> GetByNameAsync(string name);   // Single by name(uniqueness check)
        Task<Category> CreateAsync(Category category); // Insert
        Task<Category?> UpdateAsync(int id, Category updated);  // Update
        Task<Category?> DeleteAsync(int id);                    // Delete
        Task<bool> ExistsAsync(int id);                         // Existance check
    }
}