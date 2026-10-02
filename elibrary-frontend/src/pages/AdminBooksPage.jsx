// src/pages/AdminBooksPage.jsx
// ---------------------------------------------------------------------------
// Admin/Editor view: list, create, update, delete books.
// ---------------------------------------------------------------------------
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearBooksError,
  createBook,
  deleteBook,
  fetchBooks,
  setFilter,
  setPage,
  updateBook,
} from "../features/books/booksSlice";
import { fetchCategories } from "../features/categories/categoriesSlice";
import { fetchAuthors } from "../features/authors/authorsSlice";
import { useDebounce } from "../hooks/useDebounce";
import ErrorBanner from "../components/ErrorBanner";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";

// Empty book form — used to reset after create/update.
const emptyForm = {
  title: "",
  isbn: "",
  description: "",
  price: 0,
  stockQuantity: 0,
  publishedDate: "",
  coverImageUrl: "",
  categoryId: "",
  authorIds: [],
};

export default function AdminBooksPage() {
  const dispatch = useDispatch(); // Dispatch

  const { items, isLoading, error, pageNumber, totalPages } = useSelector(
    (s) => s.books,
  ); // Books state
  const { items: categories } = useSelector((s) => s.categories); // Categories
  const { items: authors } = useSelector((s) => s.authors); // Authors

  const [form, setForm] = useState(emptyForm); // Form state
  const [editingId, setEditingId] = useState(null); // null = creating
  const [searchInput, setSearchInput] = useState(""); // Local search
  const debounced = useDebounce(searchInput, 400); // Debounced search

  // Load dependencies + books on mount.
  useEffect(() => {
    dispatch(fetchCategories()); // Categories
    dispatch(fetchAuthors()); // Authors
  }, [dispatch]);

  // Push debounced search into filters.
  useEffect(() => {
    dispatch(setFilter({ key: "search", value: debounced })); // Set filter
  }, [debounced, dispatch]);

  // Re-fetch books whenever page changes (or search above).
  useEffect(() => {
    dispatch(fetchBooks()); // Fetch page
  }, [dispatch, pageNumber]);

  // Set field helper.
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value })); // Merge field

  // Submit — create or update.
  const handleSubmit = async (e) => {
    e.preventDefault(); // No reload

    // Coerce types to match DTO expectations.
    const payload = {
      ...form,
      categoryId: Number(form.categoryId), // FK as number
      price: Number(form.price), // Number
      stockQuantity: Number(form.stockQuantity), // Number
      authorIds: form.authorIds.map((x) => Number(x)), // Number[]
    };

    if (editingId) {
      await dispatch(updateBook({ id: editingId, payload })); // PUT
    } else {
      await dispatch(createBook(payload)); // POST
    }

    // Reset UI.
    setForm(emptyForm); // Clear form
    setEditingId(null); // Back to create mode
  };

  // Fill the form for editing.
  const handleEdit = (book) => {
    setEditingId(book.id); // Remember id
    setForm({
      title: book.title, // Title
      isbn: book.isbn, // ISBN
      description: book.description || "", // Desc
      price: book.price, // Price
      stockQuantity: book.stockQuantity, // Stock
      publishedDate: book.publishedDate?.slice(0, 10) || "", // date input format
      coverImageUrl: book.coverImageUrl || "", // Cover
      categoryId: book.categoryId, // Category FK
      // We only have authorNames on BookDto, so pre-selecting authors
      // requires either a matching lookup or leaving it empty for re-pick.
      authorIds: [], // Manual re-pick on edit
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this book?")) dispatch(deleteBook(id)); // Confirm + delete
  };

  return (
    <div className="page-container">
      <h1>Manage Books</h1>

      <ErrorBanner
        message={error}
        onClose={() => dispatch(clearBooksError())}
      />

      <input
        className="admin-search"
        type="search"
        placeholder="Search books..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Book" : "Add Book"}</h2>

        <div className="admin-form-grid">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            required
          />
          <input
            placeholder="ISBN"
            value={form.isbn}
            onChange={(e) => setField("isbn", e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
          />
          <input
            type="number"
            placeholder="Stock"
            value={form.stockQuantity}
            onChange={(e) => setField("stockQuantity", e.target.value)}
          />
          <input
            type="date"
            value={form.publishedDate}
            onChange={(e) => setField("publishedDate", e.target.value)}
          />
          <input
            placeholder="Cover image URL"
            value={form.coverImageUrl}
            onChange={(e) => setField("coverImageUrl", e.target.value)}
          />

          <select
            value={form.categoryId}
            onChange={(e) => setField("categoryId", e.target.value)}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </div>

        <div>
          <p>Select Authors</p>

          {authors.length === 0 && <p>No authors yet.</p>}

          {authors.map((a) => {

            const checked = form.authorIds.includes(a.id);

            return (
              <label key={a.id} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    setField(
                      "authorIds",
                      e.target.checked
                        ? [...form.authorIds, a.id] // append
                        : form.authorIds.filter((id) => id !== a.id), // remove
                    );
                  }}
                />{" "}
                {a.fullName}
              </label>
            );
          })}
        </div>

        <div className="admin-form-actions">
          <button className="btn-primary" disabled={isLoading}>
            {editingId ? "Save Changes" : "Create Book"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {isLoading && <Spinner label="Working..." />}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.title}</td>
              <td>{b.categoryName}</td>
              <td>${b.price.toFixed(2)}</td>
              <td>{b.stockQuantity}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(b)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(b.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPageChange={(p) => dispatch(setPage(p))}
      />
    </div>
  );
}
