// src/components/Pagination.jsx
// --------------------------------------------------
// Reusable pagination bar. Parent ows the page state via callbacks.
// -----------------------------------------------------------------
export default function Pagination({ pageNumber, totalPages, onPageChange }) {
    if (totalPages <=1) return null;    // Nothing to paginate

    // Build a compact window of pages around the current one.
    const pages = [];
    const start = Math.max(1, pageNumber - 2);      // Window end
    const end = Math.min(totalPages, pageNumber + 2);   // Window end

    for (let i = start; i <= end; i++) pages.push(i);   // Collect page numbers

    return (
        <div className="pagination">
            <button
                className="page-btn"
                disabled={pageNumber === 1}     // Disable on first page
                onClick={() => onPageChange(pageNumber - 1)}
            >
                Prev
            </button>

            { start > 1 && (
                <>
                    <button className="page-btn" onClick={() => onPageChange(1)}>1</button>
                    {start > 2 && <span className="page-ellipsis">...</span>}
                </>
            )}

            {pages.map((p) => (
                <button
                    key={p}
                    className={`page-btn ${p === pageNumber ? "active" : ""}`}
                    onClick={() => onPageChange(p)}
                >
                    {p}
                </button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="page-ellipsis">...</span>}
                    <button className="page-btn" onClick={() => onPageChange(totalPages)}>
                        {totalPages}
                    </button>
                </>
            )}

             <button
                className="page-btn"
                disabled={pageNumber === totalPages}    // Disable on Last page
                onClick={() => onPageChange(pageNumber + 1)}
             >
                Next
             </button>

        </div>
    );
}