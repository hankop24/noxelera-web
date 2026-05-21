import { MADE_BY_TEXT } from "../../data/initialData";

export default function FixedCredit() {
  return (
    <div className="fixed bottom-2 right-2 z-[80] rounded-full border border-slate-200 bg-white/60 px-1.5 py-0.5 text-[7px] font-medium text-slate-400 shadow-sm backdrop-blur-sm">
      {MADE_BY_TEXT}
    </div>
  );
}

