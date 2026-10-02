// src/features/reviews/reviewsSlice.js
// ---------------------------------------------------------------------------
// Reviews for a book. Includes OPTIMISTIC create + delete with rollback.
// ---------------------------------------------------------------------------
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getReviewsByBookRequest,
  createReviewRequest,
  updateReviewRequest,
  deleteReviewRequest,
} from "../../api/reviewApi";

// Fresh state per book — we key reviews under `byBookId`.
const initialState = {
  byBookId: {}, // { [bookId]: { items:[], totalPages, ... } }
  isLoading: false, // Pending flag
  error: null, // Last error
};

// ---------- fetch reviews for one book ----------
export const fetchReviewsByBook = createAsyncThunk(
  "reviews/fetchReviewsByBook",
  async ({ bookId, pageNumber = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const data = await getReviewsByBookRequest(bookId, {
        pageNumber,
        pageSize,
      });
      return { bookId, data }; // Return which book the reviews belong to
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load reviews");
    }
  },
);

// ---------- OPTIMISTIC create ----------
export const createReview = createAsyncThunk(
  "reviews/createReview",
  async ({ bookId, payload, tempId }, { rejectWithValue }) => {
    try {
      const data = await createReviewRequest(bookId, payload); // Real POST
      return { bookId, tempId, real: data }; // Return both ids
    } catch (err) {
      return rejectWithValue({
        bookId,
        tempId,
        message: err.message || "Failed to post review",
      });
    }
  },
);

// ---------- update ----------
export const updateReview = createAsyncThunk(
  "reviews/updateReview",
  async ({ id, bookId, payload }, { rejectWithValue }) => {
    try {
      const data = await updateReviewRequest(id, payload); // PUT
      return { bookId, real: data }; // Return patched review
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update review");
    }
  },
);

// ---------- OPTIMISTIC delete ----------
export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async ({ id, bookId }, { rejectWithValue }) => {
    try {
      await deleteReviewRequest(id); // Real DELETE
      return { bookId, id }; // Return book + id
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete review");
    }
  },
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    // ---- Optimistic add (called BEFORE the API returns) ----
    optimisticAddReview: (state, action) => {
      const { bookId, review } = action.payload; // { bookId, review with tempId }
      if (!state.byBookId[bookId]) {
        state.byBookId[bookId] = {
          items: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 0,
        };
      }
      state.byBookId[bookId].items.unshift(review); // Prepend
      state.byBookId[bookId].totalCount += 1; // Count++
    },
    // ---- Optimistic remove ----
    optimisticRemoveReview: (state, action) => {
      const { bookId, id } = action.payload; // { bookId, id }
      const bucket = state.byBookId[bookId]; // Bucket
      if (!bucket) return; // No bucket → skip
      bucket.items = bucket.items.filter((r) => r.id !== id); // Remove from array
      bucket.totalCount = Math.max(0, bucket.totalCount - 1); // Count--
    },
    clearReviewsError: (state) => {
      state.error = null; // Reset
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- FETCH ----
      .addCase(fetchReviewsByBook.pending, (s) => {
        s.isLoading = true; // Spinner on
        s.error = null; // Reset
      })
      .addCase(fetchReviewsByBook.fulfilled, (s, a) => {
        s.isLoading = false; // Spinner off
        s.byBookId[a.payload.bookId] = {
          items: a.payload.data.items || [], // Items
          totalCount: a.payload.data.totalCount, // Total
          pageNumber: a.payload.data.pageNumber, // Page
          pageSize: a.payload.data.pageSize, // Size
          totalPages: a.payload.data.totalPages, // Pages
        };
      })
      .addCase(fetchReviewsByBook.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      })
      // ---- OPTIMISTIC CREATE ----
      .addCase(createReview.fulfilled, (s, a) => {
        const { bookId, tempId, real } = a.payload; // Real review
        const bucket = s.byBookId[bookId]; // Find bucket
        if (!bucket) return; // Shouldn't happen
        const idx = bucket.items.findIndex((r) => r.id === tempId); // Find placeholder
        if (idx === -1) return; // Swap to real
        // Merge server fields over the optimistic entry, but keep the local
        // userName/userId if the server's POST DTO omits them.
        bucket.items[idx] = {
          ...bucket.items[idx],
          ...real,
          userName: real.userName ?? bucket.items[idx].userName,
          userId: real.userId ?? bucket.items[idx].userId,
        };
      })
      .addCase(createReview.rejected, (s, a) => {
        const { bookId, tempId, message } = a.payload || {}; // Extract
        const bucket = s.byBookId[bookId]; // Find bucket
        if (bucket) {
          bucket.items = bucket.items.filter((r) => r.id !== tempId); // Rollback
          bucket.totalCount = Math.max(0, bucket.totalCount - 1); // Count back
        }
        s.error = message || "Failed to post review"; // Show error
      })
      // ---- UPDATE ----
      .addCase(updateReview.fulfilled, (s, a) => {
        const { bookId, real } = a.payload; // Updated review
        const bucket = s.byBookId[bookId]; // Bucket
        if (!bucket) return;
        const idx = bucket.items.findIndex((r) => r.id === real.id); // Find
        if (idx !== -1) bucket.items[idx] = real; // Replace
      })
      .addCase(updateReview.rejected, (s, a) => {
        s.error = a.payload;
      })
      // ---- OPTIMISTIC DELETE ----
      .addCase(deleteReview.rejected, (s, a) => {
        s.error = a.payload || "Failed to delete review"; // Show server error
        // NOTE: to rollback a delete we'd need the removed item; the calling
        // component holds it and can dispatch an `optimisticAddReview` to restore.
      });
  },
});

export const {
  optimisticAddReview,
  optimisticRemoveReview,
  clearReviewsError,
} = reviewsSlice.actions; // Export actions
export default reviewsSlice.reducer; // Export reducer
