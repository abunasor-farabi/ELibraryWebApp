// src/hooks/useDebounce.js
// --------------------------------------------
// Return a debounced copy of `value` that updates only after `delay` ms of
// quiet. Ideal for search boxes to avoid hammering the server on each keypress.

import { useEffect, useState } from "react"

export function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);      // Local debounced state

    useEffect(() => {
        // Schedule updating the debounced value after `delay` ms.
        const t = setTimeout(() => setDebounced(value), delay); // Defferred set

        // If `value` changes again before the timeout fires, clear it.
        return () => clearTimeout(t);   // Cancel the previous timer
    }, [value, delay]);     // Re-run only when value or delay change

    return debounced;   // Caller reads this value
}