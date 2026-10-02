using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ELibraryApi.Interfaces;
using ELibraryApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace ELibraryApi.Service
{
    public class TokenService : ITokenService
    {

        private readonly IConfiguration _config;    // Reads JWT setings
        private readonly SymmetricSecurityKey _key; // HMAC key

        // DI: config injected
        public TokenService(IConfiguration config)
        {
            _config = config;       // Save config
            _key = new SymmetricSecurityKey(    // Build Symmetric key
                Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]!)
            );
        }
        
        // Build the JWT for the given user + roles
        public string CreateToken(AppUser user, IList<string> roles)
        {
            // Claims = facts about the user embedded in the token
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""), // Email claim
                new Claim(JwtRegisteredClaimNames.GivenName, user.UserName ?? ""),  // User username claim
                new Claim(ClaimTypes.NameIdentifier, user.Id),  // User Id claims (used by controllers)
            };

            // Add one role claim per role - [Authorize(Roles="Admin)] reads these
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));
            
            // Signing credentials - HS512
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256Signature);

            // Describe the token
            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),   // Attach claims
                Expires = DateTime.UtcNow.AddDays(1),   // 1 - day lifetime
                SigningCredentials = creds,             // Signature
                Issuer = _config["JWT:Issuer"],         // Issuer (must match validation)
                Audience = _config["JWT:Audience"]      // Audience (must match validation)
            };

            // Build + serialize
            var handler = new JwtSecurityTokenHandler(); // Handler
            var token = handler.CreateToken(descriptor); // Create token object
            return handler.WriteToken(token);            // Return compact
        }
    }
}