// src/api/authApi.js
// ------------------------------------------
// All authentication-related HTTP calls
// ------------------------------------------

import { apiClient } from "./apiClient";

// POST /account/login - { username, password } --> NewUserDto
export const loginRequest = (username, password) =>
    apiClient("/account/login", {
        method: "POST",     // Send credentials
        body: JSON.stringify({username, password}), // JSON body
    });

// POST /account/register - { username, email, role? } --> NewUserDto
export const registerRequest = (payload) =>
    apiClient("/account/register", {
        method: "POST", // Create account
        body: JSON.stringify(payload),  // JSON body
    });

// GET /account/me - returns { id, userName, email, roles }
export const meRequest = () => 
    apiClient("/account/me");       // GET by default