// src/features/authors/authorsSlice.js
// ----------------------------------------------
// Authors: paginated list + CRUD.
// ----------------------------------------------
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getAuthorsRequest,
    createAuthorRequest,
    updateAuthorRequest,
    deleteAuthorRequest
} from "../../api/authorApi";

const initialState = {
    items: [],  // Current page
    totalCount: 0,  // Total
    pageNumber: 1,  // Page
    pageSize: 20,   // Size
    totalPages: 0,  // Pages
    search: "",     // Search
    isLoading: false, // Pending
    error: null,    // Error
};

export const fetchAuthors = createAsyncThunk(
    "authors/fetchAuthors",
    async (_, { getState, rejectWithValue }) => {
        try {
            const { search, pageNumber, pageSize } = getState().authors;    // Read filters
            return await getAuthorsRequest({ search, pageNumber, pageSize }); // GET
        } catch (err) {
            return rejectWithValue(err.message || "Failed to load authors");
        }
    }
);

export const createAuthor = createAsyncThunk(
    "authors/createAuthor",
    async (payload, { rejectWithValue }) => {
        try {
            return await createAuthorRequest(payload);   // POST
        } catch (err) {
            return rejectWithValue(err.message || "Failed to create author");
        }
    }
);

export const updateAuthor = createAsyncThunk(
    "authors/updateAuthor",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            return await updateAuthorRequest(id, payload);  // PUT
        } catch (err) {
            return rejectWithValue(err.message || "Failed to update author");
        }
    }
);

export const deleteAuthor = createAsyncThunk(
    "authors/deleteAuthor",
    async (id, { rejectWithValue }) => {
        try {
            await deleteAuthorRequest(id);   // DELETE
            return id;      // Id for state update
        } catch (err) {
            return rejectWithValue(err.message || "Failed to delete author");
        }
    }
);

const authorsSlice = createSlice({
    name: "authors",
    initialState,
    reducers: {
        setAuthorSearch: (s, a) => {
            s.search = a.payload;   // New search
            s.pageNumber = 1;   // Reset to page 1
        },
        setAuthorPage: (s, a) => {
            s.pageNumber = a.payload;   // New page
        },
        clearAuthorsError: (s) => {
            s.error = null; // Reset
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAuthors.pending, (s) => {
                s.isLoading = true;
                s.error = null;
            })
            .addCase(fetchAuthors.fulfilled, (s, a) => {
                s.isLoading = false;
                s.items = a.payload.items || [];    // Items
                s.pageNumber = a.payload.pageNumber;    // Sync
                s.pageSize = a.payload.pageSize;    // Sync
                s.totalCount = a.payload.totalCount;    // Sync
                s.totalPages = a.payload.totalPages;    // Sync
            })
            .addCase(fetchAuthors.rejected, (s, a) => {
                s.isLoading = false;
                s.error = a.payload;
            })
            .addCase(createAuthor.fulfilled, (s, a) => {
                s.items.unshift(a.payload); // Add top
                s.totalCount += 1;      // Count++
            })
            .addCase(createAuthor.rejected, (s, a) => {
                s.error = a.payload;
            })
            .addCase(updateAuthor.fulfilled, (s, a) => {
                const i = s.items.findIndex((x) => x.id === a.payload.id); // Find
                if (i !== -1) s.items[i] = a.payload;                      // Replace
            })
            .addCase(updateAuthor.rejected, (s, a) => {
                s.error = a.payload;
            })
            .addCase(deleteAuthor.fulfilled, (s, a) => {
                s.items = s.items.filter((x) => x.id !== a.payload); // Remove
                s.totalCount = Math.max(0, s.totalCount - 1);        // Count--
            })
            .addCase(deleteAuthor.rejected, (s, a) => {
                s.error = a.payload;
            });
    },
});

export const { setAuthorSearch, setAuthorPage, clearAuthorsError } =
  authorsSlice.actions;
export default authorsSlice.reducer;