import { cn } from '@/lib/classNames';
import { round } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Strong } from './Helpers';

export function formatNumber(value: number, decimals?: number) {
  return (
    decimals !== undefined
      ? round(value, decimals)
      : value < 1
        ? value
        : round(
            value,
            value < 10
              ? 4
              : value < 20
                ? 3
                : value < 50
                  ? 2
                  : value < 100
                    ? 1
                    : 0
          )
  )
    .toLocaleString('fr-FR')
    .replace(',', '.')
    .replace(' ', ' ');
}

export function PrettyNumber({
  value,
  decimals,
  prefix,
  suffix,
  strong,
  hiddenIfZero
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  strong?: boolean;
  hiddenIfZero?: boolean;
}) {
  const [highlight, setHighlight] = useState(false);

  const formatted = formatNumber(value, decimals);
  useEffect(() => {
    setHighlight(true);
    const timeout = setTimeout(() => {
      setHighlight(false);
    }, 1e3);
    return () => {
      clearTimeout(timeout);
    };
  }, [formatted]);

  if (hiddenIfZero && formatted === '0') return undefined;

  const content = (
    <span
      className={cn(
        'whitespace-nowrap rounded-md px-1 transition-colors',
        highlight
          ? 'bg-blue-500 text-white dark:bg-blue-500 dark:text-gray-900'
          : 'duration-1000'
      )}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );

  if (strong) return <Strong>{content}</Strong>;
  return content;
}
