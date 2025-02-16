import { TextareaHTMLAttributes } from "react";
import { Field } from "../Field";

export function Textarea({
  value,
  onChange,
  placeholder,

  autofocus,
  autocorrect,
  autocomplete,
  autocapitalize,
  spellcheck,

  id,
  name,
  label = name,
  ...props
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  autofocus?: boolean;
  autocorrect?: boolean;
  autocomplete?: boolean;
  autocapitalize?: boolean;
  spellcheck?: boolean;
  label?: string;
} & Pick<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "required" | "id" | "name"
>) {
  const content = value || placeholder || "";
  return (
    <Field label={label} htmlFor={id}>
      <div className="relative">
        <div className="h-full w-full overflow-visible whitespace-pre rounded-md border-1 border-transparent px-3 py-2 font-[inherit] text-transparent">
          {content + (content.endsWith("\n") ? " " : "")}
        </div>
        <textarea
          className="absolute inset-0 m-0 w-full resize-none overflow-hidden rounded-md border-1 border-gray-200 bg-transparent px-3 py-2 font-[inherit] outline-1 -outline-offset-1 outline-blue-600 transition-all autofill:appearance-none autofill:bg-red-600 autofill:fill-white focus:outline dark:border-slate-600 dark:outline-blue-500"
          autoCorrect={autocorrect ? "" : "off"}
          autoComplete={autocomplete ? "" : "off"}
          autoCapitalize={autocapitalize ? "" : "off"}
          spellCheck={spellcheck ? "true" : "false"}
          autoFocus={autofocus}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          {...props}
        />
      </div>
    </Field>
  );
}
