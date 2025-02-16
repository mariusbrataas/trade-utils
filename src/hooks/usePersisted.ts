import { useCallback, useState } from "react";
import { useWindowListener } from "./useWindowListener";

export function usePersisted<T>(key: string, initialValue: T) {
  const [state, setState] = useState(() => fromStorage<T>(key) ?? initialValue);

  useWindowListener(
    "storage",
    (event) => {
      if (event.key === key && event.newValue)
        setState(JSON.parse(event.newValue).value);
    },
    [setState]
  );

  const handleSetPersistedState = useCallback(
    (newState: T | ((prevState: T) => T)) =>
      setState((prevState) => {
        // Get value of new state
        const newStateValue =
          typeof newState === "function"
            ? (newState as (prevState: T) => T)(prevState)
            : newState;

        // Return prevState if state has not changed
        if (newStateValue === prevState) return prevState;

        // Otherwise: Save newStateValue and return
        toStorage(key, newStateValue);
        return newStateValue;
      }),
    [key, setState]
  );

  return [state, handleSetPersistedState] as [
    state: T,
    setState: (state: T) => void,
  ];
}

function toStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify({ value }));
}

function fromStorage<T>(key: string): T | null {
  if (typeof localStorage !== "undefined") {
    const loaded = localStorage.getItem(key);
    if (loaded) return JSON.parse(loaded).value;
  }
  return null;
}
