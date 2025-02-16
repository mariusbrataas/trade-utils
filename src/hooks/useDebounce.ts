import { useEffect, useRef } from 'react';

export function useDebounceEffect(
  callback: () => void,
  delay: number,
  args: any[]
) {
  var timeout = useRef<NodeJS.Timeout>();
  useEffect(() => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(callback, delay);
    return () => clearTimeout(timeout.current);
  }, args);
}
