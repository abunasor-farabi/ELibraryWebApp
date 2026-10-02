namespace ELibraryApi.Helpers
{
    // Query string parameters used by List endpoints (pagination + filter + sort)
    public class QueryObject
    {
        // -- Filter ---
        public string? Search { get; set; } = null; // Free-text search (title/name)
        public int? CategoryId { get; set; } = null; // Filter books by category
        public int? AuthorId { get; set; } = null;   // Filter books by author

        // -- Sort ---
        public string? SortBy { get; set; } = null;     // e.g., "title", "price"
        public bool IsDescending { get; set; } = false; // Sort direction

        // -- Pagination (with some defaults) ---
        private int _pageNumber = 1;    // Default page 1
        private int _pageSize = 10;     // Default 10 per page
        private const int MaxPageSize = 50; // Hard cap to prevent abuse

        public int PageNumber
        {
            get => _pageNumber;     // Expose current value
            set => _pageNumber = value < 1 ? 1 : value; // Guard aginst <= 0 
        }

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : (value < 1 ? 10 : value);
        }
    }
}