// src/pages/LoginPage.jsx
// ------------------------------
// Login form - dispatches `Login` thunk; shows server errors inline.

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthError, login } from "../features/auth/authSlice";
import ErrorBanner from "../components/ErrorBanner";

// ------------------------------
export default function LoginPage() {
    const dispatch = useDispatch();         // Dispatch
    const navigate = useNavigate();         // Navigate after success
    const location = useLocation();         // Read `from` if redirected here
    const { isLoading, error, token } = useSelector((s) => s.auth);     // Auth state

    const [form, setForm] = useState({ username: "", password: ""});    // Local form state

    // If the token already exists (e.g., user refreshed), bounce to home.
    useEffect(() => {
        if (token) navigate("/books", { replace: true });   // Already logged in
    }, [token, navigate]);

    // If the user landed here because of a protected route, remember target.
    const redirectTo = location.state?.from?.pathname || "/books";  // Post-login target

    // Submit handler - dispatch thunk; navigate on success
    const handleSubmit = async (e) => {
        e.preventDefault();     // Prevent page reload
        const result = await dispatch(login(form));     // Thunk dispatch
        if (login.fulfilled.match(result)) {
            navigate(redirectTo, { replace: true}); // Success --> go to target
        } 
    };

    // Clear error when user starts typing.
    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));  // Merge
        if (error) dispatch(clearAuthError());          // Clear old error
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Login</h2>

                {/*Show the exact server error message*/}
                <ErrorBanner message={error} onClose={() => dispatch(clearAuthError())} />

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button className="btn-primary" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="auth-alt">
                    No Account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}