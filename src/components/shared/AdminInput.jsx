export default function AdminInput({
  label,
  value,
  onChange,
  type = "text",
  options,
  disabled = false,
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {options ? (
        <select
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
      ) : (
        <input
          disabled={disabled}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        />
      )}
    </label>
  );
}
