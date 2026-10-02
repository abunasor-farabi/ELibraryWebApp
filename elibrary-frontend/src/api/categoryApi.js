// src/api/categoryApi.js
// ---------------------------------------------------------------------------
// Category endpoints.
// ---------------------------------------------------------------------------
import { apiClient } from "./apiClient"; // Shared wrapper

// Same helper as bookApi — could be moved to a utils file if reused a lot.
const buildQuery = (params = {}) => {
  const usp = new URLSearchParams(); // Build key=value pairs
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") usp.append(k, v); // Skip empties
  });
  const qs = usp.toString(); // Serialize
  return qs ? `?${qs}` : ""; // Add ? only if needed
};

// GET /category
export const getCategoriesRequest = (query = {}) =>
  apiClient(`/category${buildQuery(query)}`); // GET

// POST /category
export const createCategoryRequest = (payload) =>
  apiClient("/category", {
    method: "POST", // Create
    body: JSON.stringify(payload), // JSON
  });

// PUT /category/:id
export const updateCategoryRequest = (id, payload) =>
  apiClient(`/category/${id}`, {
    method: "PUT", // Update
    body: JSON.stringify(payload), // JSON
  });

// DELETE /category/:id
export const deleteCategoryRequest = (id) =>
  apiClient(`/category/${id}`, { method: "DELETE" }); // Delete
