using System.Security.Claims;
using ELibraryApi.Dtos.Review;
using ELibraryApi.Helpers;
using ELibraryApi.Interfaces;
using ELibraryApi.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ELibraryApi.Controllers
{
    [Route("api/[controller]")]     // /api/review
    [ApiController]
    [Authorize]                     // Every endpoint requires a token
    public class ReviewController : ControllerBase
    {
        private readonly IReviewRepository _reviewRepo; // Reviews
        private readonly IBookRepository _bookRepo;     // Book existence
        
        public ReviewController(IReviewRepository reviewRepo, IBookRepository bookRepo)
        {
            _reviewRepo = reviewRepo;   // Save
            _bookRepo = bookRepo;       // Save
        }

        // Helper: current user id from JWT
        private string CurrentUserId() => 
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        
        // GET /api/review/book/{bookId}
        [HttpGet("book/{bookId:int}")]
        [AllowAnonymous]                // Browsing reviews is public
        public async Task<IActionResult> GetByBook([FromRoute] int bookId, [FromQuery] QueryObject query)
        {
            // Verify book exists
            if (await _bookRepo.GetByIdAsync(bookId) == null)
                return NotFound($"Book {bookId} not found");    // 404
            
            var paged = await _reviewRepo.GetByBookAsync(bookId, query);    // Repo page
            var dtos = paged.Items.Select(r => r.ToReviewDto()).ToList();   // Map

            return Ok(new
            {
                items = dtos,
                pageNumber = paged.PageNumber,
                pageSize = paged.PageSize,
                totalCount = paged.TotalCount,
                totalPages = paged.TotalPages,
                hasPrevious = paged.HasPrevious,
                hasNext = paged.HasNext
            });
        }

        // GET /api/review/{id}
        [HttpGet("{id:int}")]
        [AllowAnonymous]        // Public read
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var review = await _reviewRepo.GetByIdAsync(id);    // Fetch
            if (review == null) return NotFound($"Review {id} not found");  // 404

            return Ok(review.ToReviewDto());        // 200
        }

        // POST /api/review/book/{bookId}
        [HttpPost("book/{bookId:int}")]
        public async Task<IActionResult> Create([FromRoute] int bookId, [FromBody] CreateReviewDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState); // 400

            // Book must exist
            if (await _bookRepo.GetByIdAsync(bookId) == null)
                return NotFound($"Book {bookId} not found");        // 404
            
            var model = dto.ToReviewFromCreate(bookId, CurrentUserId());    // Map
            var created = await _reviewRepo.CreateAsync(model);     // Save

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToReviewDto());
        }

        // PUT /api/review/{id} - only owner or Admin
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateReviewDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState); // 400

            var existing = await _reviewRepo.GetByIdAsync(id);      // Fetch
            if (existing == null) return NotFound($"Review {id} not found"); // 404

            var isOwner = existing.AppUserId == CurrentUserId();    // Owner?
            var isAdmin = User.IsInRole("Admin");                   // Admin?

            if (!isOwner && !isAdmin)
                return Forbid();            // 403

            // Reuse model object for repo update
            var updateModel = new Models.Review
            {
                Title = dto.Title.Trim(),       // Titile
                Content = dto.Content.Trim(),       // Content
                Rating = dto.Rating             // Rating
            };

            var updated = await _reviewRepo.UpdateAsync(id, updateModel);    // Repo
            return Ok(updated!.ToReviewDto());      // 200
        }

        // DELETE /api/review/{id} - only owner or Admin
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var existing = await _reviewRepo.GetByIdAsync(id);  // Fetch
            if (existing == null) return NotFound($"Review {id} not found"); // 404

            var isOwner = existing.AppUserId == CurrentUserId();        // Owner?
            var isAdmin = User.IsInRole("Admin");       // Admin?

            if (!isOwner && !isAdmin) return Forbid();     // 403

            await _reviewRepo.DeleteAsync(id);      // Delete
            return NoContent();     // 204
        }
    }
}