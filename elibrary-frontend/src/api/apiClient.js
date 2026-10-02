// src/api/apiClient.js
// ---------------------------------------------------------------------------
// Single fetch wrapper — every API call goes through here.
// Provides: JWT injection, unified error extraction, session-expiry handling.
// ---------------------------------------------------------------------------

// Base URL of our .NET API — change the port if your launch profile uses another.
const BASE_URL = "http://localhost:5000/api"; // <-- adjust to match ELibraryApi port

// Read the JWT from localStorage (set at login).
const getToken = () => localStorage.getItem("token");

// Read the stored user object (also set at login).
// const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

// Clear session (used when the token expires mid-session).
const clearSession = () => {
  localStorage.removeItem("token"); // Remove token
  localStorage.removeItem("user");  // Remove user
};

// Custom error type so callers can branch on `.status` if needed.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);       // Base class message
    this.status = status; // HTTP status code (401, 404, 500, ...)
    this.name = "ApiError"; // Tag for logs
  }
}

// The one function every endpoint function calls.
export const apiClient = async (endpoint, options = {}) => {
  const token = getToken(); // Read current token
  // Build headers: JSON by default, spread any caller overrides.
  const headers = {
    "Content-Type": "application/json", // Always JSON
    ...(options.headers || {}),         // Caller overrides win
  };

  // Attach Authorization if we have a token.
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Perform the request.
  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,   // method, body, etc.
      headers,      // merged headers above
    });
  } catch {
    // Network failures (server down, CORS, DNS) land here.
    throw new ApiError(
      "Cannot reach the server. Please check your connection.",
      0
    );
  }

  // 204 No Content → nothing to parse.
  if (response.status === 204) return null;

  // Read body as text first — never assume JSON on error paths.
  const text = await response.text();

  // Non-2xx → build a readable message and throw.
  if (!response.ok) {
    let message = `Request failed (${response.status})`; // Fallback

    // Try to extract a meaningful message from the body.
    if (text) {
      try {
        const parsed = JSON.parse(text); // Parse JSON body

        if (Array.isArray(parsed)) {
          // Identity returns an array of { code, description }.
          message = parsed.map((e) => e.description || e.code || e).join(", ");
        } else if (typeof parsed === "object" && parsed !== null) {
          // Our ExceptionMiddleware returns { statusCode, message, detail }.
          message = parsed.message || parsed.title || JSON.stringify(parsed);
        } else {
          message = String(parsed); // Plain string body
        }
      } catch {
        // Body was not JSON — show it raw (e.g. "Invalid username!").
        message = text;
      }
    }

    // 401 → session expired → clean up + redirect handled in slices.
    if (response.status === 401) clearSession();

    // Throw a typed error so callers can read `.status`.
    throw new ApiError(message, response.status);
  }

  // 2xx success → parse JSON (or return null for empty).
  return text ? JSON.parse(text) : null;
};