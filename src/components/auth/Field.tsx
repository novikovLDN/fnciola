/** Поле ввода для форм аутентификации (общий стиль). */
export function Field({
  label,
  value,
  onChange,
  type = 'text',
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  return (
    <label className="block">
      <span className="text-sm text-muted">{label}</span>
      <input
        {...rest}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-full border border-ink/10 bg-bg-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-violet/50"
      />
    </label>
  );
}
