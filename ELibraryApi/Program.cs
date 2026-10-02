using System.Text;
using ELibraryApi.Data;
using ELibraryApi.Interfaces;
using ELibraryApi.Middleware;
using ELibraryApi.Models;
using ELibraryApi.Repository;
using ELibraryApi.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);

// -- 1. MVC Controllers + NewtonSoft JSON (handles EF reference loops) ---
builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;    // Don't explode on cycle
});


// --- 2. Database: MySQL via Pomelo ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection"); // Read CS
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));   // Register DbContext

// --- 3. ASP.NET Identity ---
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;       // Require a digit
    options.Password.RequireLowercase = true;   // Require a Lowercase
    options.Password.RequireUppercase = true;   // Require an uppercase
    options.Password.RequireNonAlphanumeric = false;    //  No special char needed
    options.Password.RequiredLength = 6;   // Min length 
})
.AddEntityFrameworkStores<ApplicationDbContext>()   // Store users/roles in our DbContext
.AddDefaultTokenProviders();            // Add default token providers

// --- 4. JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;     // Bearer
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;    //  Bearer
    options.DefaultForbidScheme = JwtBearerDefaults.AuthenticationScheme;   // Bearer
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme; // Bearer
    options.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;   // Bearer
    options.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;  // Bearer
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,      // Check Issuer
        ValidIssuer = builder.Configuration["JWT:Issuer"],  // Expected Issuere
        ValidateAudience = true,        // Check Audience
        ValidAudience = builder.Configuration["JWT:Audience"],      // Expected Audience
        ValidateIssuerSigningKey = true,        // Verify
        IssuerSigningKey = new SymmetricSecurityKey(  // Same key as TokenService
            Encoding.UTF8.GetBytes(builder.Configuration["JWT:SigningKey"]!)
        ),

        ClockSkew = TimeSpan.Zero       // No Leeway on expiry
    };
});

// --- 5. Authorization: role-based — nothing extra needed beyond Identity roles ---

// --- 6. Dependency Injection: repos + services ---
builder.Services.AddScoped<ITokenService, TokenService>();                   // Token service
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();       // Category repo
builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();           // Author repo
builder.Services.AddScoped<IBookRepository, BookRepository>();               // Book repo
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();           // Review repo

// --- 7. CORS: allow the React dev servers ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")  // Vite + CRA
              .AllowAnyHeader()                                               // Any headers
              .AllowAnyMethod()                                               // Any method
              .AllowCredentials();                                            // Cookies if needed
    });
});

// --- 8. Swagger with JWT Bearer button ---
builder.Services.AddEndpointsApiExplorer();                                    // Explore endpoints
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "ELibrary API", Version = "v1" }); // Doc info

    // Add the "Authorize" button to the UI
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,                                        // Where header goes
        Description = "Paste your JWT here (without 'Bearer ').",             // Help text
        Name = "Authorization",                                               // Header name
        Type = SecuritySchemeType.Http,                                       // HTTP scheme
        BearerFormat = "JWT",                                                 // Format hint
        Scheme = "Bearer"                                                     // Scheme name
    });

    // Apply the bearer scheme to every endpoint by default
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,                      // Reference a security scheme
                    Id = "Bearer"                                             // Our scheme id
                }
            },
            Array.Empty<string>()                                             // No scopes
        }
    });
});

// --- Build the app ---
var app = builder.Build();

// --- Apply migrations + seed an admin user automatically on startup ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;                                    // Scoped provider
    var db = services.GetRequiredService<ApplicationDbContext>();            // DbContext
    await db.Database.MigrateAsync();                                        // Apply pending migrations

    var userManager = services.GetRequiredService<UserManager<AppUser>>();   // UserManager
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>(); // RoleManager

    // Ensure all three roles exist
    foreach (var role in new[] { "Admin", "Editor", "User" })
    {
        if (!await roleManager.RoleExistsAsync(role))                        // Missing?
            await roleManager.CreateAsync(new IdentityRole(role));           // Create it
    }

    // Ensure a default admin exists
    var adminEmail = "admin@elibrary.local";                                  // Email
    var adminUser = await userManager.FindByEmailAsync(adminEmail);           // Check
    if (adminUser == null)                                                    // Create only once
    {
        adminUser = new AppUser { UserName = "admin", Email = adminEmail };   // Build user
        await userManager.CreateAsync(adminUser, "Admin@123");                // Strong default pw
        await userManager.AddToRoleAsync(adminUser, "Admin");                 // Give Admin role
    }
}

// --- Middleware pipeline ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();                                    // Serve swagger.json
    app.UseSwaggerUI();                                  // Serve Swagger UI
}

app.UseMiddleware<ExceptionMiddleware>();                // Catch-all error handler (BEFORE auth)

app.UseHttpsRedirection();                               // Redirect HTTP → HTTPS

app.UseCors("AllowReactApp");                            // CORS before auth

app.UseAuthentication();                                 // Validate JWT
app.UseAuthorization();                                  // Enforce [Authorize]

app.MapControllers();                                    // Route to controllers

app.Run(); 