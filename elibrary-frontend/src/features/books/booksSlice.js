// src/features/books/booksSlice.js
// ---------------------------------------------------------------------------
// Books: paginated list + single detail + CRUD (Admin/Editor).
// ---------------------------------------------------------------------------
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getBooksRequest,
  getBookByIdRequest,
  createBookRequest,
  updateBookRequest,
  deleteBookRequest,
} from "../../api/bookApi";

// Initial state — items is the current page's rows.
const initialState = {
  items: [], // Books for the current page
  pageNumber: 1, // Current page
  pageSize: 8, // Page size
  totalCount: 0, // Total rows in DB
  totalPages: 0, // Computed total pages
  filters: {
    // Active filters used by the list view
    search: "",
    categoryId: null,
    authorId: null,
    sortBy: "title",
    isDescending: false,
  },
  current: null, // Currently viewed book (detail page)
  isLoading: false, // Any pending flag
  error: null, // Last error message
};

// ---------- list thunk ----------
export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (overrideQuery, { getState, rejectWithValue }) => {
    try {
      const { filters, pageNumber, pageSize } = getState().books; // Current state
      // Merge state with any per-call overrides (e.g. when user changes page).
      const query = {
        ...filters, // Base filters
        pageNumber, // Page
        pageSize, // Size
        ...(overrideQuery || {}), // Overrides win
      };
      const data = await getBooksRequest(query); // Call API
      return { data, query }; // Return both so reducers can sync
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load books");
    }
  },
);

// ---------- detail thunk ----------
export const fetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getBookByIdRequest(id); // GET /book/:id
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load book");
    }
  },
);

// ---------- create ----------
export const createBook = createAsyncThunk(
  "books/createBook",
  async (payload, { rejectWithValue }) => {
    try {
      return await createBookRequest(payload); // POST /book
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create book");
    }
  },
);

// ---------- update ----------
export const updateBook = createAsyncThunk(
  "books/updateBook",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateBookRequest(id, payload); // PUT /book/:id
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update book");
    }
  },
);

// ---------- delete ----------
export const deleteBook = createAsyncThunk(
  "books/deleteBook",
  async (id, { rejectWithValue }) => {
    try {
      await deleteBookRequest(id); // DELETE /book/:id
      return id; // Return id so we can remove from state
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete book");
    }
  },
);

// ---------- slice ----------
const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    setBookSearch: (s, a) => {
            s.filters.search = a.payload;   // New search
            s.pageNumber = 1;   // Reset to page 1
    },
    // Update one filter value (from the UI).
    setFilter: (state, action) => {
      const { key, value } = action.payload; // e.g. { key:"search", value:"dune" }
      state.filters[key] = value; // Mutate the draft
      state.pageNumber = 1; // Reset to page 1 on filter change
    },
    // Set current page number.
    setPage: (state, action) => {
      state.pageNumber = action.payload; // New page number
    },
    // Clear error (after user dismissed it).
    clearBooksError: (state) => {
      state.error = null; // Reset
    },
    // Clear the currently viewed book (when leaving the detail page).
    clearCurrentBook: (state) => {
      state.current = null; // Reset
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- FETCH LIST ----
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true; // Show spinner
        state.error = null; // Reset
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.isLoading = false; // Hide spinner
        state.items = action.payload.data.items || []; // Page rows
        state.pageNumber = action.payload.data.pageNumber; // Sync page
        state.pageSize = action.payload.data.pageSize; // Sync size
        state.totalCount = action.payload.data.totalCount; // Sync total
        state.totalPages = action.payload.data.totalPages; // Sync total pages
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false; // Hide spinner
        state.error = action.payload; // Show error
      })
      // ---- FETCH DETAIL ----
      .addCase(fetchBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.current = null; // Blank current while loading
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.current = action.payload; // Save book
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ---- CREATE ----
      .addCase(createBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload); // Prepend to visible list
        state.totalCount += 1; // Bump total
      })
      .addCase(createBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ---- UPDATE ----
      .addCase(updateBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.isLoading = false;
        // Replace in list
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        // Replace current if same book
        if (state.current && state.current.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ---- DELETE ----
      .addCase(deleteBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((b) => b.id !== action.payload); // Remove
        state.totalCount = Math.max(0, state.totalCount - 1); // Decrement
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setBookSearch, setFilter, setPage, clearBooksError, clearCurrentBook } =
  booksSlice.actions; // Export actions
export default booksSlice.reducer; // Export reducer
