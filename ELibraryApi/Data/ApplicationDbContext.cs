using ELibraryApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ELibraryApi.Data
{
    // Inherit IdentityDbContext<AppUser> so we get all Identity tables + our tables
    public class ApplicationDbContext : IdentityDbContext<AppUser>
    {
        // Constructor receives options (connection string, provider) from DI
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
            
        }

        public DbSet<Category> Categories { get; set; } // Categories table
        public DbSet<Author> Authors { get; set; }      // Authors table
        public DbSet<Book> Books { get; set; }          // Books table
        public DbSet<BookAuthor> BookAuthors { get; set; } // Junction table
        public DbSet<Review> Reviews { get; set; }      // Reviews table

        // Configure entity rules with Fluent API
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);      // Run Identity's own configuration first

            // -- Composite primary key for BookAuthor junction ---
            builder.Entity<BookAuthor>()
                .HasKey(ba => new { ba.BookId, ba.AuthorId});   // Composite PK

            // -- BookAuthor --> Book (many-to-one) ---
            builder.Entity<BookAuthor>()
                .HasOne(ba => ba.Book)      // Each row point to a Book
                .WithMany(b => b.BookAuthors)   // A Book has many BookAuthors
                .HasForeignKey(ba => ba.BookId) // FK is BookId
                .OnDelete(DeleteBehavior.Cascade);  // Delete books --> delete junction rows

            // -- BookAuthor --> Author (many-to-one) ---
            builder.Entity<BookAuthor>()
                .HasOne(ba => ba.Author)    // Each row point to an Author
                .WithMany(a => a.BookAuthors)   // An Author has many BookAuthors
                .HasForeignKey(ba => ba.AuthorId)   // FK is AuthorId
                .OnDelete(DeleteBehavior.Cascade);  // Delete authors --> delete junction rows

            // -- Review --> Book (many-to-one) ---
            builder.Entity<Review>()
                .HasOne(r => r.Book)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookId)
                .OnDelete(DeleteBehavior.Cascade);  // Deleting a Book delete it's reviews

            // -- Review --> AppUser (many-to-one) ---
            builder.Entity<Review>()
                .HasOne(r => r.AppUser)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.AppUserId)
                .OnDelete(DeleteBehavior.Restrict); // Don't cascade-delete user reviews

            // -- Unique ISBN on Book ---
            builder.Entity<Book>()
                .HasIndex(b => b.Isbn)
                .IsUnique();        // No duplicate ISBNs

            // -- Unique Name on Category ---
            builder.Entity<Category>()
                .HasIndex(c => c.Name)
                .IsUnique();        // No duplication category names
            

            // -- SEED roles (Admin, Editor, User) ---
            var adminId = "a1b2c3d4-0001-0000-0000-000000000001"; // Fixed GUID for Admin
            var editorId = "a1b2c3d4-0002-0000-0000-000000000002"; // Fixed GUID for Editor
            var userId = "a1b2c3d4-0003-0000-0000-000000000003";   // Fixed GUID for User

            builder.Entity<IdentityRole>().HasData(
                new IdentityRole { Id = adminId, Name = "Admin", NormalizedName = "ADMIN"}, // Admin role
                new IdentityRole { Id = editorId, Name = "Editor", NormalizedName = "EDITOR"},   // Editor role
                new IdentityRole { Id = userId, Name = "User", NormalizedName = "USER" }      // User role
            );
        }
    }
}