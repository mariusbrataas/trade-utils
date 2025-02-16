import { useClickAway } from '@/hooks/useClickAway';
import {
  CSSProperties,
  MouseEventHandler,
  PropsWithChildren,
  useRef
} from 'react';

export function ClickAway({
  children,
  className,
  onClickOutside,
  style,
  onClick
}: PropsWithChildren<{
  className?: string;
  onClickOutside?: (event: MouseEvent | TouchEvent) => void;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
}>) {
  const ref = useRef<HTMLDivElement>(null);

  useClickAway(ref, onClickOutside);

  return (
    <div className={className} ref={ref} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
