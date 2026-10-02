// src/components/Spinner.jsx
// ----------------------------
// Simple centred spinner shown while thunks are pending
// -------------------------------------------------------
export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" /> {/* Animated circle */}
      <p>{label}</p> {/* Optional label */}
    </div>
  );
}
