import styles from './Dropdown.module.scss';

export function Dropdown({
  title,
  options,
  value,
  onChange
}: {
  title: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className={styles.dropdown}>
      <select
        onChange={e => onChange?.(e.target.value)}
        className="w-auto cursor-pointer appearance-none rounded-md border-solid border-gray-500 bg-white px-3 py-2"
        value={value || '__default__'}
      >
        <option value="__default__" disabled>
          {title}
        </option>
        {options.map(opt => (
          <option key={`${opt.label}_${opt.value}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
