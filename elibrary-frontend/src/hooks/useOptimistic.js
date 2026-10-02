// src/hooks/useOptimistic.js
// -----------------------------------
// Tiny wrapper that wires on "optimistic" action + rollback for a thunk.
// Pass:
//      -despatch (the redux dispatch)
//      -the optimistic action creator (e.g. optimisticAddReview)
//      -the real thunk
//      -a rollback payload builder (executed only on rejection)
// ------------------------------------

import { useCallback } from "react";


export function useOptimistic() {
    // Return a stable callback factory.
    const run = useCallback(
        ({ optimisticAction, thunkAction, optimisticPayload, rollbackPayload }) => {
            // 1. Fire the optimistic update immediately.
            if (optimisticAction) optimisticAction(optimisticPayload);

            // 2. Return a function that performs the real call and returns a promise.
            return async (dispatch) => {
                try {
                    await dispatch(thunkAction).unwrap();   // Real call
                } catch {
                    // On failure --> call rollback action if the caller provided one.
                    if(rollbackPayload) dispatch(rollbackPayload);
                }
            };
        },
        []
    );
    return { run }; // Only expose `run`
}