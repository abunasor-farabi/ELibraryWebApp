using ELibraryApi.Dtos.Category;
using ELibraryApi.Helpers;      // QueryObject
using ELibraryApi.Interfaces;   // ICategoryRepository
using ELibraryApi.Mappers;      // Extension-mappers
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc; // ControllerBase

namespace ELibraryApi.Controllers
{
    [Route("api/[controller]")]      // /api/category
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryRepository _repo; // Injected repo
        public CategoryController(ICategoryRepository repo)
        {
            _repo = repo;
        }

        // GET /api/category?search=&sortBy=&isDescending=&pageNumber=&pageSize=
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] QueryObject query)
        {
            var paged = await _repo.GetAllAsync(query);     // Get page
            var dtos = paged.Items.Select(c => c.ToCategoryDto()).ToList();     // Map

            // Return paged wrapper with mapped items
            return Ok(new
            {
                items = dtos,
                pagedNumber = paged.PageNumber,
                pageSize = paged.PageSize,
                totalCount = paged.TotalCount,
                totalPages = paged.TotalPages,
                hasPrevious = paged.HasPrevious,
                hasNext = paged.HasNext
            });
        }

        // GET /api/category/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var category = await _repo.GetByIdAsync(id);        // Fetch
            if (category == null) return NotFound($"Category {id} not found");   // 404

            return Ok(category.ToCategoryDto());        // 200 + DTO
        }

        // POST /api/category (Admin/Editor only)
        [HttpPost]
        [Authorize(Roles ="Admin, Editor")]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);     // 400

            // Check unique name
            var existing = await _repo.GetByNameAsync(dto.Name);    // 400

            if (existing != null) return Conflict($"Category '{dto.Name}' already exists.");

            var model = dto.ToCategoryFromCreate();     // Map
            var created = await _repo.CreateAsync(model);   // Save

            return CreatedAtAction(nameof(GetById), new {id = created.Id }, created.ToCategoryDto());
        }
        
        // PUT /api/category/{id} (Admin/Editor only)
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Editor")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateCategoryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);     // 400

            var updated = await _repo.UpdateAsync(id, dto.ToCategoryFromUpdate());  // Repo update

            if (updated == null) return NotFound($"Category {id} not found");       // 404

            return Ok(updated.ToCategoryDto());         // 200
        }

        // DELETE /api/category/{id} (Admin only)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var deleted = await _repo.DeleteAsync(id);      // Repo delete
            if (deleted == null) return NotFound($"Category {id} not found");   // 404

            return NoContent();                 // 204
        }
    }
}