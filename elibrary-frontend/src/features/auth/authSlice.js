// src/features/auth/authSlice.js
// ---------------------------------------------------------------------------
// Auth state: user, token, roles, loading, error.
// Persists token + user + roles in localStorage for refresh survival.
// ---------------------------------------------------------------------------
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginRequest, registerRequest } from "../../api/authApi";

// Hydrate initial state from localStorage — survives page refresh.
const initialState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),    // { userName, email }
  token: localStorage.getItem("token") || null,                // JWT
  roles: JSON.parse(localStorage.getItem("roles") || "[]"),    // ["User", "Editor", ...]
  isLoading: false,                                            // Thunk pending flag
  error: null,                                                 // Last error message
};

// ---------- login thunk ----------
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      // Call API — server-side errors surface as ApiError.
      const data = await loginRequest(username, password);
      // Persist session pieces for later reads.
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ userName: data.userName, email: data.email }));
      localStorage.setItem("roles", JSON.stringify(data.roles || []));
      return data; // Fulfilled payload
    } catch (err) {
      // Reject with a plain string so the UI shows the exact server message.
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

// ---------- register thunk ----------
export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await registerRequest(payload); // POST /account/register
      localStorage.setItem("token", data.token);   // Save token
      localStorage.setItem("user", JSON.stringify({ userName: data.userName, email: data.email }));
      localStorage.setItem("roles", JSON.stringify(data.roles || []));
      return data; // Success
    } catch (err) {
      return rejectWithValue(err.message || "Registration failed"); // Surface server msg
    }
  }
);

// ---------- slice ----------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Manual logout — clears both state and localStorage.
    logout: (state) => {
      state.user = null;                        // Clear user
      state.token = null;                       // Clear token
      state.roles = [];                         // Clear roles
      state.error = null;                       // Clear error
      localStorage.removeItem("token");         // Clear persisted token
      localStorage.removeItem("user");          // Clear persisted user
      localStorage.removeItem("roles");         // Clear persisted roles
    },
    // Clear errors — useful when navigating away from an error form.
    clearAuthError: (state) => {
      state.error = null;                       // Reset error only
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- LOGIN ----
      .addCase(login.pending, (state) => {
        state.isLoading = true;                 // Show spinner
        state.error = null;                     // Reset old error
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;                // Hide spinner
        state.user = { userName: action.payload.userName, email: action.payload.email };
        state.token = action.payload.token;     // Save JWT
        state.roles = action.payload.roles || []; // Save roles
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;                // Hide spinner
        state.error = action.payload;           // Show server message
      })
      // ---- REGISTER ----
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { userName: action.payload.userName, email: action.payload.email };
        state.token = action.payload.token;
        state.roles = action.payload.roles || [];
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions; // Export actions
export default authSlice.reducer;