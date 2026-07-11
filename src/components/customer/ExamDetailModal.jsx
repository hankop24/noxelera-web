import { motion } from "framer-motion";
import {
  Bell,
  BellOff,
  CalendarCheck,
  ClipboardList,
  Minus,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  recommendedDateText,
} from "../../utils/format";

export default function ExamDetailModal({
  exam,
  quantity,
  note,
  examDate,
  canOrder = true,
  availabilityText = "Siparişe açık",
  reminderActive = false,
  reminderText = "",
  globalMinQuantity = 1,
  globalMaxQuantity = 9999,
  noteRequired = false,
  showPrices = true,
  showPublisher = true,
  showBarcode = false,
  onQuantityChange,
  onNoteChange,
  onExamDateChange,
  onAddToCart,
  onAddReminder,
  onRemoveReminder,
  onClose,
}) {
  if (!exam) return null;
  const min = Math.max(
    Number(exam.minQuantity || 1),
    Number(globalMinQuantity || 1),
  );
  const max = Math.min(
    Number(exam.maxQuantity || 9999),
    Number(globalMaxQuantity || 9999),
  );
  const isBelowMin = quantity < min;
  const isAboveMax = quantity > max;
  const canAdd = canOrder && !isBelowMin && !isAboveMax;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
      >
        <div className="bg-gradient-to-br from-blue-700 to-blue-950 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              {showPublisher && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white ring-1 ring-white/20">
                  {exam.brand}
                </span>
              )}
              <h3 className="mt-4 text-2xl font-black tracking-tight">
                {exam.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-blue-50">
                {exam.description}
              </p>
              {showBarcode &&
                (exam.barcode || exam.isbn || exam.productCode) && (
                  <p className="mt-2 text-xs font-black text-blue-100">
                    Barkod: {exam.barcode || exam.isbn || exam.productCode}
                  </p>
                )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 p-2 hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">Grup</p>
              <p className="mt-1 font-black">{exam.group}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">Seviye</p>
              <p className="mt-1 font-black">{exam.level}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">
                Tavsiye aralığı
              </p>
              <p className="mt-1 font-black">{recommendedDateText(exam)}</p>
            </div>
            {showPrices && (
              <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                <p className="text-xs font-bold text-blue-700">Liste fiyatı</p>
                <p className="mt-1 font-black text-blue-900">
                  {formatCurrency(exam.listPrice || 0)}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
              <p className="text-xs font-bold text-blue-700">
                Sipariş kapanışı
              </p>
              <p className="mt-1 font-black text-blue-900">
                {formatDate(exam.orderDeadline)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="text-xs font-bold text-slate-500">Adet sınırı</p>
              <p className="mt-1 font-black">
                Min {min} / Maks {max}
              </p>
            </div>
            <div
              className={`rounded-2xl p-4 ring-1 ${canOrder ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-amber-50 text-amber-800 ring-amber-100"}`}
            >
              <p className="text-xs font-bold opacity-80">Durum</p>
              <p className="mt-1 font-black">{availabilityText}</p>
            </div>
          </div>
          <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-slate-950">Hatırlatma</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {reminderActive
                    ? `Kayıtlı hatırlatma: ${reminderText}`
                    : `${formatDate(exam.orderDeadline)} 09:00 tarihinde bildirim olarak gösterilir.`}
                </p>
              </div>
              {reminderActive ? (
                <button
                  onClick={onRemoveReminder}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white"
                >
                  <BellOff size={15} className="mr-1 inline" />
                  Kaldır
                </button>
              ) : (
                <button
                  onClick={onAddReminder}
                  className="rounded-2xl bg-blue-700 px-4 py-3 text-xs font-black text-white"
                >
                  <Bell size={15} className="mr-1 inline" />
                  Hatırlat
                </button>
              )}
            </div>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-[220px_1fr]">
            <div className="grid gap-4">
              <div>
                <p className="mb-2 text-sm font-black text-slate-700">
                  Sipariş adedi
                </p>
                <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-2 ring-1 ring-blue-100">
                  <button
                    disabled={!canOrder}
                    onClick={() => onQuantityChange(Math.max(quantity - 1, 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm hover:bg-blue-100 disabled:opacity-40"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    disabled={!canOrder}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(event) =>
                      onQuantityChange(Math.max(Number(event.target.value), 1))
                    }
                    className="w-20 bg-transparent text-center text-lg font-black outline-none disabled:opacity-40"
                  />
                  <button
                    disabled={!canOrder}
                    onClick={() => onQuantityChange(quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm hover:bg-blue-800 disabled:opacity-40"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {isBelowMin && (
                  <p className="mt-2 text-xs font-bold text-blue-700">
                    Minimum sipariş adedi {min} olmalıdır.
                  </p>
                )}
                {isAboveMax && (
                  <p className="mt-2 text-xs font-bold text-blue-700">
                    Maksimum sipariş adedi {max} olabilir.
                  </p>
                )}
              </div>
              <label>
                <p className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
                  <CalendarCheck size={16} /> Yapılacak tarih
                </p>
                <input
                  disabled={!canOrder}
                  type="date"
                  value={examDate}
                  onChange={(event) => onExamDateChange(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50"
                />
              </label>
            </div>
            <label>
              <p className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
                <ClipboardList size={16} /> Sipariş notu{" "}
                {noteRequired && <span className="text-blue-700">*</span>}
              </p>
              <textarea
                disabled={!canOrder}
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="Örn: 12. sınıf hafta sonu grubu için hazırlanacak."
                className="h-[150px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50"
              />
            </label>
          </div>
          <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 text-blue-700" size={18} />
              <p className="text-xs font-semibold leading-5 text-slate-600">
                {showPrices
                  ? "Fiyat görünümü bu admin hesabının ayarlarına göre gösteriliyor."
                  : "Bu admin hesabında fiyat bilgisi kurum panelinde gizlidir."}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Vazgeç
            </button>
            <button
              disabled={!canAdd}
              onClick={onAddToCart}
              className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Sepete Ekle
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
