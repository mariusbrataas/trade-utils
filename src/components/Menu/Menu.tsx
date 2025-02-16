import { useState } from 'react';
import { Button } from '../Button';
import { ClickAway } from '../ClickAway';

export function Menu({
  title,
  options,
  onSelect
}: {
  title: string;
  options: { label: string; value: string; onClick?: () => void }[];
  onSelect?: (value: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <ClickAway
      className="relative inline-block"
      onClickOutside={() => setShow(false)}
    >
      <Button filled onClick={() => setShow(!show)}>
        {title}
      </Button>
      {show ? (
        <div
          onClick={event => {
            const value = (event.target as HTMLButtonElement).value;
            if (value) {
              onSelect?.(value);
              setShow(false);
            }
          }}
          className="absolute left-0 top-[calc(100%+8px)] z-10 box-border min-w-full overflow-auto rounded-lg border-1 border-solid border-gray-400 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700"
        >
          {options.map(opt => (
            <button
              key={opt.value}
              className="block w-full cursor-pointer bg-white px-3 py-2 outline-none hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600"
              value={opt.value}
              onClick={opt.onClick}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : undefined}
    </ClickAway>
  );
}
