// src/api/reviewApi.js
// -------------------------
// Review endpoints - used with optiomistic updates.
// ----------------------------------------------------

import { apiClient } from "./apiClient";


// Save query helper.
const buildQuery = (params = {}) => {
    const usp = new URLSearchParams();      // Builder
    Object.entries(params).forEach(([k, v]) => {
        if ( v !== null && v !== undefined && v !== "") usp.append(k, v); // Skip empty
    });
    const qs = usp.toString();      // Serialize
    return qs ? `?${qs}` : "";      // Optional ?
};

// GET /review/book/:bookId
export const getReviewsByBookRequest = (bookId, query = {}) =>
    apiClient(`/review/book/${bookId}${buildQuery(query)}`); // GET

// POST /review/book/:bookId
export const createReviewRequest = (bookId, payload) => 
    apiClient(`/review/book/${bookId}`, {
        method: "POST", // Create
        body: JSON.stringify(payload),      // JSON
    });

// PUT /review/:id
export const updateReviewRequest = (id, payload) =>
    apiClient(`/review/${id}`, {
        method: "PUT",      // Update
        body: JSON.stringify(payload),  // JSON
    });

// DELETE /review/:id
export const deleteReviewRequest = (id) => 
    apiClient(`/review/${id}`, { method: "DELETE" }); // Delete