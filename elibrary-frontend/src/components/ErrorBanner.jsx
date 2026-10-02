// src/components/ErrorBanner.jsx
// ---------------------------------------------------------------------------
// Small dismissible banner that shows any server-side error message.
// ---------------------------------------------------------------------------
export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;                // Nothing to show
  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>                {/* Server message */}
      {onClose && (
        <button className="error-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
}