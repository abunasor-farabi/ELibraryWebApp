using ELibraryApi.Dtos.Author;
using ELibraryApi.Models;

namespace ELibraryApi.Mappers
{
    public static class AuthorMapper
    {
        public static AuthorDto ToAuthorDto(this Author a)
        {
            return new AuthorDto
            {
               Id = a.Id, //Id
               FirstName = a.FirstName, // FirstName
               LastName = a.LastName,   // LastName
               FullName = $"{a.FirstName} {a.LastName}",    // Computed FullName
               Country = a.Country,         // Country
               Bio = a.Bio,         // Bio
               BirthDate = a.BirthDate  // BurthDate 
            };
        }

        public static Author ToAuthorFromCreate(this CreateAuthorDto dto)
        {
            return new Author
            {
                FirstName = dto.FirstName.Trim(),   // Trim
                LastName = dto.LastName.Trim(),     // Trim
                Country = dto.Country?.Trim(),      // Trim if present
                Bio = dto.Bio?.Trim(),              // Trim if present
                BirthDate = dto.BirthDate           // Copy date
            };
        }

        public static Author ToAuthorFromUpdate(this UpdateAuthorDto dto)
        {
            return new Author
            {
                FirstName = dto.FirstName.Trim(),   // Trim
                LastName = dto.LastName.Trim(),     // Trim
                Country = dto.Country?.Trim(),      // Trim if present
                Bio = dto.Bio?.Trim(),              // Trim if present
                BirthDate = dto.BirthDate           // Copy date
            };
        }
    }
}