// src/pages/BookDetailPage.jsx
// ---------------------------------------------------------------------------
// Detail view + reviews list (with optimistic create/delete).
// ---------------------------------------------------------------------------
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { clearCurrentBook, fetchBookById } from "../features/books/booksSlice";
import {
  clearReviewsError,
  createReview,
  deleteReview,
  fetchReviewsByBook,
  optimisticAddReview,
  optimisticRemoveReview,
} from "../features/reviews/reviewsSlice";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";

export default function BookDetailPage() {
  const { id } = useParams();                             // Book id from URL
  const bookId = Number(id);                              // Cast to number
  const dispatch = useDispatch();                         // Dispatch

  const { current: book, isLoading: bookLoading, error: bookError } =
    useSelector((s) => s.books);                          // Book state

  const reviewBucket = useSelector((s) => s.reviews.byBookId[bookId]); // Reviews for book
  const { isLoading: reviewsLoading, error: reviewsError } =
    useSelector((s) => s.reviews);                        // Reviews meta

  const { user } = useSelector((s) => s.auth);            // Current user
  const { roles } = useSelector((s) => s.auth);           // Roles

  // Review form state.
  const [form, setForm] = useState({ title: "", content: "", rating: 5 }); // Form fields

  // Fetch book + reviews when id changes.
  useEffect(() => {
    dispatch(fetchBookById(bookId));                       // Load book
    dispatch(fetchReviewsByBook({ bookId, pageNumber: 1, pageSize: 10 })); // Load reviews

    // Clean up book when we leave this page.
    return () => dispatch(clearCurrentBook());             // Reset
  }, [dispatch, bookId]);

  // Submit a review using an optimistic insert.
  const handleSubmit = async (e) => {
    e.preventDefault();                                    // No reload

    const tempId = `temp-${Date.now()}`;                   // Unique placeholder id
    const optimisticReview = {
      id: tempId,                                          // Placeholder id
      title: form.title,                                   // Title
      content: form.content,                               // Body
      rating: form.rating,                                 // Rating
      createdOn: new Date().toISOString(),                 // Now
      updatedOn: null,                                     // Not yet updated
      bookId,                                              // Book FK
      userName: user?.userName || "You",                   // Reviewer name
    };

    // 1) Optimistic insert into redux.
    dispatch(optimisticAddReview({ bookId, review: optimisticReview }));

    // 2) Fire the real thunk; the reducer will swap tempId -> real on success
    //    or rollback on failure.
    dispatch(createReview({ bookId, payload: form, tempId }));

    // 3) Reset the form (optimistic UX).
    setForm({ title: "", content: "", rating: 5 });
  };

  // Delete a review optimistically.
  const handleDelete = (review) => {
    // Optimistically remove.
    dispatch(optimisticRemoveReview({ bookId, id: review.id }));
    // Fire the real thunk (rollback handled by user re-adding if needed).
    dispatch(deleteReview({ id: review.id, bookId }));
  };

  if (bookLoading) return <Spinner label="Loading book..." />; // Spinner
  if (!book) return <p className="empty-state">{bookError || "Book not found"}</p>; // Empty

  const canReview = !!user; // Only logged-in users can post

  return (
    <div className="page-container">
      <ErrorBanner message={bookError} onClose={() => dispatch(clearCurrentBook())} />

      <div className="book-detail">
        <div className="book-detail-cover">
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt={book.title} />
          ) : (
            <div className="book-cover-placeholder large">{book.title[0]}</div>
          )}
        </div>

        <div className="book-detail-info">
          <h1>{book.title}</h1>
          <p className="book-detail-authors">by {book.authorNames?.join(", ") || "Unknown"}</p>
          <p className="book-detail-category">Category: {book.categoryName || "—"}</p>
          <p className="book-detail-price">${book.price.toFixed(2)}</p>
          <p className="book-detail-stock">In stock: {book.stockQuantity}</p>
          <p className="book-detail-rating">
            ★ {book.averageRating?.toFixed(1) || "0.0"} ({book.reviewCount} reviews)
          </p>
          <p className="book-detail-desc">{book.description || "No description."}</p>
        </div>
      </div>

      <section className="reviews-section">
        <h2>Reviews</h2>

        <ErrorBanner message={reviewsError} onClose={() => dispatch(clearReviewsError())} />

        {/* Post a review */}
        {canReview && (
          <form className="review-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required minLength={5} maxLength={150}
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required minLength={5} maxLength={2000}
              />
            </div>

            <div className="form-group">
              <label>Rating (1-5)</label>
              <input
                type="number" min={1} max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                required
              />
            </div>

            <button className="btn-primary">Post Review</button>
          </form>
        )}

        {reviewsLoading && <Spinner label="Loading reviews..." />}

        <ul className="review-list">
          {reviewBucket?.items?.map((r) => (
            <li key={r.id} className="review-item">
              <div className="review-head">
                <strong>{r.title}</strong>
                <span className="review-rating">★ {r.rating}</span>
              </div>
              <p className="review-body">{r.content}</p>
              <small className="review-meta">
                by {r.userName || "Anonymous"} on {new Date(r.createdOn).toLocaleDateString()}
              </small>
              <br />
              {/* Delete button for owner or Admin */}
              {user && (user.userName === r.userName || roles.includes("Admin")) && (
                <button style={{color:"red"}} onClick={() => handleDelete(r)}>
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>

        {!reviewsLoading && (!reviewBucket || reviewBucket.items.length === 0) && (
          <p className="empty-state">No reviews yet. Be the first!</p>
        )}
      </section>
    </div>
  );
}
