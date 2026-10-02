using ELibraryApi.Dtos.Account;
using ELibraryApi.Interfaces;
using ELibraryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ELibraryApi.Controllers
{
    [Route("api/[controller]")]     // Route: /api/account
    [ApiController]         // Enables automatic 400 for invalid ModelState
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;     // Create/find users
        private readonly SignInManager<AppUser> _signInManager; // Password check
        private readonly ITokenService _tokenService;   // JWT generation

        // DI: all three provided by the container
        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, ITokenService tokenService)
        {
            _userManager = userManager;     // Save
            _signInManager = signInManager; // Save
            _tokenService = tokenService;   // Save
        }

        // POST /api/account/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState); // 400 on invalid payload

            // Normalize username to lowerCase (matches how login looks it up)
            var appUser = new AppUser
            {
                UserName = dto.Username.ToLower(),  // Lowercase username
                Email = dto.Email       // Email as-is
            };

            // Create user via Identity (hasheds password, validates uniqueness)
            var created = await _userManager.CreateAsync(appUser, dto.Password);
            if (!created.Succeeded) return BadRequest(created.Errors);  // 400 with Identity errors

            // Decide role: only existing Admin/Editor can hand out higher roles
            string assignedRole = "User";       // Default role
            if (!string.IsNullOrWhiteSpace(dto.Role))   // Client asked for a role
            {
                // Only an already-authenticated Admin can grant roles
                var isAdmin = User?.IsInRole("Admin") ?? false; // Peek current identity

                if (isAdmin && (dto.Role == "Admin" || dto.Role == "Editor" || dto.Role == "User"))
                    assignedRole = dto.Role;        // Honour request
            }

            // Assign the role
            var roleReult = await _userManager.AddToRoleAsync(appUser, assignedRole);
            if (!roleReult.Succeeded) return BadRequest(roleReult.Errors); // 400 on failure

            // Gather roles to embed in token
            var roles = await _userManager.GetRolesAsync(appUser);  // Roles list

            // Build response with signed token
            return Ok(new NewUserDto
            {
                UserName = appUser.UserName!,       // Return username
                Email = appUser.Email,          // Return email
                Token = _tokenService.CreateToken(appUser, roles),  // Sign JWT
                Roles = roles.ToList()          // Return roles
            });
        }

        // POST /api/account/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState); // 400 on invalid payload

            // Find user by normalized lowercase username
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.UserName == dto.Username.ToLower());
            
            if (user == null) return Unauthorized("Invalid username!"); // 401

            // Verify password (lockoutOnFailure = false so failed attempts don't lock)
            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);

            if (!result.Succeeded) return Unauthorized("Invalid credentials."); // 401

            // Gather roles to embed
            var roles = await _userManager.GetRolesAsync(user);     // Roles list

            // Return token
            return Ok(new NewUserDto
            {
                UserName = user.UserName!,      // Username
                Email = user.Email!,    // Email
                Token = _tokenService.CreateToken(user, roles), // JWT
                Roles = roles.ToList()          // Roles
            });
        }

        // GET /api/account/me  (returns current user info)
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            // Pull user id claim out of the token
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId)) return Unauthorized();    // 401

            // Load user
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return Unauthorized();        // 401

            // Gather roles 
            var roles = await _userManager.GetRolesAsync(user);

            // Return a compact payload (no password hash)
            return Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                roles
            });
        }
    }
}