import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  Eye,
  Package,
  Search,
  X,
} from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/format";

const TR_MONTHS = {
  ocak: 0,
  şubat: 1,
  subat: 1,
  mart: 2,
  nisan: 3,
  mayıs: 4,
  mayis: 4,
  haziran: 5,
  temmuz: 6,
  ağustos: 7,
  agustos: 7,
  eylül: 8,
  eylul: 8,
  ekim: 9,
  kasım: 10,
  kasim: 10,
  aralık: 11,
  aralik: 11,
};

const MONTH_LABELS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function parseOrderDate(order = {}) {
  if (order.createdAt) {
    const parsed = new Date(order.createdAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (order.orderDate) {
    const parsed = new Date(order.orderDate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (order.date === "Bugün") return new Date();
  const raw = String(order.date || order.examDate || "")
    .trim()
    .toLocaleLowerCase("tr-TR");
  const parts = raw.split(/\s+/);
  if (parts.length >= 3) {
    const day = Number(parts[0]);
    const month = TR_MONTHS[parts[1]];
    const year = Number(parts[2]);
    if (day && month >= 0 && year) return new Date(year, month, day);
  }
  const fallback = new Date(raw);
  if (!Number.isNaN(fallback.getTime())) return fallback;
  return new Date();
}

function getDateParts(order) {
  const date = parseOrderDate(order);
  return {
    date,
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    monthLabel: MONTH_LABELS[date.getMonth()],
    day: String(date.getDate()).padStart(2, "0"),
    iso: date.toISOString().slice(0, 10),
  };
}

function uniqueSorted(values, direction = "desc") {
  const list = [...new Set(values.filter(Boolean))];
  return list.sort((a, b) =>
    direction === "desc"
      ? String(b).localeCompare(String(a), "tr")
      : String(a).localeCompare(String(b), "tr"),
  );
}

export default function CustomerOrderHistoryModal({
  orders = [],
  showPrices = true,
  onClose,
  onRepeat,
}) {
  const enrichedOrders = useMemo(
    () =>
      orders.map((order) => ({ ...order, _dateParts: getDateParts(order) })),
    [orders],
  );
  const years = useMemo(
    () => uniqueSorted(enrichedOrders.map((order) => order._dateParts.year)),
    [enrichedOrders],
  );
  const [selectedYear, setSelectedYear] = useState("Tümü");
  const [selectedMonth, setSelectedMonth] = useState("Tümü");
  const [selectedDay, setSelectedDay] = useState("Tümü");
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const monthOptions = useMemo(() => {
    const filtered =
      selectedYear === "Tümü"
        ? enrichedOrders
        : enrichedOrders.filter(
            (order) => order._dateParts.year === selectedYear,
          );
    return [
      ...new Map(
        filtered.map((order) => [
          order._dateParts.month,
          order._dateParts.monthLabel,
        ]),
      ).entries(),
    ].sort(([a], [b]) => Number(b) - Number(a));
  }, [enrichedOrders, selectedYear]);

  const dayOptions = useMemo(() => {
    const filtered = enrichedOrders.filter((order) => {
      const matchYear =
        selectedYear === "Tümü" || order._dateParts.year === selectedYear;
      const matchMonth =
        selectedMonth === "Tümü" || order._dateParts.month === selectedMonth;
      return matchYear && matchMonth;
    });
    return uniqueSorted(filtered.map((order) => order._dateParts.day));
  }, [enrichedOrders, selectedYear, selectedMonth]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return enrichedOrders
      .filter(
        (order) =>
          selectedYear === "Tümü" || order._dateParts.year === selectedYear,
      )
      .filter(
        (order) =>
          selectedMonth === "Tümü" || order._dateParts.month === selectedMonth,
      )
      .filter(
        (order) =>
          selectedDay === "Tümü" || order._dateParts.day === selectedDay,
      )
      .filter(
        (order) =>
          !q ||
          [
            order.id,
            order.item,
            order.status,
            order.note,
            order.classCategory,
          ].some((field) =>
            String(field || "")
              .toLocaleLowerCase("tr-TR")
              .includes(q),
          ),
      )
      .sort(
        (a, b) => b._dateParts.date.getTime() - a._dateParts.date.getTime(),
      );
  }, [enrichedOrders, query, selectedDay, selectedMonth, selectedYear]);

  const groupedByDay = useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      const key = order._dateParts.iso;
      if (!acc[key]) acc[key] = [];
      acc[key].push(order);
      return acc;
    }, {});
  }, [filteredOrders]);

  const totalQuantity = filteredOrders.reduce(
    (sum, order) => sum + Number(order.quantity || 0),
    0,
  );
  const totalAmount = filteredOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2.2rem] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-blue-100 bg-gradient-to-r from-blue-700 to-slate-950 p-6 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
              Sipariş geçmişi
            </p>
            <h2 className="mt-1 text-3xl font-black">Geçmiş sipariş arşivi</h2>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-blue-50">
              Yıl, ay ve gün bazında eski siparişlerinizi görüntüleyebilir;
              sipariş detaylarına tek ekrandan ulaşabilirsiniz.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 p-2 hover:bg-white/10"
          >
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-120px)] overflow-y-auto p-6">
          <div className="grid gap-4 rounded-[1.7rem] border border-blue-100 bg-blue-50 p-4 lg:grid-cols-[1fr_180px_180px_160px]">
            <label className="relative block">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-700"
                size={18}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Sipariş no, ürün, durum veya not ara..."
                className="w-full rounded-2xl border border-blue-100 bg-white py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </label>
            <select
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                setSelectedMonth("Tümü");
                setSelectedDay("Tümü");
              }}
              className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-black outline-none focus:border-blue-500"
            >
              <option>Tümü</option>
              {years.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setSelectedDay("Tümü");
              }}
              className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-black outline-none focus:border-blue-500"
            >
              <option value="Tümü">Tüm aylar</option>
              {monthOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={selectedDay}
              onChange={(event) => setSelectedDay(event.target.value)}
              className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-black outline-none focus:border-blue-500"
            >
              <option value="Tümü">Tüm günler</option>
              {dayOptions.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-slate-500">
                Sipariş
              </p>
              <p className="mt-1 text-2xl font-black text-slate-950">
                {filteredOrders.length}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-slate-500">
                Toplam adet
              </p>
              <p className="mt-1 text-2xl font-black text-blue-700">
                {totalQuantity}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-slate-500">
                Toplam tutar
              </p>
              <p className="mt-1 text-2xl font-black text-blue-700">
                {showPrices ? formatCurrency(totalAmount) : "Gizli"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              {filteredOrders.length === 0 ? (
                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
                  Seçilen tarih aralığında sipariş bulunamadı.
                </div>
              ) : (
                Object.entries(groupedByDay).map(([dateKey, dayOrders]) => (
                  <div
                    key={dateKey}
                    className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 font-black text-slate-950">
                        <CalendarDays size={18} className="text-blue-700" />{" "}
                        {formatDate(dateKey)}
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                        {dayOrders.length} sipariş
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {dayOrders.map((order) => (
                        <button
                          key={`${order.id}-${order.item}-${order.quantity}`}
                          onClick={() => setSelectedOrder(order)}
                          className={`rounded-[1.3rem] border p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/50 ${selectedOrder?.id === order.id && selectedOrder?.item === order.item ? "border-blue-300 bg-blue-50" : "border-slate-100 bg-slate-50"}`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-xs font-black text-blue-700">
                                {order.id}
                              </p>
                              <p className="mt-1 font-black text-slate-950">
                                {order.item}
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-500">
                                {order.quantity} adet • Sınav tarihi:{" "}
                                {formatDate(order.examDate)}
                              </p>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <aside className="sticky top-4 h-fit rounded-[1.7rem] border border-blue-100 bg-white p-5 shadow-sm">
              {selectedOrder ? (
                <div>
                  <div className="mb-4 flex items-center gap-2 text-blue-700">
                    <Eye size={18} />
                    <p className="text-sm font-black uppercase tracking-wide">
                      Sipariş detayı
                    </p>
                  </div>
                  <h3 className="text-xl font-black text-slate-950">
                    {selectedOrder.item}
                  </h3>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-500">
                        Sipariş no
                      </p>
                      <p className="mt-1 font-black">{selectedOrder.id}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-500">Durum</p>
                      <div className="mt-1">
                        <StatusBadge status={selectedOrder.status} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-500">Adet</p>
                        <p className="mt-1 font-black">
                          {selectedOrder.quantity}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-500">
                          Tutar
                        </p>
                        <p className="mt-1 font-black text-blue-700">
                          {showPrices
                            ? formatCurrency(selectedOrder.total || 0)
                            : "Gizli"}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-500">Not</p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {selectedOrder.note || "Not eklenmedi."}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-500">
                        Hareketler
                      </p>
                      <div className="mt-2 grid gap-2">
                        {(selectedOrder.logs || []).map((log, index) => (
                          <p
                            key={`${log}-${index}`}
                            className="rounded-xl bg-white p-2 text-xs font-bold text-slate-600 ring-1 ring-slate-100"
                          >
                            {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRepeat?.(selectedOrder)}
                    className="mt-4 w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"
                  >
                    Bu siparişi tekrarla
                  </button>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Package className="mx-auto text-blue-700" size={36} />
                  <p className="mt-3 text-sm font-black text-slate-950">
                    Detay görmek için sipariş seçin.
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Sol taraftaki geçmiş kayıtlarından birini seçebilirsiniz.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
