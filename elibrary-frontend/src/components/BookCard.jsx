// src/components/BookCard.jsx
// ---------------------------------------
// Renders a single book in the grid.
// --------------------------------------------

import { Link } from "react-router-dom";

export default function BookCard({ book }) {
    return (
        <div className="book-card">
            <Link to={`/books/${book.id}`} className="book-cover-link">
                <div className="book-cover">
                    {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt={book.title} /> // Real cover
                    ) : (
                        <div className="book-cover-placeholder">{book.title[0]}</div>
                    )}
                </div>
            </Link>

            <div className="book-info">
                <h3 className="book-title">
                    <Link to={`/books/${book.id}`}>{book.title}</Link>
                </h3>
                
                <p className="book-category">
                    {book.categoryName || "Uncategorised"}      {/* Category */}
                </p>

                <p className="book-authors">
                    {book.authorNames?.length ? book.authorNames.join(", ") : "Unknown author"}
                </p>

                <div className="book-meta">
                    <span className="book-price">${book.price.toFixed(2)}</span>
                    <span className="book-rating">
                        ★ {book.averageRating ? book.averageRating.toFixed(1) : "0.0"}
                        <small>({book.reviewCount})</small>
                    </span>
                </div>
            </div>
        </div>
    );
}

