import { PropsWithChildren, useState } from 'react';
import { Button } from './Button';
import { ClickAway } from './ClickAway';

export function PopoverButton({
  children,
  title,
  closeOnPopoverClick
}: PropsWithChildren<{
  title: string;
  closeOnPopoverClick?: boolean;
}>) {
  const [show, setShow] = useState(false);
  return (
    <ClickAway className="relative" onClickOutside={() => setShow(false)}>
      <Button filled size="sm" onClick={() => setShow(!show)} tabIndex={-1}>
        {title}
      </Button>
      {show ? (
        <div
          className="absolute top-full z-50 pt-1"
          onClick={closeOnPopoverClick ? () => setShow(false) : undefined}
        >
          <div className="rounded-lg border border-blue-500 bg-white dark:bg-slate-800">
            {children}
          </div>
        </div>
      ) : undefined}
    </ClickAway>
  );
}
