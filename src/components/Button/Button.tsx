import { cn } from '@/lib/classNames';
import {
  ButtonHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  useState
} from 'react';
import { Spinner } from '../Spinner';

export function ToggleButtons({
  items
}: {
  items: { label: string; onClick?: () => void; isActive?: boolean }[];
}) {
  return (
    <div className="buttons">
      {items.map(item => (
        <button
          className={item.isActive ? 'active' : ''}
          onClick={item.onClick}
          tabIndex={-1}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Button({
  children,

  className,
  filled,
  gentle,
  outline,
  empty,
  text = !(filled || gentle || outline || empty),

  iconLeft,
  iconRight,

  onClick,
  pill,
  disabled: disabledProp,
  busy: busyProp,
  href,
  size = 'md',

  type = 'button',

  ...props
}: PropsWithChildren<
  {
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => any;
    disabled?: boolean;
    busy?: boolean;
    pill?: boolean;
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
    href?: string;
    size?: 'sm' | 'md' | 'lg';
  } & Partial<
    Record<'filled' | 'gentle' | 'outline' | 'empty' | 'text', boolean>
  > &
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'tabIndex'>
>) {
  const [autoBusy, setAutoBusy] = useState(false);

  const busy = busyProp || autoBusy;
  const disabled = disabledProp || busy;

  const content = (
    <button
      {...props}
      type={type}
      onClick={event => {
        const result = onClick?.(event) as any;
        if (result instanceof Promise) {
          setAutoBusy(true);
          result.finally(() => setAutoBusy(false));
        }
      }}
      className={cn(
        className,
        'relative w-fit whitespace-pre border text-center text-base transition-all',

        {
          sm: 'text-sm',
          md: 'text-base',
          lg: 'text-xl'
        }[size],

        (filled || gentle || outline) &&
          { sm: 'px-2 py-1', md: 'px-4 py-2', lg: 'px-6 py-3' }[size],

        filled &&
          'border-transparent bg-slate-900 text-white hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600 [&:not(:disabled)]:shadow-lg',
        gentle &&
          'border-transparent bg-slate-200 text-inherit hover:bg-gray-600/10 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600',
        outline &&
          'border-slate-300 text-slate-600 hover:border-slate-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:border-slate-700 dark:text-white dark:hover:text-white',
        empty && 'border-transparent text-black',
        text &&
          'border-transparent font-medium text-blue-500 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-500',

        pill ? 'rounded-full' : 'rounded-lg',

        busy ? 'pr-8' : ''
      )}
      disabled={disabled}
    >
      <div className="flex flex-row items-center justify-between gap-2">
        {!busy && iconLeft ? (
          <span className="-ml-1 h-5 min-w-5">{iconLeft}</span>
        ) : undefined}
        {children}
        {busy ? (
          <span className="absolute right-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Spinner className="h-4 w-4 text-white" />
          </span>
        ) : iconRight ? (
          <span className="-mr-1 h-5 min-w-5">{iconRight}</span>
        ) : undefined}
      </div>
    </button>
  );

  return href ? <a href={href}>{content}</a> : content;
}
