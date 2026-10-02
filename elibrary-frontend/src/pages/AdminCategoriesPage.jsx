// src/pages/AdminCategoriesPage.jsx
// ---------------------------------------------------------------------------
// Category CRUD (Admin/Editor).
// ---------------------------------------------------------------------------
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCategoriesError,
  createCategory,
  deleteCategory,
  fetchCategories,
  setCategoryPage,
  setCategorySearch,
  updateCategory,
} from "../features/categories/categoriesSlice";
import { useDebounce } from "../hooks/useDebounce";
import ErrorBanner from "../components/ErrorBanner";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";

const empty = { name: "", description: "" }; // Reset template

export default function AdminCategoriesPage() {
  const dispatch = useDispatch(); // Dispatch

  const { items, isLoading, error, pageNumber, totalPages, search } =
    useSelector((s) => s.categories); // Categories state

  const [form, setForm] = useState(empty);        // Form
  const [editingId, setEditingId] = useState(null);// null = create
  const [input, setInput] = useState(search);      // Search input
  const debounced = useDebounce(input, 400);       // Debounced

  // Debounce -> redux search.
  useEffect(() => {
    dispatch(setCategorySearch(debounced)); // Set search
  }, [debounced, dispatch]);

  // Fetch on page/search change.
  useEffect(() => {
    dispatch(fetchCategories()); // Load page
  }, [dispatch, pageNumber, search]);

  // Submit (create or update).
  const handleSubmit = async (e) => {
    e.preventDefault(); // No reload

    if (editingId) {
      await dispatch(updateCategory({ id: editingId, payload: form })); // PUT
    } else {
      await dispatch(createCategory(form)); // POST
    }

    setForm(empty);        // Reset
    setEditingId(null);    // Back to create mode
  };

  // Fill form for edit.
  const handleEdit = (c) => {
    setEditingId(c.id);                        // Remember
    setForm({ name: c.name, description: c.description || "" }); // Fill
  };

  // Confirm then delete.
  const handleDelete = (id) => {
    if (window.confirm("Delete this category?")) dispatch(deleteCategory(id)); // Delete
  };

  return (
    <div className="page-container">
      <h1>Manage Categories</h1>

      <ErrorBanner message={error} onClose={() => dispatch(clearCategoriesError())} />

      <input
        type="search"
        placeholder="Search categories..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Category" : "Add Category"}</h2>
        <label>Input Category:</label>
        <br />
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required maxLength={100}
        />
        <br />
        <br />
        <label>Input Desciption:</label>
        <br />
        <textarea style={{width:"50%"}}
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={500}
        />
        <div className="admin-form-actions">
          <button className="btn-primary" disabled={isLoading}>
            {editingId ? "Save" : "Create"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => { setForm(empty); setEditingId(null); }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {isLoading && <Spinner />}

      <table className="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.description}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(c)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPageChange={(p) => dispatch(setCategoryPage(p))}
      />
    </div>
  );
}