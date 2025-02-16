import { DependencyList, useEffect } from 'react';

export function useWindowListener<T extends keyof WindowEventMap>(
  types: T | T[],
  listener: (event: WindowEventMap[T]) => void,
  deps: DependencyList = []
) {
  useEffect(() => {
    const subscriptions = [types].flat().map(type => {
      window.addEventListener(type, listener as any);
      return () => window.removeEventListener(type, listener as any);
    });
    return () => subscriptions.forEach(unsubscribe => unsubscribe());
  }, deps);
}
