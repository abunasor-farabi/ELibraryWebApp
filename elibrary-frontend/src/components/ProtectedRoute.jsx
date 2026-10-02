// src/components/ProtectedRoute.jsx
// ----------------------------------------------
// Wraps a route and only renders it if the user i logged in AND (optionally)
// has one of the allowed roles. Otherwise, redirects.
// ----------------------------------------------------

import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { token, roles } = useSelector((s) => s.auth); // Auth slice
    const location = useLocation();     // Where the user tried to go

    // Not logged in --> send to /login, remembering where they came from.
    if (!token) {
        return <Navigate to="/login" state={{from: location}} replace/>
    }

    // Role list provided but user has none of them --> 403 page.
    if (allowedRoles && allowedRoles.length > 0) {
        const hasAccess = roles.some((r) => allowedRoles.includes(r));  // Role intersection
        if (!hasAccess) return <Navigate to="/forbidden" replace/>; // Not allowed
    }

    // Access granted.
    return children;
}