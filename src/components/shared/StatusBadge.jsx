import { BadgeCheck, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function StatusBadge({ status }) {
  const styles = {
    "Onay bekliyor": "bg-amber-50 text-amber-700 ring-amber-200",
    Onaylandı: "bg-blue-50 text-blue-700 ring-blue-200",
    "Teslim edildi": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "İptal edildi": "bg-slate-100 text-slate-600 ring-slate-200",
  };
  const Icon = status === "Teslim edildi" ? CheckCircle2 : status === "İptal edildi" ? XCircle : status === "Onaylandı" ? BadgeCheck : Clock;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles[status] || styles["Onay bekliyor"]}`}>
      <Icon size={14} />
      {status}
    </span>
  );
}

