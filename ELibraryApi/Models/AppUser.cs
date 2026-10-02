// Bring in IdentityUser base class
using Microsoft.AspNetCore.Identity;

namespace ELibraryApi.Models
{
    // AppUser inherits all Identity.fields (Id, UserName, Email, PasswordHash, etc.)
    public class AppUser : IdentityUser
    {
        // Navigation: one user can post many reviews (1 + M)
        public List<Review> Reviews { get; set; } = new List<Review>();
    }
}