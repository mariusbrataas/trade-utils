import { cn } from '@/lib/classNames';
import { PropsWithChildren, ReactNode } from 'react';

export function Field({
  children,
  className,
  label,
  htmlFor
}: PropsWithChildren<{
  className?: string;
  label?: ReactNode;
  htmlFor?: string;
}>) {
  return (
    <fieldset className={cn('m-0 block flex-1', className)}>
      {label ? <Field.Label htmlFor={htmlFor}>{label}</Field.Label> : undefined}
      {children}
    </fieldset>
  );
}

Field.Label = ({
  children,
  htmlFor,
  className
}: PropsWithChildren<{ htmlFor?: string; className?: string }>) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'm-0 block select-none whitespace-pre text-base font-medium text-black first-letter:capitalize dark:text-white',
        className
      )}
    >
      {children}
    </label>
  );
};
