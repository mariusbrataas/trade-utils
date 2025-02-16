import { cn } from '@/lib/classNames';
import {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useState
} from 'react';
import { Field } from '../Field';

interface CommonProps
  extends Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'required' | 'id' | 'name' | 'autoFocus'
  > {
  placeholder?: string | number;
}

interface TextInputProps
  extends CommonProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'pattern' | 'autoCapitalize' | 'autoComplete'
    > {
  type?: 'text' | 'password' | 'email';
  value?: string;
  onChange?: (nextState: string) => void;
}

interface NumberInputProps
  extends CommonProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'step' | 'min' | 'max'> {
  type: 'number';
  value?: number;
  onChange?: (nextState: number) => void;
}

function TextInput({
  placeholder,
  value,
  onChange,
  ...props
}: TextInputProps & { className: string }) {
  return (
    <input
      placeholder={placeholder == null ? undefined : `${placeholder}`}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      {...props}
    />
  );
}

// Helper: determine the number of decimal places from the step value.
const getStepPrecision = (stepVal: number): number => {
  const stepStr = stepVal.toString();
  if (stepStr.indexOf('e-') >= 0) {
    const [, exp] = stepStr.split('e-');
    return Number(exp);
  }
  const decimalIndex = stepStr.indexOf('.');
  return decimalIndex >= 0 ? stepStr.length - decimalIndex - 1 : 0;
};

/**
 * isCompleteNumber
 *
 * Returns true only if the input string represents a “complete” number.
 * (For example, "-0" is treated as incomplete so the user can keep typing.)
 */
const isCompleteNumber = (s: string): boolean => {
  if (!/^-?\d+(\.\d+)?$/.test(s)) return false;
  if (s === '-0') return false;
  if (s.startsWith('-0') && s.length > 2 && s[2] !== '.') return false;
  return true;
};

