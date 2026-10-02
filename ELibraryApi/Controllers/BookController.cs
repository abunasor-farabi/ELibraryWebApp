using ELibraryApi.Dtos.Book;
using ELibraryApi.Helpers;
using ELibraryApi.Interfaces;
using ELibraryApi.Mappers;
using ELibraryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ELibraryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly IBookRepository _bookRepo; // Injected
        private readonly ICategoryRepository _catRepo;  // For FK validation
        private readonly IAuthorRepository _authorRepo; // For author validation

        public BookController(IBookRepository bookPepo,
                            ICategoryRepository catRepo,
                            IAuthorRepository authorRepo)
        {
            _bookRepo = bookPepo;   // Save
            _catRepo = catRepo;     // Save
            _authorRepo = authorRepo;   // Save
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] QueryObject query)
        {
            var paged = await _bookRepo.GetAllAsync(query);     // Repo page
            var dtos = paged.Items.Select(b => b.ToBookDto()).ToList(); // Map

            return Ok(new
            {
                items = dtos,
                pageNumber = paged.PageNumber,
                pageSize = paged.PageSize,
                totalCount = paged.TotalCount,
                totalPages = paged.TotalPages,
                hasPrevious = paged.HasPrevious,        // Previous
                hasNext = paged.HasNext     // Next
            });
        }

        // GET /api/book/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var book = await _bookRepo.GetByIdAsync(id);        // Repo fetch
            if (book == null) return NotFound($"Book {id} not found");  // 404

            return Ok(book.ToBookDto());        // 200
        }

        // POST /api/book (Admin/Editor)
        [HttpPost]
        [Authorize(Roles = "Admin,Editor")]
        public async Task<IActionResult> Create([FromBody] CreateBookDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);     // 400

            // Validate category exists
            if (!await _catRepo.ExistsAsync(dto.CategoryId))
                return BadRequest($"Category {dto.CategoryId} does not exist.");    // 400
            
            // Validate every author id exists
            if (dto.AuthorIds.Count > 0)
            {
                var authors = await _authorRepo.GetByIdsAsync(dto.AuthorIds);       // Bulk fetch
                if (authors.Count != dto.AuthorIds.Distinct().Count())
                    return BadRequest("One or more authors do not exists.");    // 400
            }

            // ISBN uniqueness
            if (await _bookRepo.GetByIsbnAsync(dto.Isbn) != null)
                return Conflict($"Book with ISBN '{dto.Isbn}' already exists.");    // 404
            
            // Build the model
            var model = new Book
            {
                Title = dto.Title.Trim(),   // Title
                Isbn = dto.Isbn.Trim(),     // ISBN
                Description = dto.Description?.Trim(),  // Description
                Price = dto.Price,          // Price
                StockQuantity = dto.StockQuantity,      // Stock
                PublishedDate = dto.PublishedDate,      // Publish date
                CoverImageUrl = dto.CoverImageUrl,      // Cover
                CategoryId = dto.CategoryId             // FK
            };

            var created = await _bookRepo.CreateAsync(model, dto.AuthorIds.Distinct().ToList());    // Save
            // Reload with relations for a complete response
            var full = await _bookRepo.GetByIdAsync(created.Id);    // Fetch full

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, full!.ToBookDto());
        }

        // PUT /api/book/{id} (Admin/Editor)
        [HttpPut("{id:int}")]
        [Authorize(Roles ="Admin,Editor")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateBookDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState); // 400

            // Validate category
            if (!await _catRepo.ExistsAsync(dto.CategoryId))
                return BadRequest($"Category {dto.CategoryId} does not exist.");    // 400

            // Validate authors
            if (dto.AuthorIds.Count > 0)
            {
                var authors = await _authorRepo.GetByIdsAsync(dto.AuthorIds);   // Bulk fetch

                if (authors.Count != dto.AuthorIds.Distinct().Count())
                    return BadRequest("One or more authors do not exist.");     // 400
            }

            // ISBN uniqueness - must not collide with a "different" book
            var isbnOwner = await _bookRepo.GetByIsbnAsync(dto.Isbn);       // Lookup
            if(isbnOwner != null && isbnOwner.Id != id)
                return Conflict($"ISBN '{dto.Isbn}' is used by another book."); // 409

            var updated = await _bookRepo.UpdateAsync(id, dto);     // Repo update
            if (updated == null) return NotFound($"Book {id} not found");   // 404

            var full = await _bookRepo.GetByIdAsync(updated.Id);    // Reload full
            return Ok(full!.ToBookDto());
        }

        // DELETE /api/book/{id} (Admin only)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var deleted = await _bookRepo.DeleteAsync(id);      // Repo delete
            if (deleted == null) return NotFound($"Book {id} not found");   // 404

            return NoContent();     // 204
        }
    }
}