'use client';

interface DropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export default function Dropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  className = '',
}: DropdownProps) {
  const labelClass = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider';
  const selectClass =
    'w-full px-4 py-3 text-sm border border-[var(--color-border)] rounded-xl focus:ring-4 focus:ring-[var(--color-secondary)]/20 focus:border-[var(--color-secondary)] outline-none bg-[var(--color-background)] text-[var(--color-text)] transition-all duration-200';

  return (
    <div className={className}>
      {label && <label className={labelClass}>{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
