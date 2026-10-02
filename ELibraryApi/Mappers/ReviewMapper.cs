using ELibraryApi.Dtos.Review;
using ELibraryApi.Models;

namespace ELibraryApi.Mappers
{
    public static class ReviewMapper
    {
        public static ReviewDto ToReviewDto(this Review r)
        {
            return new ReviewDto
            {
                Id = r.Id,
                Title = r.Title,
                Content = r.Content,
                Rating = r.Rating,
                CreatedOn = r.CreatedOn,
                UpdatedOn = r.UpdatedOn,
                BookId = r.BookId,
                UserName = r.AppUser?.UserName // Reviewer name if loaded
            };
        }

        public static Review ToReviewFromCreate(this CreateReviewDto dto, int bookId, string userId)
        {
            return new Review
            {
                Title = dto.Title.Trim(),
                Content = dto.Content.Trim(),
                Rating = dto.Rating,
                BookId = bookId,
                AppUserId = userId
            };
        }
    }
}