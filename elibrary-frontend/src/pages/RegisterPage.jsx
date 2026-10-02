// src/pages/RegisterPage.jsx
// --------------------------------
// Register form
// ----------------------------------

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthError, register } from "../features/auth/authSlice";
import ErrorBanner from "../components/ErrorBanner";

export default function RegisterPage() {
    const dispatch = useDispatch();     // Dispatch
    const navigate = useNavigate();     // Post-register nav
    const { isLoading, error } = useSelector((s) => s.auth);    // Auth slice

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });  // Form state

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value})); // Merge field
        if (error) dispatch(clearAuthError());  // Clear old error
    };

    const handleSubmit = async (e) => {
        e.preventDefault();     // Prevent reload
        const res = await dispatch(register(form)); // Thunk
        if (register.fulfilled.match(res)) navigate("/books");   // Success --> books
    };
    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>

                {/*Error Banner*/}
                <ErrorBanner message={error} onClose={() => dispatch(clearAuthError())} />

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            placeholder="Username" 
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="Email" 
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input placeholder="Password" 
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                        />
                    </div>
                    <button className="btn-primary" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Sign Up"}
                    </button>
                </form>

                <p className="auth-alt">
                    Already registered? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}