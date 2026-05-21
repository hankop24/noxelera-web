import { ChevronRight } from "lucide-react";

export default function GroupTab({ active, icon, title, count, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-between rounded-[1.4rem] border px-5 py-4 text-left transition ${active ? "border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-100" : "border-blue-100 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40"}`}>
      <span className="flex items-center gap-3">{icon}<span><span className="block text-sm font-black">{title}</span><span className="block text-xs font-bold opacity-70">{count} deneme</span></span></span>
      <ChevronRight size={18} />
    </button>
  );
}

