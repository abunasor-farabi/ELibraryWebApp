namespace ELibraryApi.Dtos.Account
{
    // Response returned after successful login/registration
    public class NewUserDto
    {
        public string UserName { get; set; } = string.Empty;   // Confirmed username
        public string Email { get; set; } = string.Empty;      // Confirmed email
        public string Token { get; set; } = string.Empty;      // Signed JWT
        public List<string> Roles { get; set; } = new();       // Roles assigned to user
    }
}