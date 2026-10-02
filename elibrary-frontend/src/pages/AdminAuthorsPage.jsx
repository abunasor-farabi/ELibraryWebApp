// src/pages/AdminAuthorsPage.jsx
// ---------------------------------------------------------------------------
// Author CRUD (Admin/Editor).
// ---------------------------------------------------------------------------
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAuthorsError,
  createAuthor,
  deleteAuthor,
  fetchAuthors,
  setAuthorPage,
  setAuthorSearch,
  updateAuthor,
} from "../features/authors/authorsSlice";
import { useDebounce } from "../hooks/useDebounce";
import ErrorBanner from "../components/ErrorBanner";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";

const empty = { firstName: "", lastName: "", country: "", bio: "", birthDate: "" };

export default function AdminAuthorsPage() {
  const dispatch = useDispatch(); // Dispatch

  const { items, isLoading, error, pageNumber, totalPages, search } =
    useSelector((s) => s.authors); // Authors state

  const [form, setForm] = useState(empty);        // Form
  const [editingId, setEditingId] = useState(null);// null = create
  const [input, setInput] = useState(search);      // Search box
  const debounced = useDebounce(input, 400);       // Debounced

  // Push search into redux.
  useEffect(() => {
    dispatch(setAuthorSearch(debounced)); // Search
  }, [debounced, dispatch]);

  // Refetch on page/search change.
  useEffect(() => {
    dispatch(fetchAuthors()); // Load
  }, [dispatch, pageNumber, search]);

  // Submit.
  const handleSubmit = async (e) => {
    e.preventDefault(); // No reload

    // Build payload with proper date conversion.
    const payload = {
      ...form,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null, // ISO
    };

    if (editingId) {
      await dispatch(updateAuthor({ id: editingId, payload })); // PUT
    } else {
      await dispatch(createAuthor(payload));                    // POST
    }

    setForm(empty);        // Reset
    setEditingId(null);    // Mode
  };

  const handleEdit = (a) => {
    setEditingId(a.id);                                     // Track id
    setForm({
      firstName: a.firstName,                               // First
      lastName: a.lastName,                                 // Last
      country: a.country || "",                             // Country
      bio: a.bio || "",                                     // Bio
      birthDate: a.birthDate?.slice(0, 10) || "",           // date input
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this author?")) dispatch(deleteAuthor(id)); // Confirm + delete
  };

  return (
    <div className="page-container">
      <h1>Manage Authors</h1>

      <ErrorBanner message={error} onClose={() => dispatch(clearAuthorsError())} />

      <input
        type="search"
        placeholder="Search authors..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Author" : "Add Author"}</h2>
        <div className="admin-form-grid">
          <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <input placeholder="Last Name"  value={form.lastName}  onChange={(e) => setForm({ ...form, lastName: e.target.value })}  required />
          <input placeholder="Country"    value={form.country}   onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <input type="date"              value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          <textarea placeholder="Bio"     value={form.bio}       onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div className="admin-form-actions">
          <button className="btn-primary" disabled={isLoading}>
            {editingId ? "Save" : "Create"}
          </button>
          {editingId && (
            <button type="button" className="btn-cancel" onClick={() => { setForm(empty); setEditingId(null); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {isLoading && <Spinner />}

      <table className="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Country</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.fullName}</td>
              <td>{a.country || "—"}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(a)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(a.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPageChange={(p) => dispatch(setAuthorPage(p))}
      />
    </div>
  );
}