// src/pages/BooksPage.jsx
// ---------------------------------------------------------------------------
// Public catalogue with search (debounced), filters, sorting, and pagination.
// ---------------------------------------------------------------------------
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearBooksError,
  fetchBooks,
  setFilter,
  setPage,
} from "../features/books/booksSlice";
import { fetchCategories } from "../features/categories/categoriesSlice";
import { fetchAuthors } from "../features/authors/authorsSlice";
import { useDebounce } from "../hooks/useDebounce";
import BookCard from "../components/BookCard";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";

export default function BooksPage() {
  const dispatch = useDispatch(); // Dispatch

  const { items, isLoading, error, pageNumber, totalPages, filters } =
    useSelector((s) => s.books); // Books state

  const { items: categories } = useSelector((s) => s.categories); // Categories
  const { items: authors } = useSelector((s) => s.authors); // Authors

  // Local search box state — debounced before hitting redux.
  const [searchInput, setSearchInput] = useState(filters.search || ""); // Local search
  const debouncedSearch = useDebounce(searchInput, 400); // Debounced value

  // Load categories + authors once for the filter dropdowns.
  useEffect(() => {
    dispatch(fetchCategories()); // Fetch categories
    dispatch(fetchAuthors()); // Fetch authors
  }, [dispatch]);

  // When the debounced search changes, push it into the filter.
  useEffect(() => {
    dispatch(setFilter({ key: "search", value: debouncedSearch })); // Set filter
  }, [debouncedSearch, dispatch]);

  // Whenever the filters or page change, fetch a fresh page.
  useEffect(() => {
    dispatch(fetchBooks()); // Fetch current page
  }, [dispatch, filters, pageNumber]);

  // Filter change helper — updates redux (which resets to page 1).
  const handleFilterChange = (key, value) =>
    dispatch(setFilter({ key, value })); // Pass to slice

  return (
    <div className="page-container">
      <h1>Browse Books</h1>

      <ErrorBanner
        message={error}
        onClose={() => dispatch(clearBooksError())}
      />

      <div className="filters-bar">
        {/* Debounced search box */}
        <input
          type="search"
          placeholder="Search by title..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        {/* Category filter */}
        <select
          value={filters.categoryId || ""}
          onChange={(e) =>
            handleFilterChange(
              "categoryId",
              e.target.value ? Number(e.target.value) : null,
            )
          }
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Author filter */}
        <select
          value={filters.authorId || ""}
          onChange={(e) =>
            handleFilterChange(
              "authorId",
              e.target.value ? Number(e.target.value) : null,
            )
          }
        >
          <option value="">All Authors</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.fullName}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
        >
          <option value="title">Title</option>
          <option value="price">Price</option>
          <option value="published">Published</option>
        </select>

        {/* Direction */}
        <button
          className="btn-direction"
          onClick={() =>
            handleFilterChange("isDescending", !filters.isDescending)
          }
        >
          {filters.isDescending ? "↓ Desc" : "↑ Asc"}
        </button>
      </div>

      {isLoading && <Spinner label="Loading books..." />}

      {!isLoading && items.length === 0 && (
        <p className="empty-state">No books matched your filters.</p>
      )}

      <div className="books-grid">
        {items.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>

      <Pagination
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPageChange={(p) => dispatch(setPage(p))}
      />
    </div>
  );
}
