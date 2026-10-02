// src/api/authorApi.js
// ----------------------------
// Author endpoint.
// --------------------------------------

import { apiClient } from "./apiClient";


// Local helper - same pattern as before
const buildQuery = (params = {}) => {
    const usp = new URLSearchParams();      // Query builder
    Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") usp.append(k, v); // Skip empty
    });
    const qs = usp.toString();      // Serialize
    return qs ? `?${qs}` : "";      // Optional ?
};

// GET /author
export const getAuthorsRequest = (query = {}) =>
    apiClient(`/author${buildQuery(query)}`);   // GET

// POST /author
export const createAuthorRequest = (payload) => 
    apiClient("/author", {
        method: "POST",     // Create
        body: JSON.stringify(payload),  // JSON
    });

// PUT /author/:id
export const updateAuthorRequest = (id, payload) =>
    apiClient(`/author/${id}`, {
        method: "PUT",      // Update
        body: JSON.stringify(payload),  // JSON
    });

// DELETE /author/:id
export const deleteAuthorRequest = (id) =>
    apiClient(`/author/${id}`, { method: "DELETE" });   // Delete