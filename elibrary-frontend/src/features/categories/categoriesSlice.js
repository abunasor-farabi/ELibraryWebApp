// src/features/categories/categoriesSlice.js
// ---------------------------------------------------------------------------
// Categories: paginated list + CRUD.
// ---------------------------------------------------------------------------
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCategoriesRequest,
  createCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest,
} from "../../api/categoryApi";

const initialState = {
  items: [], // Current page items
  totalCount: 0, // Total
  pageNumber: 1, // Page
  pageSize: 20, // Size
  totalPages: 0, // Pages
  search: "", // Search text
  isLoading: false, // Pending
  error: null, // Last error
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { search, pageNumber, pageSize } = getState().categories; // Read filters
      return await getCategoriesRequest({ search, pageNumber, pageSize }); // GET
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load categories");
    }
  },
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (payload, { rejectWithValue }) => {
    try {
      return await createCategoryRequest(payload); // POST
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create category");
    }
  },
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateCategoryRequest(id, payload); // PUT
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update category");
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCategoryRequest(id); // DELETE
      return id; // For client-side removal
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete category");
    }
  },
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategorySearch: (state, action) => {
      state.search = action.payload; // New search
      state.pageNumber = 1; // Reset to page 1
    },
    setCategoryPage: (state, action) => {
      state.pageNumber = action.payload; // New page
    },
    clearCategoriesError: (state) => {
      state.error = null; // Reset
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(fetchCategories.fulfilled, (s, a) => {
        s.isLoading = false;
        s.items = a.payload.items || []; // Items
        s.pageNumber = a.payload.pageNumber; // Sync
        s.pageSize = a.payload.pageSize; // Sync
        s.totalCount = a.payload.totalCount; // Sync
        s.totalPages = a.payload.totalPages; // Sync
      })
      .addCase(fetchCategories.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      })
      .addCase(createCategory.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(createCategory.fulfilled, (s, a) => {
        s.isLoading = false;
        s.items.unshift(a.payload); // Add to top
        s.totalCount += 1; // Count++
      })
      .addCase(createCategory.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      })
      .addCase(updateCategory.fulfilled, (s, a) => {
        const i = s.items.findIndex((c) => c.id === a.payload.id); // Find
        if (i !== -1) s.items[i] = a.payload; // Replace
      })
      .addCase(updateCategory.rejected, (s, a) => {
        s.error = a.payload; // Show error
      })
      .addCase(deleteCategory.fulfilled, (s, a) => {
        s.items = s.items.filter((c) => c.id !== a.payload); // Remove
        s.totalCount = Math.max(0, s.totalCount - 1); // Count--
      })
      .addCase(deleteCategory.rejected, (s, a) => {
        s.error = a.payload;
      });
  },
});

export const { setCategorySearch, setCategoryPage, clearCategoriesError } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;
