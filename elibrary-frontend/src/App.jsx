import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import AdminBooksPage from "./pages/AdminBooksPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminAuthorsPage from "./pages/AdminAuthorsPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      {/*Public Layout wraps most routes*/}
      <Route element={<Layout />}>
        {/* Redirect root to books */}
        <Route index element={<Navigate to="/books" replace />} />
        {/* Public pages */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="books/:id" element={<BookDetailPage />} />

        {/* Admin / Editor area */}
        <Route
          path="admin/books"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Editor"]}>
              <AdminBooksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/categories"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Editor"]}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/authors"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Editor"]}>
              <AdminAuthorsPage />
            </ProtectedRoute>
          }
        />

        {/* Forbidden */}
        <Route path="forbidden" element={<ForbiddenPage />} />

        {/* 404 — must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
