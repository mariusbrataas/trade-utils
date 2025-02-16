import { InputHTMLAttributes, ReactNode } from 'react';
import { Field } from './Field';

export function Checkbox({
  label,
  id = label,
  onChange,
  status,
  ...props
}: {
  label?: string;
  onChange?: (nextState: boolean) => void;
  status?: ReactNode;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'required' | 'id' | 'name' | 'checked'
>) {
  return (
    <Field className="text-left">
      <div className="flex flex-row content-center items-center gap-2">
        <input
          id={id}
          type="checkbox"
          {...props}
          onChange={e => onChange?.(e.target.checked)}
        />
        {label ? (
          <Field.Label
            htmlFor={id}
            className="mb-0 whitespace-pre-wrap font-normal"
          >
            {label}
          </Field.Label>
        ) : undefined}
      </div>
      {status ? (
        <span className="block whitespace-pre-wrap text-sm font-light text-gray-500">
          {status}
        </span>
      ) : undefined}
    </Field>
  );
}