function NumberInput({
  placeholder,
  value,
  onChange,
  ...props
}: NumberInputProps & { className: string }) {
  // Local state stores exactly what the user types.
  const [inputValue, setInputValue] = useState(
    value == null ? '' : value.toString()
  );
  // Track whether the input is focused.
  const [isFocused, setIsFocused] = useState(false);

  // When the parent’s value changes externally, update local state—but only when not editing.
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value == null ? '' : value.toString());
    }
  }, [value, isFocused]);

  // Destructure min, max, and step from the extra props.
  const { min, max, step } = props;

  /**
   * commitNumber
   *
   * Adjusts a parsed numeric value to respect min, max, and step,
   * and rounds to the proper precision.
   */
  const commitNumber = (n: number): number => {
    let committed = n;

    // Clamp to min if needed.
    if (min !== undefined) {
      const minVal = typeof min === 'string' ? parseFloat(min) : min;
      if (!isNaN(minVal) && committed < minVal) {
        committed = minVal;
      }
    }
    // Clamp to max if needed.
    if (max !== undefined) {
      const maxVal = typeof max === 'string' ? parseFloat(max) : max;
      if (!isNaN(maxVal) && committed > maxVal) {
        committed = maxVal;
      }
    }
    // Snap to the nearest step if provided.
    if (step !== undefined) {
      const stepVal = typeof step === 'string' ? parseFloat(step) : step;
      if (!isNaN(stepVal) && stepVal !== 0) {
        let base = 0;
        if (min !== undefined) {
          const minVal = typeof min === 'string' ? parseFloat(min) : min;
          if (!isNaN(minVal)) {
            base = minVal;
          }
        }
        committed = Math.round((committed - base) / stepVal) * stepVal + base;
        const precision = getStepPrecision(stepVal);
        committed = Number(committed.toFixed(precision));
      }
    }
    return committed;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow only characters that could eventually form a valid number.
    if (/^-?\d*\.?\d*$/.test(newValue)) {
      setInputValue(newValue);

      // If the string is a complete number, parse it.
      if (isCompleteNumber(newValue)) {
        const parsed = parseFloat(newValue);
        const committed = commitNumber(parsed);
        // Only update parent's onChange if the string is already in canonical form.
        if (newValue === committed.toString()) {
          onChange?.(committed);
        } else {
          // Otherwise, do not call onChange yet.
          onChange?.(undefined!);
        }
      } else {
        // For incomplete numbers (like "", "-" or "-0"), signal no valid number.
        onChange?.(undefined!);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (isCompleteNumber(inputValue)) {
      const parsed = parseFloat(inputValue);
      const committed = commitNumber(parsed);
      // On blur we always commit (and reformat to canonical form)
      setInputValue(committed.toString());
      onChange?.(committed);
    } else {
      setInputValue('');
      onChange?.(undefined!);
    }
  };

  return (
    <input
      placeholder={placeholder == null ? undefined : `${placeholder}`}
      value={value}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      {...props}
    />
  );
}

export function Input({
  label,
  id,
  filled,
  prefix,
  suffix,
  status,
  ...props
}: {
  label?: string;
  id?: string;
  filled?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  status?: ReactNode;
} & (TextInputProps | NumberInputProps)) {
  const className =
    'w-full cursor-text rounded-md border-none bg-transparent py-2 outline-none transition-all autofill:appearance-none autofill:bg-red-600 autofill:fill-white dark:border-slate-600';
  return (
    <Field className="text-left" label={label} htmlFor={id}>
      <div
        className={cn(
          'relative flex max-w-full cursor-default flex-row items-center rounded-md border-1 outline-none transition-all focus-within:border-blue-500',
          prefix ? (typeof prefix === 'string' ? 'pl-3' : 'pl-1') : 'pl-3',
          suffix ? (typeof suffix === 'string' ? 'pr-3' : 'pr-1') : 'pr-3',
          filled
            ? 'border-transparent bg-slate-100 dark:bg-slate-900'
            : 'border-gray-200 bg-transparent dark:border-slate-600'
        )}
      >
        {prefix ? (
          <span className="h-full w-fit pr-2 text-slate-600">{prefix}</span>
        ) : null}
        {props.type === 'number' ? (
          <NumberInput className={className} {...props} />
        ) : (
          <TextInput className={className} {...props} />
        )}
        {suffix ? (
          <span className="h-full w-fit pr-2 text-slate-600">{suffix}</span>
        ) : null}
      </div>
      {status ? (
        <span className="block whitespace-nowrap text-sm font-light text-gray-500">
          {status}
        </span>
      ) : null}
    </Field>
  );
}

export function InputOld<T extends 'text' | 'number' | 'password' | 'email'>({
  value,
  onChange,
  placeholder,
  autofocus,
  type,
  id,
  name,
  label = name,
  status,
  prefix,
  suffix,
  filled,
  ...props
}: {
  value?: T extends 'text' ? string : number;
  onChange?: T extends 'number'
    ? (value: number) => void
    : (value: string) => void;
  placeholder?: string | number;
  autofocus?: boolean;
  label?: string;
  type?: T;
  status?: ReactNode;
  prefix?: string;
  suffix?: string;
  filled?: boolean;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'required' | 'id' | 'name' | 'pattern' | 'step' | 'min' | 'max'
>) {
  // Local state stores exactly what the user types.
  const [inputValue, setInputValue] = useState(
    value == null ? '' : value.toString()
  );
  // Track whether the input is focused.
  const [isFocused, setIsFocused] = useState(false);

  // When the parent’s value changes externally, update local state—but only when not editing.
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value == null ? '' : value.toString());
    }
  }, [value, isFocused]);

  // Destructure min, max, and step from the extra props.
  const { min, max, step } = props;

  // Helper: determine the number of decimal places from the step value.
  const getStepPrecision = (stepVal: number): number => {
    const stepStr = stepVal.toString();
    if (stepStr.indexOf('e-') >= 0) {
      const [, exp] = stepStr.split('e-');
      return Number(exp);
    }
    const decimalIndex = stepStr.indexOf('.');
    return decimalIndex >= 0 ? stepStr.length - decimalIndex - 1 : 0;
  };

  /**
   * commitNumber
   *
   * Adjusts a parsed numeric value to respect min, max, and step,
   * and rounds to the proper precision.
   */
  const commitNumber = (n: number): number => {
    let committed = n;

    // Clamp to min if needed.
    if (min !== undefined) {
      const minVal = typeof min === 'string' ? parseFloat(min) : min;
      if (!isNaN(minVal) && committed < minVal) {
        committed = minVal;
      }
    }
    // Clamp to max if needed.
    if (max !== undefined) {
      const maxVal = typeof max === 'string' ? parseFloat(max) : max;
      if (!isNaN(maxVal) && committed > maxVal) {
        committed = maxVal;
      }
    }
    // Snap to the nearest step if provided.
    if (step !== undefined) {
      const stepVal = typeof step === 'string' ? parseFloat(step) : step;
      if (!isNaN(stepVal) && stepVal !== 0) {
        let base = 0;
        if (min !== undefined) {
          const minVal = typeof min === 'string' ? parseFloat(min) : min;
          if (!isNaN(minVal)) {
            base = minVal;
          }
        }
        committed = Math.round((committed - base) / stepVal) * stepVal + base;
        const precision = getStepPrecision(stepVal);
        committed = Number(committed.toFixed(precision));
      }
    }
    return committed;
  };

  /**
   * isCompleteNumber
   *
   * Returns true only if the input string represents a “complete” number.
   * (For example, "-0" is treated as incomplete so the user can keep typing.)
   */
  const isCompleteNumber = (s: string): boolean => {
    if (!/^-?\d+(\.\d+)?$/.test(s)) return false;
    if (s === '-0') return false;
    if (s.startsWith('-0') && s.length > 2 && s[2] !== '.') return false;
    return true;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (type === 'number') {
      // Allow only characters that could eventually form a valid number.
      if (/^-?\d*\.?\d*$/.test(newValue)) {
        setInputValue(newValue);

        // If the string is a complete number, parse it.
        if (isCompleteNumber(newValue)) {
          const parsed = parseFloat(newValue);
          const committed = commitNumber(parsed);
          // Only update parent's onChange if the string is already in canonical form.
          if (newValue === committed.toString()) {
            onChange?.(committed as never);
          } else {
            // Otherwise, do not call onChange yet.
            onChange?.(undefined as never);
          }
        } else {
          // For incomplete numbers (like "", "-" or "-0"), signal no valid number.
          onChange?.(undefined as never);
        }
      }
    } else {
      setInputValue(newValue);
      onChange && onChange(newValue as never);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (type === 'number') {
      if (isCompleteNumber(inputValue)) {
        const parsed = parseFloat(inputValue);
        const committed = commitNumber(parsed);
        // On blur we always commit (and reformat to canonical form)
        setInputValue(committed.toString());
        onChange?.(committed as never);
      } else {
        setInputValue('');
        onChange?.(undefined as never);
      }
    }
  };

  return (
    <Field className="text-left" label={label} htmlFor={id}>
      <div
        className={cn(
          'relative flex max-w-full cursor-default flex-row items-center rounded-md border-1 px-3 outline-none transition-all focus-within:border-blue-500',
          filled
            ? 'border-transparent bg-slate-100 dark:bg-slate-900'
            : 'border-gray-200 bg-transparent dark:border-slate-600'
        )}
      >
        {prefix ? (
          <span className="h-full w-fit pr-2 text-slate-600">{prefix}</span>
        ) : null}
        <input
          id={id}
          className="w-full cursor-text rounded-md border-none bg-transparent py-2 outline-none transition-all autofill:appearance-none autofill:bg-red-600 autofill:fill-white dark:border-slate-600"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder == null ? undefined : `${placeholder}`}
          autoFocus={autofocus}
          type={type}
          name={name}
          {...props}
        />
        {suffix ? (
          <span className="h-full w-fit pr-2 text-slate-600">{suffix}</span>
        ) : null}
      </div>
      {status ? (
        <span className="block whitespace-nowrap text-sm font-light text-gray-500">
          {status}
        </span>
      ) : null}
    </Field>
  );
}
