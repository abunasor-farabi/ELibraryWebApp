namespace ELibraryApi.Dtos.Author
{
    public class AuthorDto
    {
        public int Id { get; set; }                          // Author id
        public string FirstName { get; set; } = string.Empty; // First name
        public string LastName { get; set; } = string.Empty;  // Last name
        public string FullName { get; set; } = string.Empty;  // Computed full name
        public string? Country { get; set; }                  // Country
        public string? Bio { get; set; }                      // Short bio
        public DateTime? BirthDate { get; set; }              // Birth date
    }
}