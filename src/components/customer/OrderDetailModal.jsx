import { motion } from "framer-motion";
import { Clock, Repeat, X } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/format";

function InfoCard({ label, value, accent = false, wide = false }) {
  return (
    <div
      className={`rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 ${wide ? "sm:col-span-2" : ""}`}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 whitespace-normal break-words text-sm font-black leading-relaxed ${accent ? "text-blue-700" : "text-slate-950"}`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function getDisplayComponents(order = {}) {
  const directComponents =
    order.components ||
    order.orderComponents ||
    order.componentItems ||
    order.productComponents ||
    [];
  if (directComponents.length) return directComponents;

  const aBarcode = order.aBarcode || order.barcodeA || order.componentABarcode;
  const bBarcode = order.bBarcode || order.barcodeB || order.componentBBarcode;
  const aProductCode =
    order.aProductCode || order.productCodeA || order.componentAProductCode;
  const bProductCode =
    order.bProductCode || order.productCodeB || order.componentBProductCode;

  return [
    {
      id: `${order.id || "order"}-a`,
      partLabel: "A Kitapçığı",
      name:
        order.componentAName ||
        order.aName ||
        `${order.item || "Sipariş ürünü"} A Kitapçığı`,
      publisher: order.publisher || order.brand || "-",
      barcode: aBarcode || "-",
      productCode: aProductCode || order.productCode || "-",
      requiredQty: order.quantity || 0,
    },
    {
      id: `${order.id || "order"}-b`,
      partLabel: "B Kitapçığı",
      name:
        order.componentBName ||
        order.bName ||
        `${order.item || "Sipariş ürünü"} B Kitapçığı`,
      publisher: order.publisher || order.brand || "-",
      barcode: bBarcode || "-",
      productCode: bProductCode || order.productCode || "-",
      requiredQty: order.quantity || 0,
    },
  ];
}

function ComponentRow({ component, order, index }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
      <div className="grid gap-4 xl:grid-cols-[140px_minmax(260px,1fr)_minmax(260px,360px)_170px_90px] xl:items-start">
        <div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 xl:hidden">
            Kitapçık
          </p>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100">
            {component.partLabel || component.booklet || `Bileşen ${index + 1}`}
          </span>
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 xl:hidden">
            Ürün
          </p>
          <p className="whitespace-normal break-words text-sm font-black leading-relaxed text-slate-950">
            {component.name || "-"}
          </p>
          <p className="mt-1 whitespace-normal break-words text-xs font-bold leading-relaxed text-slate-500">
            {component.publisher || "Yayınevi yok"}
            {component.classLevel ? ` • ${component.classLevel}` : ""}
          </p>
        </div>

        <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100 xl:bg-transparent xl:p-0 xl:ring-0">
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 xl:hidden">
            Barkod
          </p>
          <p className="whitespace-normal break-all font-mono text-[13px] font-black leading-relaxed text-slate-800">
            {component.barcode || "-"}
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 xl:hidden">
            Ürün kodu
          </p>
          <p className="whitespace-normal break-all font-mono text-xs font-black leading-relaxed text-slate-700">
            {component.productCode || component.aksonProductCode || "-"}
          </p>
        </div>

        <div className="text-left xl:text-right">
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 xl:hidden">
            Adet
          </p>
          <p className="text-sm font-black text-blue-700">
            {component.requiredQty || order.quantity || 0} adet
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailModal({ order, onClose, onRepeat }) {
  if (!order) return null;
  const displayComponents = getDisplayComponents(order);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-3 py-4 backdrop-blur-sm sm:px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 bg-slate-950 p-6 text-white sm:p-7">
          <div className="min-w-0">
            <p className="text-sm font-black text-blue-200">{order.id}</p>
            <h3 className="mt-2 whitespace-normal break-words text-2xl font-black leading-tight sm:text-3xl">
              {order.item}
            </h3>
            <p className="mt-2 whitespace-normal break-words text-sm font-semibold text-slate-300">
              {order.quantity} adet • {order.institution}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/20 p-2 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-132px)] overflow-y-auto p-5 sm:p-6">
          <section className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                  Sipariş bilgileri
                </p>
                <h4 className="mt-1 text-xl font-black text-slate-950">
                  Genel durum
                </h4>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Adet" value={`${order.quantity || 0} adet`} />
              <InfoCard
                label="Birim fiyat"
                value={formatCurrency(order.price || 0)}
              />
              <InfoCard
                label="Toplam tutar"
                value={formatCurrency(order.total)}
                accent
              />
              <InfoCard
                label="Fatura durumu"
                value={order.aksonStatus || "Fatura bekliyor"}
                accent
              />
              <InfoCard label="Fatura no" value={order.invoiceNumber || "-"} />
              <InfoCard label="Fatura zamanı" value={order.invoicedAt || "-"} />
              <InfoCard
                label="Fatura açıklaması"
                value={order.invoiceMessage || "Fatura bilgisi bulunmuyor."}
                wide
              />
            </div>
          </section>

          <section className="mt-5 rounded-3xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              Tarih ve operasyon
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard
                label="Oluşturulma"
                value={order.createdAt || order.date}
              />
              <InfoCard label="Onaylanma" value={order.approvedAt} />
              <InfoCard label="Hazırlanma" value={order.preparedAt} />
              <InfoCard label="Teslim" value={order.deliveredAt} />
              <InfoCard
                label="Sınav / uygulama tarihi"
                value={formatDate(order.examDate)}
              />
              <InfoCard label="Kurum" value={order.institution} />
            </div>
          </section>

          <section className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100 sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Not
            </p>
            <p className="mt-2 whitespace-normal break-words text-sm font-semibold leading-relaxed text-slate-700">
              {order.note || "Not bulunmuyor."}
            </p>
          </section>

          <section className="mt-5 rounded-3xl bg-blue-50 p-4 ring-1 ring-blue-100 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                  Depo / Fatura / Akson bileşenleri
                </p>
                <h4 className="mt-1 text-xl font-black text-slate-950">
                  Ürün bileşenleri
                </h4>
                <p className="mt-1 text-xs font-bold leading-relaxed text-blue-900/70">
                  A/B barkodları, ürün kodları ve depodan düşülecek adetler
                  burada takip edilir.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                {displayComponents.length} bileşen
              </span>
            </div>

            <div className="mt-4 hidden rounded-2xl bg-white/80 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-blue-900/60 ring-1 ring-blue-100 xl:grid xl:grid-cols-[140px_minmax(260px,1fr)_minmax(260px,360px)_170px_90px] xl:gap-4">
              <span>Kitapçık</span>
              <span>Ürün</span>
              <span>Barkod</span>
              <span>Ürün kodu</span>
              <span className="text-right">Adet</span>
            </div>

            <div className="mt-3 grid gap-3">
              {displayComponents.map((component, index) => (
                <ComponentRow
                  key={`${component.id || component.barcode || component.name}-${index}`}
                  component={component}
                  order={order}
                  index={index}
                />
              ))}
            </div>
          </section>

          <section className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100 sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              İşlem geçmişi
            </p>
            <div className="mt-3 grid gap-2">
              {(order.logs || []).length ? (
                (order.logs || []).map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-slate-700"
                  >
                    <Clock
                      size={15}
                      className="mt-0.5 shrink-0 text-blue-700"
                    />
                    <span className="break-words">{log}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-slate-500">
                  İşlem geçmişi bulunmuyor.
                </p>
              )}
            </div>
          </section>

          {onRepeat && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => onRepeat(order)}
                className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
              >
                <Repeat size={16} className="mr-2 inline" />
                Tekrar sipariş oluştur
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
