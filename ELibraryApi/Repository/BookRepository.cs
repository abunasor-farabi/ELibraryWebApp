using ELibraryApi.Data;
using ELibraryApi.Dtos.Book;
using ELibraryApi.Helpers;
using ELibraryApi.Interfaces;
using ELibraryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ELibraryApi.Repository
{
    public class BookRepository : IBookRepository
    {
        private readonly ApplicationDbContext _context; // DbContext

        public BookRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // Create hook + junction rows in one transaction (single SaveChanges)
        public async Task<Book> CreateAsync(Book book, List<int> authorIds)
        {
            await _context.Books.AddAsync(book);    // Stage book (Id generated on save)

            // Attach junction rows in-memory (EF will insert them together)
            foreach (var authorId in authorIds)
            {
                book.BookAuthors.Add(new BookAuthor { AuthorId = authorId, Book = book });
            }

            await _context.SaveChangesAsync();  // Commit everything automatically
            return book;            // Return published entity
        }   

         // Delete book (cascade deletes junction + reviews)
        public async Task<Book?> DeleteAsync(int id)
        {
            var existing = await _context.Books.FirstOrDefaultAsync(b => b.Id == id);

            if (existing == null) return null; // Not found

            _context.Books.Remove(existing);    // Stage delete
            await _context.SaveChangesAsync();  // Commit
            return existing;        // Return removed
        }

        // Paginated, filterable, sortable list with related data included        
        public async Task<PagedResult<Book>> GetAllAsync(QueryObject query)
        {
            // Include related data (Category + Author + Reviews) so mappers can read them
            var queryable = _context.Books
                .AsNoTracking()
                .Include(b => b.Category)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.Reviews)
                .AsQueryable();

            // Filter by category
            if (query.CategoryId.HasValue)
                queryable = queryable.Where(b => b.CategoryId == query.CategoryId.Value);

            // Filter by author (through junction)
            if (query.AuthorId.HasValue)
                queryable = queryable.Where(b => b.BookAuthors.Any(ba => ba.AuthorId ==query.AuthorId.Value));

            // Free-text search on title
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.ToLower();     // Local for EF
                queryable = queryable.Where(b => b.Title.ToLower().Contains(s));
            }

            // Sort by a whitelist of fields
            queryable = (query.SortBy?.ToLower()) switch
            {
                "price" => query.IsDescending ? queryable.OrderByDescending(b => b.Price)
                    : queryable.OrderBy(b => b.Price),
                "published" => query.IsDescending ? queryable.OrderByDescending(b => b.PublishedDate)
                    : queryable.OrderBy(b => b.PublishedDate),
                _ => query.IsDescending ? queryable.OrderByDescending(b => b.Title)
                    : queryable.OrderBy(b => b.Title)
            };

            var totalCount = await queryable.CountAsync();  // Count total

            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();         // Paged items
            
            return new PagedResult<Book>
            {
                Items = items,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totalCount
            };
        }

        // Single book with all relations
        public async Task<Book?> GetByIdAsync(int id) => 
            await _context.Books
                .AsNoTracking()
                .Include(b => b.Category)   // Include category
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)   // Include authors
                .Include(b => b.Reviews)    // Include reviews
                .FirstOrDefaultAsync(b => b.Id == id);

        // Lookup by ISBN for uniqueness check
        public async Task<Book?> GetByIsbnAsync(string isbn) => 
            await _context.Books.AsNoTracking().FirstOrDefaultAsync(b => b.Isbn == isbn);

        // Update book fields and replace author links
        public async Task<Book?> UpdateAsync(int id, UpdateBookDto dto)
        {
            // Load with tracking so EF can compute deltas
            var existing = await _context.Books
                .Include(b => b.BookAuthors)    //Include junction rows
                .FirstOrDefaultAsync(b => b.Id == id);

            if (existing == null) return null; // Not found

            // Copy scalar fields
            existing.Title = dto.Title;
            existing.Isbn = dto.Isbn;
            existing.Description = dto.Description;
            existing.Price = dto.Price;
            existing.StockQuantity = dto.StockQuantity;
            existing.PublishedDate = dto.PublishedDate;
            existing.CoverImageUrl = dto.CoverImageUrl;
            existing.CategoryId = dto.CategoryId;
            existing.UpdatedAt = DateTime.UtcNow; // Touch timestamp

            // Replace author links: remove all then re-add
            _context.BookAuthors.RemoveRange(existing.BookAuthors); // Remove existing
            existing.BookAuthors = dto.AuthorIds
                .Select(aid => new BookAuthor { BookId = existing.Id, AuthorId = aid}).ToList();

            await _context.SaveChangesAsync(); // Persist changes
            return existing;                   // Return updated entity
        }
    }
}