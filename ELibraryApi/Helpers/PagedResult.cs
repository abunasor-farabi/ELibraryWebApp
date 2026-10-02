namespace ELibraryApi.Helpers
{
    // Generic container returned by paginated endpoints
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new(); // The current page's items
        public int PageNumber { get; set; } // Current page number
        public int PageSize { get; set; }   // Page size
        public int TotalCount { get; set; } // Total rows across all pages
        public int TotalPages => 
            PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPrevious => PageNumber > 1;  // Convenience flag
        public bool HasNext => PageNumber < TotalPages; // Convenience flag
    }
}