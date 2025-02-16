import { RefObject } from 'react';
import { useWindowListener } from './useWindowListener';

export function useClickAway(
  ref: RefObject<HTMLElement | null>,
  onClickOutside?: (event: MouseEvent | TouchEvent) => void
) {
  useWindowListener(
    ['mousedown', 'touchstart'],
    event => {
      if (ref.current && !ref.current.contains(event.target as any)) {
        event.stopPropagation();
        onClickOutside?.(event);
      }
    },
    [ref, onClickOutside]
  );
}
