import { cn } from '@/lib/classNames';
import { PropsWithChildren, ReactNode } from 'react';

export function Strong({ children }: PropsWithChildren) {
  return (
    <strong className="text-blue-500 dark:text-blue-400">{children}</strong>
  );
}

export function Pairs({
  data,
  divide,
  numbered
}: {
  data: (
    | { label: ReactNode; content: ReactNode | string | string[] }
    | undefined
    | false
    | null
  )[];
  divide?: boolean;
  numbered?: boolean;
}) {
  return (
    <div className="w-full">
      {(
        data.filter(item => item) as {
          label: ReactNode;
          content: ReactNode | string | string[];
        }[]
      ).map(({ label, content }, idx) => (
        <>
          {divide && idx ? <Divider /> : undefined}
          <div
            className={cn(
              'flex w-full flex-1 flex-row items-center gap-4',
              numbered && 'my-2'
            )}
          >
            {numbered ? (
              <div className="h-6 w-6 flex-none content-center rounded-full bg-blue-500 text-center text-sm font-semibold text-black">
                {idx + 1}
              </div>
            ) : undefined}

            <div className="flex w-full flex-row items-center justify-between gap-4 whitespace-pre">
              <span className="flex-shrink flex-grow whitespace-pre-wrap text-left">
                {label}
              </span>
              <span className="flex-shrink-0 flex-grow text-right font-bold">
                {content instanceof Array ? content.join('\n') : content}
              </span>
            </div>
          </div>
        </>
      ))}
    </div>
  );
}

export function Divider() {
  return <hr className="my-1 h-1 w-full" />;
}
