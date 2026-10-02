// src/api/bookApi.js
// --------------------------------------------
// Book endpoints. Query string is built here from a filter object.
// -------------------------------------------------------

import { apiClient } from "./apiClient";        // Shared wrapper

// Build a query string from an object, ignoring anull/undefined/empty values.
const buildQuery = (params = {}) => {
    const usp = new URLSearchParams();  // URLSearchParams helper
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            usp.append(key, value); // Append each non-empty param
        }
    });
    const qs = usp.toString();  // Serialize
    return qs ? `?${qs}` : "";  // Prefix with ? only if non-empty
};

// GET /book?search=&categoryId=&authorId=&sortby=&isDescending=&pageNumber=&pageNumber=&pageSize=
export const getBooksRequest = (query = {}) =>
    apiClient(`/book${buildQuery(query)}`); // GET

// GET /book/:id
export const getBookByIdRequest = (id) =>
    apiClient(`/book/${id}`);   // GET

// POST /book - Admin/Editor only
export const createBookRequest = (payload) =>
    apiClient("/book", {
        method: "POST",     // Create
        body: JSON.stringify(payload),  // JSON body
    });

// PUT /book/:id - Amin/Editor only
export const updateBookRequest = (id, payload) => 
    apiClient(`/book/${id}`, {
        method: "PUT",      // Update
        body: JSON.stringify(payload),
    });

// DELETE /book/:id - Admin only
export const deleteBookRequest = (id) =>
    apiClient(`/book/${id}`, { method: "DELETE" }); // Delete
