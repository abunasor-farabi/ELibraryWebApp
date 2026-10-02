// src/components/Layout.jsx
// ---------------------------------------
// Shared page chrome - Navbar + main content + footer.

import { Outlet } from "react-router-dom";  // Renders the matched child route
import Navbar from "./Navbar";              // Top nav

// -----------------------------------------------------
export default function Layout() {
    return (
        <div className="app-shell">
            <Navbar />  {/*Persistent to nav*/}
            <main className="app-main">
                <Outlet /> {/* Route content */}
            </main>
            <footer className="app-footer">© {new Date().getFullYear()} E-Library</footer>
        </div>
    );
}