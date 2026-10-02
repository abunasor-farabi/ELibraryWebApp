using ELibraryApi.Dtos.Category;
using ELibraryApi.Models;

namespace ELibraryApi.Mappers
{
    public static class CategoryMapper
    {
        // Model --> DTO
        public static CategoryDto ToCategoryDto(this Category c)
        {
            return new CategoryDto
            {
                Id = c.Id,      // Copy Id
                Name = c.Name,  // Copy Name
                Description = c.Description,    // Copy Description
                CreatedAt = c.CreatedAt,        // Copy CreatedAt
                BookCount = c.Books?.Count ?? 0 // Compute BookCount if Loaded
            };
        }

        // CreateDto --> Model
        public static Category ToCategoryFromCreate(this CreateCategoryDto dto)
        {
            return new Category
            {
                Name = dto.Name.Trim(),     // Trim whitespace
                Description = dto.Description?.Trim() // Trim if provided
            };
        }

        // UpdateDto --> Model
        public static Category ToCategoryFromUpdate(this UpdateCategoryDto dto)
        {
            return new Category
            {
                Name = dto.Name.Trim(),     // Trim whitespace
                Description = dto.Description?.Trim()   // Trim if provided
            };
        }
    }
}