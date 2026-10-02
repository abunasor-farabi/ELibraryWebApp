// src/app/store.js
// ---------------------------------------------------------------------------
// Root redux store — every slice registered here.
// ---------------------------------------------------------------------------
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";               // Auth slice
import booksReducer from "../features/books/booksSlice";             // Books slice
import categoriesReducer from "../features/categories/categoriesSlice"; // Categories
import authorsReducer from "../features/authors/authorsSlice";       // Authors
import reviewsReducer from "../features/reviews/reviewsSlice";       // Reviews

export const store = configureStore({
  reducer: {
    auth: authReducer,             // Auth state
    books: booksReducer,           // Books state
    categories: categoriesReducer, // Categories state
    authors: authorsReducer,       // Authors state
    reviews: reviewsReducer,       // Reviews state
  },
});

export default store; // Exported for main.jsx