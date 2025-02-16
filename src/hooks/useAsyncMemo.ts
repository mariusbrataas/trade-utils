import { useEffect, useState } from "react";

/**
 * Like useMemo, but can handle promise-based callbacks.
 *
 * @param callback
 * @param triggers
 */
export function useAsyncMemo<T>(
  callback: () => T | Promise<T>,
  triggers?: any[]
) {
  // Private states
  const [state, setState] = useState<T>();

  // Execute callback
  useEffect(() => {
    Promise.resolve()
      .then(() => callback())
      .then(setState);
  }, triggers || []);

  // Return state
  return state;
}
