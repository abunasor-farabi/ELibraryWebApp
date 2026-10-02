// src/pages/ForbiddenPage.jsx
// -----------------------------------------------
// 403 fallback - shown when a logged-in user lacks the required role.
// -----------------------------------------------

import { Link } from "react-router-dom";

export default function ForbiddenPage() {
    return (
        <div className="page-container">
            <h1>403 - Forbidden</h1>
            <p>You don't have permission to view this page.</p>
            <Link to="/books">Go back to Books</Link>
        </div>
    );
}