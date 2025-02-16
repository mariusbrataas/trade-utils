import { useCallback, useEffect, useState } from 'react';

export function useSearchParam<T>(
  key: string,
  initialValue?: T
): [T, (newValue?: T) => void] {
  // Reads the current value from the URL search parameters.
  const getValueFromURL = (): T | undefined => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get(key);
    if (param === null) {
      return initialValue;
    }
    try {
      // We assume that the value was stringified using JSON.stringify.
      return JSON.parse(param) as T;
    } catch (error) {
      console.error(`Error parsing URL parameter "${key}":`, error);
      return initialValue;
    }
  };

  // Initialize the state from the URL (or fallback to initialValue, which may be undefined)
  const [value, setValue] = useState<T | undefined>(() => getValueFromURL());

  // Update the URL search parameter. If newValue is undefined, remove the parameter.
  const updateURL = useCallback(
    (newValue?: T) => {
      const params = new URLSearchParams(window.location.search);
      if (newValue === undefined) {
        params.delete(key);
      } else {
        params.set(key, JSON.stringify(newValue));
      }
      // Construct a new URL using the same pathname and hash.
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      // Use replaceState so that we don't create a new history entry each time.
      window.history.replaceState(null, '', newUrl);
    },
    [key]
  );

  // A setter that updates both our state and the URL.
  const setSearchParam = useCallback(
    (newValue?: T) => {
      setValue(newValue);
      updateURL(newValue);
    },
    [updateURL]
  );

  // Listen for changes in the URL (e.g. when the user clicks the back button)
  useEffect(() => {
    const onPopState = () => {
      setValue(getValueFromURL());
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [key]);

  return [value!, setSearchParam];
}
