export default function MonthCard({ month, selected, count, onClick }) {
  const statusClass = { past: "opacity-35 grayscale", current: "border-amber-400 bg-amber-50 text-amber-950 shadow-md shadow-amber-100 opacity-100", next: "opacity-85", future: "opacity-65" };
  const baseClass = selected ? "border-blue-700 bg-blue-700 text-white shadow-lg shadow-blue-200 opacity-100 grayscale-0" : `border-blue-100 bg-white ${statusClass[month.status] || ""}`;
  return (
    <button onClick={onClick} className={`min-w-[150px] rounded-[1.7rem] border p-5 text-left transition hover:-translate-y-1 hover:shadow-md ${baseClass}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-70">{month.year}</p>
      <p className="mt-2 text-2xl font-black">{month.label}</p>
      <p className="mt-3 text-sm font-bold opacity-80">{count} deneme</p>
      {month.status === "current" && !selected && <p className="mt-3 text-xs font-black text-amber-700">Bu ay</p>}
    </button>
  );
}

