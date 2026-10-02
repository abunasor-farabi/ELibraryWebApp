using ELibraryApi.Dtos.Author;
using ELibraryApi.Helpers;
using ELibraryApi.Interfaces;
using ELibraryApi.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ELibraryApi.Controllers
{
    [Route("api/[controller]")]     // /api/author
    [ApiController]
    public class AuthorController : ControllerBase
    {
        private readonly IAuthorRepository _repo;       // Injected repo

        public AuthorController(IAuthorRepository repo)
        {
            _repo = repo;   // Injected repo
        }

        // GET /api/author
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] QueryObject query)
        {
            var paged = await _repo.GetAllAsync(query);

            var dtos = paged.Items.Select(a => a.ToAuthorDto()).ToList();       // Map

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

        // GET /api/author/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var author = await _repo.GetByIdAsync(id);      // Repo fetch
            if (author == null) return NotFound($"Author {id} not found");  // 404

            return Ok(author.ToAuthorDto());            // 200
        }

        // POST /api/author (Admin/Editor)
        [HttpPost]
        [Authorize(Roles = "Admin,Editor")]
        public async Task<IActionResult> Create([FromBody] CreateAuthorDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);     // 400

            var model = dto.ToAuthorFromCreate();       // Map
            var created = await _repo.CreateAsync(model);   // Save

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToAuthorDto());
        }

        // PUT /api/author/{id} (Admin/Editor)
        [HttpPut("{id:int}")]
        [Authorize(Roles ="Admin, Editor")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateAuthorDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);     // 400

            var updated = await _repo.UpdateAsync(id, dto.ToAuthorFromUpdate());    // Repo
            if (updated == null) return NotFound($"Author {id} not found"); // 404

            return Ok(updated.ToAuthorDto());
        }

        // DELETE /api/author/{id} (Admin only)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var deleted = await _repo.DeleteAsync(id);
            if (deleted == null) return NotFound($"Author {id} not found"); // 404

            return NoContent();         // 204
        }
    }
}