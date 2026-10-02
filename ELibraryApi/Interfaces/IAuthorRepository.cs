using ELibraryApi.Helpers;
using ELibraryApi.Models;

namespace ELibraryApi.Interfaces
{
    public interface IAuthorRepository
    {
        Task<PagedResult<Author>> GetAllAsync(QueryObject query);   // Paginated list
        Task<Author?> GetByIdAsync(int id);         // Single by id
        Task<Author> CreateAsync(Author author);    // Insert
        Task<Author?> UpdateAsync(int id, Author updated);        // Update
        Task<Author?> DeleteAsync(int id);                        // Delete
        Task<bool> ExistsAsync(int id);                           // Existence check
        Task<List<Author>> GetByIdsAsync(List<int> ids);          // Bulk fetch for book creation
    }
}