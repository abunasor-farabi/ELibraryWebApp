using ELibraryApi.Dtos.Book;   // DTOs used by update
using ELibraryApi.Helpers;     // QueryObject, PagedResult
using ELibraryApi.Models;      // Book

namespace ELibraryApi.Interfaces
{
    public interface IBookRepository
    {
        Task<PagedResult<Book>> GetAllAsync(QueryObject query);    // Paginated, filtered
        Task<Book?> GetByIdAsync(int id);                          // Single by id (with relations)
        Task<Book?> GetByIsbnAsync(string isbn);                   // Uniqueness check
        Task<Book> CreateAsync(Book book, List<int> authorIds);    // Insert + link authors
        Task<Book?> UpdateAsync(int id, UpdateBookDto dto);        // Update + replace authors
        Task<Book?> DeleteAsync(int id);                           // Delete
    }
}