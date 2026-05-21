import { motion } from "framer-motion";
import { Clock, Repeat, X } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/format";

export default function OrderDetailModal({ order, onClose, onRepeat }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-slate-950 p-6 text-white">
          <div><p className="text-sm font-black text-blue-200">{order.id}</p><h3 className="mt-2 text-2xl font-black">{order.item}</h3><p className="mt-1 text-sm text-slate-300">{order.institution}</p></div>
          <button onClick={onClose} className="rounded-full border border-white/20 p-2 hover:bg-white/10"><X size={20} /></button>
        </div>
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Adet</p><p className="mt-1 font-black">{order.quantity}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Tarih</p><p className="mt-1 font-black">{formatDate(order.examDate)}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Tutar</p><p className="mt-1 font-black text-blue-700">{formatCurrency(order.total)}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Durum</p><div className="mt-1"><StatusBadge status={order.status} /></div></div>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Not</p><p className="mt-1 text-sm font-semibold text-slate-700">{order.note}</p></div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">İşlem geçmişi</p>
            <div className="mt-3 grid gap-2">{(order.logs || []).map((log, index) => <div key={index} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Clock size={15} className="text-blue-700" />{log}</div>)}</div>
          </div>
          {onRepeat && <div className="mt-6 flex justify-end gap-3"><button onClick={() => onRepeat(order)} className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"><Repeat size={16} className="mr-2 inline" />Tekrar sipariş oluştur</button></div>}
        </div>
      </motion.div>
    </div>
  );
}

