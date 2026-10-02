using ELibraryApi.Models;

namespace ELibraryApi.Interfaces
{
    // Contract for producing JWTs
    public interface ITokenService
    {
        // Returns a signed JWT string for the given user
        string CreateToken(AppUser user, IList<string> roles);
    }
}