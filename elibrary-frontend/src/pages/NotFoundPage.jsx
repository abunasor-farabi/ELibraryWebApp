// src/pages/NotFoundPage.jsx
// -----------------------------------------
// 404 fallback

import { Link } from "react-router-dom";

// -----------------------------------------
export default function NotFoundPage(){
    return (
        <div className="page-container center">
            <h1>404 - Page Not Found</h1>
            <Link to="/books">Go Back To Books</Link>
        </div>
    );
}