// src/components/Navbar.jsx
// ---------------------------------------------------------------------------
// Top navigation — shows links based on login state and role.
// ---------------------------------------------------------------------------
import { useDispatch, useSelector } from "react-redux"; // Redux hooks
import { Link, useNavigate } from "react-router-dom"; // Router
import { logout } from "../features/auth/authSlice"; // Logout action

export default function Navbar() {
  const dispatch = useDispatch(); // For dispatching
  const navigate = useNavigate(); // To redirect post-logout
  const { user, roles } = useSelector((s) => s.auth); // Auth slice

  const isAdmin = roles.includes("Admin"); // Role flag
  const isEditor = roles.includes("Editor") || isAdmin; // Role flag
  const isLoggedIn = !!user; // Logged in?

  // Handle logout click.
  const handleLogout = () => {
    dispatch(logout()); // Clear redux + storage
    navigate("/login"); // Send to login
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">E-Library</Link>
      </div>

      <div className="nav-links">
        {/* Public links */}
        <Link to="/books">Books</Link>

        {/* Editor/Admin links */}
        {isEditor && <Link to="/admin/books">Manage Books</Link>}
        {isEditor && <Link to="/admin/categories">Categories</Link>}
        {isEditor && <Link to="/admin/authors">Authors</Link>}

        {/* Auth links */}
        {isLoggedIn ? (
          <>
            <span className="nav-user">Hi, {user.userName}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
