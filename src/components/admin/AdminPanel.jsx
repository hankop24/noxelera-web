import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  BarChart3,
  BookOpen,
  Boxes,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Edit3,
  Eye,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Upload,
  Users,
  X,
  XCircle,
} from "lucide-react";

import AdminInput from "../shared/AdminInput";
import OrderDetailModal from "../customer/OrderDetailModal";
import WarehousePanel from "./WarehousePanel";
import {
  MADE_BY_TEXT,
  MONTHS,
  blankCustomer,
  blankExam,
} from "../../data/initialData";
import { formatCurrency, formatDate } from "../../utils/format";

const classOptionsByGroup = {
  Lise: ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf", "TYT", "AYT"],
  Ortaokul: ["5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "LGS"],
};

const orderStatuses = [
  "Tümü",
  "Onaylandı",
  "Hazır",
  "Teslim edildi",
  "İptal edildi",
];
const productSources = ["Akson", "Excel", "Manuel"];
const productExamTypes = [
  "TYT",
  "AYT",
  "LGS",
  "KPSS",
  "Ortaokul",
  "Lise",
  "DGS",
  "YKS",
];
const productTypes = [
  "Deneme",
  "Soru Bankası",
  "Konu Anlatım",
  "Set",
  "Kitapçık",
  "Yaprak Test",
];
const productCategories = [
  "Kurumsal Deneme",
  "Kurumsal Yayın",
  "Perakende Yayın",
  "Takvim Deneme",
  "Outlet",
  "Promosyon",
];
const productLevels = [
  "İlkokul",
  "Ortaokul",
  "Lise",
  "TYT",
  "AYT",
  "KPSS",
  "DGS",
];
const customerTypes = [
  "Dershane",
  "Kurs Merkezi",
  "Okul",
  "Kolej",
  "Etüt Merkezi",
  "Yayın Bayisi",
  "Diğer",
];
const customerStatuses = ["Tümü", "Aktif", "Pasif"];
const staffRoleOptions = [
  { value: "personnel", label: "Personel" },
  { value: "distributor", label: "Dağıtıcı" },
];
const staffStatusOptions = ["Tümü", "Aktif", "Pasif"];
const announcementTypes = [
  "Genel duyuru",
  "Kampanya",
  "Sistem bildirimi",
  "Sipariş bilgilendirmesi",
  "Önemli uyarı",
];
const announcementAudiences = [
  "Tüm kurumlar",
  "Sadece aktif kurumlar",
  "Seçili kurumlar",
  "Kurum tipine göre",
];
const announcementStatuses = ["Yayında", "Taslak", "Planlandı", "Pasif"];
const announcementPriorities = ["Normal", "Önemli", "Acil"];
const announcementDisplayModes = [
  {
    value: "card",
    label: "Kart",
    description: "Kurum panelinde standart duyuru kartı olarak gösterilir.",
  },
  {
    value: "banner",
    label: "Üst banner",
    description:
      "Sayfanın üst kısmında geniş bilgilendirme bandı gibi görünür.",
  },
  {
    value: "spotlight",
    label: "Öne çıkan alan",
    description: "Ana sayfada büyük görsel alanıyla öne çıkar.",
  },
  {
    value: "compact",
    label: "Kompakt satır",
    description:
      "Duyuru listesinde daha küçük ve hızlı okunur şekilde gösterilir.",
  },
];
const announcementSortOptions = [
  "Akıllı sıralama",
  "En yeni",
  "Öncelik",
  "Sabitlenenler",
  "Bitiş tarihi",
];
const adminSettingsTabs = [
  {
    id: "business",
    label: "İşletme Bilgileri",
    description: "Bu admin hesabının kurumlara görünen şube bilgileri.",
  },
  {
    id: "orders",
    label: "Sipariş Ayarları",
    description: "Kurumların sipariş oluşturma davranışları.",
  },
  {
    id: "customerPortal",
    label: "Kurum Paneli",
    description: "Bu admin hesabına bağlı kurumların görebileceği alanlar.",
  },
  {
    id: "products",
    label: "Ürün & Vitrin",
    description: "Ürün görünümü, iskonto ve vitrin davranışları.",
  },
  {
    id: "security",
    label: "Güvenlik",
    description: "Giriş, oturum ve hassas işlem kuralları.",
  },
  {
    id: "notifications",
    label: "Bildirimler",
    description: "Kurum ve personel bildirim akışları.",
  },
  {
    id: "integrations",
    label: "Sistem Entegrasyonları",
    description: "Her admin hesabına özel Akson/API bağlantı bilgileri.",
  },
];
const orderApprovalOptions = [
  "Manuel onay",
  "Otomatik onay",
  "Akson faturadan sonra onay",
];
const showcaseSortOptions = [
  "Alfabetik",
  "Yayınevine göre",
  "Son eklenen",
  "Manuel sıra",
];
const aksonInvoiceScenarioOptions = [
  "Temel fatura",
  "Ticari fatura",
  "E-arşiv",
  "E-fatura",
];
const customerMatchOptions = [
  "Kurum kodu",
  "Vergi no",
  "E-posta",
  "Manuel eşleştirme",
];
const announcementImageFitOptions = [
  {
    value: "cover",
    label: "Kapla",
    description: "Alanı tamamen doldurur, taşan kısımları kırpar.",
  },
  {
    value: "contain",
    label: "Sığdır",
    description: "Görselin tamamını gösterir, boşluk bırakabilir.",
  },
];
const announcementImageHeightOptions = [
  { value: "compact", label: "Kompakt", className: "h-40" },
  { value: "medium", label: "Standart", className: "h-56" },
  { value: "large", label: "Geniş", className: "h-72" },
  { value: "hero", label: "Afiş", className: "h-96" },
];
const announcementImagePositionOptions = [
  { value: "center", label: "Merkez", className: "object-center" },
  { value: "top", label: "Üst", className: "object-top" },
  { value: "bottom", label: "Alt", className: "object-bottom" },
  { value: "left", label: "Sol", className: "object-left" },
  { value: "right", label: "Sağ", className: "object-right" },
];
const announcementImageRadiusOptions = [
  { value: "soft", label: "Yumuşak", className: "rounded-[1.5rem]" },
  { value: "medium", label: "Orta", className: "rounded-2xl" },
  { value: "none", label: "Köşesiz", className: "rounded-none" },
];
const announcementImageOverlayOptions = [
  { value: "none", label: "Yok", className: "" },
  { value: "light", label: "Hafif karartma", className: "bg-slate-950/15" },
  { value: "dark", label: "Belirgin karartma", className: "bg-slate-950/35" },
  { value: "blue", label: "Mavi ton", className: "bg-blue-950/25" },
];
const getAnnouncementImageHeightClass = (value) =>
  announcementImageHeightOptions.find((item) => item.value === value)
    ?.className || "h-56";
const getAnnouncementImagePositionClass = (value) =>
  announcementImagePositionOptions.find((item) => item.value === value)
    ?.className || "object-center";
const getAnnouncementImageRadiusClass = (value) =>
  announcementImageRadiusOptions.find((item) => item.value === value)
    ?.className || "rounded-[1.5rem]";
const getAnnouncementImageOverlayClass = (value) =>
  announcementImageOverlayOptions.find((item) => item.value === value)
    ?.className || "";
const getAnnouncementImageFitClass = (value) =>
  value === "contain" ? "object-contain bg-slate-100" : "object-cover";
const getAnnouncementImageStyle = (item = {}) => {
  if ((item.imageFit || "cover") !== "cover") return {};
  const zoom = Math.max(100, Math.min(180, Number(item.imageCropZoom || 100)));
  const x = Math.max(0, Math.min(100, Number(item.imageCropX ?? 50)));
  const y = Math.max(0, Math.min(100, Number(item.imageCropY ?? 50)));
  return {
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${x}% ${y}%`,
  };
};
const getAnnouncementDisplayModeLabel = (value) =>
  announcementDisplayModes.find((item) => item.value === value)?.label ||
  "Kart";
const getAnnouncementTargetSummary = (announcement = {}, customers = []) => {
  const audience = announcement.audience || "Tüm kurumlar";
  if (audience === "Seçili kurumlar") {
    const ids = announcement.audienceCustomerIds || [];
    if (!ids.length) return "Seçili kurum yok";
    const names = customers
      .filter((customer) => ids.includes(customer.id))
      .map((customer) => customer.name);
    return names.length > 2
      ? `${names.slice(0, 2).join(", ")} +${names.length - 2}`
      : names.join(", ");
  }
  if (audience === "Kurum tipine göre") {
    const types = announcement.audienceCustomerTypes || [];
    return types.length ? types.join(", ") : "Kurum tipi seçilmedi";
  }
  return audience;
};
const appendAnnouncementLog = (announcement = {}, action, detail) => ({
  ...announcement,
  changeLog: [
    {
      id: Date.now() + Math.random(),
      action,
      detail,
      date: new Date().toISOString(),
    },
    ...(announcement.changeLog || []),
  ],
});
const staffPermissionModules = [
  {
    key: "dashboardView",
    label: "Dashboard görüntüleme",
    group: "Genel",
    description: "Ana özet ve hızlı durum ekranını görebilir.",
  },

  {
    key: "orderView",
    label: "Siparişleri görüntüleme",
    group: "Sipariş",
    description: "Sipariş listesini ve sipariş detaylarını görebilir.",
  },
  {
    key: "orderCreate",
    label: "Sipariş oluşturma",
    group: "Sipariş",
    description: "Kurum adına yeni sipariş oluşturabilir.",
  },
  {
    key: "orderApprove",
    label: "Sipariş onaylama",
    group: "Sipariş",
    description: "Onay bekleyen siparişleri onaylayabilir.",
  },
  {
    key: "orderPrepare",
    label: "Sipariş hazırlama",
    group: "Sipariş",
    description: "Onaylanan siparişi hazırlandı durumuna alabilir.",
  },
  {
    key: "orderDeliver",
    label: "Sipariş teslim etme",
    group: "Sipariş",
    description: "Hazır siparişleri teslim edildi olarak işaretleyebilir.",
  },
  {
    key: "orderCancel",
    label: "Sipariş iptal etme",
    group: "Sipariş",
    description: "Sipariş iptali ve iptal sebebi işlemlerini yapabilir.",
  },

  {
    key: "productPoolView",
    label: "Ürün havuzu görüntüleme",
    group: "Ürün",
    description: "Ürün havuzunu ve ürün detaylarını görebilir.",
  },
  {
    key: "productPoolImport",
    label: "Excel / Akson ürün aktarma",
    group: "Ürün",
    description: "Ürün havuzuna Excel veya Akson kaynaklı ürün aktarabilir.",
  },
  {
    key: "productPoolEdit",
    label: "Ürün düzenleme",
    group: "Ürün",
    description:
      "Ürün bilgilerini, görünürlük durumunu ve manuel kayıtları düzenleyebilir.",
  },

  {
    key: "showcaseView",
    label: "Vitrin görüntüleme",
    group: "Vitrin",
    description: "Vitrin ve deneme takvimi ekranlarını görebilir.",
  },
  {
    key: "showcaseEdit",
    label: "Vitrin / takvim düzenleme",
    group: "Vitrin",
    description:
      "Vitrine ürün ekleyebilir, takvim ve görünürlük ayarlarını değiştirebilir.",
  },

  {
    key: "customerView",
    label: "Kurumları görüntüleme",
    group: "Kurum",
    description: "Kurum listesini ve kurum detaylarını görebilir.",
  },
  {
    key: "customerCreate",
    label: "Kurum oluşturma",
    group: "Kurum",
    description: "Yeni kurum hesabı oluşturabilir.",
  },
  {
    key: "customerDiscount",
    label: "Kurum iskontosu belirleme",
    group: "Kurum",
    description: "Kurum bazlı tek iskonto oranını güncelleyebilir.",
  },
  {
    key: "customerPasswordReset",
    label: "Kurum şifre sıfırlama",
    group: "Kurum",
    description: "Kurum kullanıcıları için şifre sıfırlama akışı başlatabilir.",
  },

  {
    key: "announcementView",
    label: "Duyuruları görüntüleme",
    group: "İçerik",
    description: "Duyuru listesini ve içeriklerini görebilir.",
  },
  {
    key: "announcementEdit",
    label: "Duyuru yönetme",
    group: "İçerik",
    description:
      "Duyuru oluşturabilir, düzenleyebilir veya yayından kaldırabilir.",
  },

  {
    key: "reportView",
    label: "Arşiv / rapor görüntüleme",
    group: "Rapor",
    description: "Geçmiş sipariş ve rapor ekranlarını görüntüleyebilir.",
  },
  {
    key: "userView",
    label: "Kullanıcıları görüntüleme",
    group: "Yönetim",
    description: "Personel ve dağıtıcı kullanıcılarını görebilir.",
  },
  {
    key: "userManage",
    label: "Kullanıcı yönetimi",
    group: "Yönetim",
    description:
      "Kullanıcı oluşturabilir, silebilir, durum ve yetkileri değiştirebilir.",
  },
];
const getDefaultStaffPermissions = (role = "personnel") => {
  const defaults = {
    dashboardView: true,
    orderView: true,
    orderCreate: role === "personnel",
    orderApprove: role === "personnel",
    orderPrepare: true,
    orderDeliver: role === "distributor",
    orderCancel: false,

    productPoolView: role === "personnel",
    productPoolImport: false,
    productPoolEdit: false,

    showcaseView: role === "personnel",
    showcaseEdit: false,

    customerView: role === "personnel",
    customerCreate: false,
    customerDiscount: false,
    customerPasswordReset: false,

    announcementView: role === "personnel",
    announcementEdit: false,

    reportView: role === "personnel",
    userView: false,
    userManage: false,
  };

  if (role === "distributor") {
    return {
      ...defaults,
      dashboardView: true,
      orderView: true,
      orderCreate: false,
      orderApprove: false,
      orderPrepare: true,
      orderDeliver: true,
      orderCancel: false,
      productPoolView: false,
      showcaseView: false,
      customerView: false,
      announcementView: false,
      reportView: false,
    };
  }
  return defaults;
};
const mergeStaffPermissions = (role, permissions = {}) => ({
  ...getDefaultStaffPermissions(role),
  ...permissions,
});
const getStaffRoleLabel = (role) =>
  staffRoleOptions.find((item) => item.value === role)?.label || "Personel";

function normalizeText(value = "") {
  return String(value).toLocaleLowerCase("tr-TR");
}

function cleanExcelValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\t/g, "").replace(/\s+/g, " ").trim();
}

function parseExcelNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = cleanExcelValue(value)
    .replace(/₺/g, "")
    .replace(/%/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseExcelBoolean(value) {
  const normalized = cleanExcelValue(value).toLocaleLowerCase("tr-TR");
  return ["evet", "true", "1", "var", "y", "yes"].includes(normalized);
}

function pickExcelValue(row, keys = []) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
  }
  const normalizedEntries = Object.entries(row).map(([key, value]) => [
    cleanExcelValue(key).toLocaleLowerCase("tr-TR"),
    value,
  ]);
  for (const key of keys) {
    const normalizedKey = cleanExcelValue(key).toLocaleLowerCase("tr-TR");
    const match = normalizedEntries.find(
      ([rowKey]) => rowKey === normalizedKey,
    );
    if (match) return match[1];
  }
  return "";
}

function normalizeProductKey(product = {}) {
  const barcode = cleanExcelValue(product.barcode || product.isbn);
  if (barcode) return `barcode:${barcode}`;
  return [product.productCode, product.name, product.publisher]
    .map((item) => cleanExcelValue(item).toLocaleLowerCase("tr-TR"))
    .filter(Boolean)
    .join("|");
}

function mapExcelRowToProduct(row, index = 0) {
  const isbn = cleanExcelValue(
    pickExcelValue(row, ["Isbn", "ISBN", "Barkod", "Barcode"]),
  );
  const name = cleanExcelValue(
    pickExcelValue(row, ["Ürün Adı", "Urun Adi", "Ürün adı", "Urun adi", "Ad"]),
  );
  const publisher = cleanExcelValue(
    pickExcelValue(row, ["YAYINEVİ", "Yayınevi", "YAYINEVI", "Yayinevi"]),
  );
  const productCode = cleanExcelValue(
    pickExcelValue(row, ["Ürün Kodu", "Urun Kodu", "Kod", "Stok Kodu"]),
  );

  if (!name && !isbn && !productCode) return null;
  if (!name) return null;

  return {
    id: `excel-${Date.now()}-${index}`,
    source: "Excel",
    productType: cleanExcelValue(
      pickExcelValue(row, ["ÜRÜN TİPİ", "Ürün Tipi", "URUN TIPI", "Urun Tipi"]),
    ),
    isbn,
    barcode: isbn,
    productCode,
    name,
    publisher,
    branch: cleanExcelValue(
      pickExcelValue(row, ["BRANŞ", "Branş", "BRANS", "Brans"]),
    ),
    classLevel: cleanExcelValue(
      pickExcelValue(row, ["SINIF", "Sınıf", "Sinif"]),
    ),
    examType: cleanExcelValue(
      pickExcelValue(row, [
        "SINAV TİPİ",
        "Sınav Tipi",
        "SINAV TIPI",
        "Sinav Tipi",
      ]),
    ),
    type: cleanExcelValue(pickExcelValue(row, ["TÜR", "Tür", "TUR", "Tur"])),
    category: cleanExcelValue(
      pickExcelValue(row, ["KATEGORİ", "Kategori", "KATEGORI"]),
    ),
    level: cleanExcelValue(
      pickExcelValue(row, ["DÜZEY", "Düzey", "DUZEY", "Duzey"]),
    ),
    kind: cleanExcelValue(pickExcelValue(row, ["CİNS", "Cins", "CINS"])),
    price: parseExcelNumber(
      pickExcelValue(row, ["Liste Fiyatı", "Liste Fiyati", "Fiyat", "Liste"]),
    ),
    purchasePrice: parseExcelNumber(
      pickExcelValue(row, [
        "Alım Fiyat (Kdv Dahil)",
        "Alim Fiyat (Kdv Dahil)",
        "Alım Fiyat",
        "Alim Fiyat",
      ]),
    ),
    lastPurchaseUnitPrice: parseExcelNumber(
      pickExcelValue(row, ["Son Alım Birim Fiyat", "Son Alim Birim Fiyat"]),
    ),
    lastPurchaseDiscount: parseExcelNumber(
      pickExcelValue(row, [
        "Son Alım İnd. (%)",
        "Son Alim Ind. (%)",
        "Son Alım İnd",
        "Son Alim Ind",
      ]),
    ),
    ignoreDiscount: parseExcelBoolean(
      pickExcelValue(row, [
        "Ürün İndirimlerini Yoksay",
        "Urun Indirimlerini Yoksay",
        "İndirimleri Yoksay",
        "Indirimleri Yoksay",
      ]),
    ),
    active: true,
  };
}

function nowStamp() {
  const now = new Date();
  return {
    iso: now.toISOString(),
    dateText: now.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    timeText: now.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    monthKey: now.toLocaleDateString("tr-TR", {
      month: "long",
      year: "numeric",
    }),
    dayKey: now.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };
}

const HISTORY_MONTHS = [
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

const HISTORY_START_YEAR = 2026;

function buildHistoryYears(archive = {}) {
  const archiveYears = Object.keys(archive)
    .map((year) => Number(year))
    .filter(Boolean);
  const defaultEndYear = Math.max(
    new Date().getFullYear() + 4,
    HISTORY_START_YEAR + 4,
  );
  const maxYear = Math.max(defaultEndYear, ...archiveYears);
  return Array.from({ length: maxYear - HISTORY_START_YEAR + 1 }, (_, index) =>
    String(HISTORY_START_YEAR + index),
  );
}

function makeHistoryMonth(year, monthIndex, existingMonth) {
  const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  return {
    key,
    label: HISTORY_MONTHS[monthIndex],
    monthIndex,
    orders: existingMonth?.orders || [],
    days: existingMonth?.days || {},
  };
}

function getDaysInHistoryMonth(year, monthIndex) {
  return new Date(Number(year), monthIndex + 1, 0).getDate();
}

function makeHistoryDay(year, monthIndex, dayNumber, existingDay) {
  const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
  const monthName = HISTORY_MONTHS[monthIndex];
  return {
    key,
    label: `${String(dayNumber).padStart(2, "0")} ${monthName} ${year}`,
    orders: existingDay?.orders || [],
  };
}

function matchesHistoryOrderSearch(order = {}, query = "") {
  const q = normalizeText(query).trim();
  if (!q) return true;
  const componentText = (order.components || [])
    .map(
      (component) =>
        `${component.label || ""} ${component.name || ""} ${component.publisher || ""} ${component.barcode || ""} ${component.productCode || ""}`,
    )
    .join(" ");
  const haystack = normalizeText(
    [
      order.item,
      order.institution,
      order.id,
      order.status,
      order.aksonStatus,
      order.invoiceStatus,
      order.invoiceNo,
      order.note,
      componentText,
    ]
      .filter(Boolean)
      .join(" "),
  );
  return haystack.includes(q);
}

function parseOrderArchiveDate(order = {}) {
  const stamp = String(
    order.deliveredAt ||
      order.cancelledAt ||
      order.preparedAt ||
      order.approvedAt ||
      order.createdAt ||
      order.date ||
      "",
  );
  const monthIndex = HISTORY_MONTHS.findIndex((name) =>
    stamp.toLocaleLowerCase("tr-TR").includes(name.toLocaleLowerCase("tr-TR")),
  );
  const yearMatch = stamp.match(/20\d{2}/);
  const dayMatch = stamp.match(/\b([0-3]?\d)\b/);

  if (monthIndex >= 0 && yearMatch) {
    const year = yearMatch[0];
    const day = Math.max(1, Math.min(31, Number(dayMatch?.[1] || 1)));
    const monthName = HISTORY_MONTHS[monthIndex];
    return {
      year,
      monthKey: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
      monthName,
      monthIndex,
      dayKey: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      dayLabel: `${String(day).padStart(2, "0")} ${monthName} ${year}`,
    };
  }

  const fallback = new Date();
  const year = String(fallback.getFullYear());
  const monthIndexFallback = fallback.getMonth();
  const day = fallback.getDate();
  const monthName = HISTORY_MONTHS[monthIndexFallback];
  return {
    year,
    monthKey: `${year}-${String(monthIndexFallback + 1).padStart(2, "0")}`,
    monthName,
    monthIndex: monthIndexFallback,
    dayKey: `${year}-${String(monthIndexFallback + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    dayLabel: `${String(day).padStart(2, "0")} ${monthName} ${year}`,
  };
}

function getInvoiceStatusText(order = {}) {
  if (order.invoiceStatus === "invoice_error") return "Fatura hatası";
  if (order.invoiceStatus === "invoiced") return "Fatura edildi";
  if (order.invoiceStatus === "not_invoiced" || order.invoiceAkson === false)
    return "Fatura kesilmedi";
  return order.aksonStatus || "Bekliyor";
}

function summarizeOrderList(list = []) {
  return list.reduce(
    (acc, order) => {
      acc.count += 1;
      acc.total += Number(
        order.total || order.discountedTotal || order.listTotal || 0,
      );
      if (order.status === "Teslim edildi") acc.delivered += 1;
      if (order.status === "İptal edildi") acc.cancelled += 1;
      if (order.invoiceStatus === "invoiced") acc.invoiced += 1;
      if (order.invoiceStatus === "invoice_error") acc.invoiceError += 1;
      if (
        order.invoiceStatus === "not_invoiced" ||
        order.invoiceAkson === false
      )
        acc.notInvoiced += 1;
      return acc;
    },
    {
      count: 0,
      total: 0,
      delivered: 0,
      cancelled: 0,
      invoiced: 0,
      invoiceError: 0,
      notInvoiced: 0,
    },
  );
}

function isSameHistoryDay(order = {}, date = new Date()) {
  const parsed = parseOrderArchiveDate(order);
  const year = String(date.getFullYear());
  const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const dayKey = `${monthKey}-${String(date.getDate()).padStart(2, "0")}`;
  return parsed.dayKey === dayKey;
}

function shouldShowInTrackingToday(order = {}) {
  if (!["Teslim edildi", "İptal edildi"].includes(order.status)) return true;
  return isSameHistoryDay(order);
}

function buildHistoryArchive(list = []) {
  return list.reduce((archive, order) => {
    const parsed = parseOrderArchiveDate(order);
    archive[parsed.year] ||= { orders: [], months: {} };
    archive[parsed.year].orders.push(order);
    archive[parsed.year].months[parsed.monthKey] ||= {
      key: parsed.monthKey,
      label: parsed.monthName,
      monthIndex: parsed.monthIndex,
      orders: [],
      days: {},
    };
    archive[parsed.year].months[parsed.monthKey].orders.push(order);
    archive[parsed.year].months[parsed.monthKey].days[parsed.dayKey] ||= {
      key: parsed.dayKey,
      label: parsed.dayLabel,
      orders: [],
    };
    archive[parsed.year].months[parsed.monthKey].days[
      parsed.dayKey
    ].orders.push(order);
    return archive;
  }, {});
}

function inferClassFromExam(exam) {
  return (
    exam.level ||
    exam.tags?.[0] ||
    (exam.group === "Ortaokul" ? "8. Sınıf" : "TYT")
  );
}

function buildInitialPool(exams) {
  return exams.flatMap((exam) => {
    const base = {
      publisher: exam.brand || "Eşleştirilmedi",
      productCode: `NOX-${exam.id}`,
      productType: "Kurumsal Deneme",
      isbn: "",
      price: Number(exam.listPrice || 0),
      purchasePrice: 0,
      lastPurchaseUnitPrice: 0,
      lastPurchaseDiscount: 0,
      ignoreDiscount: false,
      active: true,
      source: "Manuel",
      examId: exam.id,
      classLevel: inferClassFromExam(exam),
      examType: exam.group === "Ortaokul" ? "LGS" : inferClassFromExam(exam),
      branch: "Genel",
      type: "Deneme",
      category: "Kurumsal Deneme",
      level: exam.group || "",
      kind: "Kitapçık",
    };

    return [
      {
        ...base,
        id: `pool-${exam.id}-A`,
        name: `${exam.title} A Kitapçığı`,
        barcode: exam.barcodeA || `BAR-${exam.id}-A`,
        booklet: "A",
      },
      {
        ...base,
        id: `pool-${exam.id}-B`,
        name: `${exam.title} B Kitapçığı`,
        barcode: exam.barcodeB || `BAR-${exam.id}-B`,
        booklet: "B",
      },
    ];
  });
}

function Pill({ children, tone = "slate", compact = false }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    dark: "bg-slate-950 text-white ring-slate-950",
  };
  return (
    <span
      title={typeof children === "string" ? children : undefined}
      className={`inline-flex max-w-full items-center rounded-full font-black ring-1 ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      } ${tones[tone]}`}
    >
      <span className="max-w-full truncate">{children}</span>
    </span>
  );
}

function AdminStatCard({ icon, title, value, subtitle }) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {subtitle}
          </p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700 ring-1 ring-blue-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Modal({ title, eyebrow, children, onClose, width = "max-w-3xl" }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div
        className={`max-h-[92vh] w-full ${width} overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
                {eyebrow}
              </p>
            )}
            <h3 className="mt-1 text-2xl font-black text-slate-950">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-950 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminPanel({
  customers,
  setCustomers,
  exams,
  setExams,
  orders,
  setOrders,
  brands,
  setBrands,
  announcements,
  setAnnouncements,
  demandShowcase = [],
  setDemandShowcase,
  warehouseData,
  setWarehouseData,
  staffUsers = [],
  setStaffUsers,
  currentStaffRole = "admin",
  currentStaffUser = null,
  adminSettings: externalAdminSettings,
  onAdminSettingsChange,
  months = MONTHS,
  seasonStartYear,
  setSeasonStartYear,
  currentMonthId,
  setCurrentMonthId,
  seasonLabel,
  previewCustomerId,
  setPreviewCustomerId,
  onPortalOpen,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState(
    currentStaffRole === "admin" ? "dashboard" : "warehouse",
  );
  const [orderSubTab, setOrderSubTab] = useState("requests");
  const [orderFilter, setOrderFilter] = useState("Tümü");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [approveModalOrder, setApproveModalOrder] = useState(null);
  const [approveWithAkson, setApproveWithAkson] = useState(true);
  const [systemNotice, setSystemNotice] = useState(null);
  const [manualOrderConfirmOpen, setManualOrderConfirmOpen] = useState(false);
  const [historyYear, setHistoryYear] = useState(
    String(Math.max(new Date().getFullYear(), HISTORY_START_YEAR)),
  );
  const [historyMonthKey, setHistoryMonthKey] = useState("");
  const [historyDayKey, setHistoryDayKey] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyInvoiceFilter, setHistoryInvoiceFilter] = useState("Tümü");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("Tümü");
  const [reportYear, setReportYear] = useState(
    String(new Date().getFullYear()),
  );
  const [reportMonthIndex, setReportMonthIndex] = useState(
    new Date().getMonth(),
  );
  const [reportDay, setReportDay] = useState(new Date().getDate());

  const [productPool, setProductPool] = useState(() => buildInitialPool(exams));
  const [poolSearch, setPoolSearch] = useState("");
  const [poolPublisherFilter, setPoolPublisherFilter] = useState("Tümü");
  const [poolClassFilter, setPoolClassFilter] = useState("Tümü");
  const [poolExamFilter, setPoolExamFilter] = useState("Tümü");
  const [poolTypeFilter, setPoolTypeFilter] = useState("Tümü");
  const [poolCategoryFilter, setPoolCategoryFilter] = useState("Tümü");
  const [poolSourceFilter, setPoolSourceFilter] = useState("Tümü");
  const [manualProductOpen, setManualProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [excelImportMessage, setExcelImportMessage] = useState("");
  const [manualRawProduct, setManualRawProduct] = useState({
    productType: "Kurumsal Deneme",
    isbn: "",
    publisher: "",
    productCode: "",
    name: "",
    barcode: "",
    price: 0,
    purchasePrice: 0,
    lastPurchaseUnitPrice: 0,
    lastPurchaseDiscount: 0,
    ignoreDiscount: false,
    classLevel: "TYT",
    examType: "TYT",
    branch: "Genel",
    type: "Deneme",
    category: "Kurumsal Deneme",
    level: "Lise",
    kind: "Kitapçık",
    source: "Manuel",
    active: true,
  });

  const [publisherDiscounts, setPublisherDiscounts] = useState(() => {
    const initial = {};
    brands.forEach((brand) => {
      initial[brand.name] = Number(
        brand.defaultDiscountRate ?? brand.discountRate ?? 0,
      );
    });
    return initial;
  });

  const [showcaseMonthId, setShowcaseMonthId] = useState(
    currentMonthId || months[0]?.id || "",
  );
  const [editingShowcase, setEditingShowcase] = useState(null);
  const [showcaseForm, setShowcaseForm] = useState({
    vitrinName: "",
    productType: "Deneme",
    group: "Lise",
    level: "TYT",
    monthId: currentMonthId || months[0]?.id || "",
    monthIds: currentMonthId
      ? [currentMonthId]
      : months[0]?.id
        ? [months[0].id]
        : [],
    productId: "",
    productAId: "",
    productBId: "",
    discountRate: 0,
    minQuantity: 1,
    maxQuantity: 999,
    orderDeadline: "",
    recommendedDate: "",
    customPrice: "",
    description: "",
    visibilityMode: "all",
    visibleCustomerIds: [],
    customerDiscounts: {},
    active: true,
    orderable: true,
  });
  const [productSelectSearch, setProductSelectSearch] = useState("");
  const [showcaseMode, setShowcaseMode] = useState("add");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [publisherSearch, setPublisherSearch] = useState("");
  const [showcaseCustomerDiscountsOpen, setShowcaseCustomerDiscountsOpen] =
    useState(false);
  const [showcaseSeasons, setShowcaseSeasons] = useState(() => {
    const start = Number(seasonStartYear || new Date().getFullYear());
    return [
      {
        id: `season-${start}`,
        startYear: start,
        label: seasonLabel || `${start}-${start + 1}`,
      },
    ];
  });
  const [selectedShowcaseSeasonId, setSelectedShowcaseSeasonId] = useState(
    () => {
      const start = Number(seasonStartYear || new Date().getFullYear());
      return `season-${start}`;
    },
  );

  const [newCustomer, setNewCustomer] = useState(blankCustomer);
  const [newCustomerPassword, setNewCustomerPassword] = useState("123456");
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerTab, setSelectedCustomerTab] = useState("overview");
  const [customerSectionTab, setCustomerSectionTab] = useState("create");
  const [customerConfirmCard, setCustomerConfirmCard] = useState(null);
  const [customerActionModal, setCustomerActionModal] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("Tümü");
  const [customerStatusFilter, setCustomerStatusFilter] = useState("Tümü");
  const blankAnnouncement = {
    title: "",
    text: "",
    type: "Genel duyuru",
    audience: "Tüm kurumlar",
    status: "Taslak",
    priority: "Normal",
    startDate: "",
    endDate: "",
    link: "",
    imageUrl: "",
    imageAlt: "",
    imageFit: "cover",
    imagePosition: "center",
    imageHeight: "medium",
    imageRadius: "soft",
    imageOverlay: "none",
    imageCropZoom: 100,
    imageCropX: 50,
    imageCropY: 50,
    displayMode: "card",
    audienceCustomerIds: [],
    audienceCustomerTypes: [],
    changeLog: [],
    pinned: false,
  };
  const [newAnnouncement, setNewAnnouncement] = useState(blankAnnouncement);
  const [announcementSectionTab, setAnnouncementSectionTab] =
    useState("create");
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [announcementStatusFilter, setAnnouncementStatusFilter] =
    useState("Tümü");
  const [announcementSort, setAnnouncementSort] = useState("Akıllı sıralama");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcementDetailTab, setAnnouncementDetailTab] = useState("preview");
  const [announcementConfirmModal, setAnnouncementConfirmModal] =
    useState(null);
  const [announcementImageModal, setAnnouncementImageModal] = useState(null);
  const [manualOrder, setManualOrder] = useState({
    group: "Lise",
    grade: "TYT",
    productASearch: "",
    productBSearch: "",
    productAId: "",
    productBId: "",
    examId: "",
    institutionId: customers[0]?.id || "",
    quantity: 1,
    discountRate: customers[0]?.discountRate ?? 0,
    note: "",
    deductStock: true,
    invoiceAkson: true,
  });
  const blankStaffUser = {
    name: "",
    username: "",
    email: "",
    phone: "",
    title: "Personel",
    role: "personnel",
    permissions: getDefaultStaffPermissions("personnel"),
    note: "",
    status: "Aktif",
    temporaryPassword: "123456",
  };
  const [newStaffUser, setNewStaffUser] = useState(blankStaffUser);
  const [staffSectionTab, setStaffSectionTab] = useState("create");
  const [staffSearch, setStaffSearch] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState("Tümü");
  const [staffStatusFilter, setStaffStatusFilter] = useState("Tümü");
  const [selectedStaffUser, setSelectedStaffUser] = useState(null);
  const [staffActionModal, setStaffActionModal] = useState(null);

  const defaultAdminSettings = {
    businessName: "İşler Kitabevi",
    branchName: "Atalar Şubesi",
    businessType: "Kitabevi",
    city: "Eskişehir",
    district: "Odunpazarı",
    phone: "",
    email: "",
    whatsapp: "",
    address: "",
    workingHours: "Hafta içi 09:00 - 18:00",
    supportMessage:
      "Sipariş ve ürün desteği için bağlı olduğunuz şube ile iletişime geçebilirsiniz.",
    showBusinessNameInCustomerNavbar: true,
    showContactToCustomers: true,

    orderTakingEnabled: true,
    orderClosedMessage:
      "Şu anda sipariş alımı kapalıdır. Lütfen daha sonra tekrar deneyin.",
    minOrderQuantity: 1,
    maxOrderQuantity: 999,
    customerCanCancelOrder: false,
    orderNoteRequired: false,
    acceptAfterHoursOrders: true,
    orderApprovalMode: "Manuel onay",

    customerCanViewProducts: true,
    customerCanViewPrices: true,
    customerCanViewOrderHistory: true,
    customerCanUseFavorites: true,
    customerCanEditProfile: true,
    customerCanChangePassword: true,
    showAnnouncementsInCustomerPanel: true,

    showOnlyActiveProducts: true,
    hideOutOfStockProducts: false,
    ignoreDiscountOnLockedProducts: true,
    showPublisherOnProducts: true,
    showBarcodeOnProducts: false,
    showListPriceOnProducts: true,
    showcaseSortMode: "Yayınevine göre",

    forceStaffPasswordChange: true,
    forceCustomerPasswordChange: true,
    inactiveCustomerCannotLogin: true,
    inactiveStaffCannotLogin: true,
    lockAfterFailedAttempts: true,
    failedAttemptLimit: 5,
    sessionDurationMinutes: 120,
    confirmSensitiveActions: true,

    notifyNewOrderToStaff: true,
    notifyCustomerOrderApproved: true,
    notifyCustomerOrderCancelled: true,
    notifyCustomersOnAnnouncement: true,
    sendPasswordResetEmail: true,
    maintenanceMessageEnabled: false,
    maintenanceMessage: "Sistem kısa süreli bakım modundadır.",

    aksonEnabled: false,
    aksonApiBaseUrl: "",
    aksonCompanyCode: "",
    aksonBranchCode: "",
    aksonUsername: "",
    aksonApiToken: "",
    aksonInvoiceScenario: "E-arşiv",
    autoSendInvoiceToAkson: true,
    useAksonForProductImport: true,
    aksonTestMode: true,
  };
  const [settingsSectionTab, setSettingsSectionTab] = useState("business");
  const [adminSettings, setAdminSettings] = useState(
    externalAdminSettings || defaultAdminSettings,
  );
  const [savedAdminSettings, setSavedAdminSettings] = useState(
    externalAdminSettings || defaultAdminSettings,
  );
  const [settingsConfirmModal, setSettingsConfirmModal] = useState(null);

  const isAdminRole = currentStaffRole === "admin";
  const poolPublishers = useMemo(
    () =>
      [...new Set(productPool.map((p) => p.publisher).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, "tr"),
      ),
    [productPool],
  );
  const poolClasses = useMemo(
    () =>
      [...new Set(productPool.map((p) => p.classLevel).filter(Boolean))].sort(
        (a, b) => String(a).localeCompare(String(b), "tr"),
      ),
    [productPool],
  );
  const poolExamTypes = useMemo(
    () =>
      [...new Set(productPool.map((p) => p.examType).filter(Boolean))].sort(
        (a, b) => String(a).localeCompare(String(b), "tr"),
      ),
    [productPool],
  );
  const poolTypes = useMemo(
    () =>
      [...new Set(productPool.map((p) => p.type).filter(Boolean))].sort(
        (a, b) => String(a).localeCompare(String(b), "tr"),
      ),
    [productPool],
  );
  const poolCategories = useMemo(
    () =>
      [...new Set(productPool.map((p) => p.category).filter(Boolean))].sort(
        (a, b) => String(a).localeCompare(String(b), "tr"),
      ),
    [productPool],
  );
  const publisherOptions = useMemo(
    () => poolPublishers.map((name) => ({ value: name, label: name })),
    [poolPublishers],
  );

  const settingsDirty = useMemo(
    () => JSON.stringify(adminSettings) !== JSON.stringify(savedAdminSettings),
    [adminSettings, savedAdminSettings],
  );
  const updateAdminSetting = (key, value) => {
    setAdminSettings((current) => ({ ...current, [key]: value }));
  };
  const saveAdminSettings = () => {
    setSavedAdminSettings(adminSettings);
    setSystemNotice({
      type: "success",
      title: "Ayarlar kaydedildi",
      text: "Bu admin hesabına ait operasyon ayarları geçici olarak güncellendi.",
    });
  };
  const requestSettingsTabChange = (nextTab) => {
    if (!settingsDirty) {
      setSettingsSectionTab(nextTab);
      return;
    }
    setSettingsConfirmModal({
      title: "Kaydedilmemiş değişiklikler var",
      text: "Sekme değiştirmeden önce yaptığın değişiklikleri kaydetmek ister misin?",
      confirmLabel: "Kaydet ve geç",
      secondaryLabel: "Kaydetmeden geç",
      onConfirm: () => {
        setSavedAdminSettings(adminSettings);
        onAdminSettingsChange?.(adminSettings);
        setSettingsSectionTab(nextTab);
        setSettingsConfirmModal(null);
        setSystemNotice({
          type: "success",
          title: "Ayarlar kaydedildi",
          text: "Değişiklikler kaydedildi ve sekme değiştirildi.",
        });
      },
      onSecondary: () => {
        setAdminSettings(savedAdminSettings);
        setSettingsSectionTab(nextTab);
        setSettingsConfirmModal(null);
      },
    });
  };
  const testAksonConnection = () => {
    if (
      !adminSettings.aksonApiBaseUrl ||
      !adminSettings.aksonUsername ||
      !adminSettings.aksonApiToken
    ) {
      setSystemNotice({
        type: "warning",
        title: "Eksik bağlantı bilgisi",
        text: "Akson bağlantı testi için API adresi, kullanıcı adı ve token alanlarını doldurmalısın.",
      });
      return;
    }
    setSystemNotice({
      type: "success",
      title: "Test simülasyonu başarılı",
      text: "Frontend deneme sisteminde Akson bağlantı bilgileri doğrulanabilir görünüyor.",
    });
  };

  const selectedShowcaseSeason = useMemo(
    () =>
      showcaseSeasons.find(
        (season) => season.id === selectedShowcaseSeasonId,
      ) || showcaseSeasons[0],
    [showcaseSeasons, selectedShowcaseSeasonId],
  );
  const showcaseSeasonMonths = useMemo(() => {
    const start = Number(
      selectedShowcaseSeason?.startYear ||
        seasonStartYear ||
        new Date().getFullYear(),
    );
    const monthNames = [
      { id: "agustos", label: "Ağustos", yearOffset: 0 },
      { id: "eylul", label: "Eylül", yearOffset: 0 },
      { id: "ekim", label: "Ekim", yearOffset: 0 },
      { id: "kasim", label: "Kasım", yearOffset: 0 },
      { id: "aralik", label: "Aralık", yearOffset: 0 },
      { id: "ocak", label: "Ocak", yearOffset: 1 },
      { id: "subat", label: "Şubat", yearOffset: 1 },
      { id: "mart", label: "Mart", yearOffset: 1 },
      { id: "nisan", label: "Nisan", yearOffset: 1 },
      { id: "mayis", label: "Mayıs", yearOffset: 1 },
      { id: "haziran", label: "Haziran", yearOffset: 1 },
      { id: "temmuz", label: "Temmuz", yearOffset: 1 },
    ];
    return monthNames.map((month) => ({
      id: `${month.id}-${start + month.yearOffset}`,
      label: month.label,
      year: String(start + month.yearOffset),
      seasonId: selectedShowcaseSeason?.id,
    }));
  }, [selectedShowcaseSeason, seasonStartYear]);
  const showcaseSeasonMonthOptions = useMemo(
    () =>
      showcaseSeasonMonths.map((m) => ({
        value: m.id,
        label: `${m.label} ${m.year}`,
      })),
    [showcaseSeasonMonths],
  );

  const filteredPool = useMemo(() => {
    const q = normalizeText(poolSearch).trim();
    const list = productPool.filter((p) => {
      const searchMatches =
        !q ||
        [
          p.name,
          p.publisher,
          p.barcode,
          p.isbn,
          p.productCode,
          p.productType,
          p.classLevel,
          p.examType,
          p.branch,
          p.type,
          p.category,
          p.level,
          p.kind,
          p.source,
          p.price,
        ].some((field) => normalizeText(field).includes(q));
      const publisherMatches =
        poolPublisherFilter === "Tümü" || p.publisher === poolPublisherFilter;
      const classMatches =
        poolClassFilter === "Tümü" || p.classLevel === poolClassFilter;
      const examMatches =
        poolExamFilter === "Tümü" || p.examType === poolExamFilter;
      const typeMatches =
        poolTypeFilter === "Tümü" || p.type === poolTypeFilter;
      const categoryMatches =
        poolCategoryFilter === "Tümü" || p.category === poolCategoryFilter;
      const sourceMatches =
        poolSourceFilter === "Tümü" || p.source === poolSourceFilter;
      return (
        searchMatches &&
        publisherMatches &&
        classMatches &&
        examMatches &&
        typeMatches &&
        categoryMatches &&
        sourceMatches
      );
    });
    return [...list].sort((a, b) => {
      const publisherSort = String(a.publisher || "").localeCompare(
        String(b.publisher || ""),
        "tr",
      );
      if (publisherSort !== 0) return publisherSort;
      return String(a.name || "").localeCompare(String(b.name || ""), "tr");
    });
  }, [
    poolSearch,
    poolPublisherFilter,
    poolClassFilter,
    poolExamFilter,
    poolTypeFilter,
    poolCategoryFilter,
    poolSourceFilter,
    productPool,
  ]);

  const productOptions = useMemo(() => {
    const q = normalizeText(productSelectSearch);
    return productPool
      .filter((p) => p.active !== false)
      .filter(
        (p) =>
          !q ||
          [p.name, p.publisher, p.barcode, p.productCode, p.classLevel].some(
            (field) => normalizeText(field).includes(q),
          ),
      )
      .slice(0, 80);
  }, [productPool, productSelectSearch]);

  const institutionTestRequests = useMemo(() => {
    const stamp = nowStamp();
    const customerPool = customers?.length
      ? customers
      : [
          {
            id: "demo-customer-1",
            name: "Atılım Eğitim Kurumu",
            discountRate: 10,
          },
          { id: "demo-customer-2", name: "Kuzey Akademi", discountRate: 15 },
          { id: "demo-customer-3", name: "Mavi Çizgi Kurs", discountRate: 20 },
        ];
    const activeProducts = productPool.filter(
      (product) => product.active !== false,
    );
    const baseProducts = activeProducts.length
      ? activeProducts
      : [
          {
            id: "demo-product-a",
            publisher: "ÖRNEK",
            productCode: "DEMO-A",
            name: "ÖRNEK TYT DENEME A KİTAPÇIĞI",
            barcode: "869000000001",
            price: 450,
            classLevel: "TYT",
          },
          {
            id: "demo-product-b",
            publisher: "ÖRNEK",
            productCode: "DEMO-B",
            name: "ÖRNEK TYT DENEME B KİTAPÇIĞI",
            barcode: "869000000002",
            price: 450,
            classLevel: "TYT",
          },
        ];
    const makeComponents = (mainProduct, quantity) => {
      const pairProduct =
        findSuggestedPairProduct(mainProduct) ||
        baseProducts.find(
          (item) => String(item.id) !== String(mainProduct?.id),
        ) ||
        null;
      const products = [mainProduct, pairProduct].filter(Boolean);
      return products.map((product, index) => {
        const requiredQty =
          products.length > 1
            ? index === 0
              ? Math.ceil(Number(quantity || 0) / 2)
              : Math.floor(Number(quantity || 0) / 2)
            : Number(quantity || 0);
        const unitPrice = Number(product?.price || 0);
        return {
          ...product,
          partLabel:
            getProductBookletLetter(product) ||
            (index === 0 ? "Seçilen ürün" : "Eş ürün"),
          requiredQty,
          unitPrice,
          lineTotal: Math.round(requiredQty * unitPrice),
          aksonProductCode: product?.productCode,
        };
      });
    };
    const scenarios = [
      {
        id: "REQ-INVOICE-SUCCESS",
        institution: customerPool[0]?.name || "Atılım Eğitim Kurumu",
        customerId: customerPool[0]?.id || "demo-customer-1",
        item: "Kurum talebi - fatura kesilecek",
        quantity: 10,
        defaultInvoiceAkson: true,
        invoiceScenarioLabel:
          "Fatura kes seçili gelmeli; onaylanınca yeşil takip satırı oluşur.",
      },
      {
        id: "REQ-INVOICE-NO",
        institution: customerPool[1]?.name || "Kuzey Akademi",
        customerId: customerPool[1]?.id || "demo-customer-2",
        item: "Kurum talebi - fatura kesilmeden onaylanacak",
        quantity: 18,
        defaultInvoiceAkson: false,
        invoiceScenarioLabel:
          "Fatura kes seçili gelmez; onaylanınca sarı takip satırı oluşur.",
      },
      {
        id: "REQ-INVOICE-ERROR",
        institution: customerPool[2]?.name || "Mavi Çizgi Kurs",
        customerId: customerPool[2]?.id || "demo-customer-3",
        item: "Kurum talebi - Akson hata testi",
        quantity: 31,
        defaultInvoiceAkson: true,
        forceAksonError: true,
        invoiceScenarioLabel:
          "Fatura kes seçili gelir; Akson hata simülasyonu kırmızı takip satırı oluşturur.",
      },
    ];

    return scenarios
      .filter((scenario) => !orders.some((order) => order.id === scenario.id))
      .map((scenario, index) => {
        const product =
          baseProducts[index % baseProducts.length] || baseProducts[0];
        const components = makeComponents(product, scenario.quantity);
        const listTotal = components.reduce(
          (sum, component) => sum + Number(component.lineTotal || 0),
          0,
        );
        const customer = customerPool[index] || customerPool[0] || {};
        const discountRate = Number(customer.discountRate || 0);
        const discountAmount = Math.round((listTotal * discountRate) / 100);
        return {
          ...scenario,
          examId: product?.examId || product?.id || scenario.id,
          status: "Onay bekliyor",
          source: "institution-test",
          price: scenario.quantity
            ? Math.round(listTotal / scenario.quantity)
            : listTotal,
          listTotal,
          discountRate,
          discountAmount,
          total: Math.max(0, listTotal - discountAmount),
          createdAt: `${stamp.dateText} ${stamp.timeText}`,
          approvedAt: "-",
          preparedAt: "-",
          deliveredAt: "-",
          invoiceStatus: "pending",
          aksonStatus: "Onay bekliyor",
          components,
          note: scenario.invoiceScenarioLabel,
          logs: [
            `${stamp.dateText} ${stamp.timeText} - Test kurum talebi oluşturuldu.`,
          ],
        };
      });
  }, [customers, orders, productPool]);

  const demoHistoryOrders = useMemo(() => {
    const customerPool = customers?.length
      ? customers
      : [
          {
            id: "history-customer-1",
            name: "Atılım Eğitim Kurumu",
            discountRate: 10,
          },
          { id: "history-customer-2", name: "Kuzey Akademi", discountRate: 15 },
          {
            id: "history-customer-3",
            name: "Mavi Çizgi Kurs",
            discountRate: 20,
          },
        ];
    const activeProducts = productPool.filter(
      (product) => product.active !== false,
    );
    const fallbackProducts = [
      {
        id: "history-product-a",
        publisher: "ÖRNEK",
        productCode: "HIST-A",
        name: "ÖRNEK TYT DENEME A KİTAPÇIĞI",
        barcode: "8690000000001",
        price: 450,
        classLevel: "TYT",
      },
      {
        id: "history-product-b",
        publisher: "ÖRNEK",
        productCode: "HIST-B",
        name: "ÖRNEK TYT DENEME B KİTAPÇIĞI",
        barcode: "8690000000002",
        price: 450,
        classLevel: "TYT",
      },
      {
        id: "history-book-1",
        publisher: "ÖRNEK",
        productCode: "HIST-KITAP",
        name: "ÖRNEK 8. SINIF SORU BANKASI",
        barcode: "8690000000003",
        price: 320,
        classLevel: "8. Sınıf",
      },
    ];
    const sourceProducts = activeProducts.length
      ? activeProducts
      : fallbackProducts;
    const buildComponents = (mainProduct, quantity) => {
      const pairProduct =
        findSuggestedPairProduct(mainProduct) ||
        sourceProducts.find(
          (item) => String(item.id) !== String(mainProduct?.id),
        ) ||
        null;
      const isExam = Boolean(
        getProductBookletLetter(mainProduct) ||
        getProductBookletLetter(pairProduct),
      );
      const products =
        isExam && pairProduct
          ? [mainProduct, pairProduct]
          : [mainProduct].filter(Boolean);
      return products.map((product, index) => {
        const requiredQty =
          products.length > 1
            ? index === 0
              ? Math.ceil(Number(quantity || 0) / 2)
              : Math.floor(Number(quantity || 0) / 2)
            : Number(quantity || 0);
        const unitPrice = Number(product?.price || 0);
        return {
          ...product,
          partLabel:
            getProductBookletLetter(product) ||
            (index === 0 ? "Seçilen ürün" : "Eş ürün"),
          requiredQty,
          unitPrice,
          lineTotal: Math.round(requiredQty * unitPrice),
          aksonProductCode: product?.productCode,
        };
      });
    };
    const samples = [
      {
        id: "HIST-2026-0001",
        productIndex: 0,
        customerIndex: 0,
        quantity: 24,
        status: "Teslim edildi",
        invoiceStatus: "invoiced",
        aksonStatus: "Fatura edildi",
        invoiceNo: "INV-2026-0312-001",
        date: "12 Mart 2026 10:35",
        note: "2026 Mart arşiv örneği - fatura başarılı.",
      },
      {
        id: "HIST-2026-0002",
        productIndex: 1,
        customerIndex: 1,
        quantity: 31,
        status: "İptal edildi",
        invoiceStatus: "invoice_error",
        aksonStatus: "Fatura hatası",
        invoiceNo: "-",
        date: "28 Nisan 2026 15:10",
        note: "2026 Nisan arşiv örneği - Akson bağlantı hatası.",
      },
      {
        id: "HIST-2027-0001",
        productIndex: 2,
        customerIndex: 2,
        quantity: 18,
        status: "Teslim edildi",
        invoiceStatus: "not_invoiced",
        aksonStatus: "Fatura kesilmedi",
        invoiceNo: "-",
        date: "05 Ocak 2027 09:20",
        note: "2027 Ocak arşiv örneği - faturasız onay.",
      },
      {
        id: "HIST-2027-0002",
        productIndex: 0,
        customerIndex: 0,
        quantity: 42,
        status: "Teslim edildi",
        invoiceStatus: "invoiced",
        aksonStatus: "Fatura edildi",
        invoiceNo: "INV-2027-0918-014",
        date: "18 Eylül 2027 14:45",
        note: "2027 Eylül arşiv örneği - teslim edildi.",
      },
      {
        id: "HIST-2028-0001",
        productIndex: 1,
        customerIndex: 1,
        quantity: 16,
        status: "Teslim edildi",
        invoiceStatus: "invoiced",
        aksonStatus: "Fatura edildi",
        invoiceNo: "INV-2028-0203-006",
        date: "03 Şubat 2028 11:05",
        note: "2028 Şubat arşiv örneği - ürün kodu ve barkod arama testi.",
      },
      {
        id: "HIST-2028-0002",
        productIndex: 2,
        customerIndex: 2,
        quantity: 9,
        status: "İptal edildi",
        invoiceStatus: "not_invoiced",
        aksonStatus: "Fatura kesilmedi",
        invoiceNo: "-",
        date: "22 Kasım 2028 16:30",
        note: "2028 Kasım arşiv örneği - iptal kayıt testi.",
      },
    ];
    return samples.map((sample) => {
      const product =
        sourceProducts[sample.productIndex % sourceProducts.length] ||
        sourceProducts[0] ||
        fallbackProducts[0];
      const customer =
        customerPool[sample.customerIndex % customerPool.length] ||
        customerPool[0] ||
        {};
      const components = buildComponents(product, sample.quantity);
      const listTotal = components.reduce(
        (sum, component) => sum + Number(component.lineTotal || 0),
        0,
      );
      const discountRate = Number(customer.discountRate || 0);
      const discountAmount = Math.round((listTotal * discountRate) / 100);
      const total = Math.max(0, listTotal - discountAmount);
      return {
        id: sample.id,
        examId: product?.examId || product?.id || sample.id,
        institution: customer.name || "Örnek Kurum",
        customerId: customer.id || "history-customer",
        item:
          product?.name?.replace(/\s+[AB]\s+K[İI]TAPÇIĞI$/i, "") ||
          product?.name ||
          "Geçmiş sipariş örneği",
        quantity: sample.quantity,
        price: sample.quantity
          ? Math.round(listTotal / sample.quantity)
          : listTotal,
        listTotal,
        discountRate,
        discountAmount,
        total,
        status: sample.status,
        invoiceStatus: sample.invoiceStatus,
        invoiceAkson: sample.invoiceStatus === "invoiced",
        aksonStatus: sample.aksonStatus,
        invoiceNo: sample.invoiceNo,
        createdAt: sample.date,
        approvedAt: sample.date,
        preparedAt: sample.status === "Teslim edildi" ? sample.date : "-",
        deliveredAt: sample.status === "Teslim edildi" ? sample.date : "-",
        cancelledAt: sample.status === "İptal edildi" ? sample.date : "-",
        components,
        note: sample.note,
        logs: [
          `${sample.date} - Sipariş arşiv kaydı oluşturuldu.`,
          `${sample.date} - ${sample.aksonStatus}.`,
          `${sample.date} - Durum: ${sample.status}.`,
        ],
        source: "history-demo",
      };
    });
  }, [customers, productPool]);

  const requestOrders = useMemo(() => {
    const activeRequests = orders.filter(
      (order) => order.status === "Onay bekliyor",
    );
    return [...institutionTestRequests, ...activeRequests];
  }, [institutionTestRequests, orders]);
  const trackingOrders = useMemo(() => {
    // Teslim edilen ve iptal edilen siparişler gün içinde takip panosunda görünür.
    // Gün değişince aktif takipten düşer; ancak geçmiş siparişler arşivinde kayıtlı kalır.
    const source = orders.filter(
      (order) =>
        order.status !== "Onay bekliyor" && shouldShowInTrackingToday(order),
    );
    return orderFilter === "Tümü"
      ? source
      : source.filter((order) => order.status === orderFilter);
  }, [orders, orderFilter]);
  const historyOrders = useMemo(() => {
    const completedOrders = orders.filter((order) =>
      ["Teslim edildi", "İptal edildi"].includes(order.status),
    );
    const existingIds = new Set(
      completedOrders.map((order) => String(order.id)),
    );
    return [
      ...demoHistoryOrders.filter(
        (order) => !existingIds.has(String(order.id)),
      ),
      ...completedOrders,
    ];
  }, [demoHistoryOrders, orders]);
  const filteredHistoryOrders = useMemo(() => {
    return historyOrders.filter((order) => {
      const invoiceMatches =
        historyInvoiceFilter === "Tümü" ||
        getInvoiceStatusText(order) === historyInvoiceFilter;
      const statusMatches =
        historyStatusFilter === "Tümü" || order.status === historyStatusFilter;
      return (
        invoiceMatches &&
        statusMatches &&
        matchesHistoryOrderSearch(order, historySearch)
      );
    });
  }, [historyOrders, historySearch, historyInvoiceFilter, historyStatusFilter]);
  const historyArchive = useMemo(
    () => buildHistoryArchive(filteredHistoryOrders),
    [filteredHistoryOrders],
  );
  const historyYearOptions = useMemo(
    () => buildHistoryYears(historyArchive),
    [historyArchive],
  );

  const getPoolProductGroup = (product = {}) => {
    const classText = String(product.classLevel || product.level || "");
    return classText.includes("Sınıf") || classText === "LGS"
      ? "Ortaokul"
      : "Lise";
  };
  const getProductById = (id) =>
    productPool.find((product) => String(product.id) === String(id));

  function getProductBookletLetter(product = {}) {
    const text = normalizeText(
      `${product.name || ""} ${product.productCode || ""} ${product.barcode || ""}`,
    );
    if (/\bsay(ı|i)?sal\s*a\b/.test(text) || /\bsay\s*a\b/.test(text))
      return "A";
    if (/\bs(o|ö)zel\s*a\b/.test(text) || /\bsöz\s*a\b/.test(text)) return "A";
    if (/\bsay(ı|i)?sal\s*b\b/.test(text) || /\bsay\s*b\b/.test(text))
      return "B";
    if (/\bs(o|ö)zel\s*b\b/.test(text) || /\bsöz\s*b\b/.test(text)) return "B";
    if (
      /(^|[\s\-_.])a($|[\s\-_.])/.test(text) ||
      text.includes(" a kitapçığı") ||
      text.includes("kitapçık a") ||
      text.endsWith("-a")
    )
      return "A";
    if (
      /(^|[\s\-_.])b($|[\s\-_.])/.test(text) ||
      text.includes(" b kitapçığı") ||
      text.includes("kitapçık b") ||
      text.endsWith("-b")
    )
      return "B";
    return "";
  }

  function findSuggestedPairProduct(selectedProduct) {
    if (!selectedProduct) return null;
    const sourceLetter = getProductBookletLetter(selectedProduct);
    if (!sourceLetter) return null;
    const targetLetter = sourceLetter === "A" ? "B" : "A";
    const sourceName = normalizeText(selectedProduct.name);
    const target = targetLetter.toLocaleLowerCase("tr-TR");
    const source = sourceLetter.toLocaleLowerCase("tr-TR");
    const swapped = sourceName
      .replace(new RegExp(` ${source} kitapçığı`, "g"), ` ${target} kitapçığı`)
      .replace(new RegExp(`kitapçık ${source}`, "g"), `kitapçık ${target}`)
      .replace(new RegExp(`\\b${source}\\b`, "g"), target);
    const samePublisher = (p) =>
      normalizeText(p.publisher || "") ===
      normalizeText(selectedProduct.publisher || "");
    const simplify = (value = "") =>
      normalizeText(value)
        .replace(/\bsay(ı|i)?sal\s*(a|b)\b/g, "sayısal")
        .replace(/\bsay\s*(a|b)\b/g, "sayısal")
        .replace(/\bs(o|ö)zel\s*(a|b)\b/g, "sözel")
        .replace(/\bsöz\s*(a|b)\b/g, "sözel")
        .replace(/\b(a|b)\s*kitapçığı\b/g, "")
        .replace(/\bkitapçık\s*(a|b)\b/g, "")
        .replace(/(^|[\s\-_.])(a|b)($|[\s\-_.])/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const simplifiedSource = simplify(selectedProduct.name);
    return (
      productPool.find(
        (p) =>
          p.id !== selectedProduct.id &&
          samePublisher(p) &&
          normalizeText(p.name) === swapped,
      ) ||
      productPool.find(
        (p) =>
          p.id !== selectedProduct.id &&
          samePublisher(p) &&
          getProductBookletLetter(p) === targetLetter &&
          simplify(p.name) === simplifiedSource,
      ) ||
      productPool.find(
        (p) =>
          p.id !== selectedProduct.id &&
          samePublisher(p) &&
          getProductBookletLetter(p) === targetLetter &&
          simplify(p.name).includes(simplifiedSource.slice(0, 18)),
      ) ||
      null
    );
  }

  const cleanManualOrderTitle = (name = "") =>
    String(name || "")
      .replace(
        /\bA\b|\bB\b|A Kitapçığı|B Kitapçığı|Kitapçık A|Kitapçık B/gi,
        "",
      )
      .replace(/\s+/g, " ")
      .trim();
  const selectedManualAProduct = getProductById(
    manualOrder.productAId || manualOrder.examId,
  );
  const selectedManualBProduct = getProductById(manualOrder.productBId);
  const selectedManualSuggestedBProduct = selectedManualAProduct
    ? findSuggestedPairProduct(selectedManualAProduct)
    : null;
  const selectedManualNeedsPair = Boolean(
    selectedManualAProduct &&
    (getProductBookletLetter(selectedManualAProduct) ||
      selectedManualSuggestedBProduct),
  );
  const selectedManualProduct = selectedManualAProduct;
  const selectedManualPairProduct =
    selectedManualBProduct || selectedManualSuggestedBProduct;
  const selectedManualComponents = [
    selectedManualAProduct,
    selectedManualBProduct || selectedManualSuggestedBProduct,
  ].filter(Boolean);
  const selectedManualStock = selectedManualComponents.length
    ? selectedManualComponents.reduce(
        (sum, item) => sum + Number(item.stock ?? item.quantity ?? 0),
        0,
      )
    : 0;
  const selectedManualCustomer = customers.find(
    (customer) => String(customer.id) === String(manualOrder.institutionId),
  );
  const manualOrderQuantity = Math.max(1, Number(manualOrder.quantity || 1));
  const getManualComponentQty = (
    index,
    totalComponents = selectedManualComponents.length,
  ) => {
    const total = manualOrderQuantity;
    if (!totalComponents || totalComponents <= 1) return total;
    if (totalComponents === 2)
      return index === 0 ? Math.ceil(total / 2) : Math.floor(total / 2);
    const base = Math.floor(total / totalComponents);
    const remainder = total % totalComponents;
    return base + (index < remainder ? 1 : 0);
  };
  const manualOrderPricedComponents = selectedManualComponents.map(
    (product, index) => {
      const componentQty = getManualComponentQty(
        index,
        selectedManualComponents.length,
      );
      const unitPrice = Number(product?.price || 0);
      return {
        ...product,
        componentQty,
        unitPrice,
        lineTotal: Math.round(unitPrice * componentQty),
      };
    },
  );
  const manualOrderListTotal = manualOrderPricedComponents.length
    ? manualOrderPricedComponents.reduce(
        (sum, item) => sum + Number(item.lineTotal || 0),
        0,
      )
    : Math.round(
        Number(selectedManualAProduct?.price || 0) * manualOrderQuantity,
      );
  const manualOrderDiscountRate =
    manualOrder.discountRate === "" ||
    manualOrder.discountRate === undefined ||
    manualOrder.discountRate === null
      ? Number(selectedManualCustomer?.discountRate || 0)
      : Number(manualOrder.discountRate || 0);
  const manualOrderDiscountAmount = Math.round(
    manualOrderListTotal * (manualOrderDiscountRate / 100),
  );
  const manualOrderDiscountedTotal = Math.max(
    0,
    manualOrderListTotal - manualOrderDiscountAmount,
  );
  const selectedManualExam = selectedManualAProduct
    ? {
        id: `manual-${selectedManualAProduct.id}-${selectedManualBProduct?.id || selectedManualSuggestedBProduct?.id || "single"}`,
        title:
          cleanManualOrderTitle(selectedManualAProduct.name) ||
          selectedManualAProduct.name,
        brand: selectedManualAProduct.publisher,
        group: getPoolProductGroup(selectedManualAProduct),
        level: selectedManualAProduct.classLevel,
        listPrice: manualOrderQuantity
          ? Math.round(manualOrderListTotal / manualOrderQuantity)
          : Number(selectedManualAProduct.price || 0),
        netPrice: manualOrderQuantity
          ? Math.round(manualOrderDiscountedTotal / manualOrderQuantity)
          : Number(selectedManualAProduct.price || 0),
        productId: selectedManualAProduct.id,
        productAId: selectedManualAProduct.id,
        productBId:
          selectedManualBProduct?.id ||
          selectedManualSuggestedBProduct?.id ||
          "",
        components: manualOrderPricedComponents,
        tags: [selectedManualAProduct.classLevel],
      }
    : null;
  const getManualProductResults = (query) => {
    const q = normalizeText(query);
    if (q.length < 1) return [];
    return productPool
      .filter((product) => product.active !== false)
      .filter((product) => getPoolProductGroup(product) === manualOrder.group)
      .filter((product) => {
        const classText = normalizeText(product.classLevel || "");
        const gradeText = normalizeText(manualOrder.grade || "");
        return (
          !gradeText ||
          classText === gradeText ||
          classText.includes(gradeText) ||
          normalizeText(product.name).includes(gradeText)
        );
      })
      .filter((product) =>
        [
          product.name,
          product.publisher,
          product.barcode,
          product.productCode,
          product.classLevel,
        ].some((field) => normalizeText(field).includes(q)),
      )
      .sort((a, b) =>
        `${a.publisher} ${a.name}`.localeCompare(
          `${b.publisher} ${b.name}`,
          "tr",
        ),
      )
      .slice(0, 10);
  };
  const getExamComponents = (exam = {}) => {
    if (exam.components?.length) return exam.components;

    const ids = [
      exam.productId,
      exam.productAId,
      exam.productBId,
      exam.componentAId,
      exam.componentBId,
    ].filter(Boolean);
    const linkedProducts = ids.map(getProductById).filter(Boolean);
    if (linkedProducts.length) return linkedProducts;

    const examTitle = normalizeText(exam.title || exam.name || "");
    const examBrand = normalizeText(exam.brand || exam.publisher || "");
    const examLevel = normalizeText(exam.level || exam.classLevel || "");

    const matchedProducts = productPool.filter((product) => {
      const productName = normalizeText(product.name || "");
      const productPublisher = normalizeText(
        product.publisher || product.brand || "",
      );
      const productClass = normalizeText(
        product.classLevel || product.level || "",
      );
      const sameExamId =
        String(product.examId || "") === String(exam.id || "missing");
      const sameBrand = examBrand && productPublisher.includes(examBrand);
      const sameLevel =
        !examLevel ||
        productClass.includes(examLevel) ||
        productName.includes(examLevel);
      const titleWords = examTitle
        .split(/\s+/)
        .filter((word) => word.length > 2);
      const nameMatchCount = titleWords.filter((word) =>
        productName.includes(word),
      ).length;
      return (
        sameExamId ||
        (sameBrand &&
          sameLevel &&
          nameMatchCount >= Math.min(2, titleWords.length))
      );
    });

    if (matchedProducts.length) {
      return matchedProducts
        .sort((a, b) =>
          String(a.booklet || a.name || "").localeCompare(
            String(b.booklet || b.name || ""),
            "tr",
          ),
        )
        .slice(0, exam.group === "Ortaokul" && exam.level === "LGS" ? 4 : 2);
    }

    const base = {
      publisher: exam.brand || exam.publisher || "-",
      productCode: exam.productCode || `NOX-${exam.id || "VITRIN"}`,
      price: Number(exam.listPrice || exam.price || 0),
      classLevel: inferClassFromExam(exam),
    };

    return [
      {
        ...base,
        id: `${exam.id || "exam"}-fallback-a`,
        name: `${exam.title || exam.name || "Vitrin ürünü"} A Kitapçığı`,
        barcode: exam.barcodeA || `BAR-${exam.id || "VITRIN"}-A`,
        booklet: "A",
      },
      {
        ...base,
        id: `${exam.id || "exam"}-fallback-b`,
        name: `${exam.title || exam.name || "Vitrin ürünü"} B Kitapçığı`,
        barcode: exam.barcodeB || `BAR-${exam.id || "VITRIN"}-B`,
        booklet: "B",
      },
    ];
  };
  const getComponentPartLabel = (component = {}, index = 0) => {
    const text = normalizeText(
      `${component.name || ""} ${component.productCode || ""} ${component.barcode || ""}`,
    );
    if (/\bsay(ı|i)?sal\s*a\b/.test(text) || /\bsay\s*a\b/.test(text))
      return "Sayısal A";
    if (/\bs(o|ö)zel\s*a\b/.test(text) || /\bsöz\s*a\b/.test(text))
      return "Sözel A";
    if (/\bsay(ı|i)?sal\s*b\b/.test(text) || /\bsay\s*b\b/.test(text))
      return "Sayısal B";
    if (/\bs(o|ö)zel\s*b\b/.test(text) || /\bsöz\s*b\b/.test(text))
      return "Sözel B";
    if (/(^|[\s\-_.])a($|[\s\-_.])/.test(text) || text.endsWith("-a"))
      return "A Kitapçığı";
    if (/(^|[\s\-_.])b($|[\s\-_.])/.test(text) || text.endsWith("-b"))
      return "B Kitapçığı";
    return index === 0
      ? "A Kitapçığı"
      : index === 1
        ? "B Kitapçığı"
        : `Bileşen ${index + 1}`;
  };

  const buildOrderComponents = (exam, quantity) => {
    const components = getExamComponents(exam);
    const totalQuantity = Math.max(0, Number(quantity || 0));
    const getRequiredQty = (index) => {
      if (!components.length || components.length <= 1) return totalQuantity;
      if (components.length === 2)
        return index === 0
          ? Math.ceil(totalQuantity / 2)
          : Math.floor(totalQuantity / 2);
      const base = Math.floor(totalQuantity / components.length);
      const remainder = totalQuantity % components.length;
      return base + (index < remainder ? 1 : 0);
    };

    return components.map((component, index) => {
      const requiredQty = Number(
        component.componentQty ??
          component.requiredQty ??
          getRequiredQty(index),
      );
      const unitPrice = Number(component.unitPrice ?? component.price ?? 0);
      return {
        ...component,
        partLabel:
          component.partLabel || getComponentPartLabel(component, index),
        requiredQty,
        unitPrice,
        lineTotal: Math.round(unitPrice * requiredQty),
        aksonProductCode: component.productCode,
      };
    });
  };
  const enrichOrderForDetail = (order) => {
    const exam = exams.find(
      (item) =>
        String(item.id) === String(order.examId) || item.title === order.item,
    );
    return {
      ...order,
      price: order.price ?? (exam?.listPrice || 0),
      createdAt: order.createdAt || order.date || "-",
      approvedAt:
        order.approvedAt ||
        (order.status !== "Onay bekliyor" ? order.date : "-"),
      preparedAt:
        order.preparedAt ||
        (order.status === "Hazır" || order.status === "Teslim edildi"
          ? order.date
          : "-"),
      deliveredAt:
        order.deliveredAt ||
        (order.status === "Teslim edildi" ? order.date : "-"),
      components: order.components?.length
        ? order.components
        : exam
          ? buildOrderComponents(exam, order.quantity)
          : [],
    };
  };

  const productPoolWarehouseData = useMemo(
    () => ({
      ...(warehouseData || {}),
      legacyExams: [],
      stockItems: productPool.map((p) => ({
        id: p.id,
        type: "Ürün Havuzu",
        name: p.name,
        brand: p.publisher,
        category: p.classLevel,
        barcode: p.barcode,
        quantity: Number(p.stock ?? p.quantity ?? 0),
        stock: Number(p.stock ?? p.quantity ?? 0),
        shelf: p.shelf || "Ürün Havuzu",
        active: p.active !== false,
        minStock: p.minStock || 20,
        status: p.active !== false ? "Aktif" : "Pasif",
      })),
    }),
    [warehouseData, productPool],
  );

  const customerSummaries = useMemo(() => {
    return customers.map((customer) => {
      const customerOrders = orders.filter(
        (order) =>
          String(order.customerId || "") === String(customer.id || "") ||
          normalizeText(order.institution || "") ===
            normalizeText(customer.name || ""),
      );
      const activeOrders = customerOrders.filter(
        (order) => order.status !== "İptal edildi",
      );
      const totalAmount = activeOrders.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0,
      );
      const pendingCount = customerOrders.filter(
        (order) => order.status === "Onay bekliyor",
      ).length;
      return {
        ...customer,
        type: customer.type || customer.customerType || "Dershane",
        authorizedPerson:
          customer.authorizedPerson || customer.contactPerson || "",
        district: customer.district || "",
        paymentTerm: customer.paymentTerm || "Peşin / sipariş onayı",
        orderLimit: customer.orderLimit ?? "",
        note: customer.note || "",
        orderCount: customerOrders.length,
        pendingCount,
        totalAmount,
        lastOrder: customerOrders[0] || null,
        orders: customerOrders,
      };
    });
  }, [customers, orders]);

  const filteredCustomers = useMemo(() => {
    const q = normalizeText(customerSearch).trim();
    return customerSummaries
      .filter((customer) => {
        const matchesSearch =
          !q ||
          [
            customer.name,
            customer.username,
            customer.email,
            customer.phone,
            customer.city,
            customer.district,
            customer.type,
            customer.authorizedPerson,
            customer.note,
          ].some((field) => normalizeText(field).includes(q));
        const matchesType =
          customerTypeFilter === "Tümü" || customer.type === customerTypeFilter;
        const matchesStatus =
          customerStatusFilter === "Tümü" ||
          (customer.status || "Aktif") === customerStatusFilter;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        const statusSort = String(a.status || "Aktif").localeCompare(
          String(b.status || "Aktif"),
          "tr",
        );
        if (statusSort !== 0) return statusSort;
        return String(a.name || "").localeCompare(String(b.name || ""), "tr");
      });
  }, [
    customerSearch,
    customerStatusFilter,
    customerSummaries,
    customerTypeFilter,
  ]);

  const selectedCustomerSummary = useMemo(() => {
    if (!selectedCustomer) return null;
    return (
      customerSummaries.find(
        (customer) => String(customer.id) === String(selectedCustomer.id),
      ) || selectedCustomer
    );
  }, [customerSummaries, selectedCustomer]);

  const resetCustomerForm = () => {
    setNewCustomer(blankCustomer);
    setNewCustomerPassword("123456");
    setEditingCustomerId(null);
    setCustomerConfirmCard(null);
    setCustomerActionModal(null);
  };

  const normalizeCustomerIdentity = (value = "") =>
    normalizeText(value).replace(/\s+/g, "").trim();

  const normalizeCustomerPhone = (value = "") =>
    String(value).replace(/\D/g, "");

  const createCustomerRecord = () => {
    const name = String(newCustomer.name || "").trim();
    if (!name) return;
    const payload = {
      ...newCustomer,
      name,
      username: String(newCustomer.username || "").trim(),
      email: String(newCustomer.email || "").trim(),
      phone: String(newCustomer.phone || "").trim(),
      city: String(newCustomer.city || "").trim(),
      district: String(newCustomer.district || "").trim(),
      address: String(newCustomer.address || "").trim(),
      deliveryAddress: String(
        newCustomer.deliveryAddress || newCustomer.address || "",
      ).trim(),
      billingAddress: String(
        newCustomer.billingAddress || newCustomer.address || "",
      ).trim(),
      invoiceTitle: String(
        newCustomer.invoiceTitle || newCustomer.name || "",
      ).trim(),
      taxNumber: String(newCustomer.taxNumber || "").trim(),
      taxOffice: String(newCustomer.taxOffice || "").trim(),
      contactPerson: String(newCustomer.contactPerson || "").trim(),
      contactPhone: String(newCustomer.contactPhone || "").trim(),
      contactEmail: String(newCustomer.contactEmail || "").trim(),
      type: newCustomer.type || "Dershane",
      status: newCustomer.status === "Pasif" ? "Pasif" : "Aktif",
      discountRate: Number(newCustomer.discountRate || 0),
      note: newCustomer.note || "",
      profileEditableByCustomer: true,
      profileLockedForAdmin: true,
    };

    const nextCustomer = {
      ...payload,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      password: undefined,
      temporaryPassword: undefined,
      initialPasswordDefined: true,
      passwordResetRequired: false,
    };

    setCustomers((current) => [nextCustomer, ...current]);
    setSelectedCustomer(nextCustomer);
    setSelectedCustomerTab("overview");
    setCustomerSectionTab("list");
    resetCustomerForm();
    setCustomerActionModal(null);
    setSystemNotice({
      type: "success",
      title: "Kurum oluşturuldu",
      text: `${name} kurumu oluşturuldu. Profil bilgileri artık kurum panelinden düzenlenir; admin tarafında yalnızca iskonto ve şifre sıfırlama yönetilir.`,
    });
  };

  const saveCustomer = () => {
    const requiredFields = [
      ["Kurum adı", newCustomer.name],
      ["E-posta", newCustomer.email],
      ["Telefon numarası", newCustomer.phone],
      ["Kullanıcı adı", newCustomer.username],
      ["Geçici şifre", newCustomerPassword],
      ["Şehir", newCustomer.city],
      ["İlçe", newCustomer.district],
      ["Kurum tipi", newCustomer.type],
    ];
    const missing = requiredFields
      .filter(([, value]) => !String(value || "").trim())
      .map(([label]) => label);
    if (missing.length) {
      setCustomerActionModal({
        type: "warning",
        title: "Eksik zorunlu bilgiler var",
        text: `Kurum oluşturmak için şu alanları doldurmalısın: ${missing.join(", ")}.`,
        confirmLabel: "Tamam",
      });
      return;
    }

    const email = String(newCustomer.email || "").trim();
    const username = String(newCustomer.username || "").trim();
    const phone = String(newCustomer.phone || "").trim();
    const normalizedEmail = normalizeCustomerIdentity(email);
    const normalizedUsername = normalizeCustomerIdentity(username);
    const normalizedPhone = normalizeCustomerPhone(phone);

    const validationErrors = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push("E-posta formatı geçerli değil");
    }
    if (String(newCustomerPassword || "").trim().length < 6) {
      validationErrors.push("Geçici şifre en az 6 karakter olmalı");
    }
    if (normalizedPhone.length < 10) {
      validationErrors.push("Telefon numarası eksik görünüyor");
    }

    const duplicateCustomer = customers.find((customer) => {
      const customerEmail = normalizeCustomerIdentity(customer.email || "");
      const customerUsername = normalizeCustomerIdentity(
        customer.username || "",
      );
      const customerPhone = normalizeCustomerPhone(customer.phone || "");
      return (
        (normalizedEmail && customerEmail === normalizedEmail) ||
        (normalizedUsername && customerUsername === normalizedUsername) ||
        (normalizedPhone && customerPhone === normalizedPhone)
      );
    });

    if (duplicateCustomer) {
      const duplicateFields = [];
      if (
        normalizeCustomerIdentity(duplicateCustomer.username || "") ===
        normalizedUsername
      ) {
        duplicateFields.push("kullanıcı adı");
      }
      if (
        normalizeCustomerIdentity(duplicateCustomer.email || "") ===
        normalizedEmail
      ) {
        duplicateFields.push("e-posta");
      }
      if (
        normalizeCustomerPhone(duplicateCustomer.phone || "") ===
        normalizedPhone
      ) {
        duplicateFields.push("telefon");
      }
      validationErrors.push(
        `Bu ${duplicateFields.join(", ")} zaten ${duplicateCustomer.name || "başka bir kurum"} için kullanılıyor`,
      );
    }

    if (validationErrors.length) {
      setCustomerActionModal({
        type: "warning",
        title: "Kurum hesabı oluşturulamadı",
        text: validationErrors.join(". ") + ".",
        confirmLabel: "Tamam",
      });
      return;
    }

    const name = String(newCustomer.name || "").trim();
    setCustomerActionModal({
      type: "confirm",
      title: "Kurum hesabı oluşturulsun mu?",
      text: `${name} için yeni kurum hesabı oluşturulacak. İlk şifre sadece oluşturma sırasında kullanılır; işlemden sonra admin dahil kimse şifreyi görüntüleyemez.`,
      confirmLabel: "Evet, oluştur",
      cancelLabel: "Vazgeç",
      onConfirm: createCustomerRecord,
    });
  };

  const startEditCustomer = (customer) => {
    setEditingCustomerId(customer.id);
    setNewCustomer({
      ...blankCustomer,
      ...customer,
      type: customer.type || customer.customerType || "Dershane",
      contactPerson: customer.contactPerson || customer.authorizedPerson || "",
      contactPhone: customer.contactPhone || "",
      contactEmail: customer.contactEmail || "",
      deliveryAddress: customer.deliveryAddress || customer.address || "",
      billingAddress: customer.billingAddress || customer.address || "",
      invoiceTitle: customer.invoiceTitle || customer.name || "",
      taxNumber: customer.taxNumber || "",
      taxOffice: customer.taxOffice || "",
      district: customer.district || "",
      paymentTerm: customer.paymentTerm || "Peşin / sipariş onayı",
      orderLimit: customer.orderLimit ?? "",
      note: customer.note || "",
      status: customer.status || "Aktif",
    });
    setCustomerSectionTab("create");
  };

  const applyCustomerStatus = (customer, nextStatus) => {
    setCustomers((current) =>
      current.map((item) =>
        String(item.id) === String(customer.id)
          ? { ...item, status: nextStatus }
          : item,
      ),
    );
    setSelectedCustomer((current) =>
      current && String(current.id) === String(customer.id)
        ? { ...current, status: nextStatus }
        : current,
    );
    setCustomerConfirmCard(null);
    setCustomerActionModal(null);
    setSystemNotice({
      type: "success",
      title: "Kurum durumu güncellendi",
      text: `${customer.name} artık ${nextStatus}.`,
    });
  };

  const toggleCustomerStatus = (customer) => {
    const nextStatus = customer.status === "Pasif" ? "Aktif" : "Pasif";
    setCustomerActionModal({
      type: nextStatus === "Pasif" ? "danger" : "confirm",
      title: `Kurumu ${nextStatus.toLocaleLowerCase("tr-TR")} yapmak istediğine emin misin?`,
      text: `${customer.name} kurumunun hesap durumu ${nextStatus} olarak değiştirilecek. Geçmiş kayıtlar silinmez.`,
      confirmLabel: `Evet, ${nextStatus.toLocaleLowerCase("tr-TR")} yap`,
      cancelLabel: "Vazgeç",
      onConfirm: () => applyCustomerStatus(customer, nextStatus),
    });
  };

  const updateCustomerDiscount = (customer, value) => {
    const nextRate = Math.max(0, Number(value || 0));
    setCustomers((current) =>
      current.map((item) =>
        String(item.id) === String(customer.id)
          ? { ...item, discountRate: nextRate }
          : item,
      ),
    );
    setSelectedCustomer((current) =>
      current && String(current.id) === String(customer.id)
        ? { ...current, discountRate: nextRate }
        : current,
    );
  };

  const applyCustomerPasswordReset = (customer) => {
    const stamp = nowStamp();
    setCustomers((current) =>
      current.map((item) =>
        String(item.id) === String(customer.id)
          ? {
              ...item,
              passwordResetRequestedAt: `${stamp.dateText} ${stamp.timeText}`,
              passwordResetRequired: true,
            }
          : item,
      ),
    );
    setSelectedCustomer((current) =>
      current && String(current.id) === String(customer.id)
        ? {
            ...current,
            passwordResetRequestedAt: `${stamp.dateText} ${stamp.timeText}`,
            passwordResetRequired: true,
          }
        : current,
    );
    setCustomerConfirmCard(null);
    setCustomerActionModal(null);
    setSystemNotice({
      type: "success",
      title: "Şifre sıfırlama başlatıldı",
      text: `${customer.name} için sıfırlama işlemi başlatıldı. Admin dahil hiçbir kullanıcı mevcut şifreyi göremez.`,
    });
  };

  const resetCustomerPassword = (customer) => {
    setCustomerActionModal({
      type: "danger",
      title: "Şifre sıfırlama akışı başlatılsın mı?",
      text: `${customer.name} için mevcut şifre okunmadan sıfırlama akışı başlatılacak. Kayıtlı e-posta adresine sıfırlama yönlendirmesi gönderilmiş gibi işaretlenecek ve kurum bir sonraki girişte yeni şifre belirleyecek.`,
      confirmLabel: "Evet, sıfırlama başlat",
      cancelLabel: "Vazgeç",
      onConfirm: () => applyCustomerPasswordReset(customer),
    });
  };

  const normalizeStaffIdentity = (value = "") =>
    normalizeText(value).replace(/\s+/g, "").trim();

  const normalizeStaffPhone = (value = "") => String(value).replace(/\D/g, "");

  const staffSummaries = useMemo(() => {
    return staffUsers
      .filter((user) => (user.role || "personnel") !== "admin")
      .map((user) => {
        const role = user.role === "distributor" ? "distributor" : "personnel";
        const permissions = mergeStaffPermissions(role, user.permissions || {});
        return {
          ...user,
          role,
          permissions,
          permissionCount: Object.values(permissions).filter(Boolean).length,
          roleLabel: getStaffRoleLabel(role),
          status: user.status || (user.active === false ? "Pasif" : "Aktif"),
          title: user.title || getStaffRoleLabel(role),
          note: user.note || "",
        };
      });
  }, [staffUsers]);

  const filteredStaffUsers = useMemo(() => {
    const q = normalizeText(staffSearch).trim();
    return staffSummaries
      .filter((user) => {
        const matchesSearch =
          !q ||
          [
            user.name,
            user.username,
            user.email,
            user.phone,
            user.roleLabel,
          ].some((field) => normalizeText(field).includes(q));
        const matchesRole =
          staffRoleFilter === "Tümü" || user.role === staffRoleFilter;
        const matchesStatus =
          staffStatusFilter === "Tümü" ||
          (user.status || "Aktif") === staffStatusFilter;
        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), "tr"),
      );
  }, [staffRoleFilter, staffSearch, staffStatusFilter, staffSummaries]);

  const resetStaffForm = () => {
    setNewStaffUser({
      ...blankStaffUser,
      permissions: getDefaultStaffPermissions("personnel"),
    });
    setStaffActionModal(null);
  };

  const updateNewStaffRole = (role) => {
    const safeRole = role === "distributor" ? "distributor" : "personnel";
    setNewStaffUser((current) => ({
      ...current,
      role: safeRole,
      title: getStaffRoleLabel(safeRole),
      permissions: getDefaultStaffPermissions(safeRole),
    }));
  };

  const toggleNewStaffPermission = (permissionKey) => {
    setNewStaffUser((current) => ({
      ...current,
      permissions: {
        ...mergeStaffPermissions(current.role, current.permissions),
        [permissionKey]: !mergeStaffPermissions(
          current.role,
          current.permissions,
        )[permissionKey],
      },
    }));
  };

  const updateStaffPermission = (user, permissionKey) => {
    const currentPermissions = mergeStaffPermissions(
      user.role,
      user.permissions,
    );
    const nextPermissions = {
      ...currentPermissions,
      [permissionKey]: !currentPermissions[permissionKey],
    };
    setStaffUsers?.((current) =>
      current.map((item) =>
        String(item.id) === String(user.id)
          ? { ...item, permissions: nextPermissions }
          : item,
      ),
    );
    setSelectedStaffUser((current) =>
      current && String(current.id) === String(user.id)
        ? { ...current, permissions: nextPermissions }
        : current,
    );
  };

  const applyCreateStaffUser = () => {
    const payload = {
      ...newStaffUser,
      name: String(newStaffUser.name || "").trim(),
      username: String(newStaffUser.username || "").trim(),
      email: String(newStaffUser.email || "").trim(),
      phone: String(newStaffUser.phone || "").trim(),
      role: newStaffUser.role === "distributor" ? "distributor" : "personnel",
      title: getStaffRoleLabel(
        newStaffUser.role === "distributor" ? "distributor" : "personnel",
      ),
      permissions: mergeStaffPermissions(
        newStaffUser.role === "distributor" ? "distributor" : "personnel",
        newStaffUser.permissions || {},
      ),
      status: newStaffUser.status === "Pasif" ? "Pasif" : "Aktif",
      active: newStaffUser.status !== "Pasif",
      note: String(newStaffUser.note || "").trim(),
      passwordResetRequired: false,
      passwordResetRequestedAt: "",
      temporaryPassword: undefined,
      password: undefined,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    setStaffUsers?.((current) => [payload, ...current]);
    setSelectedStaffUser(payload);
    setStaffSectionTab("list");
    resetStaffForm();
    setSystemNotice({
      type: "success",
      title: "Kullanıcı oluşturuldu",
      text: `${payload.name} kullanıcısı ${payload.title} rolüyle oluşturuldu. Şifre işlemden sonra görüntülenmez.`,
    });
  };

  const saveStaffUser = () => {
    const requiredFields = [
      ["Ad soyad", newStaffUser.name],
      ["Kullanıcı adı", newStaffUser.username],
      ["E-posta", newStaffUser.email],
      ["Telefon", newStaffUser.phone],
      ["Geçici şifre", newStaffUser.temporaryPassword],
      ["Rol", newStaffUser.role],
    ];
    const missing = requiredFields
      .filter(([, value]) => !String(value || "").trim())
      .map(([label]) => label);
    if (missing.length) {
      setStaffActionModal({
        type: "warning",
        title: "Eksik zorunlu bilgiler var",
        text: `Kullanıcı oluşturmak için şu alanları doldurmalısın: ${missing.join(", ")}.`,
        confirmLabel: "Tamam",
      });
      return;
    }

    const email = String(newStaffUser.email || "").trim();
    const username = String(newStaffUser.username || "").trim();
    const phone = String(newStaffUser.phone || "").trim();
    const normalizedEmail = normalizeStaffIdentity(email);
    const normalizedUsername = normalizeStaffIdentity(username);
    const normalizedPhone = normalizeStaffPhone(phone);
    const validationErrors = [];

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push("E-posta formatı geçerli değil");
    }
    if (String(newStaffUser.temporaryPassword || "").trim().length < 6) {
      validationErrors.push("Geçici şifre en az 6 karakter olmalı");
    }
    if (normalizedPhone.length < 10) {
      validationErrors.push("Telefon numarası eksik görünüyor");
    }

    const duplicateUser = staffUsers.find((user) => {
      const userEmail = normalizeStaffIdentity(user.email || "");
      const userUsername = normalizeStaffIdentity(user.username || "");
      const userPhone = normalizeStaffPhone(user.phone || "");
      return (
        (normalizedEmail && userEmail === normalizedEmail) ||
        (normalizedUsername && userUsername === normalizedUsername) ||
        (normalizedPhone && userPhone === normalizedPhone)
      );
    });

    if (duplicateUser) {
      const duplicateFields = [];
      if (
        normalizeStaffIdentity(duplicateUser.username || "") ===
        normalizedUsername
      ) {
        duplicateFields.push("kullanıcı adı");
      }
      if (
        normalizeStaffIdentity(duplicateUser.email || "") === normalizedEmail
      ) {
        duplicateFields.push("e-posta");
      }
      if (normalizeStaffPhone(duplicateUser.phone || "") === normalizedPhone) {
        duplicateFields.push("telefon");
      }
      validationErrors.push(
        `Bu ${duplicateFields.join(", ")} zaten ${duplicateUser.name || "başka bir kullanıcı"} için kullanılıyor`,
      );
    }

    if (validationErrors.length) {
      setStaffActionModal({
        type: "warning",
        title: "Kullanıcı oluşturulamadı",
        text: validationErrors.join(". ") + ".",
        confirmLabel: "Tamam",
      });
      return;
    }

    setStaffActionModal({
      type: "confirm",
      title: "Kullanıcı hesabı oluşturulsun mu?",
      text: `${newStaffUser.name} için ${getStaffRoleLabel(newStaffUser.role)} rolünde yeni sistem kullanıcısı oluşturulacak. Geçici şifre işlemden sonra admin dahil kimse tarafından görüntülenemez.`,
      confirmLabel: "Evet, oluştur",
      cancelLabel: "Vazgeç",
      onConfirm: applyCreateStaffUser,
    });
  };

  const applyStaffStatus = (user, nextStatus) => {
    setStaffUsers?.((current) =>
      current.map((item) =>
        String(item.id) === String(user.id)
          ? { ...item, status: nextStatus, active: nextStatus !== "Pasif" }
          : item,
      ),
    );
    setSelectedStaffUser((current) =>
      current && String(current.id) === String(user.id)
        ? { ...current, status: nextStatus, active: nextStatus !== "Pasif" }
        : current,
    );
    setStaffActionModal(null);
    setSystemNotice({
      type: "success",
      title: "Kullanıcı durumu güncellendi",
      text: `${user.name} artık ${nextStatus}.`,
    });
  };

  const toggleStaffStatus = (user) => {
    const currentStatus =
      user.status || (user.active === false ? "Pasif" : "Aktif");
    const nextStatus = currentStatus === "Pasif" ? "Aktif" : "Pasif";
    setStaffActionModal({
      type: nextStatus === "Pasif" ? "danger" : "confirm",
      title: `Kullanıcıyı ${nextStatus.toLocaleLowerCase("tr-TR")} yapmak istediğine emin misin?`,
      text: `${user.name} kullanıcısının panel erişimi ${nextStatus} olarak değiştirilecek. Geçmiş kayıtlar silinmez.`,
      confirmLabel: `Evet, ${nextStatus.toLocaleLowerCase("tr-TR")} yap`,
      cancelLabel: "Vazgeç",
      onConfirm: () => applyStaffStatus(user, nextStatus),
    });
  };

  const applyStaffPasswordReset = (user) => {
    const stamp = nowStamp();
    setStaffUsers?.((current) =>
      current.map((item) =>
        String(item.id) === String(user.id)
          ? {
              ...item,
              passwordResetRequestedAt: `${stamp.dateText} ${stamp.timeText}`,
              passwordResetRequired: true,
            }
          : item,
      ),
    );
    setSelectedStaffUser((current) =>
      current && String(current.id) === String(user.id)
        ? {
            ...current,
            passwordResetRequestedAt: `${stamp.dateText} ${stamp.timeText}`,
            passwordResetRequired: true,
          }
        : current,
    );
    setStaffActionModal(null);
    setSystemNotice({
      type: "success",
      title: "Şifre sıfırlama başlatıldı",
      text: `${user.name} için sıfırlama akışı başlatıldı. Mevcut şifre görüntülenmedi ve saklanmadı.`,
    });
  };

  const resetStaffPassword = (user) => {
    setStaffActionModal({
      type: "danger",
      title: "Şifre sıfırlama akışı başlatılsın mı?",
      text: `${user.name} için mevcut şifre okunmadan sıfırlama akışı başlatılacak. Kullanıcı bir sonraki girişte yeni şifre belirlemek zorunda kalacak.`,
      confirmLabel: "Evet, sıfırlama başlat",
      cancelLabel: "Vazgeç",
      onConfirm: () => applyStaffPasswordReset(user),
    });
  };

  const getStaffActivityLog = (user = {}) => {
    const createdDate = user.createdAt
      ? formatDate(user.createdAt)
      : "Sistem kaydı";
    const enabledCount = Object.values(
      mergeStaffPermissions(user.role, user.permissions),
    ).filter(Boolean).length;
    const status = user.status || (user.active === false ? "Pasif" : "Aktif");
    return [
      {
        title: "Hesap oluşturuldu",
        text: `${getStaffRoleLabel(user.role)} rolüyle kullanıcı kaydı açıldı.`,
        time: createdDate,
      },
      {
        title: "Yetki matrisi güncel",
        text: `${staffPermissionModules.length} yetkiden ${enabledCount} tanesi açık durumda.`,
        time: "Anlık durum",
      },
      {
        title: `Hesap durumu: ${status}`,
        text:
          status === "Pasif"
            ? "Kullanıcı panele giriş yapamaz."
            : "Kullanıcı yetkileri kapsamında panele erişebilir.",
        time: "Anlık durum",
      },
      ...(user.passwordResetRequestedAt
        ? [
            {
              title: "Şifre sıfırlama başlatıldı",
              text: "Mevcut şifre görüntülenmeden sıfırlama akışı işaretlendi.",
              time: user.passwordResetRequestedAt,
            },
          ]
        : []),
    ];
  };

  const applyDeleteStaffUser = (user) => {
    setStaffUsers?.((current) =>
      current.filter((item) => String(item.id) !== String(user.id)),
    );
    setSelectedStaffUser(null);
    setStaffActionModal(null);
    setSystemNotice({
      type: "success",
      title: "Kullanıcı silindi",
      text: `${user.name} kullanıcısı sistem kullanıcı listesinden kaldırıldı.`,
    });
  };

  const deleteStaffUser = (user) => {
    setStaffActionModal({
      type: "danger",
      title: "Kullanıcı silinsin mi?",
      text: `${user.name} kullanıcısını silmek üzeresin. Bu işlem kullanıcı hesabını listeden kaldırır; geçmiş sipariş kayıtları silinmez.`,
      confirmLabel: "Evet, kullanıcıyı sil",
      cancelLabel: "Vazgeç",
      onConfirm: () => applyDeleteStaffUser(user),
    });
  };

  const totalRevenue = orders
    .filter((order) => order.status !== "İptal edildi")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pendingOrders = orders.filter(
    (order) => order.status === "Onay bekliyor",
  ).length;
  const activeCustomerCount = customers.filter(
    (customer) => customer.status === "Aktif",
  ).length;
  const activeExamCount = exams.filter((exam) => exam.active).length;

  const sidebarGroups = [
    {
      title: "Ana Sayfa",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard size={17} />,
        },
      ],
    },
    {
      title: "Sipariş Yönetimi",
      items: [
        {
          id: "orders",
          label: "Siparişler",
          icon: <ClipboardCheck size={17} />,
        },
      ],
    },
    {
      title: "Ürün Yönetimi",
      items: [
        { id: "product-pool", label: "Ürün Havuzu", icon: <Boxes size={17} /> },
        { id: "exams", label: "Vitrin / Takvim", icon: <BookOpen size={17} /> },
        {
          id: "publishers",
          label: "Yayınevi & İskonto",
          icon: <Tags size={17} />,
        },
      ],
    },
    {
      title: "Depo Yönetimi",
      items: [
        { id: "warehouse", label: "Depo", icon: <Package size={17} /> },
        {
          id: "day-report",
          label: "Operasyon Raporu",
          icon: <CalendarDays size={17} />,
        },
      ],
    },
    {
      title: "Kurum Yönetimi",
      items: [
        { id: "customers", label: "Kurumlar", icon: <Users size={17} /> },
        { id: "users", label: "Kullanıcılar", icon: <Users size={17} /> },
      ],
    },
    {
      title: "İçerik",
      items: [
        {
          id: "announcements",
          label: "Duyurular",
          icon: <Megaphone size={17} />,
        },
      ],
    },
    {
      title: "Sistem",
      items: [
        { id: "settings", label: "Ayarlar", icon: <Settings size={17} /> },
      ],
    },
  ];
  const visibleSidebarGroups = isAdminRole
    ? sidebarGroups
    : [
        {
          title: "Depo Yönetimi",
          items: sidebarGroups
            .flatMap((group) => group.items)
            .filter((tab) => tab.id === "warehouse"),
        },
      ];

  const setOrderWithStamp = (order, status, extra = {}) => {
    const stamp = nowStamp();
    const dateFields = {
      approvedAt:
        status === "Onaylandı"
          ? `${stamp.dateText} ${stamp.timeText}`
          : order.approvedAt,
      preparedAt:
        status === "Hazır"
          ? `${stamp.dateText} ${stamp.timeText}`
          : order.preparedAt,
      deliveredAt:
        status === "Teslim edildi"
          ? `${stamp.dateText} ${stamp.timeText}`
          : order.deliveredAt,
    };
    const extraLogs = Array.isArray(extra.logs) ? extra.logs : [];
    return {
      ...order,
      ...extra,
      ...dateFields,
      status,
      logs: [
        ...(order.logs || []),
        `${stamp.dateText} ${stamp.timeText} - Sipariş '${status}' durumuna alındı.`,
        ...extraLogs,
      ],
    };
  };
  const updateOrderStatus = (id, item, status, extra = {}) =>
    setOrders((current) =>
      current.map((order) =>
        order.id === id && order.item === item
          ? setOrderWithStamp(order, status, extra)
          : order,
      ),
    );
  const confirmCancelOrder = () => {
    if (!cancelModalOrder) return;
    updateOrderStatus(
      cancelModalOrder.id,
      cancelModalOrder.item,
      "İptal edildi",
      { cancelReason },
    );
    setCancelModalOrder(null);
    setCancelReason("");
  };
  const createAksonInvoiceResult = (shouldInvoice, order = {}) => {
    const stamp = nowStamp();
    if (!shouldInvoice) {
      return {
        invoiceAkson: false,
        invoiceStatus: "not_invoiced",
        invoiceTone: "warning",
        aksonStatus: "Fatura kesilmedi",
        invoiceMessage: "Fatura kes seçeneği kullanılmadan onaylandı.",
        invoicedAt: "-",
        invoiceNumber: "-",
        logs: [
          `${stamp.dateText} ${stamp.timeText} - Fatura kesilmeden onaylandı.`,
        ],
      };
    }

    const hasConnectionError = Boolean(
      order.forceAksonError ||
      order.aksonConnectionError ||
      order.invoiceShouldFail,
    );
    if (hasConnectionError) {
      return {
        invoiceAkson: true,
        invoiceStatus: "invoice_error",
        invoiceTone: "error",
        aksonStatus: "Fatura hatası",
        invoiceMessage:
          "Akson bağlantısı kurulamadı veya fatura kesme sırasında hata oluştu.",
        invoicedAt: "-",
        invoiceNumber: "-",
        logs: [
          `${stamp.dateText} ${stamp.timeText} - Fatura hatası: Akson bağlantısı kurulamadı.`,
        ],
      };
    }

    return {
      invoiceAkson: true,
      invoiceStatus: "invoiced",
      invoiceTone: "success",
      aksonStatus: "Fatura edildi",
      invoiceMessage: "Fatura kesimi başarıyla tamamlandı.",
      invoicedAt: `${stamp.dateText} ${stamp.timeText}`,
      invoiceNumber: `AKS-${String(Date.now()).slice(-6)}`,
      logs: [
        `${stamp.dateText} ${stamp.timeText} - Fatura kesimi başarıyla tamamlandı.`,
      ],
    };
  };

  const notifyInvoiceResult = (invoiceResult, orderTitle) => {
    if (!invoiceResult) return;
    if (invoiceResult.invoiceStatus === "invoice_error") {
      setSystemNotice({
        type: "error",
        title: "Fatura kesilemedi",
        text: `${orderTitle} için Akson bağlantısı kurulamadı veya fatura kesimi sırasında hata oluştu. Sipariş takip ekranında kırmızı işaretlendi.`,
      });
      return;
    }
    if (invoiceResult.invoiceStatus === "not_invoiced") {
      setSystemNotice({
        type: "warning",
        title: "Fatura kesilmedi",
        text: `${orderTitle} fatura kesilmeden onaylandı. Sipariş takip ekranında sarı işaretlendi.`,
      });
      return;
    }
    if (invoiceResult.invoiceStatus === "invoiced") {
      setSystemNotice({
        type: "success",
        title: "Fatura kesildi",
        text: `${orderTitle} için fatura kesimi başarıyla tamamlandı. Sipariş takip ekranında yeşil işaretlendi.`,
      });
    }
  };

  const buildInvoiceDemoOrders = () => {
    const stamp = nowStamp();
    const customer = customers[0] || {
      id: "demo-customer",
      name: "Demo Kurum",
    };
    const productOne =
      productPool.find((product) => product.active !== false) || productPool[0];
    const productTwo = productOne ? findSuggestedPairProduct(productOne) : null;
    const demoComponents = [productOne, productTwo]
      .filter(Boolean)
      .map((product, index, list) => {
        const requiredQty = list.length > 1 ? (index === 0 ? 5 : 5) : 10;
        const unitPrice = Number(product?.price || 0);
        return {
          ...product,
          partLabel: getComponentPartLabel(product, index),
          requiredQty,
          unitPrice,
          lineTotal: Math.round(requiredQty * unitPrice),
          aksonProductCode: product?.productCode,
        };
      });
    const listTotal =
      demoComponents.reduce(
        (sum, component) => sum + Number(component.lineTotal || 0),
        0,
      ) || 4500;
    const makeDemo = (suffix, invoiceResult, item, quantity = 10) => ({
      id: `DEMO-${suffix}-${Date.now()}`,
      institution: customer.name,
      customerId: customer.id,
      item,
      examId: `demo-${suffix}`,
      quantity,
      examDate: "-",
      price: quantity ? Math.round(listTotal / quantity) : listTotal,
      listTotal,
      discountRate: 0,
      discountAmount: 0,
      total: listTotal,
      status: "Onaylandı",
      source: "demo",
      stockBehavior: "deduct",
      ...invoiceResult,
      note: "Fatura durumlarını test etmek için oluşturulan örnek sipariş.",
      createdAt: `${stamp.dateText} ${stamp.timeText}`,
      approvedAt: `${stamp.dateText} ${stamp.timeText}`,
      preparedAt: "-",
      deliveredAt: "-",
      components: demoComponents,
      cancelReason: "",
      logs: [
        `${stamp.dateText} ${stamp.timeText} - Demo sipariş oluşturuldu.`,
        ...(invoiceResult.logs || []),
      ],
    });

    const successInvoice = createAksonInvoiceResult(true, { source: "demo" });
    const noInvoice = createAksonInvoiceResult(false, { source: "demo" });
    const errorInvoice = createAksonInvoiceResult(true, {
      source: "demo",
      forceAksonError: true,
    });
    const created = [
      makeDemo("SUCCESS", successInvoice, "Demo - Fatura kesildi"),
      makeDemo("NOINVOICE", noInvoice, "Demo - Fatura kesilmedi"),
      makeDemo("ERROR", errorInvoice, "Demo - Fatura hatası"),
    ];
    setOrders((current) => [...created, ...current]);
    setSystemNotice({
      type: "warning",
      title: "Test siparişleri oluşturuldu",
      text: "Yeşil, sarı ve kırmızı fatura durumlarını kontrol etmek için 3 örnek sipariş Sipariş Takip ekranına eklendi.",
    });
    setOrderSubTab("tracking");
  };

  const confirmApproveOrder = () => {
    if (!approveModalOrder) return;
    const exam = exams.find(
      (item) =>
        String(item.id) === String(approveModalOrder.examId) ||
        item.title === approveModalOrder.item,
    );
    const invoiceResult = createAksonInvoiceResult(
      approveWithAkson,
      approveModalOrder,
    );
    const approvalExtra = {
      ...invoiceResult,
      source: approveModalOrder.source || "institution",
      components: exam
        ? buildOrderComponents(exam, approveModalOrder.quantity)
        : approveModalOrder.components || [],
    };

    setOrders((current) => {
      const exists = current.some(
        (order) =>
          order.id === approveModalOrder.id &&
          order.item === approveModalOrder.item,
      );
      if (exists) {
        return current.map((order) =>
          order.id === approveModalOrder.id &&
          order.item === approveModalOrder.item
            ? setOrderWithStamp(order, "Onaylandı", approvalExtra)
            : order,
        );
      }
      return [
        setOrderWithStamp(approveModalOrder, "Onaylandı", approvalExtra),
        ...current,
      ];
    });

    notifyInvoiceResult(invoiceResult, approveModalOrder.item);

    setApproveModalOrder(null);
    setApproveWithAkson(true);
    setOrderSubTab("tracking");
  };

  const importAksonSample = () => {
    const sample = [
      {
        publisher: "ÖZDEBİR",
        productCode: "AKS-TYT-A",
        name: "ÖZDEBİR TYT TÜRKİYE GENELİ A KİTAPÇIĞI",
        barcode: "869000000101",
        price: 450,
        classLevel: "TYT",
        source: "Akson",
      },
      {
        publisher: "ÖZDEBİR",
        productCode: "AKS-TYT-B",
        name: "ÖZDEBİR TYT TÜRKİYE GENELİ B KİTAPÇIĞI",
        barcode: "869000000102",
        price: 450,
        classLevel: "TYT",
        source: "Akson",
      },
      {
        publisher: "HIZ VE RENK",
        productCode: "AKS-LGS-A",
        name: "HIZ VE RENK LGS DENEME A KİTAPÇIĞI",
        barcode: "869000000201",
        price: 390,
        classLevel: "LGS",
        source: "Akson",
      },
      {
        publisher: "HIZ VE RENK",
        productCode: "AKS-LGS-B",
        name: "HIZ VE RENK LGS DENEME B KİTAPÇIĞI",
        barcode: "869000000202",
        price: 390,
        classLevel: "LGS",
        source: "Akson",
      },
    ].map((p, index) => ({
      productType: "Akson Ürünü",
      isbn: p.barcode || "",
      branch: p.name.includes("TÜRKİYE") ? "Genel" : "Genel",
      examType: p.classLevel,
      type: "Deneme",
      category: "Kurumsal Deneme",
      level: ["LGS", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"].includes(
        p.classLevel,
      )
        ? "Ortaokul"
        : "Lise",
      kind: "Kitapçık",
      purchasePrice: 0,
      lastPurchaseUnitPrice: 0,
      lastPurchaseDiscount: 0,
      ignoreDiscount: false,
      ...p,
      id: `akson-${Date.now()}-${index}`,
      active: true,
    }));
    setProductPool((current) => [...sample, ...current]);
    setSystemNotice({
      type: "success",
      title: "Akson ürünleri aktarıldı",
      text: `${sample.length} ürün havuza eklendi. Mevcut Akson bağlantısı hazır olduğunda bu akış gerçek kayıtlarla çalışacak.`,
    });
  };
  const handleExcelImport = async (file) => {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLocaleLowerCase("tr-TR");
    if (!extension || !["xls", "xlsx", "csv"].includes(extension)) {
      setExcelImportMessage(
        "Lütfen .xls, .xlsx veya .csv formatında bir dosya seçin.",
      );
      setSystemNotice({
        type: "error",
        title: "Excel dosyası okunamadı",
        text: "Ürün aktarımı için .xls, .xlsx veya .csv dosyası seçmelisiniz.",
      });
      return;
    }

    try {
      setExcelImportMessage(`${file.name} okunuyor...`);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: true,
      });

      const importedProducts = rows
        .map((row, index) => mapExcelRowToProduct(row, index))
        .filter(Boolean);

      let addedCount = 0;
      let updatedCount = 0;
      const skippedCount = Math.max(rows.length - importedProducts.length, 0);
      const productMap = new Map();
      const order = [];

      productPool.forEach((product) => {
        const key = normalizeProductKey(product) || `current:${product.id}`;
        productMap.set(key, product);
        order.push(key);
      });

      importedProducts.forEach((product) => {
        const key = normalizeProductKey(product) || `excel:${product.id}`;
        const existing = productMap.get(key);

        if (existing) {
          updatedCount += 1;
          productMap.set(key, {
            ...existing,
            ...product,
            id: existing.id,
            active: existing.active !== false,
            source: product.source || existing.source || "Excel",
          });
          return;
        }

        addedCount += 1;
        productMap.set(key, product);
        order.unshift(key);
      });

      setProductPool(order.map((key) => productMap.get(key)).filter(Boolean));

      setExcelImportMessage(
        `${file.name} aktarıldı. ${addedCount.toLocaleString("tr-TR")} yeni ürün eklendi, ${updatedCount.toLocaleString("tr-TR")} ürün güncellendi, ${skippedCount.toLocaleString("tr-TR")} satır atlandı.`,
      );
      setSystemNotice({
        type: "success",
        title: "Excel ürünleri aktarıldı",
        text: `${addedCount.toLocaleString("tr-TR")} yeni ürün eklendi, ${updatedCount.toLocaleString("tr-TR")} ürün güncellendi. Bu aktarım geçici olarak frontend hafızasında tutulur; sayfa yenilenirse temizlenir.`,
      });
    } catch (error) {
      console.error("Excel import error:", error);
      setExcelImportMessage(
        `${file.name} okunamadı. Dosya formatını kontrol edin.`,
      );
      setSystemNotice({
        type: "error",
        title: "Excel içe aktarımı başarısız",
        text: "Dosya okunurken hata oluştu. Axon çıktısının .xls, .xlsx veya .csv formatında olduğundan emin olun.",
      });
    }
  };
  const saveManualProduct = (payload, editingId = null) => {
    if (!payload.name || !payload.barcode) return;
    if (editingId) {
      setProductPool((current) =>
        current.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...payload,
                price: Number(payload.price || 0),
                purchasePrice: Number(payload.purchasePrice || 0),
                lastPurchaseUnitPrice: Number(
                  payload.lastPurchaseUnitPrice || 0,
                ),
                lastPurchaseDiscount: Number(payload.lastPurchaseDiscount || 0),
                ignoreDiscount: Boolean(payload.ignoreDiscount),
                active: payload.active !== false,
              }
            : p,
        ),
      );
      setEditingProduct(null);
      return;
    }
    setProductPool((current) => [
      {
        ...payload,
        id: `manual-${Date.now()}`,
        source: payload.source || "Manuel",
        price: Number(payload.price || 0),
        purchasePrice: Number(payload.purchasePrice || 0),
        lastPurchaseUnitPrice: Number(payload.lastPurchaseUnitPrice || 0),
        lastPurchaseDiscount: Number(payload.lastPurchaseDiscount || 0),
        ignoreDiscount: Boolean(payload.ignoreDiscount),
        active: payload.active !== false,
      },
      ...current,
    ]);
    setManualRawProduct({
      productType: "Kurumsal Deneme",
      isbn: "",
      publisher: "",
      productCode: "",
      name: "",
      barcode: "",
      price: 0,
      purchasePrice: 0,
      lastPurchaseUnitPrice: 0,
      lastPurchaseDiscount: 0,
      ignoreDiscount: false,
      classLevel: "TYT",
      examType: "TYT",
      branch: "Genel",
      type: "Deneme",
      category: "Kurumsal Deneme",
      level: "Lise",
      kind: "Kitapçık",
      source: "Manuel",
      active: true,
    });
    setManualProductOpen(false);
  };

  const getDiscountForPublisher = (publisher) =>
    Number(publisherDiscounts[publisher] ?? 0);
  const selectedShowcaseProducts = [
    showcaseForm.productId,
    showcaseForm.productAId,
    showcaseForm.productBId,
  ]
    .map(getProductById)
    .filter(Boolean);
  const firstShowcaseProduct = selectedShowcaseProducts[0];
  const calculateShowcasePrice = () => {
    const base = Number(
      showcaseForm.customPrice || firstShowcaseProduct?.price || 0,
    );
    const discount = Number(
      showcaseForm.discountRate ||
        getDiscountForPublisher(firstShowcaseProduct?.publisher) ||
        0,
    );
    return Math.round(base * (1 - discount / 100));
  };
  const resetShowcaseForm = () =>
    setShowcaseForm({
      vitrinName: "",
      productType: "Deneme",
      group: "Lise",
      level: "TYT",
      monthId: showcaseMonthId || currentMonthId || months[0]?.id || "",
      monthIds: showcaseMonthId
        ? [showcaseMonthId]
        : currentMonthId
          ? [currentMonthId]
          : months[0]?.id
            ? [months[0].id]
            : [],
      productId: "",
      productAId: "",
      productBId: "",
      discountRate: 0,
      minQuantity: 1,
      maxQuantity: 999,
      orderDeadline: "",
      recommendedDate: "",
      customPrice: "",
      description: "",
      visibilityMode: "all",
      visibleCustomerIds: [],
      customerDiscounts: {},
      active: true,
      orderable: true,
    });
  const isShowcaseDeadlineExpired = (deadline) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return false;
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getShowcaseVisibilityText = (item = {}) =>
    item.visibilityMode === "selected"
      ? `Sadece ${item.visibleCustomerIds?.length || 0} kurum`
      : "Tüm kurumlar";

  const getShowcaseOrderStatusText = (item = {}) => {
    if (item.active === false) return "Kapalı";
    if (isShowcaseDeadlineExpired(item.orderDeadline))
      return "Sipariş süresi doldu";
    if (item.orderable === false) return "Siparişe kapalı";
    return "Siparişe açık";
  };

  const addShowcaseProduct = () => {
    const products =
      showcaseForm.productType === "Deneme"
        ? [
            getProductById(showcaseForm.productAId),
            getProductById(showcaseForm.productBId),
          ].filter(Boolean)
        : [getProductById(showcaseForm.productId)].filter(Boolean);
    if (!showcaseForm.vitrinName || products.length === 0) return;
    const selectedMonthIds =
      Array.isArray(showcaseForm.monthIds) && showcaseForm.monthIds.length
        ? showcaseForm.monthIds
        : [showcaseForm.monthId || showcaseMonthId].filter(Boolean);
    if (!selectedMonthIds.length) return;
    const duplicateMonths = selectedMonthIds.filter((monthId) =>
      exams.some((exam) => {
        const sameSeason = exam.seasonId
          ? exam.seasonId === selectedShowcaseSeasonId
          : true;
        const sameMonth = exam.monthId === monthId;
        const sameTitle =
          normalizeText(exam.title || "") ===
          normalizeText(showcaseForm.vitrinName || "");
        const sameMainProduct =
          String(exam.productAId || exam.productId || "") ===
          String(showcaseForm.productAId || showcaseForm.productId || "");
        const samePairProduct =
          !showcaseForm.productBId ||
          String(exam.productBId || "") ===
            String(showcaseForm.productBId || "");
        return (
          sameSeason &&
          sameMonth &&
          (sameTitle || (sameMainProduct && samePairProduct))
        );
      }),
    );
    if (duplicateMonths.length) {
      const names = duplicateMonths
        .map((monthId) => {
          const month = showcaseSeasonMonths.find((m) => m.id === monthId);
          return month ? `${month.label} ${month.year}` : monthId;
        })
        .join(", ");
      setSystemNotice({
        type: "warning",
        title: "Tekrarlı vitrin kaydı",
        text: `${showcaseForm.vitrinName || products[0]?.name} zaten ${names} vitrininizde görünüyor. Aynı ayda aynı deneme tekrar eklenmedi.`,
      });
      return;
    }
    const publisher = products[0]?.publisher || "";
    const discountRate = Number(
      showcaseForm.discountRate || getDiscountForPublisher(publisher) || 0,
    );
    const useCustomerSpecificPricing = Boolean(showcaseCustomerDiscountsOpen);
    const resolvedCustomerDiscounts = useCustomerSpecificPricing
      ? Object.fromEntries(
          customers.map((customer) => [
            customer.id,
            Number(
              showcaseForm.customerDiscounts?.[customer.id] ??
                customer.discountRate ??
                discountRate,
            ),
          ]),
        )
      : {};
    const customerPricing = useCustomerSpecificPricing
      ? customers.map((customer) => {
          const rate = Number(
            resolvedCustomerDiscounts[customer.id] ?? discountRate,
          );
          const discountAmount = Math.round(
            Number(showcaseForm.customPrice || products[0]?.price || 0) *
              (rate / 100),
          );
          return {
            customerId: customer.id,
            customerName: customer.name,
            discountRate: rate,
            discountAmount,
            netPrice: Math.max(
              0,
              Number(showcaseForm.customPrice || products[0]?.price || 0) -
                discountAmount,
            ),
          };
        })
      : [];
    const nowId = Date.now();
    const createdProducts = selectedMonthIds.map((monthId, index) => ({
      ...blankExam,
      id: `showcase-${nowId}-${index}`,
      title: showcaseForm.vitrinName,
      brand: publisher,
      level: showcaseForm.level,
      group: showcaseForm.group,
      monthId,
      seasonId: selectedShowcaseSeasonId,
      seasonLabel: selectedShowcaseSeason?.label || seasonLabel,
      listPrice: Number(showcaseForm.customPrice || products[0]?.price || 0),
      netPrice: calculateShowcasePrice(),
      discountRate,
      useCustomerSpecificPricing,
      customerDiscounts: resolvedCustomerDiscounts,
      customerPricing,
      minQuantity: Number(showcaseForm.minQuantity || 1),
      maxQuantity: Number(showcaseForm.maxQuantity || 999),
      orderDeadline: autoDeadlineForShowcaseMonth(
        monthId,
        selectedShowcaseSeason?.startYear,
      ),
      recommendedStartDate: showcaseForm.recommendedDate,
      recommendedDate: showcaseForm.recommendedDate,
      description: showcaseForm.description,
      visibilityMode: showcaseForm.visibilityMode || "all",
      visibleCustomerIds:
        showcaseForm.visibilityMode === "selected"
          ? showcaseForm.visibleCustomerIds || []
          : [],
      active: showcaseForm.active,
      orderable: showcaseForm.orderable !== false,
      productType: showcaseForm.productType,
      productId: showcaseForm.productId || showcaseForm.productAId,
      productAId: showcaseForm.productAId,
      productBId: showcaseForm.productBId,
      components: products,
      tags: [showcaseForm.level, showcaseForm.productType],
    }));
    setExams((current) => [...createdProducts, ...current]);
    setShowcaseMonthId(selectedMonthIds[0]);
    resetShowcaseForm();
  };
  const updateShowcase = (id, patch) =>
    setExams((current) =>
      current.map((exam) => (exam.id === id ? { ...exam, ...patch } : exam)),
    );

  const autoDeadlineForMonth = (monthId) => {
    const month = months.find((m) => String(m.id) === String(monthId));
    if (!month) return "";
    const year = month.year || seasonStartYear || new Date().getFullYear();
    const monthIndex = Math.max(
      0,
      months.findIndex((m) => String(m.id) === String(monthId)),
    );
    const date = new Date(year, monthIndex + 1, 0);
    return date.toISOString().slice(0, 10);
  };

  const createManualOrder = () => {
    const customer = customers.find(
      (c) => String(c.id) === String(manualOrder.institutionId),
    );
    const exam = selectedManualExam;
    if (!customer || !exam) return;
    const stamp = nowStamp();
    const quantity = Number(manualOrder.quantity || 1);
    const discount = manualOrderDiscountRate;
    const total = manualOrderDiscountedTotal;
    const invoiceResult = createAksonInvoiceResult(
      Boolean(manualOrder.invoiceAkson),
      { source: "admin" },
    );
    const created = {
      id: `ADM-${Date.now()}`,
      institution: customer.name,
      customerId: customer.id,
      item: exam.title,
      examId: exam.id,
      quantity,
      examDate: exam.recommendedStartDate || exam.orderDeadline,
      price: Number(exam.listPrice || 0),
      listTotal: manualOrderListTotal,
      discountRate: discount,
      discountAmount: manualOrderDiscountAmount,
      total,
      status: "Onaylandı",
      source: "admin",
      stockBehavior: manualOrder.deductStock ? "deduct" : "ignore",
      ...invoiceResult,
      note: manualOrder.note,
      createdAt: `${stamp.dateText} ${stamp.timeText}`,
      approvedAt: `${stamp.dateText} ${stamp.timeText}`,
      preparedAt: "-",
      deliveredAt: "-",
      components: buildOrderComponents(exam, quantity),
      cancelReason: "",
      logs: [
        `${stamp.dateText} ${stamp.timeText} - Admin siparişi oluşturuldu.`,
        `${stamp.dateText} ${stamp.timeText} - İskonto: %${discount}`,
        `${stamp.dateText} ${stamp.timeText} - Fatura kes: ${manualOrder.invoiceAkson ? "Evet" : "Hayır"}`,
        `${stamp.dateText} ${stamp.timeText} - Stok düş: ${manualOrder.deductStock ? "Evet" : "Hayır"}`,
        ...(invoiceResult.logs || []),
      ],
    };
    setOrders((current) => [created, ...current]);
    notifyInvoiceResult(invoiceResult, created.item);
    setManualOrderConfirmOpen(false);
    setOrderSubTab("tracking");
  };

  const resolveMonthDayFromText = (stamp = "") => {
    const text = String(stamp || "");
    const monthNames = [
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
    const monthName = monthNames.find((name) => text.includes(name));
    const yearMatch = text.match(/20\d{2}/);
    const dayMatch = text.match(/\b\d{1,2}\b/);
    if (monthName && yearMatch) {
      return {
        month: `${monthName} ${yearMatch[0]}`,
        day: `${dayMatch ? dayMatch[0].padStart(2, "0") : "--"} ${monthName} ${yearMatch[0]}`,
      };
    }
    const fallback = new Date();
    const fallbackMonth = fallback.toLocaleDateString("tr-TR", {
      month: "long",
      year: "numeric",
    });
    const fallbackDay = fallback.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return { month: fallbackMonth, day: fallbackDay };
  };

  const groupOrdersByMonthAndDay = (list) => {
    return list.reduce((acc, order) => {
      const stamp =
        order.deliveredAt ||
        order.cancelledAt ||
        order.createdAt ||
        order.date ||
        "";
      const { month, day } = resolveMonthDayFromText(stamp);
      acc[month] ||= {};
      acc[month][day] ||= [];
      acc[month][day].push(order);
      return acc;
    }, {});
  };

  const getReportDateKeyFromText = (stamp = "") => {
    const parsed = parseOrderArchiveDate({ createdAt: stamp });
    return parsed.dayKey;
  };

  const getReportTimeFromText = (stamp = "") => {
    const match = String(stamp || "").match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
    return match?.[0] || "--:--";
  };

  const inferReportCategory = (text = "") => {
    const normalized = normalizeText(text);
    if (normalized.includes("fatura") || normalized.includes("akson"))
      return "invoice";
    if (normalized.includes("iptal") || normalized.includes("hata"))
      return "issue";
    return "order";
  };

  const reportCategoryMeta = {
    order: {
      title: "Sipariş Hareketleri",
      description: "Onay, hazırlama ve teslim akışındaki sipariş kayıtları.",
      tone: "blue",
    },
    invoice: {
      title: "Fatura / Akson Hareketleri",
      description: "Fatura kesimi, faturasız onay ve Akson bağlantı durumları.",
      tone: "green",
    },
    issue: {
      title: "İptal ve Hata Kayıtları",
      description: "İptal edilen siparişler ve hata oluşturan işlemler.",
      tone: "red",
    },
  };

  const reportYearOptions = useMemo(() => {
    const years = new Set([String(new Date().getFullYear()), reportYear]);
    orders.forEach((order) => {
      [
        order.createdAt,
        order.approvedAt,
        order.preparedAt,
        order.deliveredAt,
        order.cancelledAt,
        ...(order.logs || []),
      ]
        .filter(Boolean)
        .forEach((stamp) => {
          const match = String(stamp).match(/20\d{2}/);
          if (match) years.add(match[0]);
        });
    });
    demoHistoryOrders.forEach((order) => {
      [
        order.createdAt,
        order.approvedAt,
        order.preparedAt,
        order.deliveredAt,
        order.cancelledAt,
        ...(order.logs || []),
      ]
        .filter(Boolean)
        .forEach((stamp) => {
          const match = String(stamp).match(/20\d{2}/);
          if (match) years.add(match[0]);
        });
    });
    return Array.from(years)
      .map(Number)
      .filter(Boolean)
      .sort((a, b) => a - b)
      .map(String);
  }, [orders, demoHistoryOrders, reportYear]);

  const selectedReportDayKey = `${reportYear}-${String(Number(reportMonthIndex) + 1).padStart(2, "0")}-${String(Number(reportDay)).padStart(2, "0")}`;
  const selectedReportDateLabel = `${String(Number(reportDay)).padStart(2, "0")} ${HISTORY_MONTHS[Number(reportMonthIndex)]} ${reportYear}`;

  const reportMovements = useMemo(() => {
    const movements = [];
    const sourceOrders = [
      ...demoHistoryOrders.filter(
        (demoOrder) =>
          !orders.some((order) => String(order.id) === String(demoOrder.id)),
      ),
      ...orders,
    ];

    sourceOrders.forEach((order) => {
      const baseStamp = order.createdAt || order.date || "Tarih yok";
      const logs = order.logs?.length
        ? order.logs
        : [`${baseStamp} - Sipariş kaydı oluşturuldu.`];

      logs.forEach((log, index) => {
        const stamp = String(log).split(" - ")[0] || baseStamp;
        movements.push({
          id: `log-${order.id}-${index}`,
          dayKey: getReportDateKeyFromText(stamp),
          time: getReportTimeFromText(stamp),
          category: inferReportCategory(log),
          title: order.item,
          detail: log.includes(" - ")
            ? log.split(" - ").slice(1).join(" - ")
            : `${order.institution} • ${order.quantity} adet • ${order.status}`,
          institution: order.institution,
          status: order.status,
          amount: Number(order.total || 0),
          order,
          components: order.components || [],
        });
      });

      if (order.invoiceStatus) {
        const stamp =
          order.invoicedAt || order.approvedAt || order.createdAt || baseStamp;
        movements.push({
          id: `invoice-${order.id}`,
          dayKey: getReportDateKeyFromText(stamp),
          time: getReportTimeFromText(stamp),
          category:
            order.invoiceStatus === "invoice_error" ? "issue" : "invoice",
          title: order.item,
          detail: `${getInvoiceStatusText(order)}${order.invoiceNumber || order.invoiceNo ? ` • No: ${order.invoiceNumber || order.invoiceNo}` : ""}`,
          institution: order.institution,
          status: order.status,
          amount: Number(order.total || 0),
          order,
          components: order.components || [],
        });
      }

      if (order.status === "İptal edildi") {
        const stamp = order.cancelledAt || order.createdAt || baseStamp;
        movements.push({
          id: `cancel-${order.id}`,
          dayKey: getReportDateKeyFromText(stamp),
          time: getReportTimeFromText(stamp),
          category: "issue",
          title: order.item,
          detail: `Sipariş iptal edildi${order.cancelReason ? ` • ${order.cancelReason}` : ""}`,
          institution: order.institution,
          status: order.status,
          amount: Number(order.total || 0),
          order,
          components: order.components || [],
        });
      }
    });

    return movements.sort((a, b) =>
      String(b.time).localeCompare(String(a.time)),
    );
  }, [orders, demoHistoryOrders]);

  const selectedReportMovements = useMemo(
    () =>
      reportMovements.filter(
        (movement) => movement.dayKey === selectedReportDayKey,
      ),
    [reportMovements, selectedReportDayKey],
  );

  const reportSummary = useMemo(() => {
    return selectedReportMovements.reduce(
      (acc, movement) => {
        acc.total += 1;
        if (movement.category === "order") acc.orders += 1;
        if (movement.category === "invoice") acc.invoices += 1;
        if (movement.category === "issue") acc.issues += 1;
        if (movement.status === "Teslim edildi") acc.delivered += 1;
        if (movement.status === "İptal edildi") acc.cancelled += 1;
        if (movement.order?.invoiceStatus === "invoice_error")
          acc.invoiceErrors += 1;
        if (movement.order?.invoiceStatus === "invoiced") acc.invoiced += 1;
        if (movement.order && movement.category !== "issue") {
          acc.revenue += Number(movement.order.total || 0);
        }
        return acc;
      },
      {
        total: 0,
        orders: 0,
        invoices: 0,
        issues: 0,
        delivered: 0,
        cancelled: 0,
        invoiced: 0,
        invoiceErrors: 0,
        revenue: 0,
      },
    );
  }, [selectedReportMovements]);

  const summarizeReportMovements = (list = []) =>
    list.reduce(
      (acc, movement) => {
        acc.total += 1;
        if (movement.category === "order") acc.orders += 1;
        if (movement.category === "invoice") acc.invoices += 1;
        if (movement.category === "issue") acc.issues += 1;
        if (movement.status === "Teslim edildi") acc.delivered += 1;
        if (movement.status === "İptal edildi") acc.cancelled += 1;
        if (movement.order?.invoiceStatus === "invoice_error")
          acc.invoiceErrors += 1;
        if (movement.order?.invoiceStatus === "invoiced") acc.invoiced += 1;
        if (movement.order && movement.category !== "issue") {
          acc.revenue += Number(movement.order.total || 0);
        }
        return acc;
      },
      {
        total: 0,
        orders: 0,
        invoices: 0,
        issues: 0,
        delivered: 0,
        cancelled: 0,
        invoiced: 0,
        invoiceErrors: 0,
        revenue: 0,
      },
    );

  const reportYearCards = useMemo(
    () =>
      reportYearOptions.map((year) => {
        const movements = reportMovements.filter((movement) =>
          movement.dayKey.startsWith(`${year}-`),
        );
        return {
          year,
          movements,
          summary: summarizeReportMovements(movements),
        };
      }),
    [reportYearOptions, reportMovements],
  );

  const reportMonthCards = useMemo(
    () =>
      HISTORY_MONTHS.map((month, index) => {
        const monthKey = `${reportYear}-${String(index + 1).padStart(2, "0")}`;
        const movements = reportMovements.filter((movement) =>
          movement.dayKey.startsWith(`${monthKey}-`),
        );
        return {
          key: monthKey,
          label: month,
          monthIndex: index,
          movements,
          summary: summarizeReportMovements(movements),
        };
      }),
    [reportYear, reportMovements],
  );

  const reportDayCards = useMemo(() => {
    const daysInMonth = getDaysInHistoryMonth(
      reportYear,
      Number(reportMonthIndex),
    );
    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dayKey = `${reportYear}-${String(Number(reportMonthIndex) + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const movements = reportMovements.filter(
        (movement) => movement.dayKey === dayKey,
      );
      return {
        key: dayKey,
        day,
        label: `${String(day).padStart(2, "0")} ${HISTORY_MONTHS[Number(reportMonthIndex)]}`,
        movements,
        summary: summarizeReportMovements(movements),
      };
    });
  }, [reportYear, reportMonthIndex, reportMovements]);

  const setReportToToday = () => {
    const now = new Date();
    setReportYear(String(now.getFullYear()));
    setReportMonthIndex(now.getMonth());
    setReportDay(now.getDate());
  };

  const setReportToYesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    setReportYear(String(date.getFullYear()));
    setReportMonthIndex(date.getMonth());
    setReportDay(date.getDate());
  };

  const renderOrderCard = (order, compact = false) => (
    <div
      key={`${order.id}-${order.item}`}
      className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill
              tone={
                order.status === "İptal edildi"
                  ? "red"
                  : order.status === "Teslim edildi"
                    ? "green"
                    : order.status === "Onay bekliyor"
                      ? "amber"
                      : "blue"
              }
            >
              {order.status}
            </Pill>
            {order.source === "admin" && <Pill>Admin oluşturdu</Pill>}
          </div>
          <p className="mt-2 truncate text-lg font-black text-slate-950">
            {order.item}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-500">
            {order.quantity} adet • {order.institution}
          </p>
          {!compact && (
            <p className="mt-1 text-xs font-bold text-slate-400">{order.id}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedOrder(enrichOrderForDetail(order))}
            className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200"
          >
            Detaylar
          </button>
          {order.status === "Onay bekliyor" && (
            <button
              onClick={() => {
                setApproveWithAkson(order.defaultInvoiceAkson ?? true);
                setApproveModalOrder(order);
              }}
              className="rounded-full bg-blue-700 px-3 py-2 text-xs font-black text-white"
            >
              Onayla
            </button>
          )}
          {order.status === "Onaylandı" && (
            <button
              onClick={() => updateOrderStatus(order.id, order.item, "Hazır")}
              className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100"
            >
              Hazır
            </button>
          )}
          {order.status === "Hazır" && (
            <button
              onClick={() =>
                updateOrderStatus(order.id, order.item, "Teslim edildi")
              }
              className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-black text-white"
            >
              Teslim
            </button>
          )}
          {!["İptal edildi", "Teslim edildi"].includes(order.status) && (
            <button
              onClick={() => {
                setCancelModalOrder(order);
                setCancelReason(order.cancelReason || "");
              }}
              className="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100"
            >
              İptal
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const getInvoiceRowClass = (order) => {
    if (order.invoiceStatus === "invoice_error")
      return "border-red-200 bg-red-50/80 hover:border-red-300 hover:bg-red-50";
    if (order.invoiceStatus === "invoiced")
      return "border-emerald-200 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-50";
    if (order.invoiceStatus === "not_invoiced" || order.invoiceAkson === false)
      return "border-amber-200 bg-amber-50/75 hover:border-amber-300 hover:bg-amber-50";
    return "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30";
  };

  const getInvoicePill = (order) => {
    if (order.invoiceStatus === "invoice_error")
      return <Pill tone="red">Fatura hatası</Pill>;
    if (order.invoiceStatus === "invoiced")
      return <Pill tone="green">Fatura edildi</Pill>;
    if (order.invoiceStatus === "not_invoiced" || order.invoiceAkson === false)
      return <Pill tone="amber">Fatura kesilmedi</Pill>;
    return null;
  };

  const getInvoiceText = (order = {}) => getInvoiceStatusText(order);

  const renderHistoryOrderRow = (order) => (
    <div
      key={`history-${order.id}-${order.item}`}
      className={`rounded-2xl border p-4 shadow-sm ${getInvoiceRowClass(order)}`}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(150px,0.75fr)_90px_130px_150px_130px_120px] xl:items-center">
        <div className="min-w-0">
          <p className="text-base font-black text-slate-950">{order.item}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            Sipariş No: {order.id}
          </p>
        </div>
        <p className="text-sm font-extrabold text-slate-700">
          {order.institution}
        </p>
        <p className="text-sm font-black text-slate-950">
          {order.quantity} adet
        </p>
        <p className="text-sm font-black text-slate-950">
          {formatCurrency(Number(order.total || order.discountedTotal || 0))}
        </p>
        <div className="flex flex-wrap gap-2">
          {getInvoicePill(order) || <Pill>{getInvoiceText(order)}</Pill>}
        </div>
        <Pill tone={order.status === "İptal edildi" ? "red" : "green"}>
          {order.status}
        </Pill>
        <button
          onClick={() => setSelectedOrder(enrichOrderForDetail(order))}
          className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white"
        >
          Tüm detaylar
        </button>
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl bg-white/70 p-3 text-xs font-bold text-slate-600 ring-1 ring-slate-200 sm:grid-cols-2 xl:grid-cols-4">
        <span>
          Oluşturma: <b className="text-slate-950">{order.createdAt || "—"}</b>
        </span>
        <span>
          Onay: <b className="text-slate-950">{order.approvedAt || "—"}</b>
        </span>
        <span>
          Hazır: <b className="text-slate-950">{order.preparedAt || "—"}</b>
        </span>
        <span>
          Teslim/İptal:{" "}
          <b className="text-slate-950">
            {order.deliveredAt || order.cancelledAt || "—"}
          </b>
        </span>
        <span>
          Liste toplam:{" "}
          <b className="text-slate-950">
            {formatCurrency(Number(order.listTotal || 0))}
          </b>
        </span>
        <span>
          İskonto:{" "}
          <b className="text-slate-950">
            %{order.discountRate || 0} /{" "}
            {formatCurrency(Number(order.discountAmount || 0))}
          </b>
        </span>
        <span>
          Fatura: <b className="text-slate-950">{getInvoiceText(order)}</b>
        </span>
        <span>
          Kalem:{" "}
          <b className="text-slate-950">
            {order.components?.length || 0} bileşen
          </b>
        </span>
      </div>
    </div>
  );

  const renderHistorySection = () => {
    const years = historyYearOptions;
    const activeYear = historyYear || years[0] || String(HISTORY_START_YEAR);
    const yearData = historyArchive[activeYear] || { orders: [], months: {} };
    const yearSummary = summarizeOrderList(yearData.orders || []);
    const monthList = HISTORY_MONTHS.map((_, monthIndex) =>
      makeHistoryMonth(
        activeYear,
        monthIndex,
        yearData.months?.[
          `${activeYear}-${String(monthIndex + 1).padStart(2, "0")}`
        ],
      ),
    );
    const selectedMonth = historyMonthKey
      ? monthList.find((month) => month.key === historyMonthKey)
      : null;
    const monthSummary = summarizeOrderList(selectedMonth?.orders || []);
    const dayList = selectedMonth
      ? Array.from(
          {
            length: getDaysInHistoryMonth(activeYear, selectedMonth.monthIndex),
          },
          (_, index) => {
            const dayNumber = index + 1;
            const dayKey = `${activeYear}-${String(selectedMonth.monthIndex + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
            return makeHistoryDay(
              activeYear,
              selectedMonth.monthIndex,
              dayNumber,
              selectedMonth.days?.[dayKey],
            );
          },
        )
      : [];
    const selectedDay =
      historyDayKey && selectedMonth
        ? dayList.find((day) => day.key === historyDayKey)
        : null;
    const daySummary = summarizeOrderList(selectedDay?.orders || []);
    const hasActiveHistoryFilter =
      Boolean(historySearch.trim()) ||
      historyInvoiceFilter !== "Tümü" ||
      historyStatusFilter !== "Tümü";

    return (
      <div className="grid gap-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                Geçmiş siparişler
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Yıl → ay → gün → sipariş arşivi
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                2026 yılından itibaren tüm yıllar, tüm aylar ve tüm günler
                listelenir. Kayıt olmayan dönemler de tıklanabilir kalır; sadece
                silik görünür. Siparişin tüm bileşenleri, barkodları, fatura,
                Akson, iskonto ve işlem geçmişi detay kutusunda tutulur.
              </p>
            </div>
            <button
              onClick={() => {
                setOrderSubTab("tracking");
                setHistoryMonthKey("");
                setHistoryDayKey("");
              }}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
            >
              Sipariş takibe dön
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                Arama ve filtreler
              </p>
              <h3 className="text-xl font-black text-slate-950">
                Arşiv içinde hızlı bul
              </h3>
            </div>
            {hasActiveHistoryFilter && (
              <button
                type="button"
                onClick={() => {
                  setHistorySearch("");
                  setHistoryInvoiceFilter("Tümü");
                  setHistoryStatusFilter("Tümü");
                }}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200"
              >
                Filtreleri temizle
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px]">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Ürün, kurum, barkod, ürün kodu, fatura no veya not ara
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                <Search size={18} className="text-slate-400" />
                <input
                  value={historySearch}
                  onChange={(event) => {
                    setHistorySearch(event.target.value);
                    setHistoryDayKey("");
                  }}
                  placeholder="Örn: Özdebir, Atalar, 869..., INV..."
                  className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Fatura durumu
              </span>
              <select
                value={historyInvoiceFilter}
                onChange={(event) => {
                  setHistoryInvoiceFilter(event.target.value);
                  setHistoryDayKey("");
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              >
                <option>Tümü</option>
                <option>Fatura edildi</option>
                <option>Fatura kesilmedi</option>
                <option>Fatura hatası</option>
                <option>Bekliyor</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Sipariş durumu
              </span>
              <select
                value={historyStatusFilter}
                onChange={(event) => {
                  setHistoryStatusFilter(event.target.value);
                  setHistoryDayKey("");
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              >
                <option>Tümü</option>
                <option>Teslim edildi</option>
                <option>İptal edildi</option>
              </select>
            </label>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-400">
            Arama ve filtreler aktifken yıl/ay/gün özetleri filtreye uyan
            siparişlere göre hesaplanır.
          </p>
        </div>

        {hasActiveHistoryFilter ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                  Arama sonuçları
                </p>
                <h3 className="text-2xl font-black text-slate-950">
                  Tüm geçmiş kayıtlar içinde sonuçlar
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Arama veya filtre aktifken yıl/ay/gün görünümü kapanır;
                  eşleşen siparişler doğrudan listelenir.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill>{filteredHistoryOrders.length} sonuç</Pill>
                <Pill tone="green">
                  {summarizeOrderList(filteredHistoryOrders).invoiced} faturalı
                </Pill>
                <Pill tone="amber">
                  {summarizeOrderList(filteredHistoryOrders).notInvoiced}{" "}
                  faturasız
                </Pill>
                <Pill tone="red">
                  {summarizeOrderList(filteredHistoryOrders).invoiceError} hata
                </Pill>
              </div>
            </div>
            <div className="mt-5 hidden rounded-2xl bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400 xl:grid xl:grid-cols-[130px_minmax(0,1.45fr)_minmax(150px,0.75fr)_90px_130px_150px_130px_120px] xl:gap-4">
              <span>Tarih</span>
              <span>Ürün</span>
              <span>Kurum</span>
              <span>Adet</span>
              <span>Net tutar</span>
              <span>Fatura</span>
              <span>Durum</span>
              <span className="text-right">Detay</span>
            </div>
            <div className="mt-3 grid gap-3">
              {filteredHistoryOrders.map((order) => {
                const parsed = parseOrderArchiveDate(order);
                return (
                  <div
                    key={`search-${order.id}-${order.item}`}
                    className={`rounded-2xl border p-4 shadow-sm ${getInvoiceRowClass(order)}`}
                  >
                    <div className="grid gap-3 xl:grid-cols-[130px_minmax(0,1.45fr)_minmax(150px,0.75fr)_90px_130px_150px_130px_120px] xl:items-center">
                      <p className="text-xs font-black text-slate-500">
                        {parsed.dayLabel}
                      </p>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-950 xl:truncate">
                          {order.item}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-slate-400">
                          Sipariş No: {order.id}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold text-slate-600 xl:truncate">
                        {order.institution}
                      </p>
                      <p className="text-sm font-black text-slate-950">
                        {order.quantity} adet
                      </p>
                      <p className="text-sm font-black text-slate-950">
                        {formatCurrency(
                          order.total ||
                            order.discountedTotal ||
                            order.listTotal ||
                            0,
                        )}
                      </p>
                      <div>{getInvoicePill(order)}</div>
                      <Pill
                        tone={
                          order.status === "Teslim edildi"
                            ? "green"
                            : order.status === "İptal edildi"
                              ? "red"
                              : "blue"
                        }
                      >
                        {order.status}
                      </Pill>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-950 hover:text-white xl:justify-self-end"
                      >
                        Detay
                      </button>
                    </div>
                  </div>
                );
              })}
              {!filteredHistoryOrders.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-base font-black text-slate-500">
                    Aramanıza uygun geçmiş sipariş bulunamadı.
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-400">
                    Arama kelimesini, fatura filtresini veya sipariş durumunu
                    değiştirerek tekrar deneyebilirsiniz.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {years.map((year) => {
                const summary = summarizeOrderList(
                  historyArchive[year]?.orders || [],
                );
                const active = String(year) === String(activeYear);
                const empty = summary.count === 0;
                return (
                  <button
                    key={year}
                    onClick={() => {
                      setHistoryYear(String(year));
                      setHistoryMonthKey("");
                      setHistoryDayKey("");
                    }}
                    className={`rounded-[1.6rem] border p-5 text-left shadow-sm transition ${active ? "border-blue-200 bg-blue-50 ring-4 ring-blue-100" : empty ? "border-slate-200 bg-slate-50 opacity-55 hover:opacity-100" : "border-slate-200 bg-white hover:border-blue-200"}`}
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Yıl
                    </p>
                    <h3 className="mt-1 text-3xl font-black text-slate-950">
                      {year}
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                      <span>{summary.count} sipariş</span>
                      <span>{formatCurrency(summary.total)}</span>
                      <span>{summary.delivered} teslim</span>
                      <span>{summary.cancelled} iptal</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                    {activeYear} yılı
                  </p>
                  <h3 className="text-2xl font-black text-slate-950">Aylar</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-black text-slate-600">
                  <Pill>{yearSummary.count} sipariş</Pill>
                  <Pill tone="green">{yearSummary.delivered} teslim</Pill>
                  <Pill tone="red">{yearSummary.cancelled} iptal</Pill>
                  <Pill tone="amber">{yearSummary.invoiceError} hata</Pill>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {monthList.map((month) => {
                  const summary = summarizeOrderList(month.orders || []);
                  const active = month.key === historyMonthKey;
                  const empty = summary.count === 0;
                  return (
                    <button
                      key={month.key}
                      onClick={() => {
                        setHistoryMonthKey(month.key);
                        setHistoryDayKey("");
                      }}
                      className={`rounded-[1.4rem] border p-4 text-left transition ${active ? "border-blue-200 bg-blue-50 ring-4 ring-blue-100" : empty ? "border-slate-200 bg-slate-50 opacity-50 hover:border-blue-200 hover:bg-white hover:opacity-100" : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white"}`}
                    >
                      <h4 className="text-lg font-black text-slate-950">
                        {month.label}
                      </h4>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                        <span>{summary.count} sipariş</span>
                        <span>{formatCurrency(summary.total)}</span>
                        <span>{summary.delivered} teslim</span>
                        <span>{summary.cancelled} iptal</span>
                        <span>{summary.invoiced} fatura</span>
                        <span>{summary.invoiceError} hata</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedMonth && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                      {selectedMonth.label} {activeYear}
                    </p>
                    <h3 className="text-2xl font-black text-slate-950">
                      Günler
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-black text-slate-600">
                    <Pill>{monthSummary.count} sipariş</Pill>
                    <Pill tone="green">{monthSummary.delivered} teslim</Pill>
                    <Pill tone="red">{monthSummary.cancelled} iptal</Pill>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {dayList.map((day) => {
                    const summary = summarizeOrderList(day.orders || []);
                    const active = day.key === historyDayKey;
                    const empty = summary.count === 0;
                    return (
                      <button
                        key={day.key}
                        onClick={() => setHistoryDayKey(day.key)}
                        className={`rounded-[1.25rem] border p-4 text-left transition ${active ? "border-blue-200 bg-blue-50 ring-4 ring-blue-100" : empty ? "border-slate-200 bg-slate-50 opacity-45 hover:border-blue-200 hover:bg-white hover:opacity-100" : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white"}`}
                      >
                        <h4 className="text-sm font-black text-slate-950">
                          {day.label}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black text-slate-500">
                          <span>{summary.count} sipariş</span>
                          <span>{summary.delivered} teslim</span>
                          <span>{summary.cancelled} iptal</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedDay && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                      {selectedDay.label}
                    </p>
                    <h3 className="text-2xl font-black text-slate-950">
                      Sipariş kayıtları
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill>{daySummary.count} sipariş</Pill>
                    <Pill tone="green">{daySummary.invoiced} faturalı</Pill>
                    <Pill tone="amber">{daySummary.notInvoiced} faturasız</Pill>
                    <Pill tone="red">{daySummary.invoiceError} hata</Pill>
                  </div>
                </div>
                <div className="mt-5 hidden rounded-2xl bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400 xl:grid xl:grid-cols-[minmax(0,1.45fr)_minmax(150px,0.75fr)_90px_130px_150px_130px_120px] xl:gap-4">
                  <span>Ürün</span>
                  <span>Kurum</span>
                  <span>Adet</span>
                  <span>Net tutar</span>
                  <span>Fatura</span>
                  <span>Durum</span>
                  <span className="text-right">Detay</span>
                </div>
                <div className="mt-3 grid gap-3">
                  {selectedDay.orders.map((order) =>
                    renderHistoryOrderRow(order),
                  )}
                  {!selectedDay.orders.length && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                      <p className="text-base font-black text-slate-500">
                        Bu gün için kayıt yok.
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-400">
                        Gün tıklanabilir kalır; sipariş oluştuğunda kayıtlar
                        burada listelenir.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderTrackingOrderRow = (order) => (
    <div
      key={`${order.id}-${order.item}`}
      className={`rounded-2xl border px-4 py-3 shadow-sm transition ${getInvoiceRowClass(order)}`}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(180px,0.75fr)_110px_minmax(250px,auto)] lg:items-center">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-slate-950">
            {order.item}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="truncate text-xs font-bold text-slate-400">
              Sipariş No: {order.id}
            </p>
            {getInvoicePill(order)}
          </div>
        </div>
        <p className="truncate text-sm font-extrabold text-slate-600">
          {order.institution}
        </p>
        <p className="text-sm font-black text-slate-950">
          {order.quantity} adet
        </p>
        <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
          <button
            onClick={() => setSelectedOrder(enrichOrderForDetail(order))}
            className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200"
          >
            Detaylar
          </button>
          {order.status === "Onay bekliyor" && (
            <button
              onClick={() => {
                setApproveWithAkson(order.defaultInvoiceAkson ?? true);
                setApproveModalOrder(order);
              }}
              className="rounded-full bg-blue-700 px-3 py-2 text-xs font-black text-white"
            >
              Onayla
            </button>
          )}
          {order.status === "Onaylandı" && (
            <button
              onClick={() => updateOrderStatus(order.id, order.item, "Hazır")}
              className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100"
            >
              Hazır yap
            </button>
          )}
          {order.status === "Hazır" && (
            <button
              onClick={() =>
                updateOrderStatus(order.id, order.item, "Teslim edildi")
              }
              className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-black text-white"
            >
              Teslim et
            </button>
          )}
          {!["İptal edildi", "Teslim edildi"].includes(order.status) && (
            <button
              onClick={() => {
                setCancelModalOrder(order);
                setCancelReason(order.cancelReason || "");
              }}
              className="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100"
            >
              İptal
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const SearchableProductPicker = ({
    label,
    value,
    onChange,
    search,
    onSearch,
    helper,
    placeholder = "Ürün adı, yayınevi, barkod veya ürün kodu yaz",
  }) => {
    const selected = getProductById(value);
    const selectedLabel = selected
      ? `${selected.publisher} • ${selected.name}`
      : "";
    const query = normalizeText(search || "").trim();
    const showResults = query.length > 0 && search !== selectedLabel;
    const list = showResults
      ? productPool
          .filter((p) => p.active !== false)
          .filter((p) =>
            [p.name, p.publisher, p.barcode, p.productCode, p.classLevel].some(
              (field) => normalizeText(field).includes(query),
            ),
          )
          .sort((a, b) =>
            `${a.publisher} ${a.name}`.localeCompare(
              `${b.publisher} ${b.name}`,
              "tr",
            ),
          )
          .slice(0, 10)
      : [];

    return (
      <div className="relative grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">
            {label}
          </span>
          {selected && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-100">
              Seçildi
            </span>
          )}
        </div>

        <div className="relative">
          <div className="rounded-[1.4rem] border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <div className="flex items-center gap-3 rounded-[1.1rem] bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={selected ? selectedLabel : placeholder}
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearch("")}
                  className="rounded-full bg-slate-200 p-1 text-slate-500 transition hover:bg-slate-900 hover:text-white"
                  aria-label="Aramayı temizle"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {showResults && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-80 overflow-y-auto rounded-[1.4rem] border border-slate-200 bg-white p-2 shadow-2xl">
              {list.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(product.id, product);
                    onSearch(`${product.publisher} • ${product.name}`);
                  }}
                  className={`block w-full rounded-2xl px-4 py-3 text-left transition hover:bg-blue-50 ${String(value) === String(product.id) ? "bg-blue-50 text-blue-800" : "text-slate-700"}`}
                >
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-black leading-5 text-slate-900">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {product.publisher || "-"} • {product.classLevel || "-"}
                      </p>
                    </div>
                    <div className="shrink-0 text-left md:text-right">
                      <p className="font-mono text-[11px] font-black text-slate-500">
                        {product.barcode || "Barkod yok"}
                      </p>
                      <p className="mt-1 text-xs font-black text-blue-700">
                        {formatCurrency(product.price || 0)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {!list.length && (
                <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold text-slate-400">
                  Eşleşen ürün bulunamadı. Farklı bir ürün adı, barkod veya ürün
                  kodu dene.
                </div>
              )}
            </div>
          )}
        </div>

        {selected && (
          <div className="grid gap-3 rounded-[1.4rem] bg-slate-50 p-4 ring-1 ring-slate-100 md:grid-cols-[1fr_auto] md:items-start">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                Seçilen ürün
              </p>
              <p className="mt-1 text-sm font-black leading-5 text-slate-950">
                {selected.name}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {selected.publisher || "-"} • {selected.classLevel || "-"} •
                Ürün kodu: {selected.productCode || "-"}
              </p>
              <p className="mt-1 break-all font-mono text-[11px] font-black text-slate-500">
                Barkod: {selected.barcode || "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-left ring-1 ring-slate-100 md:text-right">
              <p className="text-[11px] font-black uppercase text-slate-400">
                Liste fiyatı
              </p>
              <p className="mt-1 text-lg font-black text-slate-950">
                {formatCurrency(selected.price || 0)}
              </p>
            </div>
          </div>
        )}

        {helper && <p className="text-xs font-bold text-slate-500">{helper}</p>}
      </div>
    );
  };

  const ManualProductSearchBox = ({
    label,
    value,
    searchValue,
    onSearchChange,
    onSelect,
    disabled = false,
    helper,
    suggested,
  }) => {
    const selected = getProductById(value);
    const results = getManualProductResults(searchValue);
    const hasSearch = normalizeText(searchValue).length > 0;
    const showResults =
      hasSearch &&
      (!selected || searchValue !== `${selected.publisher} • ${selected.name}`);
    return (
      <div className="relative grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">
            {label}
          </span>
          {suggested && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-100">
              Öneri bulundu
            </span>
          )}
        </div>
        <div
          className={`rounded-[1.4rem] border bg-white p-2 shadow-sm transition ${disabled ? "opacity-60" : "focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"}`}
        >
          <div className="flex items-center gap-3 rounded-[1.1rem] bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
            <Search size={19} className="shrink-0 text-blue-700" />
            <input
              disabled={disabled}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                disabled
                  ? "Önce ana ürünü seç"
                  : "Ürün adı, yayınevi, barkod veya ürün kodu yaz"
              }
              className="min-w-0 flex-1 bg-transparent text-sm font-black text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              autoComplete="off"
            />
            {searchValue && !disabled && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect("", null, "")}
                className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-slate-500 ring-1 ring-slate-200 hover:bg-slate-950 hover:text-white"
              >
                Temizle
              </button>
            )}
          </div>
          {!hasSearch && !selected && !disabled && (
            <div className="mt-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-400">
              Yazdıkça ürün havuzundaki eşleşmeler burada açılır. Tüm ürünler
              boşken listelenmez.
            </div>
          )}
        </div>

        {showResults && !disabled && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-80 overflow-y-auto rounded-[1.35rem] border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-slate-100">
            {results.map((product, index) => {
              const isSelected = String(value) === String(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    onSelect(
                      product.id,
                      product,
                      `${product.publisher} • ${product.name}`,
                    )
                  }
                  className={`block w-full rounded-2xl px-4 py-3 text-left transition ${isSelected ? "bg-blue-50 text-blue-800" : index === 0 ? "bg-slate-50 hover:bg-blue-50" : "hover:bg-blue-50"}`}
                >
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-950">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {product.publisher} •{" "}
                        {product.classLevel || "Sınıf yok"}
                      </p>
                      <p className="mt-2 break-all font-mono text-[11px] font-bold text-slate-400">
                        {product.barcode || "Barkod yok"}
                      </p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-sm font-black text-blue-700">
                        {formatCurrency(product.price || 0)}
                      </p>
                      <p className="mt-1 font-mono text-[11px] font-bold text-slate-400">
                        {product.productCode || "Kod yok"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {!results.length && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-400">
                Seçili grup/sınıf ve arama metniyle eşleşen ürün bulunamadı.
              </div>
            )}
          </div>
        )}

        {selected && (
          <div className="rounded-[1.25rem] border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Seçili ürün
            </p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {selected.name}
            </p>
            <div className="mt-3 grid gap-2 text-xs font-black text-slate-600 sm:grid-cols-2">
              <span>
                Yayınevi:{" "}
                <b className="text-slate-950">{selected.publisher || "—"}</b>
              </span>
              <span>
                Fiyat:{" "}
                <b className="text-blue-700">
                  {formatCurrency(selected.price || 0)}
                </b>
              </span>
              <span className="sm:col-span-2">
                Barkod:{" "}
                <b className="break-all font-mono text-slate-950">
                  {selected.barcode || "—"}
                </b>
              </span>
              <span>
                Ürün kodu:{" "}
                <b className="font-mono text-slate-950">
                  {selected.productCode || "—"}
                </b>
              </span>
              <span>
                Stok:{" "}
                <b className="text-slate-950">
                  {Number(selected.stock ?? selected.quantity ?? 0) || "—"}
                </b>
              </span>
            </div>
          </div>
        )}
        {helper && <p className="text-xs font-bold text-slate-500">{helper}</p>}
      </div>
    );
  };

  const renderSearchableExamPicker = () => {
    const handleSelectA = (id, product, text) => {
      const suggestedB = product ? findSuggestedPairProduct(product) : null;
      setManualOrder((current) => ({
        ...current,
        productAId: id,
        examId: id,
        productASearch: text,
        productBId: suggestedB?.id || "",
        productBSearch: suggestedB
          ? `${suggestedB.publisher} • ${suggestedB.name}`
          : "",
      }));
    };
    const handleSelectB = (id, product, text) => {
      setManualOrder((current) => ({
        ...current,
        productBId: id,
        productBSearch: text,
      }));
    };

    return (
      <div className="grid gap-5">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-700">
            2. Ürün / deneme seçimi
          </p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">
            Ürün havuzundan ürün seç
          </h3>
          <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-500">
            Ürün adı, yayınevi, barkod veya ürün kodu ile ara. Seçilen ürün bir
            denemenin A/B kitapçığıysa sistem eş kitapçığı altta önerir;
            kullanıcı öneriyi kontrol edip değiştirebilir.
          </p>
        </div>

        <div className="rounded-[1.7rem] bg-slate-50 p-4 ring-1 ring-slate-100">
          {ManualProductSearchBox({
            label: "Ürün / deneme",
            value: manualOrder.productAId,
            searchValue: manualOrder.productASearch,
            onSearchChange: (value) =>
              setManualOrder((current) => ({
                ...current,
                productAId: "",
                examId: "",
                productBId: "",
                productBSearch: "",
                productASearch: value,
              })),
            onSelect: handleSelectA,
            helper:
              "Boşken tüm ürünler listelenmez. Yazdıkça seçili grup ve sınıfa göre ürün havuzundan sonuçlar gelir.",
          })}
        </div>

        {selectedManualNeedsPair && (
          <div className="rounded-[1.7rem] border border-blue-100 bg-blue-50/70 p-4">
            <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                  Eş kitapçık kontrolü
                </p>
                <h4 className="text-xl font-black text-slate-950">
                  Tamamlayıcı ürün
                </h4>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  Seçtiğin ürün A ise B, B ise A kitapçığı önerilir. Doğru
                  değilse alandan yeniden ara.
                </p>
              </div>
              {selectedManualSuggestedBProduct && (
                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                  Eş ürün otomatik önerildi
                </span>
              )}
            </div>
            {ManualProductSearchBox({
              label: "Eş kitapçık / tamamlayıcı ürün",
              value: manualOrder.productBId,
              searchValue: manualOrder.productBSearch,
              onSearchChange: (value) =>
                setManualOrder((current) => ({
                  ...current,
                  productBId: "",
                  productBSearch: value,
                })),
              onSelect: handleSelectB,
              disabled: false,
              suggested: Boolean(
                selectedManualSuggestedBProduct && !selectedManualBProduct,
              ),
              helper:
                "Önerilen eş ürün doğru değilse bu kutudan arayıp değiştirebilirsin. Tekil kitaplarda bu alan açılmaz.",
            })}
          </div>
        )}
      </div>
    );
  };

  const ProductPoolSection = () => (
    <section className="grid min-w-0 gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-br from-white via-white to-blue-50/60 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-700">
                Ürün havuzu
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Sistemin ana ürün kaynağı
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                Depo, yayınevi, vitrin ve sipariş ekranları buradaki temel ürün
                bilgilerinden beslenir. Tablo sade kalır; stok, vitrin ve fatura
                ayrıntıları kendi modüllerinde yönetilir.
              </p>
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-2 rounded-[1.4rem] bg-white p-2 ring-1 ring-slate-200">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-2xl font-black text-slate-950">
                  {productPool.length}
                </p>
                <p className="text-[11px] font-black uppercase text-slate-500">
                  Toplam
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-2xl font-black text-slate-950">
                  {poolPublishers.length}
                </p>
                <p className="text-[11px] font-black uppercase text-slate-500">
                  Yayınevi
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-2xl font-black text-slate-950">
                  {filteredPool.length}
                </p>
                <p className="text-[11px] font-black uppercase text-slate-500">
                  Listelenen
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5">
          <div className="grid gap-3 xl:grid-cols-[1fr_220px_180px]">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 focus-within:bg-white focus-within:ring-blue-300">
              <Search size={18} className="shrink-0 text-blue-700" />
              <input
                value={poolSearch}
                onChange={(e) => setPoolSearch(e.target.value)}
                placeholder="Ürün adı, yayınevi, barkod/ISBN, ürün kodu, branş, kategori veya sınav tipi ara"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
              />
              {poolSearch && (
                <button
                  onClick={() => setPoolSearch("")}
                  className="rounded-full bg-white p-1 text-slate-400 ring-1 ring-slate-200 hover:bg-slate-950 hover:text-white"
                  title="Aramayı temizle"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={poolPublisherFilter}
              onChange={(e) => setPoolPublisherFilter(e.target.value)}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-blue-300"
            >
              <option value="Tümü">Tüm yayınevleri</option>
              {poolPublishers.map((publisher) => (
                <option key={publisher} value={publisher}>
                  {publisher}
                </option>
              ))}
            </select>
            <select
              value={poolClassFilter}
              onChange={(e) => setPoolClassFilter(e.target.value)}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-blue-300"
            >
              <option value="Tümü">Tüm sınıflar</option>
              {poolClasses.map((classLevel) => (
                <option key={classLevel} value={classLevel}>
                  {classLevel}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              value={poolExamFilter}
              onChange={(e) => setPoolExamFilter(e.target.value)}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-blue-300"
            >
              <option value="Tümü">Tüm sınav tipleri</option>
              {poolExamTypes.map((examType) => (
                <option key={examType} value={examType}>
                  {examType}
                </option>
              ))}
            </select>
            <select
              value={poolTypeFilter}
              onChange={(e) => setPoolTypeFilter(e.target.value)}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-blue-300"
            >
              <option value="Tümü">Tüm türler</option>
              {poolTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={poolCategoryFilter}
              onChange={(e) => setPoolCategoryFilter(e.target.value)}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-blue-300"
            >
              <option value="Tümü">Tüm kategoriler</option>
              {poolCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={poolSourceFilter}
              onChange={(e) => setPoolSourceFilter(e.target.value)}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-blue-300"
            >
              <option value="Tümü">Tüm kaynaklar</option>
              {productSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.6rem] bg-slate-50 p-3 ring-1 ring-slate-200 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Ürün aktarım işlemleri
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Akson, Excel veya manuel giriş aynı temel ürün alanlarına kayıt
                açar.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={importAksonSample}
                className="inline-flex items-center rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                <Store size={16} className="mr-2" />
                Akson'dan çek
              </button>
              <label className="inline-flex cursor-pointer items-center rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-950 hover:text-white">
                <Upload size={16} className="mr-2" />
                Excel yükle
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    handleExcelImport(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setManualProductOpen(true)}
                className="inline-flex items-center rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-950 hover:text-white"
              >
                <Plus size={16} className="mr-2" />
                Manuel ürün ekle
              </button>
            </div>
          </div>

          {excelImportMessage && (
            <div className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
              <FileSpreadsheet size={16} className="mr-2 inline" />
              {excelImportMessage}
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-700">
                Excel tablo görünümü
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Ürün listesi
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Varsayılan sıralama yayınevine göre alfabetiktir.
              </p>
            </div>
            {(poolSearch ||
              poolPublisherFilter !== "Tümü" ||
              poolClassFilter !== "Tümü" ||
              poolExamFilter !== "Tümü" ||
              poolTypeFilter !== "Tümü" ||
              poolCategoryFilter !== "Tümü" ||
              poolSourceFilter !== "Tümü") && (
              <button
                onClick={() => {
                  setPoolSearch("");
                  setPoolPublisherFilter("Tümü");
                  setPoolClassFilter("Tümü");
                  setPoolExamFilter("Tümü");
                  setPoolTypeFilter("Tümü");
                  setPoolCategoryFilter("Tümü");
                  setPoolSourceFilter("Tümü");
                }}
                className="w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-950 hover:text-white"
              >
                Filtreleri temizle
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[620px] max-w-full overflow-auto">
          <table className="w-full min-w-[1120px] table-fixed border-separate border-spacing-0 text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
              <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                <th className="w-[300px] border-b border-slate-200 px-3 py-2.5 font-black">
                  Ürün
                </th>
                <th className="w-[170px] border-b border-slate-200 px-3 py-2.5 font-black">
                  Yayınevi
                </th>
                <th className="w-[210px] border-b border-slate-200 px-3 py-2.5 font-black">
                  Eğitim bilgisi
                </th>
                <th className="w-[210px] border-b border-slate-200 px-3 py-2.5 font-black">
                  Tür / kategori
                </th>
                <th className="w-[120px] border-b border-slate-200 px-3 py-2.5 font-black">
                  Fiyat
                </th>
                <th className="w-[150px] border-b border-slate-200 px-3 py-2.5 font-black">
                  Barkod / ISBN
                </th>
                <th className="w-[100px] border-b border-slate-200 px-3 py-2.5 text-right font-black">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPool.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <p className="text-lg font-black text-slate-800">
                      Ürün bulunamadı
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Arama veya filtreleri değiştirerek tekrar deneyebilirsin.
                    </p>
                  </td>
                </tr>
              )}
              {filteredPool.map((p, index) => (
                <tr
                  key={p.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50/70"} transition hover:bg-blue-50/50`}
                >
                  <td className="border-b border-slate-100 px-3 py-2.5 align-top">
                    <span
                      title={p.name || "-"}
                      className="block truncate text-[13px] font-black leading-5 text-slate-950"
                    >
                      {p.name || "-"}
                    </span>
                    <span
                      title={p.productCode || "-"}
                      className="mt-1.5 block truncate font-mono text-[10.5px] font-bold text-slate-500"
                    >
                      Ürün kodu: {p.productCode || "-"}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 align-top">
                    <p
                      title={p.publisher || "-"}
                      className="truncate font-black text-slate-900"
                    >
                      {p.publisher || "-"}
                    </p>
                    <p
                      title={p.productType || "Ürün tipi yok"}
                      className="mt-1 truncate text-[11px] font-bold text-slate-500"
                    >
                      {p.productType || "Ürün tipi yok"}
                    </p>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 align-top">
                    <div className="flex min-w-0 flex-wrap gap-1">
                      <Pill compact>{p.classLevel || "Sınıf yok"}</Pill>
                      <Pill compact tone="blue">
                        {p.examType || "Sınav yok"}
                      </Pill>
                    </div>
                    <p
                      title={`Branş: ${p.branch || "-"} • Düzey: ${p.level || "-"}`}
                      className="mt-1.5 truncate text-[11px] font-bold text-slate-500"
                    >
                      Branş: {p.branch || "-"} • Düzey: {p.level || "-"}
                    </p>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 align-top">
                    <p
                      title={p.type || "-"}
                      className="truncate font-black text-slate-800"
                    >
                      {p.type || "-"}
                    </p>
                    <p
                      title={`${p.category || "-"}${p.kind ? ` • ${p.kind}` : ""}`}
                      className="mt-1 truncate text-[11px] font-bold text-slate-500"
                    >
                      {p.category || "-"} {p.kind ? `• ${p.kind}` : ""}
                    </p>
                    {p.ignoreDiscount && (
                      <p className="mt-1.5 truncate text-[10.5px] font-black text-amber-700">
                        İskonto yoksayılır
                      </p>
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 align-top">
                    <p className="whitespace-nowrap font-black text-slate-950">
                      {formatCurrency(p.price)}
                    </p>
                    <p
                      title={`Son alım: ${formatCurrency(Number(p.lastPurchaseUnitPrice || p.purchasePrice || 0))}`}
                      className="mt-1 truncate text-[10.5px] font-bold text-slate-500"
                    >
                      Son alım:{" "}
                      {formatCurrency(
                        Number(p.lastPurchaseUnitPrice || p.purchasePrice || 0),
                      )}
                    </p>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 align-top">
                    <p
                      title={p.isbn || p.barcode || "-"}
                      className="truncate font-mono text-[11px] font-black text-slate-800"
                    >
                      {p.isbn || p.barcode || "-"}
                    </p>
                    <p
                      title={
                        p.barcode && p.isbn && p.barcode !== p.isbn
                          ? p.barcode
                          : "Barkod / ISBN"
                      }
                      className="mt-1 truncate text-[10.5px] font-bold text-slate-500"
                    >
                      Barkod / ISBN
                    </p>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 align-top text-right">
                    <button
                      onClick={() => setEditingProduct({ ...p })}
                      className="rounded-full bg-white px-2.5 py-1.5 text-[11px] font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-950 hover:text-white"
                    >
                      <Edit3 size={13} className="mr-1 inline" />
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const ProductFormModal = ({ mode, product, onClose }) => {
    const [draft, setDraft] = useState(product || manualRawProduct);
    const isEdit = mode === "edit";

    return (
      <Modal
        title={isEdit ? "Ürün bilgilerini düzenle" : "Manuel ürün ekle"}
        eyebrow="Ürün havuzu"
        onClose={onClose}
        width="max-w-4xl"
      >
        <div className="rounded-[1.6rem] bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500 ring-1 ring-slate-200">
          Ürün Havuzu sadece temel ürün bilgilerini tutar. Depo, stok, vitrin ve
          fatura işlemleri bu kayıtları referans alır. Geçmiş siparişler kendi
          kayıt anındaki bilgileri saklamaya devam eder.
        </div>

        <div className="mt-5 grid gap-5">
          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              Temel bilgiler
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminInput
                label="Ürün adı"
                value={draft.name || ""}
                onChange={(v) => setDraft({ ...draft, name: v })}
              />
              <AdminInput
                label="Yayınevi"
                value={draft.publisher || ""}
                onChange={(v) => setDraft({ ...draft, publisher: v })}
              />
              <AdminInput
                label="Ürün tipi"
                value={draft.productType || ""}
                onChange={(v) => setDraft({ ...draft, productType: v })}
                options={["", ...productCategories]}
              />
              <AdminInput
                label="Kaynak"
                value={draft.source || "Manuel"}
                onChange={(v) => setDraft({ ...draft, source: v })}
                options={productSources}
              />
              <AdminInput
                label="ISBN"
                value={draft.isbn || ""}
                onChange={(v) => setDraft({ ...draft, isbn: v })}
              />
              <AdminInput
                label="Barkod numarası"
                value={draft.barcode || ""}
                onChange={(v) => setDraft({ ...draft, barcode: v })}
              />
              <AdminInput
                label="Ürün kodu"
                value={draft.productCode || ""}
                onChange={(v) => setDraft({ ...draft, productCode: v })}
              />
              <AdminInput
                label="Durum"
                value={draft.active === false ? "Pasif" : "Aktif"}
                onChange={(v) => setDraft({ ...draft, active: v === "Aktif" })}
                options={["Aktif", "Pasif"]}
              />
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              Eğitim bilgileri
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AdminInput
                label="Sınıf"
                value={draft.classLevel || ""}
                onChange={(v) => setDraft({ ...draft, classLevel: v })}
                options={[
                  "",
                  ...classOptionsByGroup.Lise,
                  ...classOptionsByGroup.Ortaokul,
                ]}
              />
              <AdminInput
                label="Sınav tipi"
                value={draft.examType || ""}
                onChange={(v) => setDraft({ ...draft, examType: v })}
                options={["", ...productExamTypes]}
              />
              <AdminInput
                label="Branş"
                value={draft.branch || ""}
                onChange={(v) => setDraft({ ...draft, branch: v })}
              />
              <AdminInput
                label="Düzey"
                value={draft.level || ""}
                onChange={(v) => setDraft({ ...draft, level: v })}
                options={["", ...productLevels]}
              />
              <AdminInput
                label="Tür"
                value={draft.type || ""}
                onChange={(v) => setDraft({ ...draft, type: v })}
                options={["", ...productTypes]}
              />
              <AdminInput
                label="Kategori"
                value={draft.category || ""}
                onChange={(v) => setDraft({ ...draft, category: v })}
                options={["", ...productCategories]}
              />
              <AdminInput
                label="Cins"
                value={draft.kind || ""}
                onChange={(v) => setDraft({ ...draft, kind: v })}
              />
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              Fiyat ve iskonto bilgileri
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <AdminInput
                label="Liste fiyatı / KDV dahil satış"
                type="number"
                value={draft.price || 0}
                onChange={(v) => setDraft({ ...draft, price: v })}
              />
              <AdminInput
                label="Alım fiyatı / KDV dahil"
                type="number"
                value={draft.purchasePrice || 0}
                onChange={(v) => setDraft({ ...draft, purchasePrice: v })}
              />
              <AdminInput
                label="Son alım birim fiyat"
                type="number"
                value={draft.lastPurchaseUnitPrice || 0}
                onChange={(v) =>
                  setDraft({ ...draft, lastPurchaseUnitPrice: v })
                }
              />
              <AdminInput
                label="Son alım ind. (%)"
                type="number"
                value={draft.lastPurchaseDiscount || 0}
                onChange={(v) =>
                  setDraft({ ...draft, lastPurchaseDiscount: v })
                }
              />
            </div>
            <label className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
              <input
                type="checkbox"
                checked={Boolean(draft.ignoreDiscount)}
                onChange={(e) =>
                  setDraft({ ...draft, ignoreDiscount: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-amber-300"
              />
              <span>
                Bu üründe kurum/yayınevi iskontolarını yoksay
                <span className="mt-1 block text-xs font-semibold text-amber-700">
                  Axon Excel'indeki “Ürün İndirimlerini Yoksay” alanına karşılık
                  gelir.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-[1.6rem] bg-blue-50 p-4 ring-1 ring-blue-100 md:grid-cols-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-blue-700">
              Yayınevi
            </p>
            <p className="mt-1 truncate text-sm font-black text-slate-950">
              {draft.publisher || "-"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-blue-700">
              ISBN / Barkod
            </p>
            <p className="mt-1 break-all font-mono text-sm font-black text-slate-950">
              {draft.isbn || draft.barcode || "-"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-blue-700">
              Sınıf / sınav
            </p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {draft.classLevel || "-"}{" "}
              {draft.examType ? `• ${draft.examType}` : ""}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-blue-700">
              Fiyat
            </p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {formatCurrency(Number(draft.price || 0))}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-200"
          >
            Vazgeç
          </button>
          <button
            onClick={() => saveManualProduct(draft, isEdit ? draft.id : null)}
            className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
          >
            {isEdit ? "Değişiklikleri kaydet" : "Ürünü kaydet"}
          </button>
        </div>
      </Modal>
    );
  };

  const Header = () => (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-700">
            Noxelera
          </p>
          <h1 className="text-2xl font-black text-slate-950 lg:text-3xl">
            Yönetim Paneli
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onPortalOpen}
            className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100"
          >
            <Eye size={14} className="mr-1 inline" /> Kurum önizleme
          </button>
          <button
            onClick={onLogout}
            className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white"
          >
            <LogOut size={14} className="mr-1 inline" /> Çıkış
          </button>
        </div>
      </div>
    </header>
  );

  const DashboardSection = () => {
    const dashboardOrders = orders.slice(0, 3);
    const operationStatuses = ["Onay bekliyor", "Onaylandı", "Teslim edildi"];
    const maxOperationCount = Math.max(
      1,
      ...operationStatuses.map(
        (status) => orders.filter((order) => order.status === status).length,
      ),
    );

    return (
      <section className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            icon={<ShoppingCart size={22} />}
            title="Toplam Sipariş"
            value={orders.length}
            subtitle={`${pendingOrders} onay bekliyor`}
          />
          <AdminStatCard
            icon={<BarChart3 size={22} />}
            title="Ciro"
            value={formatCurrency(totalRevenue)}
            subtitle="İptaller hariç toplam"
          />
          <AdminStatCard
            icon={<BookOpen size={22} />}
            title="Aktif Deneme"
            value={activeExamCount}
            subtitle={`${exams.length} kayıt içinde`}
          />
          <AdminStatCard
            icon={<Store size={22} />}
            title="Aktif Dershane"
            value={activeCustomerCount}
            subtitle={`${customers.length} toplam kurum`}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.75fr_1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                  Son siparişler
                </p>
                <h2 className="text-2xl font-black text-slate-950">
                  Sipariş akışı
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("orders")}
                className="rounded-full bg-blue-50 px-5 py-3 text-xs font-black text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
              >
                Tümünü gör
              </button>
            </div>

            <div className="grid gap-3">
              {dashboardOrders.map((order) => (
                <button
                  key={`${order.id}-${order.item}-dashboard-flow`}
                  onClick={() => setSelectedOrder(enrichOrderForDetail(order))}
                  className="rounded-2xl bg-slate-50 px-4 py-4 text-left ring-1 ring-slate-100 transition hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-slate-950">
                        {order.item}
                      </p>
                      <p className="mt-2 truncate text-sm font-semibold text-slate-500">
                        {order.institution} • {order.quantity} adet •{" "}
                        {order.createdAt || order.date}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Pill
                        tone={
                          order.status === "İptal edildi"
                            ? "red"
                            : order.status === "Teslim edildi"
                              ? "green"
                              : order.status === "Onay bekliyor"
                                ? "amber"
                                : "blue"
                        }
                      >
                        {order.status}
                      </Pill>
                      <span className="text-base font-black text-blue-700">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              {!dashboardOrders.length && (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  Henüz sipariş yok.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-wide text-blue-700">
              Durum Özeti
            </p>
            <h2 className="mb-6 text-2xl font-black text-slate-950">
              Operasyon
            </h2>
            <div className="grid gap-4">
              {operationStatuses.map((status) => {
                const count = orders.filter(
                  (order) => order.status === status,
                ).length;
                const width = `${Math.max(8, Math.round((count / maxOperationCount) * 100))}%`;
                return (
                  <div
                    key={status}
                    className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-black text-slate-950">
                        {status}
                      </span>
                      <span className="font-black text-slate-950">{count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-700"
                        style={{ width }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const OrdersSection = () => {
    const trackingStatuses = [
      "Onaylandı",
      "Hazır",
      "Teslim edildi",
      "İptal edildi",
    ];
    return (
      <section className="grid gap-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "requests", label: "Kurum Talepleri" },
            { id: "tracking", label: "Sipariş Takip" },
            { id: "manual", label: "Admin Siparişi Oluştur" },
            { id: "history", label: "Geçmiş Siparişler" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOrderSubTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-black ${orderSubTab === tab.id ? "bg-blue-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {orderSubTab === "requests" && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-wide text-blue-700">
              Kurum talepleri
            </p>
            <h2 className="mb-5 text-2xl font-black">
              Onay bekleyen siparişler
            </h2>
            <div className="grid gap-3">
              {requestOrders.length ? (
                requestOrders.map((order) => renderOrderCard(order, true))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  Onay bekleyen kurum talebi yok.
                </div>
              )}
            </div>
          </div>
        )}
        {orderSubTab === "tracking" && (
          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                    Sipariş takip
                  </p>
                  <h2 className="text-2xl font-black">
                    Aktif ve tamamlanan sipariş akışı
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Durumlar tam genişlikli modüller halinde listelenir.
                    Satırlarda sadece ürün adı, kurum ve adet görünür; Akson,
                    fiyat ve tarih/saat detayları detay kutusundadır.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <AdminInput
                    label="Durum filtresi"
                    value={orderFilter}
                    onChange={setOrderFilter}
                    options={orderStatuses}
                  />
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {trackingStatuses.map((status) => (
                  <div
                    key={status}
                    className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      {status}
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {trackingOrders.filter((o) => o.status === status).length}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-6">
              {trackingStatuses.map((status) => {
                const statusOrders = trackingOrders.filter(
                  (o) => o.status === status,
                );
                return (
                  <div
                    key={status}
                    className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-black text-slate-950">
                          {status}
                        </h3>
                        <p className="text-sm font-bold text-slate-500">
                          Bu modül içinde çok sayıda sipariş satır olarak takip
                          edilir.
                        </p>
                      </div>
                      <Pill
                        tone={
                          status === "İptal edildi"
                            ? "red"
                            : status === "Teslim edildi"
                              ? "green"
                              : "blue"
                        }
                      >
                        {statusOrders.length} sipariş
                      </Pill>
                    </div>
                    <div className="mb-3 hidden rounded-2xl bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400 lg:grid lg:gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(180px,0.75fr)_110px_minmax(250px,auto)]">
                      <span>Ürün adı</span>
                      <span>Kurum</span>
                      <span>Adet</span>
                      <span className="text-right">İşlem</span>
                    </div>
                    <div className="max-h-[520px] overflow-y-auto pr-1">
                      <div className="grid gap-3">
                        {statusOrders.map((order) =>
                          renderTrackingOrderRow(order),
                        )}
                        {!statusOrders.length && (
                          <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-400">
                            Bu durumda sipariş yok.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setOrderSubTab("history")}
              className="justify-self-start rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
            >
              Geçmiş siparişlere git
            </button>
          </div>
        )}
        {orderSubTab === "manual" && (
          <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-br from-white to-blue-50/60 p-6">
              <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                Admin siparişi
              </p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">
                Sipariş oluştur
              </h2>
              <p className="mt-2 max-w-5xl text-sm font-semibold leading-6 text-slate-500">
                Sipariş artık tek modül içinde sıralı şekilde oluşturulur. Önce
                temel bilgiler, sonra ürün seçimi, ardından adet ve
                iskonto/fiyat hesaplaması, son olarak işlem tercihleri ve not
                girilir.
              </p>
            </div>

            <div className="grid gap-8 p-6">
              <section className="grid gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                    1. Temel bilgiler
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-950">
                    Grup, sınıf ve kurum
                  </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <AdminInput
                    label="Grup"
                    value={manualOrder.group}
                    onChange={(v) =>
                      setManualOrder({
                        ...manualOrder,
                        group: v,
                        grade: classOptionsByGroup[v][0],
                        productASearch: "",
                        productBSearch: "",
                        productAId: "",
                        productBId: "",
                        examId: "",
                      })
                    }
                    options={["Lise", "Ortaokul"]}
                  />
                  <AdminInput
                    label="Sınıf"
                    value={manualOrder.grade}
                    onChange={(v) =>
                      setManualOrder({
                        ...manualOrder,
                        grade: v,
                        productASearch: "",
                        productBSearch: "",
                        productAId: "",
                        productBId: "",
                        examId: "",
                      })
                    }
                    options={classOptionsByGroup[manualOrder.group]}
                  />
                  <AdminInput
                    label="Kurum"
                    value={manualOrder.institutionId}
                    onChange={(v) => {
                      const customer = customers.find(
                        (c) => String(c.id) === String(v),
                      );
                      setManualOrder({
                        ...manualOrder,
                        institutionId: v,
                        discountRate: customer?.discountRate ?? 0,
                      });
                    }}
                    options={customers.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                  />
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              <section>{renderSearchableExamPicker()}</section>

              <div className="h-px bg-slate-100" />

              <section className="grid gap-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                      3. Adet ve fiyat
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-slate-950">
                      Kurum iskontosu uygulanır
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      İskonto oranı seçili kuruma göre otomatik gelir; bu
                      siparişe özel elle değiştirilebilir.
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-50 px-4 py-2 text-xs font-black text-slate-500 ring-1 ring-slate-100">
                    Seçili kurum:{" "}
                    <span className="text-slate-950">
                      {selectedManualCustomer?.name || "—"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-[220px_repeat(5,minmax(0,1fr))]">
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <AdminInput
                      label="Adet"
                      type="number"
                      value={manualOrder.quantity}
                      onChange={(v) =>
                        setManualOrder({ ...manualOrder, quantity: v })
                      }
                    />
                    <p className="mt-2 text-xs font-black text-slate-500">
                      Depo stoku:{" "}
                      {selectedManualExam ? selectedManualStock || "—" : "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Bileşen
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {selectedManualComponents.length || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Liste toplam
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {formatCurrency(manualOrderListTotal)}
                    </p>
                  </div>
                  <label className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                    <span className="text-xs font-black uppercase tracking-wide text-blue-700">
                      İskonto %
                    </span>
                    <input
                      type="number"
                      value={manualOrder.discountRate}
                      onChange={(e) =>
                        setManualOrder((current) => ({
                          ...current,
                          discountRate: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-xl font-black text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      İskonto tutarı
                    </p>
                    <p className="mt-1 text-2xl font-black text-rose-600">
                      -{formatCurrency(manualOrderDiscountAmount)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      İskontolu fiyat
                    </p>
                    <p className="mt-1 text-2xl font-black text-emerald-700">
                      {formatCurrency(manualOrderDiscountedTotal)}
                    </p>
                  </div>
                </div>

                {manualOrderPricedComponents.length > 0 && (
                  <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                          Akson / fatura dağılımı
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-600">
                          Toplam adet kitapçıklara bölünür. Tek sayıda fazla
                          adet, ilk seçilen bileşene yazılır.
                        </p>
                      </div>
                      <p className="text-sm font-black text-slate-950">
                        Toplam: {manualOrderQuantity} adet
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {manualOrderPricedComponents.map((component, index) => (
                        <div
                          key={`${component.id || component.name}-${index}`}
                          className="rounded-2xl bg-white p-4 ring-1 ring-blue-100"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                {getComponentPartLabel(component, index)}
                              </p>
                              <p className="mt-1 text-sm font-black text-slate-950">
                                {component.name}
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-500">
                                {component.publisher || "—"}
                              </p>
                            </div>
                            <Pill tone="blue">
                              {component.componentQty} adet
                            </Pill>
                          </div>
                          <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600 sm:grid-cols-2">
                            <span>
                              Barkod:{" "}
                              <b className="break-all font-mono text-slate-950">
                                {component.barcode || "—"}
                              </b>
                            </span>
                            <span>
                              Ürün kodu:{" "}
                              <b className="font-mono text-slate-950">
                                {component.productCode || "—"}
                              </b>
                            </span>
                            <span>
                              Birim fiyat:{" "}
                              <b className="text-slate-950">
                                {formatCurrency(component.unitPrice)}
                              </b>
                            </span>
                            <span>
                              Satır toplamı:{" "}
                              <b className="text-blue-700">
                                {formatCurrency(component.lineTotal)}
                              </b>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <div className="h-px bg-slate-100" />

              <section className="grid gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                    4. İşlem tercihleri
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-950">
                    Akson ve depo işlemleri
                  </h3>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-slate-50 px-5 py-4 ring-1 ring-slate-100">
                    <div>
                      <p className="text-base font-black text-slate-950">
                        Fatura kes
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Seçili ürün dağılımına göre Fatura kesimi yapılır.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={manualOrder.invoiceAkson}
                      onChange={(e) =>
                        setManualOrder((current) => ({
                          ...current,
                          invoiceAkson: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 accent-blue-700"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-slate-50 px-5 py-4 ring-1 ring-slate-100">
                    <div>
                      <p className="text-base font-black text-slate-950">
                        Depodan stok düş
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Seçili ürün ve varsa eş kitapçık üzerinden stok hareketi
                        oluşturulur.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={manualOrder.deductStock}
                      onChange={(e) =>
                        setManualOrder((current) => ({
                          ...current,
                          deductStock: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 accent-blue-700"
                    />
                  </label>
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              <section className="grid gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                    5. Not ve oluşturma
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-950">
                    Siparişi takip ekranına gönder
                  </h3>
                </div>
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Not
                  </span>
                  <textarea
                    value={manualOrder.note}
                    onChange={(e) =>
                      setManualOrder({ ...manualOrder, note: e.target.value })
                    }
                    className="min-h-[150px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="Sipariş notu, özel hazırlama açıklaması..."
                  />
                </label>

                {selectedManualExam && (
                  <div className="rounded-[1.5rem] bg-blue-50 p-4 text-sm font-bold text-blue-900 ring-1 ring-blue-100">
                    Seçili ürün takip ekranına bileşenleriyle düşer:{" "}
                    <span className="font-black">
                      {selectedManualExam.title}
                    </span>{" "}
                    • İskontolu toplam:{" "}
                    <span className="font-black">
                      {formatCurrency(manualOrderDiscountedTotal)}
                    </span>
                    {selectedManualNeedsPair ? (
                      selectedManualBProduct ||
                      selectedManualSuggestedBProduct ? (
                        <span> • Eş kitapçık bağlı</span>
                      ) : (
                        <span> • Eş kitapçık henüz seçilmedi</span>
                      )
                    ) : (
                      <span> • Tekil ürün</span>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setManualOrderConfirmOpen(true)}
                    disabled={!selectedManualAProduct}
                    className="rounded-2xl bg-blue-700 px-7 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Sipariş oluştur
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
        {orderSubTab === "history" && renderHistorySection()}
      </section>
    );
  };

  const ShowcaseSection = () => {
    const activeSeason = selectedShowcaseSeason || showcaseSeasons[0];
    const selectedMonth =
      showcaseSeasonMonths.find((m) => m.id === showcaseMonthId) ||
      showcaseSeasonMonths[0];
    const monthOptions = showcaseSeasonMonthOptions.length
      ? showcaseSeasonMonthOptions
      : months.map((m) => ({ value: m.id, label: `${m.label} ${m.year}` }));
    const isExamProduct = Boolean(
      firstShowcaseProduct &&
      (getProductBookletLetter(firstShowcaseProduct) ||
        findSuggestedPairProduct(firstShowcaseProduct)),
    );
    const selectedPairProduct = getProductById(showcaseForm.productBId);
    const suggestedShowcasePairProduct = firstShowcaseProduct
      ? findSuggestedPairProduct(firstShowcaseProduct)
      : null;
    const pairMismatchWarning = Boolean(
      selectedPairProduct &&
      suggestedShowcasePairProduct &&
      String(selectedPairProduct.id) !==
        String(suggestedShowcasePairProduct.id),
    );
    const showcaseVisibilityText =
      showcaseForm.visibilityMode === "selected"
        ? `${showcaseForm.visibleCustomerIds?.length || 0} kurum seçili`
        : "Tüm kurumlar";
    const showcaseBasePrice = Number(
      showcaseForm.customPrice || firstShowcaseProduct?.price || 0,
    );
    const showcaseDiscountRate = Number(
      showcaseForm.discountRate ||
        getDiscountForPublisher(firstShowcaseProduct?.publisher) ||
        0,
    );
    const showcaseDiscountAmount = Math.round(
      showcaseBasePrice * (showcaseDiscountRate / 100),
    );
    const showcaseNetPrice = Math.max(
      0,
      showcaseBasePrice - showcaseDiscountAmount,
    );
    const isCustomerSpecificPricingEnabled = showcaseCustomerDiscountsOpen;
    const getShowcaseCustomerDiscount = (customer = {}) =>
      Number(
        showcaseForm.customerDiscounts?.[customer.id] ??
          customer.discountRate ??
          showcaseDiscountRate ??
          0,
      );
    const showcaseCustomerPricing = isCustomerSpecificPricingEnabled
      ? customers.map((customer) => {
          const customerDiscountRate = getShowcaseCustomerDiscount(customer);
          const customerDiscountAmount = Math.round(
            showcaseBasePrice * (customerDiscountRate / 100),
          );
          return {
            customerId: customer.id,
            customerName: customer.name,
            discountRate: customerDiscountRate,
            discountAmount: customerDiscountAmount,
            netPrice: Math.max(0, showcaseBasePrice - customerDiscountAmount),
          };
        })
      : [];
    const customerDiscountSummary = isCustomerSpecificPricingEnabled
      ? customers.length
        ? `${customers.length} kurum için özel fiyatlandırma açık`
        : "Henüz kurum kaydı yok"
      : `Kurum özel fiyatlandırma kapalı. Tüm kurumlara genel iskonto %${showcaseDiscountRate} uygulanır`;
    const currentProducts = exams.filter((exam) => {
      const sameMonth = exam.monthId === showcaseMonthId;
      const sameSeason = exam.seasonId
        ? exam.seasonId === activeSeason?.id
        : showcaseSeasonMonths.some((m) => m.id === exam.monthId);
      return sameMonth && sameSeason;
    });
    const seasonProductCount = exams.filter((exam) =>
      exam.seasonId
        ? exam.seasonId === activeSeason?.id
        : showcaseSeasonMonths.some((m) => m.id === exam.monthId),
    ).length;

    const setShowcaseMonthForSeason = (seasonId) => {
      const season = showcaseSeasons.find((item) => item.id === seasonId);
      setSelectedShowcaseSeasonId(seasonId);
      const start = Number(
        season?.startYear || seasonStartYear || new Date().getFullYear(),
      );
      const nextMonthId = `agustos-${start}`;
      setShowcaseMonthId(nextMonthId);
      setShowcaseForm((current) => ({
        ...current,
        monthId: nextMonthId,
        monthIds: [nextMonthId],
        orderDeadline: autoDeadlineForShowcaseMonth(nextMonthId, start),
      }));
    };

    const createNextShowcaseSeason = () => {
      const maxStart = Math.max(
        ...showcaseSeasons.map((season) => Number(season.startYear || 0)),
        Number(seasonStartYear || new Date().getFullYear()),
      );
      const nextStart = maxStart + 1;
      const nextSeason = {
        id: `season-${nextStart}`,
        startYear: nextStart,
        label: `${nextStart}-${nextStart + 1}`,
      };
      setShowcaseSeasons((current) => [...current, nextSeason]);
      setSelectedShowcaseSeasonId(nextSeason.id);
      const firstMonth = `agustos-${nextStart}`;
      setShowcaseMonthId(firstMonth);
      setShowcaseForm((current) => ({
        ...current,
        monthId: firstMonth,
        monthIds: [firstMonth],
        orderDeadline: autoDeadlineForShowcaseMonth(firstMonth, nextStart),
      }));
      setShowcaseMode("add");
      setSystemNotice({
        type: "success",
        title: "Yeni sezon oluşturuldu",
        text: `${nextSeason.label} sezonu için boş vitrin/takvim açıldı.`,
      });
    };

    const handleShowcaseMainProduct = (id, product) => {
      const suggestedPair = findSuggestedPairProduct(product);
      const productGroup =
        product?.classLevel?.includes("Sınıf") || product?.classLevel === "LGS"
          ? "Ortaokul"
          : "Lise";
      const suggestedName = cleanManualOrderTitle(product?.name || "");
      setShowcaseForm({
        ...showcaseForm,
        productType: suggestedPair ? "Deneme" : "Tekil ürün",
        productAId: id,
        productId: id,
        productBId: suggestedPair?.id || "",
        productBSearch: suggestedPair
          ? `${suggestedPair.publisher} • ${suggestedPair.name}`
          : "",
        vitrinName: showcaseForm.vitrinName || suggestedName,
        group: productGroup,
        level: product?.classLevel || showcaseForm.level,
        discountRate: getDiscountForPublisher(product?.publisher),
        customerDiscounts: Object.fromEntries(
          customers.map((customer) => [
            customer.id,
            Number(
              customer.discountRate ??
                getDiscountForPublisher(product?.publisher) ??
                0,
            ),
          ]),
        ),
        customPrice: product?.price || showcaseForm.customPrice,
        orderDeadline:
          showcaseForm.orderDeadline ||
          autoDeadlineForShowcaseMonth(
            showcaseForm.monthId,
            activeSeason?.startYear,
          ),
      });
    };

    const handleShowcasePairProduct = (id, product) => {
      setShowcaseForm((current) => ({
        ...current,
        productBId: id,
        productBSearch: `${product.publisher} • ${product.name}`,
      }));
    };

    const selectedShowcaseMonthIds =
      Array.isArray(showcaseForm.monthIds) && showcaseForm.monthIds.length
        ? showcaseForm.monthIds
        : [showcaseForm.monthId || showcaseMonthId].filter(Boolean);
    const selectedShowcaseMonths = showcaseSeasonMonths.filter((month) =>
      selectedShowcaseMonthIds.includes(month.id),
    );
    const toggleShowcaseFormMonth = (monthId) => {
      setShowcaseForm((current) => {
        const currentIds =
          Array.isArray(current.monthIds) && current.monthIds.length
            ? current.monthIds
            : [current.monthId || showcaseMonthId].filter(Boolean);
        const exists = currentIds.includes(monthId);
        const nextIds = exists
          ? currentIds.filter((id) => id !== monthId)
          : [...currentIds, monthId];
        const safeIds = nextIds.length ? nextIds : [monthId];
        return {
          ...current,
          monthIds: safeIds,
          monthId: safeIds[0],
          orderDeadline: autoDeadlineForShowcaseMonth(
            safeIds[0],
            activeSeason?.startYear,
          ),
        };
      });
    };
    const showcaseDeadlinePreview = selectedShowcaseMonths.map((month) => ({
      ...month,
      deadline: autoDeadlineForShowcaseMonth(month.id, activeSeason?.startYear),
    }));

    return (
      <section className="grid gap-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 p-6 text-white">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-300">
                  Vitrin / takvim
                </p>
                <h2 className="mt-1 text-3xl font-black">
                  Sezon ve ay bazlı deneme vitrini
                </h2>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
                  Bu modülün ana hedefi denemeleri kuruma tek ürün gibi
                  göstermek. Ürün havuzundaki A/B kitapçıkları arka planda bağlı
                  kalır; kurum panelinde vitrin adı görünür.
                </p>
              </div>
              <div className="flex rounded-full bg-white/10 p-1 ring-1 ring-white/10">
                <button
                  onClick={() => setShowcaseMode("add")}
                  className={`rounded-full px-4 py-2 text-sm font-black ${showcaseMode === "add" ? "bg-white text-slate-950" : "text-white/70"}`}
                >
                  Deneme Ekle
                </button>
                <button
                  onClick={() => setShowcaseMode("list")}
                  className={`rounded-full px-4 py-2 text-sm font-black ${showcaseMode === "list" ? "bg-white text-slate-950" : "text-white/70"}`}
                >
                  Vitrin
                </button>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-5 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
            <AdminInput
              label="Sezon"
              value={selectedShowcaseSeasonId}
              onChange={setShowcaseMonthForSeason}
              options={showcaseSeasons.map((season) => ({
                value: season.id,
                label: season.label,
              }))}
            />
            <AdminInput
              label="Ay"
              value={showcaseMonthId}
              onChange={(v) => {
                setShowcaseMonthId(v);
                setShowcaseForm({
                  ...showcaseForm,
                  monthId: v,
                  monthIds: [v],
                  orderDeadline: autoDeadlineForShowcaseMonth(
                    v,
                    activeSeason?.startYear,
                  ),
                });
              }}
              options={monthOptions}
            />
            <button
              onClick={createNextShowcaseSeason}
              className="h-12 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800"
            >
              Yeni sezon oluştur
            </button>
          </div>
        </div>

        {showcaseMode === "add" && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                  Deneme ekle
                </p>
                <h2 className="text-2xl font-black">Yeni vitrin denemesi</h2>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                  Tek modül içinde sezon aylarını, ürün havuzu bağlantısını,
                  vitrin adını ve fiyat/iskonto bilgisini belirle. Seçilen her
                  ay için son sipariş tarihi otomatik olarak ilgili ayın son
                  günü atanır.
                </p>
              </div>
              <Pill tone="blue">{activeSeason?.label} sezonu</Pill>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
              <div className="grid gap-5">
                <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        1. Yayın ayları
                      </p>
                      <h3 className="mt-1 text-lg font-black text-slate-950">
                        Bu deneme hangi ay/aylarda listelenecek?
                      </h3>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Birden fazla ay seçebilirsin. Her ay için ayrı vitrin
                        kaydı oluşur.
                      </p>
                    </div>
                    <Pill tone="slate">
                      {selectedShowcaseMonthIds.length} ay seçili
                    </Pill>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {showcaseSeasonMonths.map((month) => {
                      const checked = selectedShowcaseMonthIds.includes(
                        month.id,
                      );
                      return (
                        <button
                          key={month.id}
                          type="button"
                          onClick={() => toggleShowcaseFormMonth(month.id)}
                          className={`rounded-2xl p-4 text-left ring-1 transition ${checked ? "bg-blue-700 text-white ring-blue-700" : "bg-white text-slate-700 ring-slate-200 hover:bg-blue-50"}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black">
                              {month.label} {month.year}
                            </p>
                            <span
                              className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-black ${checked ? "bg-white text-blue-700" : "bg-slate-100 text-slate-400"}`}
                            >
                              {checked ? "✓" : "+"}
                            </span>
                          </div>
                          <p
                            className={`mt-1 text-xs font-bold ${checked ? "text-white/70" : "text-slate-400"}`}
                          >
                            Son sipariş:{" "}
                            {autoDeadlineForShowcaseMonth(
                              month.id,
                              activeSeason?.startYear,
                            ) || "—"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    2. Ürün havuzu bağlantısı
                  </p>
                  <h3 className="mt-1 text-lg font-black text-slate-950">
                    Deneme kitapçığını seç
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Yazdıkça ürün havuzundaki benzer ürünler gelir. Seçilen ürün
                    denemeyse eş kitapçık otomatik önerilir.
                  </p>
                  <div className="mt-4">
                    <SearchableProductPicker
                      label="Ürün / deneme ara"
                      value={showcaseForm.productAId || showcaseForm.productId}
                      search={productSelectSearch}
                      onSearch={setProductSelectSearch}
                      onChange={handleShowcaseMainProduct}
                      helper="Ürün adı, yayınevi, barkod, ürün kodu veya sınıfa göre arayabilirsin."
                    />
                  </div>

                  {firstShowcaseProduct && (
                    <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 md:grid-cols-4">
                      <div>
                        <p className="text-[11px] font-black uppercase text-slate-400">
                          Yayınevi
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {firstShowcaseProduct.publisher || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-slate-400">
                          Sınıf
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {firstShowcaseProduct.classLevel || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-slate-400">
                          Barkod
                        </p>
                        <p className="mt-1 break-all font-mono text-xs font-black text-slate-800">
                          {firstShowcaseProduct.barcode || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-slate-400">
                          Fiyat
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {formatCurrency(firstShowcaseProduct.price || 0)}
                        </p>
                      </div>
                    </div>
                  )}

                  {isExamProduct && (
                    <div className="mt-4 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-blue-950">
                            Eş kitapçık
                          </p>
                          <p className="mt-1 text-xs font-bold text-blue-900/70">
                            Sistem eş kitapçığı önerdi. Yanlışsa buradan elle
                            değiştirebilirsin.
                          </p>
                        </div>
                        <Pill tone={selectedPairProduct ? "green" : "amber"}>
                          {selectedPairProduct
                            ? "Eş seçildi"
                            : "Kontrol gerekli"}
                        </Pill>
                      </div>
                      <SearchableProductPicker
                        label="Önerilen / seçilen eş kitapçık"
                        value={showcaseForm.productBId}
                        search={showcaseForm.productBSearch || ""}
                        onSearch={(v) =>
                          setShowcaseForm((current) => ({
                            ...current,
                            productBSearch: v,
                          }))
                        }
                        onChange={handleShowcasePairProduct}
                        helper="Kurum tek deneme görür; A/B kitapçıkları depo ve fatura tarafında ayrı tutulur."
                      />
                      {pairMismatchWarning && (
                        <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-800 ring-1 ring-amber-100">
                          Bu ürün sistemde otomatik eşlenik olarak görünmüyor.
                          Yine de seçebilirsin; kaydetmeden önce barkod ve ürün
                          kodunu kontrol et.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    3. Vitrin adı ve kategori
                  </p>
                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <AdminInput
                      label="Ürünün liste adı / vitrindeki adı"
                      value={showcaseForm.vitrinName}
                      onChange={(v) =>
                        setShowcaseForm({ ...showcaseForm, vitrinName: v })
                      }
                    />
                    <AdminInput
                      label="Grup"
                      value={showcaseForm.group}
                      onChange={(v) =>
                        setShowcaseForm({
                          ...showcaseForm,
                          group: v,
                          level: classOptionsByGroup[v][0],
                        })
                      }
                      options={["Lise", "Ortaokul"]}
                    />
                    <AdminInput
                      label="Sınıf"
                      value={showcaseForm.level}
                      onChange={(v) =>
                        setShowcaseForm({ ...showcaseForm, level: v })
                      }
                      options={classOptionsByGroup[showcaseForm.group]}
                    />
                    <AdminInput
                      label="Görünürlük durumu"
                      value={showcaseForm.active ? "Yayında" : "Kapalı"}
                      onChange={(v) =>
                        setShowcaseForm({
                          ...showcaseForm,
                          active: v === "Yayında",
                        })
                      }
                      options={["Yayında", "Kapalı"]}
                    />
                    <AdminInput
                      label="Sipariş durumu"
                      value={
                        showcaseForm.orderable === false
                          ? "Siparişe kapalı"
                          : "Siparişe açık"
                      }
                      onChange={(v) =>
                        setShowcaseForm({
                          ...showcaseForm,
                          orderable: v === "Siparişe açık",
                        })
                      }
                      options={["Siparişe açık", "Siparişe kapalı"]}
                    />
                    <AdminInput
                      label="Minimum sipariş adedi"
                      type="number"
                      value={showcaseForm.minQuantity}
                      onChange={(v) =>
                        setShowcaseForm({ ...showcaseForm, minQuantity: v })
                      }
                    />
                    <AdminInput
                      label="Tavsiye tarihi"
                      type="date"
                      value={showcaseForm.recommendedDate}
                      onChange={(v) =>
                        setShowcaseForm({ ...showcaseForm, recommendedDate: v })
                      }
                    />
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    4. Görünürlük
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Denemeyi tüm kurumlara açabilir veya sadece seçtiğin
                    kurumlara gösterebilirsin.
                  </p>
                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <AdminInput
                      label="Görünürlük"
                      value={
                        showcaseForm.visibilityMode === "selected"
                          ? "Seçili kurumlar"
                          : "Tüm kurumlar"
                      }
                      onChange={(v) =>
                        setShowcaseForm({
                          ...showcaseForm,
                          visibilityMode:
                            v === "Seçili kurumlar" ? "selected" : "all",
                          visibleCustomerIds:
                            v === "Seçili kurumlar"
                              ? showcaseForm.visibleCustomerIds
                              : [],
                        })
                      }
                      options={["Tüm kurumlar", "Seçili kurumlar"]}
                    />
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                      <p className="text-xs font-black uppercase text-slate-400">
                        Görünecek kapsam
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-950">
                        {showcaseVisibilityText}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Kapalı ürünler kurum panelinde görünmez.
                      </p>
                    </div>
                  </div>
                  {showcaseForm.visibilityMode === "selected" && (
                    <div className="mt-4 grid max-h-64 gap-2 overflow-y-auto rounded-2xl bg-white p-3 ring-1 ring-slate-100 md:grid-cols-2">
                      {customers.map((customer) => {
                        const checked = (
                          showcaseForm.visibleCustomerIds || []
                        ).includes(customer.id);
                        return (
                          <label
                            key={customer.id}
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-bold ring-1 transition ${checked ? "bg-blue-50 text-blue-800 ring-blue-100" : "bg-slate-50 text-slate-600 ring-slate-100 hover:bg-white"}`}
                          >
                            <span className="min-w-0 truncate">
                              {customer.name}
                            </span>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setShowcaseForm((current) => {
                                  const ids = current.visibleCustomerIds || [];
                                  const exists = ids.includes(customer.id);
                                  return {
                                    ...current,
                                    visibleCustomerIds: exists
                                      ? ids.filter((id) => id !== customer.id)
                                      : [...ids, customer.id],
                                  };
                                })
                              }
                              className="h-4 w-4 accent-blue-700"
                            />
                          </label>
                        );
                      })}
                      {!customers.length && (
                        <p className="col-span-full rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-400">
                          Henüz kurum kaydı yok.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    5. Fiyat ve iskonto
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    İskonto oranı seçilen ürünün yayınevine göre otomatik gelir;
                    vitrin özelinde değiştirilebilir.
                  </p>
                  <div className="mt-4 grid gap-4 xl:grid-cols-3">
                    <AdminInput
                      label="Vitrin liste fiyatı"
                      type="number"
                      value={showcaseBasePrice}
                      onChange={(v) =>
                        setShowcaseForm({ ...showcaseForm, customPrice: v })
                      }
                    />
                    <AdminInput
                      label="Genel iskonto oranı %"
                      type="number"
                      value={showcaseDiscountRate}
                      onChange={(v) =>
                        setShowcaseForm({ ...showcaseForm, discountRate: v })
                      }
                    />
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                      <p className="text-xs font-black uppercase text-slate-400">
                        Genel net vitrin fiyatı
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-950">
                        {formatCurrency(showcaseNetPrice)}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Genel iskonto tutarı:{" "}
                        {formatCurrency(showcaseDiscountAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-950">
                          Kuruma özel fiyatlandırma
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          Kapalıyken tüm kurumlara yayınevi/admin genel
                          iskontosu uygulanır. Açarsan bu deneme için her kuruma
                          ayrı iskonto verebilirsin.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setShowcaseCustomerDiscountsOpen(
                            (current) => !current,
                          )
                        }
                        className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                      >
                        {showcaseCustomerDiscountsOpen
                          ? "Kuruma özel fiyatlandırmayı kapat"
                          : "Kuruma özel fiyatlandırmayı aç"}
                      </button>
                    </div>
                    <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-100">
                      {customerDiscountSummary}.
                    </div>

                    {showcaseCustomerDiscountsOpen && (
                      <div className="mt-4 grid max-h-80 gap-3 overflow-y-auto pr-1">
                        {showcaseCustomerPricing.map((item) => (
                          <div
                            key={item.customerId}
                            className="grid gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100 lg:grid-cols-[minmax(0,1fr)_130px_150px] lg:items-center"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-900">
                                {item.customerName}
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-500">
                                Net fiyat: {formatCurrency(item.netPrice)} •
                                İskonto tutarı:{" "}
                                {formatCurrency(item.discountAmount)}
                              </p>
                            </div>
                            <label className="grid gap-1 text-xs font-black uppercase text-slate-400">
                              İskonto %
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.discountRate}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setShowcaseForm((current) => ({
                                    ...current,
                                    customerDiscounts: {
                                      ...(current.customerDiscounts || {}),
                                      [item.customerId]: value,
                                    },
                                  }));
                                }}
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                              />
                            </label>
                            <div className="rounded-xl bg-white px-3 py-2 text-right ring-1 ring-slate-100">
                              <p className="text-[11px] font-black uppercase text-slate-400">
                                Kuruma özel net
                              </p>
                              <p className="text-sm font-black text-slate-950">
                                {formatCurrency(item.netPrice)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {!customers.length && (
                          <p className="rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-400">
                            Henüz kurum kaydı yok.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <aside className="rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                  Önizleme
                </p>
                <h3 className="mt-3 text-2xl font-black leading-tight">
                  {showcaseForm.vitrinName ||
                    cleanManualOrderTitle(
                      firstShowcaseProduct?.name || "Vitrin adı",
                    )}
                </h3>
                <p className="mt-2 text-sm font-bold text-slate-300">
                  {firstShowcaseProduct?.publisher || "Yayınevi"} •{" "}
                  {showcaseForm.group} • {showcaseForm.level}
                </p>

                <div className="mt-5 grid gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between gap-3 text-sm font-bold">
                    <span className="text-slate-300">Liste fiyatı</span>
                    <span>{formatCurrency(showcaseBasePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm font-bold">
                    <span className="text-slate-300">İskonto</span>
                    <span>%{showcaseDiscountRate}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-base font-black">
                    <span>Net fiyat</span>
                    <span>{formatCurrency(showcaseNetPrice)}</span>
                  </div>
                </div>

                {showcaseCustomerPricing.length > 0 && (
                  <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black">Kurum özel fiyatları</p>
                      <span className="text-xs font-black text-blue-300">
                        {showcaseCustomerPricing.length} kurum
                      </span>
                    </div>
                    <div className="mt-3 grid max-h-40 gap-2 overflow-y-auto pr-1 text-xs font-bold text-slate-300">
                      {showcaseCustomerPricing.slice(0, 8).map((item) => (
                        <div
                          key={item.customerId}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2"
                        >
                          <span className="min-w-0 truncate">
                            {item.customerName}
                          </span>
                          <span className="shrink-0">
                            %{item.discountRate} •{" "}
                            {formatCurrency(item.netPrice)}
                          </span>
                        </div>
                      ))}
                      {showcaseCustomerPricing.length > 8 && (
                        <p className="text-slate-400">
                          +{showcaseCustomerPricing.length - 8} kurum daha
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-5 grid gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between gap-3 text-sm font-bold">
                    <span className="text-slate-300">Minimum sipariş</span>
                    <span>{showcaseForm.minQuantity || 1} adet</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm font-bold">
                    <span className="text-slate-300">Tavsiye tarihi</span>
                    <span>{showcaseForm.recommendedDate || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm font-bold">
                    <span className="text-slate-300">Görünürlük</span>
                    <span>{showcaseVisibilityText}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm font-bold">
                    <span className="text-slate-300">Sipariş durumu</span>
                    <span>
                      {showcaseForm.orderable === false
                        ? "Siparişe kapalı"
                        : "Siparişe açık"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-sm font-black">Listelenecek aylar</p>
                  <div className="mt-3 grid gap-2">
                    {showcaseDeadlinePreview.length ? (
                      showcaseDeadlinePreview.map((month) => (
                        <div
                          key={month.id}
                          className="rounded-xl bg-white/10 p-3"
                        >
                          <p className="text-sm font-black">
                            {month.label} {month.year}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-300">
                            Son sipariş tarihi: {month.deadline || "—"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-bold text-slate-300">
                        Henüz ay seçilmedi.
                      </p>
                    )}
                  </div>
                </div>

                {firstShowcaseProduct && (
                  <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm font-black">Bağlı ürünler</p>
                    <div className="mt-3 grid gap-2 text-xs font-bold text-slate-300">
                      <p className="break-words">
                        1. {firstShowcaseProduct.name}
                      </p>
                      {selectedPairProduct && (
                        <p className="break-words">
                          2. {selectedPairProduct.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    addShowcaseProduct();
                    setShowcaseMode("list");
                  }}
                  disabled={
                    !firstShowcaseProduct ||
                    !showcaseForm.vitrinName ||
                    !selectedShowcaseMonthIds.length
                  }
                  className="mt-5 w-full rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-600"
                >
                  Seçili aylara vitrine ekle
                </button>
              </aside>
            </div>
          </div>
        )}

        {showcaseMode === "list" && (
          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                    Vitrin
                  </p>
                  <h2 className="text-2xl font-black">
                    {activeSeason?.label} sezonu vitrin takvimi
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {seasonProductCount} ürün bu sezonda kayıtlı. Kapalı ürünler
                    kurum panelinde görünmez; siparişe kapalı veya son tarihi
                    geçmiş ürünler görünür kalıp siparişe kapalı çalışır.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="blue">
                    Seçili ay: {selectedMonth?.label} {selectedMonth?.year}
                  </Pill>
                  <button
                    onClick={() =>
                      setExams((current) =>
                        current.map((exam) =>
                          currentProducts.some((item) => item.id === exam.id)
                            ? { ...exam, orderable: false }
                            : exam,
                        ),
                      )
                    }
                    className="rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 ring-1 ring-amber-100"
                  >
                    Bu ayı siparişe kapat
                  </button>
                  <button
                    onClick={() =>
                      setExams((current) =>
                        current.map((exam) =>
                          currentProducts.some((item) => item.id === exam.id)
                            ? { ...exam, active: false }
                            : exam,
                        ),
                      )
                    }
                    className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200"
                  >
                    Bu ayı pasifleştir
                  </button>
                  <button
                    onClick={() =>
                      setExams((current) =>
                        current.map((exam) =>
                          currentProducts.some((item) => item.id === exam.id)
                            ? { ...exam, active: true, orderable: true }
                            : exam,
                        ),
                      )
                    }
                    className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100"
                  >
                    Bu ayı yayına aç
                  </button>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {showcaseSeasonMonths.map((month) => {
                  const count = exams.filter((exam) => {
                    const sameMonth = exam.monthId === month.id;
                    const sameSeason = exam.seasonId
                      ? exam.seasonId === activeSeason?.id
                      : showcaseSeasonMonths.some((m) => m.id === exam.monthId);
                    return sameMonth && sameSeason;
                  }).length;
                  const active = showcaseMonthId === month.id;
                  return (
                    <button
                      key={month.id}
                      onClick={() => setShowcaseMonthId(month.id)}
                      className={`rounded-2xl p-4 text-left ring-1 transition ${active ? "bg-blue-700 text-white ring-blue-700" : count ? "bg-white text-slate-800 ring-slate-200 hover:bg-blue-50" : "bg-slate-50 text-slate-400 ring-slate-100 hover:bg-white"}`}
                    >
                      <p className="text-sm font-black">
                        {month.label} {month.year}
                      </p>
                      <p
                        className={`mt-1 text-xs font-bold ${active ? "text-white/70" : "text-slate-400"}`}
                      >
                        {count ? `${count} vitrin ürünü` : "Boş"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {currentProducts.map((exam) => {
                const examComponents = exam.components?.length
                  ? exam.components
                  : [
                      getProductById(exam.productAId || exam.productId),
                      getProductById(exam.productBId),
                    ].filter(Boolean);
                const examVisibilityText = getShowcaseVisibilityText(exam);
                const examGeneralDiscount = Number(
                  exam.discountRate || getDiscountForPublisher(exam.brand) || 0,
                );
                const examListPrice = Number(exam.listPrice || 0);
                const examNetPrice = Number(
                  exam.netPrice ||
                    Math.max(
                      0,
                      Math.round(
                        examListPrice * (1 - examGeneralDiscount / 100),
                      ),
                    ),
                );
                const examCustomerPricing = exam.customerPricing || [];
                return (
                  <div
                    key={exam.id}
                    className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-slate-100 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xl font-black leading-tight text-slate-950">
                            {exam.title}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {exam.brand} • {exam.group} • {exam.level}
                          </p>
                        </div>
                        <Pill
                          tone={
                            exam.active === false
                              ? "slate"
                              : isShowcaseDeadlineExpired(exam.orderDeadline)
                                ? "amber"
                                : exam.orderable === false
                                  ? "amber"
                                  : "green"
                          }
                        >
                          {getShowcaseOrderStatusText(exam)}
                        </Pill>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Pill tone={exam.active === false ? "slate" : "green"}>
                          {exam.active === false ? "Kapalı" : "Yayında"}
                        </Pill>
                        <Pill
                          tone={exam.orderable === false ? "amber" : "blue"}
                        >
                          {exam.orderable === false
                            ? "Siparişe kapalı"
                            : "Siparişe açık"}
                        </Pill>
                        <Pill
                          tone={
                            exam.visibilityMode === "selected"
                              ? "amber"
                              : "slate"
                          }
                        >
                          {examVisibilityText}
                        </Pill>
                      </div>
                    </div>

                    <div className="grid gap-4 p-5">
                      <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 md:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                            Liste fiyatı
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-950">
                            {formatCurrency(examListPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                            Genel iskonto / net
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-950">
                            %{examGeneralDiscount} •{" "}
                            {formatCurrency(examNetPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                            Son sipariş
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-700">
                            {exam.orderDeadline || "Otomatik atanmadı"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                            Tavsiye tarihi / min. sipariş
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-700">
                            {exam.recommendedStartDate ||
                              exam.recommendedDate ||
                              "—"}{" "}
                            • {exam.minQuantity || 1} adet
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-blue-950">
                            Ürün bileşenleri
                          </p>
                          <span className="text-xs font-black text-blue-700">
                            {examComponents.length || 0} ürün
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2">
                          {examComponents.map((component, index) => (
                            <div
                              key={`${exam.id}-${component?.id || index}`}
                              className="rounded-xl bg-white p-3 text-xs font-bold text-blue-900 ring-1 ring-blue-100"
                            >
                              <p className="font-black">
                                {getComponentPartLabel(component, index)}
                              </p>
                              <p className="mt-1 break-words">
                                {component?.name || "Ürün seçilmedi"}
                              </p>
                              <p className="mt-1 font-mono text-[11px] text-blue-700">
                                Barkod: {component?.barcode || "—"}
                              </p>
                              <p className="font-mono text-[11px] text-blue-700">
                                Ürün kodu:{" "}
                                {component?.productCode ||
                                  component?.aksonProductCode ||
                                  "—"}
                              </p>
                            </div>
                          ))}
                          {!examComponents.length && (
                            <p className="rounded-xl bg-white p-3 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                              Bu vitrin ürününe bağlı ürün bulunamadı.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-slate-950">
                            Kurum fiyatlandırması
                          </p>
                          <Pill
                            tone={
                              exam.useCustomerSpecificPricing ? "blue" : "slate"
                            }
                          >
                            {exam.useCustomerSpecificPricing
                              ? "Kuruma özel"
                              : "Tek iskonto"}
                          </Pill>
                        </div>
                        {exam.useCustomerSpecificPricing ? (
                          <div className="mt-3 grid max-h-40 gap-2 overflow-y-auto pr-1">
                            {examCustomerPricing.slice(0, 6).map((item) => (
                              <div
                                key={item.customerId}
                                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-xs font-bold ring-1 ring-slate-100"
                              >
                                <span className="min-w-0 truncate text-slate-700">
                                  {item.customerName}
                                </span>
                                <span className="shrink-0 font-black text-slate-950">
                                  %{item.discountRate} •{" "}
                                  {formatCurrency(item.netPrice)}
                                </span>
                              </div>
                            ))}
                            {examCustomerPricing.length > 6 && (
                              <p className="text-xs font-bold text-slate-400">
                                +{examCustomerPricing.length - 6} kurum daha
                              </p>
                            )}
                            {!examCustomerPricing.length && (
                              <p className="text-xs font-bold text-slate-400">
                                Kuruma özel fiyat listesi boş.
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs font-bold text-slate-500">
                            Tüm kurumlara genel iskonto uygulanır: %
                            {examGeneralDiscount}.
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            setEditingShowcase({
                              ...exam,
                              productASearch: "",
                              productBSearch: "",
                              customerDiscounts:
                                exam.customerDiscounts ||
                                Object.fromEntries(
                                  customers.map((customer) => [
                                    customer.id,
                                    Number(
                                      customer.discountRate ??
                                        examGeneralDiscount ??
                                        0,
                                    ),
                                  ]),
                                ),
                            })
                          }
                          className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-blue-700"
                        >
                          Düzenle
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!currentProducts.length && (
                <div className="rounded-[1.6rem] bg-white p-6 text-sm font-bold text-slate-500 ring-1 ring-slate-200">
                  Bu ay için vitrin ürünü yok. Deneme Ekle bölümünden bu aya
                  ürün ekleyebilirsin.
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    );
  };

  const autoDeadlineForShowcaseMonth = (monthId, fallbackStartYear) => {
    const sourceMonths = showcaseSeasonMonths.length
      ? showcaseSeasonMonths
      : months;
    const month = sourceMonths.find((m) => String(m.id) === String(monthId));
    if (!month) return "";
    const year = Number(
      month.year ||
        fallbackStartYear ||
        seasonStartYear ||
        new Date().getFullYear(),
    );
    const monthName = String(month.id).split("-")[0];
    const order = [
      "ocak",
      "subat",
      "mart",
      "nisan",
      "mayis",
      "haziran",
      "temmuz",
      "agustos",
      "eylul",
      "ekim",
      "kasim",
      "aralik",
    ];
    const monthIndex = Math.max(0, order.indexOf(monthName));
    const date = new Date(year, monthIndex + 1, 0);
    return date.toISOString().slice(0, 10);
  };

  const PublishersSection = () => {
    const filteredPublishers = poolPublishers.filter((publisher) =>
      normalizeText(publisher).includes(normalizeText(publisherSearch)),
    );
    const activePublisher =
      selectedPublisher && poolPublishers.includes(selectedPublisher)
        ? selectedPublisher
        : filteredPublishers[0] || poolPublishers[0] || "";
    const activeProducts = productPool
      .filter((p) => p.publisher === activePublisher)
      .sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), "tr"),
      );
    const activeShowcaseProducts = exams.filter(
      (exam) =>
        normalizeText(exam.brand || exam.publisher || "") ===
        normalizeText(activePublisher),
    );
    const activeDiscount = Number(publisherDiscounts[activePublisher] ?? 0);
    const publisherStats = (publisher) => {
      const productCount = productPool.filter(
        (p) => p.publisher === publisher,
      ).length;
      const showcaseCount = exams.filter(
        (exam) =>
          normalizeText(exam.brand || exam.publisher || "") ===
          normalizeText(publisher),
      ).length;
      return {
        productCount,
        showcaseCount,
        discount: Number(publisherDiscounts[publisher] ?? 0),
      };
    };
    const savePublisherDiscount = () => {
      if (!activePublisher) return;
      setSystemNotice({
        type: "success",
        title: "Yayınevi iskontosu güncellendi",
        text: `${activePublisher} için varsayılan iskonto %${activeDiscount} olarak kaydedildi. Bu oran yeni vitrin ürünlerinde otomatik önerilir; mevcut özel vitrin fiyatları değişmez.`,
      });
    };

    return (
      <section className="grid gap-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                Yayınevi & İskonto
              </p>
              <h2 className="text-3xl font-black">
                Ürün havuzundan gelen yayınevleri
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-500">
                Yayınevleri ürün havuzundan otomatik oluşur. Burada tanımlanan
                iskonto, yeni vitrin/deneme eklerken varsayılan oran olarak
                gelir; ürün veya kurum özelinde ayrıca değiştirilebilir.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-100">
              <div className="rounded-xl bg-white px-4 py-3 text-center ring-1 ring-slate-100">
                <p className="text-xl font-black text-slate-950">
                  {poolPublishers.length}
                </p>
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Yayınevi
                </p>
              </div>
              <div className="rounded-xl bg-white px-4 py-3 text-center ring-1 ring-slate-100">
                <p className="text-xl font-black text-slate-950">
                  {productPool.length}
                </p>
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Ürün
                </p>
              </div>
              <div className="rounded-xl bg-white px-4 py-3 text-center ring-1 ring-slate-100">
                <p className="text-xl font-black text-slate-950">
                  {exams.length}
                </p>
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Vitrin
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Liste
                </p>
                <h3 className="text-xl font-black">Yayınevleri</h3>
              </div>
              <Pill tone="blue">{filteredPublishers.length} sonuç</Pill>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input
                value={publisherSearch}
                onChange={(event) => setPublisherSearch(event.target.value)}
                placeholder="Yayınevi ara..."
                className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
              />
              {publisherSearch && (
                <button
                  onClick={() => setPublisherSearch("")}
                  className="rounded-full bg-white p-1 text-slate-400 ring-1 ring-slate-200 hover:text-slate-950"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="mt-4 grid max-h-[640px] gap-2 overflow-y-auto pr-1">
              {filteredPublishers.length ? (
                filteredPublishers.map((publisher) => {
                  const stats = publisherStats(publisher);
                  const active = activePublisher === publisher;
                  return (
                    <button
                      key={publisher}
                      onClick={() => setSelectedPublisher(publisher)}
                      className={`rounded-2xl p-4 text-left ring-1 transition ${active ? "bg-blue-700 text-white ring-blue-700 shadow-lg shadow-blue-950/10" : "bg-slate-50 text-slate-800 ring-slate-100 hover:bg-blue-50"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-black">
                            {publisher}
                          </p>
                          <p
                            className={`mt-1 text-xs font-bold ${active ? "text-white/70" : "text-slate-500"}`}
                          >
                            {stats.productCount} ürün • {stats.showcaseCount}{" "}
                            vitrin ürünü
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${active ? "bg-white/15 text-white" : "bg-white text-blue-700 ring-1 ring-slate-100"}`}
                        >
                          %{stats.discount}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500 ring-1 ring-slate-100">
                  Aramanızla eşleşen yayınevi bulunamadı.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            {activePublisher ? (
              <>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                      İskonto kartı
                    </p>
                    <h3 className="text-2xl font-black">{activePublisher}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Bu yayınevine ait varsayılan iskonto oranını yönetin.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center ring-1 ring-slate-100">
                      <p className="text-xl font-black">
                        {activeProducts.length}
                      </p>
                      <p className="text-[10px] font-black uppercase text-slate-400">
                        Havuz
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center ring-1 ring-slate-100">
                      <p className="text-xl font-black">
                        {activeShowcaseProducts.length}
                      </p>
                      <p className="text-[10px] font-black uppercase text-slate-400">
                        Vitrin
                      </p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center text-blue-800 ring-1 ring-blue-100">
                      <p className="text-xl font-black">%{activeDiscount}</p>
                      <p className="text-[10px] font-black uppercase">
                        İskonto
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                    <AdminInput
                      label="Varsayılan iskonto oranı %"
                      type="number"
                      value={publisherDiscounts[activePublisher] ?? 0}
                      onChange={(v) =>
                        setPublisherDiscounts({
                          ...publisherDiscounts,
                          [activePublisher]: Number(v || 0),
                        })
                      }
                    />
                    <button
                      onClick={savePublisherDiscount}
                      className="h-12 rounded-2xl bg-blue-700 px-6 text-sm font-black text-white shadow-lg shadow-blue-950/10 hover:bg-blue-800"
                    >
                      Kaydet
                    </button>
                  </div>
                  <p className="mt-3 text-xs font-bold leading-relaxed text-blue-900">
                    Bu değişiklik yeni eklenen vitrin ürünlerinde otomatik
                    kullanılır. Mevcut vitrin ürünlerinin özel iskontoları ve
                    geçmiş sipariş kayıtları değişmez.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="font-black">Ürün havuzu örnekleri</h4>
                      <Pill tone="slate">{activeProducts.length} ürün</Pill>
                    </div>
                    <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1">
                      {activeProducts.length ? (
                        activeProducts.slice(0, 12).map((product) => (
                          <div
                            key={product.id}
                            className="rounded-xl bg-white p-3 text-sm ring-1 ring-slate-100"
                          >
                            <p className="font-black leading-snug text-slate-950">
                              {product.name}
                            </p>
                            <p className="mt-1 break-all text-xs font-semibold text-slate-500">
                              {product.barcode || "Barkod yok"} •{" "}
                              {product.productCode || "Kod yok"}
                            </p>
                            <p className="mt-1 text-xs font-black text-slate-700">
                              {formatCurrency(product.price)} •{" "}
                              {product.classLevel || "Genel"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-100">
                          Bu yayınevine ait ürün bulunamadı.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="font-black">Vitrindeki ürünler</h4>
                      <Pill tone="green">
                        {activeShowcaseProducts.length} ürün
                      </Pill>
                    </div>
                    <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1">
                      {activeShowcaseProducts.length ? (
                        activeShowcaseProducts.slice(0, 12).map((exam) => (
                          <div
                            key={exam.id}
                            className="rounded-xl bg-white p-3 text-sm ring-1 ring-slate-100"
                          >
                            <p className="font-black leading-snug text-slate-950">
                              {exam.title}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {exam.group} • {exam.level} •{" "}
                              {exam.monthId || "Ay seçilmedi"}
                            </p>
                            <p className="mt-1 text-xs font-black text-slate-700">
                              Liste: {formatCurrency(exam.listPrice)} • İskonto:
                              %{Number(exam.discountRate || 0)} • Net:{" "}
                              {formatCurrency(exam.netPrice || exam.listPrice)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-100">
                          Bu yayınevinden vitrine eklenmiş ürün yok.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                Ürün havuzunda yayınevi bulunamadı.
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] bg-slate-950 p-3 text-white lg:flex lg:flex-col">
        <div className="mb-4 flex items-center gap-2.5 overflow-hidden px-1">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1.5 shadow-sm">
            <img
              src="/noxelera-logo.png"
              alt="Noxelera Logo"
              className="block h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-base font-black tracking-tight">
              Noxelera
            </p>
            <p className="mt-0.5 truncate text-[10px] font-bold leading-snug text-white/70">
              Kurumsal Sipariş Portalı
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-white/5 bg-white/[0.03] p-2">
          <nav className="h-full space-y-3 overflow-y-auto px-1 py-2 pr-2 [scrollbar-color:#2f67c7_#0b1020] [scrollbar-width:thin]">
            {visibleSidebarGroups.map((group) => (
              <div key={group.title} className="grid gap-1.5">
                <p className="px-3 pt-1 text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                  {group.title}
                </p>
                {group.items.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-2.5 rounded-[1rem] px-3 py-2.5 text-left text-sm font-black transition ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-950/25" : "text-slate-100 hover:bg-white/10 hover:text-white"}`}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${active ? "bg-white/10" : "bg-white/5 text-slate-300"}`}
                      >
                        {tab.icon}
                      </span>
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
          <button
            onClick={onPortalOpen}
            className="flex h-11 items-center justify-center gap-2 rounded-[1rem] bg-white px-4 text-sm font-black text-slate-950"
          >
            <Eye size={16} />
            Kurum önizleme
          </button>
          <button
            onClick={onLogout}
            className="flex h-11 items-center justify-center gap-2 rounded-[1rem] bg-white/10 px-4 text-sm font-black text-white"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </aside>
      <main className="min-w-0 lg:pl-[260px]">
        {Header()}
        <div className="min-w-0 p-5 lg:p-8">
          {activeTab === "dashboard" && DashboardSection()}
          {activeTab === "orders" && OrdersSection()}
          {activeTab === "product-pool" && ProductPoolSection()}
          {activeTab === "exams" && ShowcaseSection()}
          {activeTab === "publishers" && PublishersSection()}
          {activeTab === "warehouse" && (
            <WarehousePanel
              warehouseData={productPoolWarehouseData}
              setWarehouseData={setWarehouseData}
              orders={orders}
              setOrders={setOrders}
            />
          )}
          {activeTab === "day-report" && (
            <section className="grid gap-6">
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="bg-slate-950 p-6 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">
                    Operasyon Raporu
                  </p>
                  <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <h2 className="text-3xl font-black">
                        Günlük operasyon arşivi
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-300">
                        Sipariş, fatura/Akson, iptal ve hata kayıtlarını yıl, ay
                        ve gün bazında düzenli şekilde takip edebilirsin. Teslim
                        ve iptal kayıtları gün içinde buraya da düşer, gün
                        sonunda arşiv olarak kalır.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={setReportToToday}
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950 hover:bg-blue-50"
                      >
                        Bugün
                      </button>
                      <button
                        onClick={setReportToYesterday}
                        className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/20 hover:bg-white/20"
                      >
                        Dün
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Yıl seçimi
                        </p>
                        <h3 className="text-lg font-black text-slate-950">
                          Rapor yılı
                        </h3>
                      </div>
                      <Pill tone="blue">{reportYear}</Pill>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {reportYearCards.map((card) => {
                        const selected =
                          String(card.year) === String(reportYear);
                        const empty = card.summary.total === 0;
                        return (
                          <button
                            key={card.year}
                            onClick={() => setReportYear(String(card.year))}
                            className={`rounded-2xl p-4 text-left ring-1 transition ${
                              selected
                                ? "bg-slate-950 text-white ring-slate-950"
                                : empty
                                  ? "bg-white text-slate-400 opacity-70 ring-slate-200 hover:opacity-100"
                                  : "bg-white text-slate-950 ring-slate-200 hover:bg-blue-50 hover:ring-blue-100"
                            }`}
                          >
                            <p className="text-2xl font-black">{card.year}</p>
                            <p
                              className={`mt-1 text-xs font-bold ${selected ? "text-slate-300" : "text-slate-500"}`}
                            >
                              {card.summary.total} kayıt •{" "}
                              {formatCurrency(card.summary.revenue)}
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-black">
                              <span>Teslim: {card.summary.delivered}</span>
                              <span>İptal: {card.summary.cancelled}</span>
                              <span>Fatura: {card.summary.invoiced}</span>
                              <span>Hata: {card.summary.invoiceErrors}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Ay seçimi
                        </p>
                        <h3 className="text-lg font-black text-slate-950">
                          {reportYear} yılı ayları
                        </h3>
                      </div>
                      <Pill tone="slate">
                        {HISTORY_MONTHS[Number(reportMonthIndex)]}
                      </Pill>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {reportMonthCards.map((month) => {
                        const selected =
                          Number(month.monthIndex) === Number(reportMonthIndex);
                        const empty = month.summary.total === 0;
                        return (
                          <button
                            key={month.key}
                            onClick={() => {
                              setReportMonthIndex(month.monthIndex);
                              const maxDay = getDaysInHistoryMonth(
                                reportYear,
                                month.monthIndex,
                              );
                              setReportDay((current) =>
                                Math.min(Number(current), maxDay),
                              );
                            }}
                            className={`rounded-2xl p-4 text-left ring-1 transition ${
                              selected
                                ? "bg-blue-600 text-white ring-blue-600"
                                : empty
                                  ? "bg-slate-50 text-slate-400 opacity-70 ring-slate-200 hover:opacity-100"
                                  : "bg-white text-slate-950 ring-slate-200 hover:bg-blue-50 hover:ring-blue-100"
                            }`}
                          >
                            <p className="text-base font-black">
                              {month.label}
                            </p>
                            <p
                              className={`mt-1 text-xs font-bold ${selected ? "text-blue-100" : "text-slate-500"}`}
                            >
                              {month.summary.total} kayıt •{" "}
                              {formatCurrency(month.summary.revenue)}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1">
                              <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-black ring-1 ring-current/10">
                                Fatura {month.summary.invoiced}
                              </span>
                              <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-black ring-1 ring-current/10">
                                Hata {month.summary.invoiceErrors}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Gün seçimi
                        </p>
                        <h3 className="text-lg font-black text-slate-950">
                          {HISTORY_MONTHS[Number(reportMonthIndex)]}{" "}
                          {reportYear}
                        </h3>
                      </div>
                      <Pill tone="blue">{selectedReportDateLabel}</Pill>
                    </div>
                    <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                      {reportDayCards.map((day) => {
                        const selected = Number(day.day) === Number(reportDay);
                        const empty = day.summary.total === 0;
                        return (
                          <button
                            key={day.key}
                            onClick={() => setReportDay(day.day)}
                            className={`rounded-2xl p-3 text-left ring-1 transition ${
                              selected
                                ? "bg-slate-950 text-white ring-slate-950"
                                : empty
                                  ? "bg-white text-slate-400 opacity-60 ring-slate-200 hover:opacity-100"
                                  : "bg-white text-slate-950 ring-slate-200 hover:bg-blue-50 hover:ring-blue-100"
                            }`}
                          >
                            <p className="text-sm font-black">{day.label}</p>
                            <p
                              className={`mt-1 text-xs font-bold ${selected ? "text-slate-300" : "text-slate-500"}`}
                            >
                              {day.summary.total} kayıt
                            </p>
                            <p
                              className={`mt-1 text-[11px] font-black ${selected ? "text-blue-200" : "text-blue-700"}`}
                            >
                              {formatCurrency(day.summary.revenue)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard
                  title="Toplam Kayıt"
                  value={reportSummary.total}
                  subtitle={selectedReportDateLabel}
                  icon={<ClipboardCheck size={22} />}
                />
                <AdminStatCard
                  title="Fatura Kesilen"
                  value={reportSummary.invoiced}
                  subtitle={`${reportSummary.invoiceErrors} fatura hatası`}
                  icon={<FileSpreadsheet size={22} />}
                />
                <AdminStatCard
                  title="Teslim / İptal"
                  value={`${reportSummary.delivered}/${reportSummary.cancelled}`}
                  subtitle="Günlük tamamlanan işlemler"
                  icon={<Package size={22} />}
                />
                <AdminStatCard
                  title="Günlük Ciro"
                  value={formatCurrency(reportSummary.revenue)}
                  subtitle="Fatura ve sipariş kayıtlarından"
                  icon={<BarChart3 size={22} />}
                />
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                      Seçili gün kayıtları
                    </p>
                    <h3 className="text-2xl font-black text-slate-950">
                      {selectedReportDateLabel}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Kayıtlar saat sırasına göre listelenir. Satıra tıklayarak
                      sipariş detayını açabilirsin.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="blue">Sipariş: {reportSummary.orders}</Pill>
                    <Pill tone="green">Fatura: {reportSummary.invoices}</Pill>
                    <Pill tone="red">Hata/İptal: {reportSummary.issues}</Pill>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white">
                  <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone="blue">
                          {selectedReportMovements.length} kayıt
                        </Pill>
                        <h4 className="text-lg font-black text-slate-950">
                          Günlük hareket tablosu
                        </h4>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Sipariş, fatura ve iptal/hata kayıtları tek Excel
                        benzeri listede gösterilir. Detay’a basınca siparişin
                        tüm bilgileri açılır.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[1080px]">
                      <div className="grid grid-cols-[84px_150px_1.4fr_1fr_1.4fr_110px_130px_96px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
                        <span>Saat</span>
                        <span>İşlem türü</span>
                        <span>Ürün / Sipariş</span>
                        <span>Kurum</span>
                        <span>İşlem detayı</span>
                        <span>Durum</span>
                        <span className="text-right">Tutar</span>
                        <span className="text-right">Detay</span>
                      </div>

                      <div className="max-h-[620px] overflow-y-auto">
                        {selectedReportMovements.map((movement) => {
                          const meta =
                            reportCategoryMeta[movement.category] ||
                            reportCategoryMeta.order;
                          return (
                            <div
                              key={movement.id}
                              className="border-b border-slate-100 px-4 py-4 last:border-b-0 hover:bg-blue-50/50"
                            >
                              <div className="grid grid-cols-[84px_150px_1.4fr_1fr_1.4fr_110px_130px_96px] gap-3 items-start">
                                <div className="text-sm font-black text-blue-700">
                                  {movement.time}
                                </div>
                                <div>
                                  <Pill tone={meta.tone}>
                                    {meta.title
                                      .replace(" Hareketleri", "")
                                      .replace(" Kayıtları", "")}
                                  </Pill>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-black leading-snug text-slate-950">
                                    {movement.title}
                                  </p>
                                  <p className="mt-1 text-xs font-bold text-slate-500">
                                    {movement.order?.id || movement.id}
                                  </p>
                                </div>
                                <p className="text-sm font-bold leading-snug text-slate-600">
                                  {movement.institution}
                                </p>
                                <p className="text-sm font-semibold leading-snug text-slate-600">
                                  {movement.detail}
                                </p>
                                <p className="text-sm font-black text-slate-700">
                                  {movement.status}
                                </p>
                                <div className="text-right text-sm font-black text-slate-950">
                                  {movement.amount
                                    ? formatCurrency(movement.amount)
                                    : "-"}
                                </div>
                                <div className="text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      movement.order &&
                                      setSelectedOrder(
                                        enrichOrderForDetail(movement.order),
                                      )
                                    }
                                    className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-blue-700"
                                  >
                                    Detay
                                  </button>
                                </div>
                              </div>

                              {movement.components?.length > 0 && (
                                <div className="mt-3 grid gap-2 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100 md:grid-cols-2 xl:grid-cols-3">
                                  {movement.components.map(
                                    (component, index) => (
                                      <div
                                        key={`${movement.id}-component-${component.id || index}`}
                                        className="rounded-xl bg-white p-3 ring-1 ring-slate-100"
                                      >
                                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                          {component.partLabel ||
                                            getComponentPartLabel(
                                              component,
                                              index,
                                            )}
                                        </p>
                                        <p className="mt-1 text-sm font-black leading-snug text-slate-950">
                                          {component.name || "Ürün bileşeni"}
                                        </p>
                                        <p className="mt-1 break-all text-xs font-bold text-slate-500">
                                          Barkod: {component.barcode || "-"}
                                        </p>
                                        <p className="mt-1 break-all text-xs font-bold text-slate-500">
                                          Kod:{" "}
                                          {component.productCode ||
                                            component.aksonProductCode ||
                                            "-"}
                                        </p>
                                        <p className="mt-1 text-xs font-black text-blue-700">
                                          Adet:{" "}
                                          {component.requiredQty ??
                                            component.componentQty ??
                                            "-"}
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {!selectedReportMovements.length && (
                          <div className="p-10 text-center">
                            <p className="text-sm font-black text-slate-500">
                              Bu tarih için operasyon kaydı yok.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeTab === "customers" && (
            <section className="grid gap-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                      Kurum yönetimi
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-slate-950">
                      Kurumlar
                    </h2>
                    <p className="mt-1 max-w-3xl text-sm font-bold leading-relaxed text-slate-500">
                      Yeni kurum hesabı oluştur, kurumları listele ve detayları
                      geniş modal üzerinden yönet. Şifre hiçbir yerde
                      görüntülenmez; onay gerektiren işlemler ayrı onay
                      modalıyla ilerler.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-3xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerSectionTab("create");
                        setCustomerActionModal(null);
                      }}
                      className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                        customerSectionTab === "create"
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-950"
                      }`}
                    >
                      Yeni kurum oluştur
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerSectionTab("list");
                        setCustomerActionModal(null);
                      }}
                      className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                        customerSectionTab === "list"
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-950"
                      }`}
                    >
                      Kurum listesi
                    </button>
                  </div>
                </div>
              </div>

              {customerSectionTab === "create" && (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                        Yeni kurum oluştur
                      </p>
                      <h3 className="mt-1 text-2xl font-black text-slate-950">
                        Kurum hesap bilgileri
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm font-bold leading-relaxed text-slate-500">
                        Bu ekrandan sadece ilk kurum hesabı açılır. Oluşturma
                        sonrasında profil bilgileri kurum panelinden düzenlenir;
                        admin tarafında yalnızca iskonto ve şifre sıfırlama
                        yönetilir.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 px-4 py-3 text-white">
                      <p className="text-[11px] font-black uppercase tracking-wide text-blue-200">
                        Güvenlik
                      </p>
                      <p className="mt-1 max-w-xs text-xs font-bold leading-relaxed text-slate-300">
                        Şifre kayıt sonrası görüntülenmez. Aynı kullanıcı adı,
                        e-posta veya telefon ikinci kez kullanılamaz.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5">
                    <div className="rounded-[1.7rem] border border-blue-100 bg-blue-50 p-5">
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                            Zorunlu bilgiler
                          </p>
                          <p className="mt-1 text-xs font-bold text-blue-700/80">
                            Bu alanlar kurum hesabının açılması için gereklidir.
                          </p>
                        </div>
                        <Pill tone="blue">Zorunlu</Pill>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <AdminInput
                          label="Kurum adı *"
                          value={newCustomer.name}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, name: v })
                          }
                        />
                        <AdminInput
                          label="Kurum tipi *"
                          value={newCustomer.type || "Dershane"}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, type: v })
                          }
                          options={customerTypes}
                        />
                        <AdminInput
                          label="Kullanıcı adı *"
                          value={newCustomer.username}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, username: v })
                          }
                        />
                        <AdminInput
                          label="Geçici şifre *"
                          type="password"
                          value={newCustomerPassword}
                          onChange={setNewCustomerPassword}
                        />
                        <AdminInput
                          label="E-posta *"
                          type="email"
                          value={newCustomer.email || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, email: v })
                          }
                        />
                        <AdminInput
                          label="Telefon numarası *"
                          value={newCustomer.phone || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, phone: v })
                          }
                        />
                        <AdminInput
                          label="Şehir *"
                          value={newCustomer.city || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, city: v })
                          }
                        />
                        <AdminInput
                          label="İlçe *"
                          value={newCustomer.district || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, district: v })
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                            Ek bilgiler
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            Bu alanlar opsiyoneldir. Kurum profili
                            oluşturulduktan sonra adres/profil güncellemeleri
                            kurumun kendi panelinden yapılır.
                          </p>
                        </div>
                        <Pill>Opsiyonel</Pill>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <AdminInput
                          label="Adres"
                          value={newCustomer.address || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, address: v })
                          }
                        />
                        <AdminInput
                          label="Teslimat adresi"
                          value={newCustomer.deliveryAddress || ""}
                          onChange={(v) =>
                            setNewCustomer({
                              ...newCustomer,
                              deliveryAddress: v,
                            })
                          }
                        />
                        <AdminInput
                          label="Fatura adresi"
                          value={newCustomer.billingAddress || ""}
                          onChange={(v) =>
                            setNewCustomer({
                              ...newCustomer,
                              billingAddress: v,
                            })
                          }
                        />
                        <AdminInput
                          label="Fatura unvanı"
                          value={newCustomer.invoiceTitle || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, invoiceTitle: v })
                          }
                        />
                        <AdminInput
                          label="Vergi / T.C. numarası"
                          value={newCustomer.taxNumber || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, taxNumber: v })
                          }
                        />
                        <AdminInput
                          label="Vergi dairesi"
                          value={newCustomer.taxOffice || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, taxOffice: v })
                          }
                        />
                        <AdminInput
                          label="Yetkili kişi"
                          value={newCustomer.contactPerson || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, contactPerson: v })
                          }
                        />
                        <AdminInput
                          label="Yetkili telefon"
                          value={newCustomer.contactPhone || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, contactPhone: v })
                          }
                        />
                        <AdminInput
                          label="Yetkili e-posta"
                          value={newCustomer.contactEmail || ""}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, contactEmail: v })
                          }
                        />
                        <AdminInput
                          label="Genel iskonto %"
                          type="number"
                          value={newCustomer.discountRate || 0}
                          onChange={(v) =>
                            setNewCustomer({ ...newCustomer, discountRate: v })
                          }
                        />
                        <AdminInput
                          label="Durum"
                          value={
                            newCustomer.status === "Pasif" ? "Pasif" : "Aktif"
                          }
                          onChange={(v) =>
                            setNewCustomer({
                              ...newCustomer,
                              status: v === "Pasif" ? "Pasif" : "Aktif",
                            })
                          }
                          options={["Aktif", "Pasif"]}
                        />
                        <div className="md:col-span-2 xl:col-span-1">
                          <AdminInput
                            label="Kurum iç notu"
                            value={newCustomer.note || ""}
                            onChange={(v) =>
                              setNewCustomer({ ...newCustomer, note: v })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-[1.7rem] border border-slate-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-950">
                          Kurum hesabı oluşturulmaya hazır mı?
                        </p>
                        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
                          Oluşturmadan önce kullanıcı adı, e-posta ve telefonun
                          daha önce kullanılmadığı kontrol edilir.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={saveCustomer}
                        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700"
                      >
                        Kurum hesabı oluştur
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {customerSectionTab === "list" && (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                        Kurum listesi
                      </p>
                      <h3 className="mt-1 text-xl font-black text-slate-950">
                        Kayıtlı kurumlar
                      </h3>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3 xl:min-w-[680px]">
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Search size={16} className="text-slate-400" />
                          <input
                            value={customerSearch}
                            onChange={(event) =>
                              setCustomerSearch(event.target.value)
                            }
                            placeholder="Kurum, kullanıcı, e-posta ara"
                            className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                      <select
                        value={customerTypeFilter}
                        onChange={(event) =>
                          setCustomerTypeFilter(event.target.value)
                        }
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 outline-none"
                      >
                        {["Tümü", ...customerTypes].map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                      <select
                        value={customerStatusFilter}
                        onChange={(event) =>
                          setCustomerStatusFilter(event.target.value)
                        }
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 outline-none"
                      >
                        {customerStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    <div className="min-w-[900px] overflow-hidden rounded-[1.5rem] border border-slate-200">
                      <div className="grid grid-cols-[1.25fr_1fr_1fr_1fr_110px_110px_110px] gap-3 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400">
                        <span>Kurum</span>
                        <span>Kullanıcı adı</span>
                        <span>E-posta</span>
                        <span>Konum</span>
                        <span>İskonto</span>
                        <span>Durum</span>
                        <span className="text-right">İşlem</span>
                      </div>
                      {filteredCustomers.map((customer) => {
                        const safeStatus =
                          customer.status === "Pasif" ? "Pasif" : "Aktif";
                        return (
                          <div
                            key={customer.id}
                            className="grid grid-cols-[1.25fr_1fr_1fr_1fr_110px_110px_110px] gap-3 border-t border-slate-100 px-4 py-3 text-sm font-bold text-slate-600"
                          >
                            <div>
                              <p
                                className="truncate font-black text-slate-950"
                                title={customer.name}
                              >
                                {customer.name}
                              </p>
                              <p
                                className="mt-1 truncate text-xs font-bold text-slate-400"
                                title={customer.type}
                              >
                                {customer.type || "Kurum"}
                              </p>
                            </div>
                            <p
                              className="truncate self-center"
                              title={customer.username}
                            >
                              {customer.username || "-"}
                            </p>
                            <p
                              className="truncate self-center"
                              title={customer.email}
                            >
                              {customer.email || "-"}
                            </p>
                            <p
                              className="truncate self-center"
                              title={`${customer.city || ""} ${customer.district || ""}`}
                            >
                              {customer.city || "-"}
                              {customer.district
                                ? ` / ${customer.district}`
                                : ""}
                            </p>
                            <p className="self-center font-black text-slate-950">
                              %{customer.discountRate || 0}
                            </p>
                            <div className="self-center">
                              <Pill
                                tone={safeStatus === "Pasif" ? "red" : "green"}
                              >
                                {safeStatus}
                              </Pill>
                            </div>
                            <div className="flex justify-end self-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setSelectedCustomerTab("overview");
                                  setCustomerActionModal(null);
                                }}
                                className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-blue-700"
                              >
                                Detay
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {!filteredCustomers.length && (
                        <div className="px-4 py-12 text-center">
                          <p className="text-sm font-black text-slate-500">
                            Aradığın kriterlere uygun kurum bulunamadı.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedCustomerSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
                  <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
                    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 p-5 backdrop-blur">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                          Kurum detayları
                        </p>
                        <h3 className="mt-1 text-2xl font-black text-slate-950">
                          {selectedCustomerSummary.name}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {selectedCustomerSummary.type || "Kurum"} ·{" "}
                          {selectedCustomerSummary.city || "-"}
                          {selectedCustomerSummary.district
                            ? ` / ${selectedCustomerSummary.district}`
                            : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setCustomerActionModal(null);
                        }}
                        className="rounded-2xl bg-slate-100 p-3 text-slate-500 hover:bg-slate-200"
                        aria-label="Kurum detayını kapat"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="grid gap-2 rounded-3xl bg-slate-100 p-1 md:grid-cols-3">
                        {[
                          ["overview", "Genel bilgiler"],
                          ["orders", "Siparişler"],
                          ["security", "İskonto & güvenlik"],
                        ].map(([tabId, label]) => (
                          <button
                            key={tabId}
                            type="button"
                            onClick={() => setSelectedCustomerTab(tabId)}
                            className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                              selectedCustomerTab === tabId
                                ? "bg-slate-950 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-950"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {selectedCustomerTab === "overview" && (
                        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
                          <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                              Özel olmayan kurum bilgileri
                            </p>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Kurum tipi
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-950">
                                  {selectedCustomerSummary.type || "-"}
                                </p>
                              </div>
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Konum
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-950">
                                  {selectedCustomerSummary.city || "-"}
                                  {selectedCustomerSummary.district
                                    ? ` / ${selectedCustomerSummary.district}`
                                    : ""}
                                </p>
                              </div>
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Kullanıcı adı
                                </p>
                                <p className="mt-1 break-all text-sm font-black text-slate-950">
                                  {selectedCustomerSummary.username || "-"}
                                </p>
                              </div>
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  E-posta
                                </p>
                                <p className="mt-1 break-all text-sm font-black text-slate-950">
                                  {selectedCustomerSummary.email || "-"}
                                </p>
                              </div>
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Durum
                                </p>
                                <div className="mt-2">
                                  <Pill
                                    tone={
                                      selectedCustomerSummary.status === "Pasif"
                                        ? "red"
                                        : "green"
                                    }
                                  >
                                    {selectedCustomerSummary.status === "Pasif"
                                      ? "Pasif"
                                      : "Aktif"}
                                  </Pill>
                                </div>
                              </div>
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Genel iskonto
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-950">
                                  %{selectedCustomerSummary.discountRate || 0}
                                </p>
                              </div>
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Telefon
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-950">
                                  {selectedCustomerSummary.phone || "-"}
                                </p>
                              </div>
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100 md:col-span-2">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Adres
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-950">
                                  {selectedCustomerSummary.address || "-"}
                                </p>
                              </div>
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100 md:col-span-2">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Fatura bilgisi
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-950">
                                  {selectedCustomerSummary.invoiceTitle ||
                                    selectedCustomerSummary.name ||
                                    "-"}
                                </p>
                                <p className="mt-1 text-xs font-bold text-slate-500">
                                  {selectedCustomerSummary.taxOffice ||
                                    "Vergi dairesi yok"}{" "}
                                  ·{" "}
                                  {selectedCustomerSummary.taxNumber ||
                                    "Numara yok"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-[1.7rem] border border-amber-200 bg-amber-50 p-5">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                              Profil düzenleme yetkisi
                            </p>
                            <p className="mt-2 text-sm font-bold leading-relaxed text-amber-800">
                              Kurum oluşturulduktan sonra profil bilgileri
                              kurumun kendi panelinden düzenlenir. Admin
                              tarafında yalnızca iskonto belirleme ve şifre
                              sıfırlama akışı yönetilir.
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedCustomerTab === "orders" && (
                        <div className="mt-5 rounded-[1.7rem] border border-slate-200 bg-white p-5">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                                Kurum siparişleri
                              </p>
                              <h4 className="mt-1 text-xl font-black text-slate-950">
                                Son sipariş hareketleri
                              </h4>
                            </div>
                            <Pill tone="blue">
                              {selectedCustomerSummary.orderCount || 0} sipariş
                            </Pill>
                          </div>
                          <div className="mt-4 grid gap-3">
                            {selectedCustomerSummary.orders
                              ?.slice(0, 5)
                              .map((order) => (
                                <div
                                  key={order.id}
                                  className="grid gap-3 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100 md:grid-cols-[1fr_140px_130px_auto] md:items-center"
                                >
                                  <div>
                                    <p className="text-sm font-black text-slate-950">
                                      {order.id || "Sipariş"}
                                    </p>
                                    <p className="mt-1 text-xs font-bold text-slate-500">
                                      {order.date || "Tarih yok"} ·{" "}
                                      {order.items?.length || 0} ürün
                                    </p>
                                  </div>
                                  <Pill
                                    tone={
                                      order.status === "İptal edildi"
                                        ? "red"
                                        : "blue"
                                    }
                                  >
                                    {order.status || "Durum yok"}
                                  </Pill>
                                  <p className="text-sm font-black text-slate-950 md:text-right">
                                    {formatCurrency(order.total || 0)}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedOrder(
                                        enrichOrderForDetail(order),
                                      )
                                    }
                                    className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-blue-700"
                                  >
                                    Sipariş detayı
                                  </button>
                                </div>
                              ))}
                            {!selectedCustomerSummary.orders?.length && (
                              <div className="rounded-3xl bg-slate-50 p-8 text-center ring-1 ring-slate-100">
                                <p className="text-sm font-black text-slate-500">
                                  Bu kuruma ait sipariş yok.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedCustomerTab === "security" && (
                        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                          <div className="rounded-[1.7rem] border border-blue-100 bg-blue-50 p-5">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                              İskonto belirleme
                            </p>
                            <p className="mt-2 text-4xl font-black text-blue-800">
                              %{selectedCustomerSummary.discountRate || 0}
                            </p>
                            <div className="mt-4 max-w-xs">
                              <AdminInput
                                label="Genel iskonto %"
                                type="number"
                                value={
                                  selectedCustomerSummary.discountRate || 0
                                }
                                onChange={(v) =>
                                  updateCustomerDiscount(
                                    selectedCustomerSummary,
                                    v,
                                  )
                                }
                              />
                            </div>
                            <p className="mt-3 text-xs font-bold leading-relaxed text-blue-700">
                              Şimdilik yayınevi/ürün bazlı yapı yok; kurum için
                              tek genel iskonto kullanılır.
                            </p>
                          </div>

                          <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                              Şifre sıfırlama
                            </p>
                            <div className="mt-4 grid gap-3">
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Kullanıcı adı
                                </p>
                                <p className="mt-1 break-all text-sm font-black text-slate-950">
                                  {selectedCustomerSummary.username || "-"}
                                </p>
                              </div>
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  E-posta
                                </p>
                                <p className="mt-1 break-all text-sm font-black text-slate-950">
                                  {selectedCustomerSummary.email || "-"}
                                </p>
                              </div>
                              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Son şifre sıfırlama
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-950">
                                  {selectedCustomerSummary.passwordResetRequestedAt ||
                                    "Yok"}
                                </p>
                              </div>
                            </div>
                            <p className="mt-4 text-sm font-bold leading-relaxed text-slate-500">
                              Admin mevcut şifreyi göremez, yeni şifre üretemez.
                              Sadece sıfırlama akışını başlatır.
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                resetCustomerPassword(selectedCustomerSummary)
                              }
                              className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
                            >
                              Şifre sıfırlama başlat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {customerActionModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
                    <div
                      className={`rounded-[1.7rem] border p-5 ${
                        customerActionModal.type === "danger"
                          ? "border-red-200 bg-red-50"
                          : customerActionModal.type === "warning"
                            ? "border-amber-200 bg-amber-50"
                            : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-black uppercase tracking-[0.18em] ${
                          customerActionModal.type === "danger"
                            ? "text-red-700"
                            : customerActionModal.type === "warning"
                              ? "text-amber-700"
                              : "text-blue-700"
                        }`}
                      >
                        Onay gerekli
                      </p>
                      <h3 className="mt-2 text-xl font-black text-slate-950">
                        {customerActionModal.title}
                      </h3>
                      <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">
                        {customerActionModal.text}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                      {customerActionModal.onConfirm && (
                        <button
                          type="button"
                          onClick={() => setCustomerActionModal(null)}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:border-slate-300"
                        >
                          {customerActionModal.cancelLabel || "Vazgeç"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={
                          customerActionModal.onConfirm ||
                          (() => setCustomerActionModal(null))
                        }
                        className={`rounded-2xl px-4 py-2 text-sm font-black text-white ${
                          customerActionModal.type === "danger"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-700 hover:bg-blue-800"
                        }`}
                      >
                        {customerActionModal.confirmLabel || "Tamam"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
          {activeTab === "users" && (
            <section className="grid gap-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                      Kullanıcılar
                    </p>
                    <h2 className="text-2xl font-black text-slate-950">
                      Personel ve dağıtıcı yetki yönetimi
                    </h2>
                    <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-500">
                      Admin hesabı buradan oluşturulmaz. Personel ve dağıtıcı
                      hesaplarının panel işlem yetkileri yetki matrisiyle açılıp
                      kapatılır.
                    </p>
                  </div>
                  <div className="flex rounded-2xl bg-slate-100 p-1">
                    {[
                      { id: "create", label: "Yeni kullanıcı" },
                      { id: "list", label: "Kullanıcı listesi" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStaffSectionTab(tab.id)}
                        className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                          staffSectionTab === tab.id
                            ? "bg-white text-blue-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {staffSectionTab === "create" ? (
                <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                      Yeni kullanıcı
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-slate-950">
                      Hesap bilgileri
                    </h3>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                      Bu kullanıcılar yalnızca Noxelera yönetim tarafı içindir.
                      Şifre oluşturma işleminden sonra şifre görüntülenmez.
                    </p>

                    <div className="mt-5 grid gap-4">
                      <AdminInput
                        label="Ad soyad *"
                        value={newStaffUser.name}
                        onChange={(v) =>
                          setNewStaffUser({ ...newStaffUser, name: v })
                        }
                      />
                      <AdminInput
                        label="Kullanıcı adı *"
                        value={newStaffUser.username}
                        onChange={(v) =>
                          setNewStaffUser({ ...newStaffUser, username: v })
                        }
                      />
                      <AdminInput
                        label="E-posta *"
                        value={newStaffUser.email}
                        onChange={(v) =>
                          setNewStaffUser({ ...newStaffUser, email: v })
                        }
                      />
                      <AdminInput
                        label="Telefon *"
                        value={newStaffUser.phone}
                        onChange={(v) =>
                          setNewStaffUser({ ...newStaffUser, phone: v })
                        }
                      />
                      <AdminInput
                        label="Geçici şifre *"
                        value={newStaffUser.temporaryPassword}
                        onChange={(v) =>
                          setNewStaffUser({
                            ...newStaffUser,
                            temporaryPassword: v,
                          })
                        }
                      />
                      <AdminInput
                        label="Rol *"
                        value={newStaffUser.role}
                        onChange={updateNewStaffRole}
                        options={staffRoleOptions}
                      />
                      <AdminInput
                        label="Durum"
                        value={newStaffUser.status}
                        onChange={(v) =>
                          setNewStaffUser({ ...newStaffUser, status: v })
                        }
                        options={[
                          { value: "Aktif", label: "Aktif" },
                          { value: "Pasif", label: "Pasif" },
                        ]}
                      />
                      <AdminInput
                        label="İç not"
                        value={newStaffUser.note}
                        onChange={(v) =>
                          setNewStaffUser({ ...newStaffUser, note: v })
                        }
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={resetStaffForm}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 hover:border-slate-300"
                      >
                        Temizle
                      </button>
                      <button
                        type="button"
                        onClick={saveStaffUser}
                        className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
                      >
                        Kullanıcı oluştur
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                          Yetki matrisi
                        </p>
                        <h3 className="mt-1 text-2xl font-black text-slate-950">
                          Detaylı yetki matrisi
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
                          Kullanıcı oluşturulurken hangi işlemleri
                          yapabileceğini seç. Oluşturduktan sonra detay
                          modalından tekrar düzenlenebilir.
                        </p>
                      </div>
                      <span className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600">
                        {getStaffRoleLabel(newStaffUser.role)} varsayılanı
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {staffPermissionModules.map((module) => {
                        const permissions = mergeStaffPermissions(
                          newStaffUser.role,
                          newStaffUser.permissions,
                        );
                        const enabled = Boolean(permissions[module.key]);
                        return (
                          <button
                            key={module.key}
                            type="button"
                            onClick={() => toggleNewStaffPermission(module.key)}
                            className={`rounded-[1.3rem] border p-4 text-left transition ${
                              enabled
                                ? "border-blue-200 bg-blue-50 shadow-sm"
                                : "border-slate-200 bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                  {module.group}
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-950">
                                  {module.label}
                                </p>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                                  enabled
                                    ? "bg-blue-700 text-white"
                                    : "bg-slate-200 text-slate-500"
                                }`}
                              >
                                {enabled ? "Açık" : "Kapalı"}
                              </span>
                            </div>
                            <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500">
                              {module.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-5">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px]">
                      <div className="relative">
                        <Search
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          value={staffSearch}
                          onChange={(e) => setStaffSearch(e.target.value)}
                          placeholder="Ad, kullanıcı adı, e-posta veya telefon ara..."
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white"
                        />
                      </div>
                      <AdminInput
                        label="Rol"
                        value={staffRoleFilter}
                        onChange={setStaffRoleFilter}
                        options={[
                          { value: "Tümü", label: "Tümü" },
                          ...staffRoleOptions,
                        ]}
                      />
                      <AdminInput
                        label="Durum"
                        value={staffStatusFilter}
                        onChange={setStaffStatusFilter}
                        options={staffStatusOptions.map((item) => ({
                          value: item,
                          label: item,
                        }))}
                      />
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="grid grid-cols-[1.4fr_1fr_130px_120px_110px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 max-lg:hidden">
                      <span>Kullanıcı</span>
                      <span>İletişim</span>
                      <span>Rol</span>
                      <span>Yetki</span>
                      <span>İşlem</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {filteredStaffUsers.length ? (
                        filteredStaffUsers.map((user) => {
                          const status =
                            user.status ||
                            (user.active === false ? "Pasif" : "Aktif");
                          return (
                            <div
                              key={user.id}
                              className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 lg:grid-cols-[1.4fr_1fr_130px_120px_110px] lg:items-center"
                            >
                              <div>
                                <p className="text-sm font-black text-slate-950">
                                  {user.name}
                                </p>
                                <p className="mt-1 text-xs font-bold text-slate-500">
                                  @{user.username || "kullanici"} • {status}
                                </p>
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="truncate text-sm font-bold text-slate-700"
                                  title={user.email || ""}
                                >
                                  {user.email || "-"}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                  {user.phone || "-"}
                                </p>
                              </div>
                              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                                {getStaffRoleLabel(user.role)}
                              </span>
                              <div>
                                <p className="text-sm font-black text-slate-900">
                                  {user.permissionCount}/
                                  {staffPermissionModules.length}
                                </p>
                                <p className="text-[11px] font-bold text-slate-400">
                                  yetki açık
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedStaffUser(user)}
                                className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                Detay
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-sm font-bold text-slate-500">
                          Bu filtrelere uygun kullanıcı bulunamadı.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedStaffUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 p-6">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                          Kullanıcı detayı
                        </p>
                        <h3 className="mt-1 text-3xl font-black text-slate-950">
                          {selectedStaffUser.name}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {getStaffRoleLabel(selectedStaffUser.role)} • @
                          {selectedStaffUser.username}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStaffUser(null)}
                        className="rounded-2xl bg-white p-3 text-slate-500 shadow-sm hover:bg-slate-100"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="max-h-[calc(92vh-120px)] overflow-y-auto p-6">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {[
                          ["Kullanıcı adı", selectedStaffUser.username || "-"],
                          ["E-posta", selectedStaffUser.email || "-"],
                          ["Telefon", selectedStaffUser.phone || "-"],
                          ["Rol", getStaffRoleLabel(selectedStaffUser.role)],
                          [
                            "Durum",
                            selectedStaffUser.status ||
                              (selectedStaffUser.active === false
                                ? "Pasif"
                                : "Aktif"),
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                              {label}
                            </p>
                            <p className="mt-2 break-words text-sm font-black text-slate-900">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-[1.7rem] border border-slate-200 bg-white p-5">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              Yetki matrisi
                            </p>
                            <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
                              Sipariş oluşturma, hazırlama, teslim etme gibi
                              ince yetkiler buradan ayrı ayrı açılıp kapatılır.
                              Değişiklikler kullanıcı hesabına doğrudan
                              uygulanır.
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
                            {
                              Object.values(
                                mergeStaffPermissions(
                                  selectedStaffUser.role,
                                  selectedStaffUser.permissions,
                                ),
                              ).filter(Boolean).length
                            }
                            /{staffPermissionModules.length} açık
                          </span>
                        </div>
                        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {staffPermissionModules.map((module) => {
                            const permissions = mergeStaffPermissions(
                              selectedStaffUser.role,
                              selectedStaffUser.permissions,
                            );
                            const enabled = Boolean(permissions[module.key]);
                            return (
                              <button
                                key={module.key}
                                type="button"
                                onClick={() =>
                                  updateStaffPermission(
                                    selectedStaffUser,
                                    module.key,
                                  )
                                }
                                className={`rounded-[1.3rem] border p-4 text-left transition ${
                                  enabled
                                    ? "border-emerald-200 bg-emerald-50"
                                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                      {module.group}
                                    </p>
                                    <p className="mt-1 text-sm font-black text-slate-950">
                                      {module.label}
                                    </p>
                                  </div>
                                  <span
                                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                                      enabled
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-200 text-slate-500"
                                    }`}
                                  >
                                    {enabled ? "Açık" : "Kapalı"}
                                  </span>
                                </div>
                                <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500">
                                  {module.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-[1.7rem] border border-amber-200 bg-amber-50 p-5">
                          <p className="text-sm font-black text-amber-800">
                            Şifre güvenliği
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-relaxed text-amber-700">
                            Mevcut şifre görüntülenmez. Admin yalnızca sıfırlama
                            akışı başlatabilir.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              resetStaffPassword(selectedStaffUser)
                            }
                            className="mt-4 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-black text-white hover:bg-amber-700"
                          >
                            Şifre sıfırlama başlat
                          </button>
                        </div>
                        <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm font-black text-slate-900">
                            Hesap durumu
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                            Pasif kullanıcı panele giriş yapamaz. Kayıtları ve
                            geçmiş hareketleri silinmez.
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleStaffStatus(selectedStaffUser)}
                            className={`mt-4 rounded-2xl px-4 py-3 text-sm font-black text-white ${
                              (selectedStaffUser.status ||
                                (selectedStaffUser.active === false
                                  ? "Pasif"
                                  : "Aktif")) === "Pasif"
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-slate-800 hover:bg-slate-900"
                            }`}
                          >
                            {(selectedStaffUser.status ||
                              (selectedStaffUser.active === false
                                ? "Pasif"
                                : "Aktif")) === "Pasif"
                              ? "Aktife al"
                              : "Pasife al"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-950">
                                Kullanıcı hareketleri
                              </p>
                              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                                Bu alan şimdilik frontend içi geçici kayıt
                                mantığıyla hesap oluşturma, durum, yetki ve
                                şifre sıfırlama hareketlerini gösterir.
                              </p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
                              {getStaffActivityLog(selectedStaffUser).length}{" "}
                              kayıt
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3">
                            {getStaffActivityLog(selectedStaffUser).map(
                              (activity, index) => (
                                <div
                                  key={`${activity.title}-${index}`}
                                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                                >
                                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                    <p className="text-sm font-black text-slate-900">
                                      {activity.title}
                                    </p>
                                    <span className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                                      {activity.time}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                                    {activity.text}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="rounded-[1.7rem] border border-red-200 bg-red-50 p-5">
                          <p className="text-sm font-black text-red-800">
                            Tehlikeli işlem
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-relaxed text-red-700">
                            Kullanıcı silme işlemi hesabı listeden kaldırır.
                            Geçmiş sipariş ve hareket kayıtları silinmez.
                          </p>
                          <button
                            type="button"
                            onClick={() => deleteStaffUser(selectedStaffUser)}
                            className="mt-4 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700"
                          >
                            Kullanıcıyı sil
                          </button>
                        </div>
                      </div>

                      {selectedStaffUser.note && (
                        <div className="mt-5 rounded-[1.7rem] border border-slate-200 bg-white p-5">
                          <p className="text-sm font-black text-slate-950">
                            İç not
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                            {selectedStaffUser.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {staffActionModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
                    <div
                      className={`rounded-[1.5rem] border p-5 ${
                        staffActionModal.type === "danger"
                          ? "border-red-200 bg-red-50"
                          : staffActionModal.type === "warning"
                            ? "border-amber-200 bg-amber-50"
                            : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-black uppercase tracking-[0.18em] ${
                          staffActionModal.type === "danger"
                            ? "text-red-700"
                            : staffActionModal.type === "warning"
                              ? "text-amber-700"
                              : "text-blue-700"
                        }`}
                      >
                        {staffActionModal.onConfirm
                          ? "Onay gerekli"
                          : "Bilgilendirme"}
                      </p>
                      <h3 className="mt-2 text-xl font-black text-slate-950">
                        {staffActionModal.title}
                      </h3>
                      <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">
                        {staffActionModal.text}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                      {staffActionModal.onConfirm && (
                        <button
                          type="button"
                          onClick={() => setStaffActionModal(null)}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:border-slate-300"
                        >
                          {staffActionModal.cancelLabel || "Vazgeç"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={
                          staffActionModal.onConfirm ||
                          (() => setStaffActionModal(null))
                        }
                        className={`rounded-2xl px-4 py-2 text-sm font-black text-white ${
                          staffActionModal.type === "danger"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-700 hover:bg-blue-800"
                        }`}
                      >
                        {staffActionModal.confirmLabel || "Tamam"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
          {activeTab === "announcements" && (
            <section className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-2 shadow-sm">
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    { id: "create", label: "Yeni duyuru oluştur" },
                    { id: "list", label: "Duyuru listesi" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAnnouncementSectionTab(tab.id)}
                      className={`rounded-[1.5rem] px-4 py-3 text-sm font-black transition ${
                        announcementSectionTab === tab.id
                          ? "bg-blue-700 text-white shadow-lg shadow-blue-700/20"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {announcementSectionTab === "create" && (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                        Duyuru merkezi
                      </p>
                      <h2 className="mt-1 text-2xl font-black text-slate-950">
                        Yeni duyuru oluştur
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-500">
                        Kurum panelinde görünecek duyuruları buradan
                        hazırlayabilirsin. Görsel eklenirse duyuru kartında
                        önizleme olarak gösterilir.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100">
                      {newAnnouncement.status}
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="grid gap-4">
                      <AdminInput
                        label="Duyuru başlığı *"
                        value={newAnnouncement.title}
                        onChange={(v) =>
                          setNewAnnouncement({ ...newAnnouncement, title: v })
                        }
                      />
                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Duyuru metni *
                        </label>
                        <textarea
                          value={newAnnouncement.text}
                          onChange={(e) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              text: e.target.value,
                            })
                          }
                          rows={6}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          placeholder="Kurumlara gösterilecek açıklamayı yaz..."
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <AdminInput
                          label="Duyuru tipi"
                          value={newAnnouncement.type}
                          onChange={(v) =>
                            setNewAnnouncement({ ...newAnnouncement, type: v })
                          }
                          options={announcementTypes.map((item) => ({
                            value: item,
                            label: item,
                          }))}
                        />
                        <AdminInput
                          label="Hedef kitle"
                          value={newAnnouncement.audience}
                          onChange={(v) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              audience: v,
                              audienceCustomerIds: [],
                              audienceCustomerTypes: [],
                            })
                          }
                          options={announcementAudiences.map((item) => ({
                            value: item,
                            label: item,
                          }))}
                        />
                        <AdminInput
                          label="Yayın durumu"
                          value={newAnnouncement.status}
                          onChange={(v) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              status: v,
                            })
                          }
                          options={announcementStatuses.map((item) => ({
                            value: item,
                            label: item,
                          }))}
                        />
                        <AdminInput
                          label="Öncelik"
                          value={newAnnouncement.priority}
                          onChange={(v) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              priority: v,
                            })
                          }
                          options={announcementPriorities.map((item) => ({
                            value: item,
                            label: item,
                          }))}
                        />
                        <AdminInput
                          label="Başlangıç tarihi"
                          type="date"
                          value={newAnnouncement.startDate}
                          onChange={(v) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              startDate: v,
                            })
                          }
                        />
                        <AdminInput
                          label="Bitiş tarihi"
                          type="date"
                          value={newAnnouncement.endDate}
                          onChange={(v) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              endDate: v,
                            })
                          }
                        />
                        <AdminInput
                          label="Kurum paneli görünümü"
                          value={newAnnouncement.displayMode}
                          onChange={(v) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              displayMode: v,
                            })
                          }
                          options={announcementDisplayModes.map((item) => ({
                            value: item.value,
                            label: item.label,
                          }))}
                        />
                      </div>

                      {newAnnouncement.audience === "Seçili kurumlar" && (
                        <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
                          <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                            Hedef kurum seçimi
                          </p>
                          <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                            {customers.map((customer) => {
                              const selected = (
                                newAnnouncement.audienceCustomerIds || []
                              ).includes(customer.id);
                              return (
                                <label
                                  key={customer.id}
                                  className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-blue-100"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={(event) => {
                                      const currentIds =
                                        newAnnouncement.audienceCustomerIds ||
                                        [];
                                      setNewAnnouncement({
                                        ...newAnnouncement,
                                        audienceCustomerIds: event.target
                                          .checked
                                          ? [...currentIds, customer.id]
                                          : currentIds.filter(
                                              (id) => id !== customer.id,
                                            ),
                                      });
                                    }}
                                  />
                                  <span className="min-w-0 truncate">
                                    {customer.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {newAnnouncement.audience === "Kurum tipine göre" && (
                        <div className="rounded-[1.5rem] border border-indigo-100 bg-indigo-50/60 p-4">
                          <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
                            Kurum tipi seçimi
                          </p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {customerTypes.map((type) => {
                              const selected = (
                                newAnnouncement.audienceCustomerTypes || []
                              ).includes(type);
                              return (
                                <label
                                  key={type}
                                  className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-indigo-100"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={(event) => {
                                      const currentTypes =
                                        newAnnouncement.audienceCustomerTypes ||
                                        [];
                                      setNewAnnouncement({
                                        ...newAnnouncement,
                                        audienceCustomerTypes: event.target
                                          .checked
                                          ? [...currentTypes, type]
                                          : currentTypes.filter(
                                              (item) => item !== type,
                                            ),
                                      });
                                    }}
                                  />
                                  {type}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Kurum paneli önizleme tipi
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          {getAnnouncementDisplayModeLabel(
                            newAnnouncement.displayMode,
                          )}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {
                            announcementDisplayModes.find(
                              (item) =>
                                item.value === newAnnouncement.displayMode,
                            )?.description
                          }
                        </p>
                      </div>

                      <AdminInput
                        label="Yönlendirme linki"
                        value={newAnnouncement.link}
                        onChange={(v) =>
                          setNewAnnouncement({ ...newAnnouncement, link: v })
                        }
                        placeholder="İsteğe bağlı"
                      />
                      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
                        <input
                          type="checkbox"
                          checked={newAnnouncement.pinned}
                          onChange={(e) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              pinned: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                        />
                        Duyuruyu kurum panelinde sabitle
                      </label>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                            Görsel
                          </p>
                          <h3 className="text-lg font-black text-slate-950">
                            Duyuru görseli
                          </h3>
                        </div>
                        {newAnnouncement.imageUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setAnnouncementImageModal({ mode: "create" })
                            }
                            className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50"
                          >
                            Görseli düzenle
                          </button>
                        )}
                      </div>
                      <div
                        className={`relative overflow-hidden ${getAnnouncementImageRadiusClass(newAnnouncement.imageRadius)} border border-dashed border-slate-300 bg-white`}
                      >
                        {newAnnouncement.imageUrl ? (
                          <>
                            <img
                              src={newAnnouncement.imageUrl}
                              alt={
                                newAnnouncement.imageAlt ||
                                newAnnouncement.title ||
                                "Duyuru görseli"
                              }
                              className={`${getAnnouncementImageHeightClass(newAnnouncement.imageHeight)} w-full ${getAnnouncementImageFitClass(newAnnouncement.imageFit)} ${getAnnouncementImagePositionClass(newAnnouncement.imagePosition)}`}
                              style={getAnnouncementImageStyle(newAnnouncement)}
                            />
                            {getAnnouncementImageOverlayClass(
                              newAnnouncement.imageOverlay,
                            ) && (
                              <div
                                className={`pointer-events-none absolute inset-0 ${getAnnouncementImageOverlayClass(newAnnouncement.imageOverlay)}`}
                              />
                            )}
                          </>
                        ) : (
                          <div className="grid h-56 place-items-center p-6 text-center">
                            <div>
                              <Upload
                                className="mx-auto mb-3 text-slate-400"
                                size={34}
                              />
                              <p className="text-sm font-black text-slate-700">
                                Henüz görsel eklenmedi
                              </p>
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                JPG, PNG veya WEBP dosyası seçebilirsin.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 grid gap-3">
                        <label className="cursor-pointer rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-slate-800">
                          Bilgisayardan görsel seç
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () =>
                                setNewAnnouncement({
                                  ...newAnnouncement,
                                  imageUrl: String(reader.result || ""),
                                  imageAlt:
                                    newAnnouncement.imageAlt || file.name,
                                });
                              reader.readAsDataURL(file);
                              event.target.value = "";
                            }}
                          />
                        </label>
                        <AdminInput
                          label="Görsel URL"
                          value={newAnnouncement.imageUrl}
                          onChange={(v) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              imageUrl: v,
                            })
                          }
                          placeholder="Dosya yerine URL de kullanabilirsin"
                        />
                        <AdminInput
                          label="Görsel açıklaması"
                          value={newAnnouncement.imageAlt}
                          onChange={(v) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              imageAlt: v,
                            })
                          }
                          placeholder="Örn. Kampanya afişi"
                        />
                        {newAnnouncement.imageUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                imageUrl: "",
                                imageAlt: "",
                              })
                            }
                            className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-100"
                          >
                            Görseli kaldır
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() => setNewAnnouncement(blankAnnouncement)}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 hover:border-slate-300"
                    >
                      Formu temizle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          !newAnnouncement.title.trim() ||
                          !newAnnouncement.text.trim()
                        ) {
                          setAnnouncementConfirmModal({
                            type: "info",
                            title: "Eksik bilgi var",
                            text: "Duyuru oluşturmak için başlık ve duyuru metni zorunludur.",
                          });
                          return;
                        }
                        if (
                          newAnnouncement.startDate &&
                          newAnnouncement.endDate &&
                          newAnnouncement.endDate < newAnnouncement.startDate
                        ) {
                          setAnnouncementConfirmModal({
                            type: "info",
                            title: "Tarih aralığı hatalı",
                            text: "Bitiş tarihi başlangıç tarihinden önce olamaz.",
                          });
                          return;
                        }
                        if (
                          newAnnouncement.audience === "Seçili kurumlar" &&
                          !(newAnnouncement.audienceCustomerIds || []).length
                        ) {
                          setAnnouncementConfirmModal({
                            type: "info",
                            title: "Hedef kurum seçilmedi",
                            text: "Seçili kurumlar hedefi için en az bir kurum seçmelisin.",
                          });
                          return;
                        }
                        if (
                          newAnnouncement.audience === "Kurum tipine göre" &&
                          !(newAnnouncement.audienceCustomerTypes || []).length
                        ) {
                          setAnnouncementConfirmModal({
                            type: "info",
                            title: "Kurum tipi seçilmedi",
                            text: "Kurum tipine göre hedefleme için en az bir kurum tipi seçmelisin.",
                          });
                          return;
                        }
                        const item = {
                          ...newAnnouncement,
                          id: Date.now(),
                          active: newAnnouncement.status === "Yayında",
                          createdAt: new Date().toISOString(),
                          changeLog: [
                            {
                              id: Date.now(),
                              action: "Duyuru oluşturuldu",
                              detail: `${newAnnouncement.status} durumunda kaydedildi.`,
                              date: new Date().toISOString(),
                            },
                          ],
                        };
                        setAnnouncements((a) => [item, ...a]);
                        setNewAnnouncement(blankAnnouncement);
                        setAnnouncementSectionTab("list");
                        setAnnouncementConfirmModal({
                          type: "success",
                          title: "Duyuru oluşturuldu",
                          text: "Yeni duyuru listeye eklendi. Durumuna göre kurum panelinde görüntülenecek.",
                        });
                      }}
                      className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
                    >
                      Duyuru oluştur
                    </button>
                  </div>
                </div>
              )}

              {announcementSectionTab === "list" &&
                (() => {
                  const priorityRank = { Acil: 0, Önemli: 1, Normal: 2 };
                  const filteredAnnouncements = announcements
                    .filter((item) => {
                      const targetText = getAnnouncementTargetSummary(
                        item,
                        customers,
                      );
                      const haystack =
                        `${item.title || ""} ${item.text || ""} ${item.type || ""} ${item.audience || ""} ${targetText}`.toLocaleLowerCase(
                          "tr-TR",
                        );
                      const status =
                        item.status ||
                        (item.active === false ? "Pasif" : "Yayında");
                      const matchesSearch =
                        !announcementSearch ||
                        haystack.includes(
                          announcementSearch.toLocaleLowerCase("tr-TR"),
                        );
                      const matchesStatus =
                        announcementStatusFilter === "Tümü" ||
                        status === announcementStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .sort((a, b) => {
                      if (announcementSort === "En yeni")
                        return (
                          new Date(b.createdAt || 0) -
                          new Date(a.createdAt || 0)
                        );
                      if (announcementSort === "Öncelik")
                        return (
                          (priorityRank[a.priority] ?? 9) -
                          (priorityRank[b.priority] ?? 9)
                        );
                      if (announcementSort === "Sabitlenenler")
                        return (
                          Number(!!b.pinned) - Number(!!a.pinned) ||
                          new Date(b.createdAt || 0) -
                            new Date(a.createdAt || 0)
                        );
                      if (announcementSort === "Bitiş tarihi")
                        return String(a.endDate || "9999-12-31").localeCompare(
                          String(b.endDate || "9999-12-31"),
                        );
                      return (
                        Number(!!b.pinned) - Number(!!a.pinned) ||
                        (priorityRank[a.priority] ?? 9) -
                          (priorityRank[b.priority] ?? 9) ||
                        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                      );
                    });

                  return (
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                            Duyuru listesi
                          </p>
                          <h2 className="mt-1 text-2xl font-black text-slate-950">
                            Yayın yönetimi
                          </h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <div className="relative">
                            <Search
                              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              size={16}
                            />
                            <input
                              value={announcementSearch}
                              onChange={(e) =>
                                setAnnouncementSearch(e.target.value)
                              }
                              placeholder="Duyuru ara..."
                              className="w-64 rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </div>
                          <select
                            value={announcementStatusFilter}
                            onChange={(e) =>
                              setAnnouncementStatusFilter(e.target.value)
                            }
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            {["Tümü", ...announcementStatuses].map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                          <select
                            value={announcementSort}
                            onChange={(e) =>
                              setAnnouncementSort(e.target.value)
                            }
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            {announcementSortOptions.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                        <div className="grid grid-cols-[1.4fr_0.85fr_0.85fr_0.7fr_0.5fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
                          <span>Duyuru</span>
                          <span>Tip / hedef</span>
                          <span>Yayın</span>
                          <span>Durum</span>
                          <span className="text-right">İşlem</span>
                        </div>
                        {filteredAnnouncements.length === 0 ? (
                          <div className="p-8 text-center text-sm font-bold text-slate-500">
                            Kriterlere uygun duyuru bulunamadı.
                          </div>
                        ) : (
                          filteredAnnouncements.map((item) => {
                            const status =
                              item.status ||
                              (item.active === false ? "Pasif" : "Yayında");
                            return (
                              <div
                                key={item.id}
                                className="grid grid-cols-[1.4fr_0.85fr_0.85fr_0.7fr_0.5fr] items-center gap-3 border-t border-slate-100 px-4 py-4"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                                    {item.imageUrl ? (
                                      <img
                                        src={item.imageUrl}
                                        alt={item.imageAlt || item.title}
                                        className={`h-full w-full ${getAnnouncementImageFitClass(item.imageFit)} ${getAnnouncementImagePositionClass(item.imagePosition)}`}
                                        style={getAnnouncementImageStyle(item)}
                                      />
                                    ) : (
                                      <div className="grid h-full w-full place-items-center text-slate-400">
                                        <Megaphone size={20} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p
                                      className="truncate text-sm font-black text-slate-950"
                                      title={item.title}
                                    >
                                      {item.title}
                                    </p>
                                    <p
                                      className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500"
                                      title={item.text}
                                    >
                                      {item.text}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-slate-600">
                                  <p>{item.type || "Genel duyuru"}</p>
                                  <p className="mt-1 text-xs text-slate-400">
                                    {getAnnouncementTargetSummary(
                                      item,
                                      customers,
                                    )}
                                  </p>
                                  <p className="mt-1 text-[11px] font-black text-blue-500">
                                    {getAnnouncementDisplayModeLabel(
                                      item.displayMode,
                                    )}
                                  </p>
                                </div>
                                <div className="text-xs font-bold text-slate-500">
                                  <p>{item.startDate || "Başlangıç yok"}</p>
                                  <p className="mt-1">
                                    {item.endDate || "Bitiş yok"}
                                  </p>
                                </div>
                                <span
                                  className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
                                    status === "Yayında"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : status === "Planlandı"
                                        ? "bg-blue-50 text-blue-700"
                                        : status === "Pasif"
                                          ? "bg-red-50 text-red-700"
                                          : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAnnouncement(item);
                                    setAnnouncementDetailTab("preview");
                                  }}
                                  className="justify-self-end rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-slate-800"
                                >
                                  Detay
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}

              {selectedAnnouncement && (
                <Modal
                  title={selectedAnnouncement.title || "Duyuru detayı"}
                  eyebrow="Duyuru detay modalı"
                  width="max-w-5xl"
                  onClose={() => setSelectedAnnouncement(null)}
                >
                  <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                      <div
                        className={`relative overflow-hidden ${getAnnouncementImageRadiusClass(selectedAnnouncement.imageRadius)} bg-white ring-1 ring-slate-200`}
                      >
                        {selectedAnnouncement.imageUrl ? (
                          <>
                            <img
                              src={selectedAnnouncement.imageUrl}
                              alt={
                                selectedAnnouncement.imageAlt ||
                                selectedAnnouncement.title
                              }
                              className={`${getAnnouncementImageHeightClass(selectedAnnouncement.imageHeight)} w-full ${getAnnouncementImageFitClass(selectedAnnouncement.imageFit)} ${getAnnouncementImagePositionClass(selectedAnnouncement.imagePosition)}`}
                              style={getAnnouncementImageStyle(
                                selectedAnnouncement,
                              )}
                            />
                            {getAnnouncementImageOverlayClass(
                              selectedAnnouncement.imageOverlay,
                            ) && (
                              <div
                                className={`pointer-events-none absolute inset-0 ${getAnnouncementImageOverlayClass(selectedAnnouncement.imageOverlay)}`}
                              />
                            )}
                          </>
                        ) : (
                          <div className="grid h-64 place-items-center text-slate-400">
                            <Megaphone size={42} />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setAnnouncementImageModal({
                            mode: "edit",
                            announcement: selectedAnnouncement,
                          })
                        }
                        className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50"
                      >
                        Görseli düzenle
                      </button>
                    </div>

                    <div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {[
                          { id: "preview", label: "Önizleme" },
                          { id: "publish", label: "Yayın bilgileri" },
                          { id: "panel", label: "Kurum paneli" },
                          { id: "edit", label: "Düzenle" },
                          { id: "history", label: "Değişiklik kaydı" },
                          { id: "actions", label: "İşlemler" },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setAnnouncementDetailTab(tab.id)}
                            className={`rounded-2xl px-4 py-2 text-xs font-black ${
                              announcementDetailTab === tab.id
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {announcementDetailTab === "preview" && (
                        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                              {selectedAnnouncement.type || "Genel duyuru"}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                              {selectedAnnouncement.priority || "Normal"}
                            </span>
                            {selectedAnnouncement.pinned && (
                              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                                Sabitli
                              </span>
                            )}
                          </div>
                          <h3 className="mt-4 text-2xl font-black text-slate-950">
                            {selectedAnnouncement.title}
                          </h3>
                          <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-relaxed text-slate-600">
                            {selectedAnnouncement.text}
                          </p>
                          {selectedAnnouncement.link && (
                            <p className="mt-4 text-xs font-black text-blue-700">
                              Link: {selectedAnnouncement.link}
                            </p>
                          )}
                        </div>
                      )}

                      {announcementDetailTab === "publish" && (
                        <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:grid-cols-2">
                          {[
                            [
                              "Hedef kitle",
                              selectedAnnouncement.audience || "Tüm kurumlar",
                            ],
                            [
                              "Hedef detay",
                              getAnnouncementTargetSummary(
                                selectedAnnouncement,
                                customers,
                              ),
                            ],
                            [
                              "Kurum görünümü",
                              getAnnouncementDisplayModeLabel(
                                selectedAnnouncement.displayMode,
                              ),
                            ],
                            [
                              "Durum",
                              selectedAnnouncement.status ||
                                (selectedAnnouncement.active === false
                                  ? "Pasif"
                                  : "Yayında"),
                            ],
                            [
                              "Başlangıç",
                              selectedAnnouncement.startDate || "Belirlenmedi",
                            ],
                            [
                              "Bitiş",
                              selectedAnnouncement.endDate || "Belirlenmedi",
                            ],
                            [
                              "Öncelik",
                              selectedAnnouncement.priority || "Normal",
                            ],
                            [
                              "Oluşturma",
                              selectedAnnouncement.createdAt
                                ? formatDate(selectedAnnouncement.createdAt)
                                : "Sistem kaydı",
                            ],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-2xl bg-slate-50 p-4"
                            >
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                {label}
                              </p>
                              <p className="mt-1 text-sm font-black text-slate-800">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {announcementDetailTab === "panel" && (
                        <div className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                              Kurum paneli görünümü
                            </p>
                            <h3 className="mt-1 text-xl font-black text-slate-950">
                              {getAnnouncementDisplayModeLabel(
                                selectedAnnouncement.displayMode,
                              )}
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              {
                                announcementDisplayModes.find(
                                  (item) =>
                                    item.value ===
                                    (selectedAnnouncement.displayMode ||
                                      "card"),
                                )?.description
                              }
                            </p>
                          </div>

                          {(selectedAnnouncement.displayMode || "card") ===
                            "banner" && (
                            <div className="overflow-hidden rounded-2xl bg-blue-700 p-5 text-white shadow-lg">
                              <p className="text-xs font-black uppercase tracking-wide text-blue-100">
                                {selectedAnnouncement.type || "Duyuru"}
                              </p>
                              <h4 className="mt-1 text-2xl font-black">
                                {selectedAnnouncement.title}
                              </h4>
                              <p className="mt-2 line-clamp-2 text-sm font-semibold text-blue-50">
                                {selectedAnnouncement.text}
                              </p>
                            </div>
                          )}

                          {(selectedAnnouncement.displayMode || "card") ===
                            "spotlight" && (
                            <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
                              {selectedAnnouncement.imageUrl && (
                                <img
                                  src={selectedAnnouncement.imageUrl}
                                  alt={
                                    selectedAnnouncement.imageAlt ||
                                    selectedAnnouncement.title
                                  }
                                  className={`h-56 w-full ${getAnnouncementImageFitClass(selectedAnnouncement.imageFit)} ${getAnnouncementImagePositionClass(selectedAnnouncement.imagePosition)}`}
                                  style={getAnnouncementImageStyle(
                                    selectedAnnouncement,
                                  )}
                                />
                              )}
                              <div className="p-5">
                                <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                                  Öne çıkan duyuru
                                </p>
                                <h4 className="mt-1 text-2xl font-black text-slate-950">
                                  {selectedAnnouncement.title}
                                </h4>
                                <p className="mt-2 text-sm font-semibold text-slate-600">
                                  {selectedAnnouncement.text}
                                </p>
                              </div>
                            </div>
                          )}

                          {(selectedAnnouncement.displayMode || "card") ===
                            "compact" && (
                            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                              <div>
                                <p className="text-sm font-black text-slate-950">
                                  {selectedAnnouncement.title}
                                </p>
                                <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
                                  {selectedAnnouncement.text}
                                </p>
                              </div>
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                                Detay
                              </span>
                            </div>
                          )}

                          {(selectedAnnouncement.displayMode || "card") ===
                            "card" && (
                            <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                                  {selectedAnnouncement.type || "Duyuru"}
                                </span>
                                {selectedAnnouncement.pinned && (
                                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                                    Sabitli
                                  </span>
                                )}
                              </div>
                              <h4 className="mt-3 text-xl font-black text-slate-950">
                                {selectedAnnouncement.title}
                              </h4>
                              <p className="mt-2 text-sm font-semibold text-slate-600">
                                {selectedAnnouncement.text}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {announcementDetailTab === "edit" && (
                        <div className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                          <AdminInput
                            label="Başlık"
                            value={selectedAnnouncement.title || ""}
                            onChange={(v) =>
                              setSelectedAnnouncement({
                                ...selectedAnnouncement,
                                title: v,
                              })
                            }
                          />
                          <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                              Metin
                            </label>
                            <textarea
                              value={selectedAnnouncement.text || ""}
                              onChange={(e) =>
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  text: e.target.value,
                                })
                              }
                              rows={5}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <AdminInput
                              label="Tip"
                              value={
                                selectedAnnouncement.type || "Genel duyuru"
                              }
                              onChange={(v) =>
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  type: v,
                                })
                              }
                              options={announcementTypes.map((item) => ({
                                value: item,
                                label: item,
                              }))}
                            />
                            <AdminInput
                              label="Hedef"
                              value={
                                selectedAnnouncement.audience || "Tüm kurumlar"
                              }
                              onChange={(v) =>
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  audience: v,
                                  audienceCustomerIds: [],
                                  audienceCustomerTypes: [],
                                })
                              }
                              options={announcementAudiences.map((item) => ({
                                value: item,
                                label: item,
                              }))}
                            />
                            <AdminInput
                              label="Durum"
                              value={selectedAnnouncement.status || "Yayında"}
                              onChange={(v) =>
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  status: v,
                                  active: v === "Yayında",
                                })
                              }
                              options={announcementStatuses.map((item) => ({
                                value: item,
                                label: item,
                              }))}
                            />
                            <AdminInput
                              label="Öncelik"
                              value={selectedAnnouncement.priority || "Normal"}
                              onChange={(v) =>
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  priority: v,
                                })
                              }
                              options={announcementPriorities.map((item) => ({
                                value: item,
                                label: item,
                              }))}
                            />
                            <AdminInput
                              label="Başlangıç"
                              type="date"
                              value={selectedAnnouncement.startDate || ""}
                              onChange={(v) =>
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  startDate: v,
                                })
                              }
                            />
                            <AdminInput
                              label="Bitiş"
                              type="date"
                              value={selectedAnnouncement.endDate || ""}
                              onChange={(v) =>
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  endDate: v,
                                })
                              }
                            />
                            <AdminInput
                              label="Kurum paneli görünümü"
                              value={selectedAnnouncement.displayMode || "card"}
                              onChange={(v) =>
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  displayMode: v,
                                })
                              }
                              options={announcementDisplayModes.map((item) => ({
                                value: item.value,
                                label: item.label,
                              }))}
                            />
                          </div>

                          {selectedAnnouncement.audience ===
                            "Seçili kurumlar" && (
                            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
                              <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                                Hedef kurumlar
                              </p>
                              <div className="mt-3 grid max-h-52 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                                {customers.map((customer) => {
                                  const selected = (
                                    selectedAnnouncement.audienceCustomerIds ||
                                    []
                                  ).includes(customer.id);
                                  return (
                                    <label
                                      key={customer.id}
                                      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-blue-100"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={(event) => {
                                          const currentIds =
                                            selectedAnnouncement.audienceCustomerIds ||
                                            [];
                                          setSelectedAnnouncement({
                                            ...selectedAnnouncement,
                                            audienceCustomerIds: event.target
                                              .checked
                                              ? [...currentIds, customer.id]
                                              : currentIds.filter(
                                                  (id) => id !== customer.id,
                                                ),
                                          });
                                        }}
                                      />
                                      <span className="min-w-0 truncate">
                                        {customer.name}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {selectedAnnouncement.audience ===
                            "Kurum tipine göre" && (
                            <div className="rounded-[1.5rem] border border-indigo-100 bg-indigo-50/60 p-4">
                              <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
                                Hedef kurum tipleri
                              </p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                {customerTypes.map((type) => {
                                  const selected = (
                                    selectedAnnouncement.audienceCustomerTypes ||
                                    []
                                  ).includes(type);
                                  return (
                                    <label
                                      key={type}
                                      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-indigo-100"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={(event) => {
                                          const currentTypes =
                                            selectedAnnouncement.audienceCustomerTypes ||
                                            [];
                                          setSelectedAnnouncement({
                                            ...selectedAnnouncement,
                                            audienceCustomerTypes: event.target
                                              .checked
                                              ? [...currentTypes, type]
                                              : currentTypes.filter(
                                                  (item) => item !== type,
                                                ),
                                          });
                                        }}
                                      />
                                      {type}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <AdminInput
                            label="Yönlendirme linki"
                            value={selectedAnnouncement.link || ""}
                            onChange={(v) =>
                              setSelectedAnnouncement({
                                ...selectedAnnouncement,
                                link: v,
                              })
                            }
                          />
                          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
                            <input
                              type="checkbox"
                              checked={!!selectedAnnouncement.pinned}
                              onChange={(e) =>
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  pinned: e.target.checked,
                                })
                              }
                            />
                            Sabitli duyuru
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                !selectedAnnouncement.title?.trim() ||
                                !selectedAnnouncement.text?.trim()
                              ) {
                                setAnnouncementConfirmModal({
                                  type: "info",
                                  title: "Eksik bilgi",
                                  text: "Başlık ve metin boş bırakılamaz.",
                                });
                                return;
                              }
                              if (
                                selectedAnnouncement.startDate &&
                                selectedAnnouncement.endDate &&
                                selectedAnnouncement.endDate <
                                  selectedAnnouncement.startDate
                              ) {
                                setAnnouncementConfirmModal({
                                  type: "info",
                                  title: "Tarih aralığı hatalı",
                                  text: "Bitiş tarihi başlangıç tarihinden önce olamaz.",
                                });
                                return;
                              }
                              if (
                                selectedAnnouncement.audience ===
                                  "Seçili kurumlar" &&
                                !(
                                  selectedAnnouncement.audienceCustomerIds || []
                                ).length
                              ) {
                                setAnnouncementConfirmModal({
                                  type: "info",
                                  title: "Hedef kurum seçilmedi",
                                  text: "En az bir kurum seçmelisin.",
                                });
                                return;
                              }
                              if (
                                selectedAnnouncement.audience ===
                                  "Kurum tipine göre" &&
                                !(
                                  selectedAnnouncement.audienceCustomerTypes ||
                                  []
                                ).length
                              ) {
                                setAnnouncementConfirmModal({
                                  type: "info",
                                  title: "Kurum tipi seçilmedi",
                                  text: "En az bir kurum tipi seçmelisin.",
                                });
                                return;
                              }
                              const updated = appendAnnouncementLog(
                                selectedAnnouncement,
                                "Duyuru güncellendi",
                                "Başlık, metin, hedef veya yayın bilgileri kaydedildi.",
                              );
                              setSelectedAnnouncement(updated);
                              setAnnouncements((items) =>
                                items.map((item) =>
                                  item.id === selectedAnnouncement.id
                                    ? updated
                                    : item,
                                ),
                              );
                              setAnnouncementConfirmModal({
                                type: "success",
                                title: "Duyuru güncellendi",
                                text: "Duyuru bilgileri başarıyla kaydedildi.",
                              });
                            }}
                            className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"
                          >
                            Değişiklikleri kaydet
                          </button>
                        </div>
                      )}

                      {announcementDetailTab === "history" && (
                        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Değişiklik kaydı
                          </p>
                          <div className="mt-4 grid gap-3">
                            {(selectedAnnouncement.changeLog || []).length ===
                            0 ? (
                              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                                Bu duyuru için henüz değişiklik kaydı yok.
                              </p>
                            ) : (
                              selectedAnnouncement.changeLog.map((log) => (
                                <div
                                  key={log.id}
                                  className="rounded-2xl bg-slate-50 p-4"
                                >
                                  <p className="text-sm font-black text-slate-900">
                                    {log.action}
                                  </p>
                                  <p className="mt-1 text-xs font-semibold text-slate-500">
                                    {log.detail}
                                  </p>
                                  <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                                    {log.date
                                      ? formatDate(log.date)
                                      : "Tarih yok"}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {announcementDetailTab === "actions" && (
                        <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                          <button
                            type="button"
                            onClick={() =>
                              setAnnouncementConfirmModal({
                                type: "warning",
                                title:
                                  selectedAnnouncement.status === "Yayında"
                                    ? "Duyuru pasife alınsın mı?"
                                    : "Duyuru yayına alınsın mı?",
                                text:
                                  selectedAnnouncement.status === "Yayında"
                                    ? "Bu duyuru kurum panelinde görünmez hale gelecek."
                                    : "Bu duyuru kurum panelinde yayınlanabilir hale gelecek.",
                                confirmLabel:
                                  selectedAnnouncement.status === "Yayında"
                                    ? "Pasife al"
                                    : "Yayına al",
                                onConfirm: () => {
                                  const nextStatus =
                                    selectedAnnouncement.status === "Yayında"
                                      ? "Pasif"
                                      : "Yayında";
                                  const updated = appendAnnouncementLog(
                                    {
                                      ...selectedAnnouncement,
                                      status: nextStatus,
                                      active: nextStatus === "Yayında",
                                    },
                                    nextStatus === "Yayında"
                                      ? "Duyuru yayına alındı"
                                      : "Duyuru pasife alındı",
                                    nextStatus === "Yayında"
                                      ? "Duyuru kurum panelinde görünür hale getirildi."
                                      : "Duyuru kurum panelinde gizlendi.",
                                  );
                                  setAnnouncements((items) =>
                                    items.map((item) =>
                                      item.id === selectedAnnouncement.id
                                        ? updated
                                        : item,
                                    ),
                                  );
                                  setSelectedAnnouncement(updated);
                                  setAnnouncementConfirmModal(null);
                                },
                              })
                            }
                            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
                          >
                            {selectedAnnouncement.status === "Yayında"
                              ? "Duyuruyu pasife al"
                              : "Duyuruyu yayına al"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAnnouncementConfirmModal({
                                type: "danger",
                                title: "Duyuru silinsin mi?",
                                text: "Bu işlem duyuruyu listeden kaldırır. Frontend geçici sistemde geri alma işlemi yoktur.",
                                confirmLabel: "Evet, sil",
                                onConfirm: () => {
                                  setAnnouncements((items) =>
                                    items.filter(
                                      (item) =>
                                        item.id !== selectedAnnouncement.id,
                                    ),
                                  );
                                  setSelectedAnnouncement(null);
                                  setAnnouncementConfirmModal(null);
                                },
                              })
                            }
                            className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-100"
                          >
                            Duyuruyu sil
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Modal>
              )}

              {announcementImageModal && (
                <Modal
                  title="Duyuru görselini düzenle"
                  eyebrow="Görsel yönetimi"
                  width="max-w-5xl"
                  onClose={() => setAnnouncementImageModal(null)}
                >
                  {(() => {
                    const editingExisting =
                      announcementImageModal.mode === "edit";
                    const current = editingExisting
                      ? selectedAnnouncement
                      : newAnnouncement;
                    const applyImage = (patch) => {
                      if (editingExisting) {
                        const updated = { ...selectedAnnouncement, ...patch };
                        setSelectedAnnouncement(updated);
                        setAnnouncements((items) =>
                          items.map((item) =>
                            item.id === updated.id ? updated : item,
                          ),
                        );
                      } else {
                        setNewAnnouncement({ ...newAnnouncement, ...patch });
                      }
                    };
                    const ControlSelect = ({
                      label,
                      value,
                      onChange,
                      options,
                      helper,
                    }) => (
                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                          {label}
                        </label>
                        <select
                          value={value}
                          onChange={(event) => onChange(event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                          {options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {helper && (
                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            {helper}
                          </p>
                        )}
                      </div>
                    );
                    const imageFit = current?.imageFit || "cover";
                    const imagePosition = current?.imagePosition || "center";
                    const imageHeight = current?.imageHeight || "medium";
                    const imageRadius = current?.imageRadius || "soft";
                    const imageOverlay = current?.imageOverlay || "none";
                    const imageCropZoom = current?.imageCropZoom || 100;
                    const imageCropX = current?.imageCropX ?? 50;
                    const imageCropY = current?.imageCropY ?? 50;
                    const fitDescription = announcementImageFitOptions.find(
                      (item) => item.value === imageFit,
                    )?.description;
                    return (
                      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                                Canlı önizleme
                              </p>
                              <h3 className="text-lg font-black text-slate-950">
                                Görselin kurum panelindeki görünümü
                              </h3>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
                              {announcementImageHeightOptions.find(
                                (item) => item.value === imageHeight,
                              )?.label || "Standart"}
                            </span>
                          </div>
                          <div
                            className={`relative overflow-hidden ${getAnnouncementImageRadiusClass(imageRadius)} bg-white ring-1 ring-slate-200`}
                          >
                            {current?.imageUrl ? (
                              <>
                                <img
                                  src={current.imageUrl}
                                  alt={
                                    current.imageAlt ||
                                    current.title ||
                                    "Duyuru görseli"
                                  }
                                  className={`${getAnnouncementImageHeightClass(imageHeight)} w-full ${getAnnouncementImageFitClass(imageFit)} ${getAnnouncementImagePositionClass(imagePosition)}`}
                                  style={getAnnouncementImageStyle(current)}
                                />
                                {getAnnouncementImageOverlayClass(
                                  imageOverlay,
                                ) && (
                                  <div
                                    className={`pointer-events-none absolute inset-0 ${getAnnouncementImageOverlayClass(imageOverlay)}`}
                                  />
                                )}
                              </>
                            ) : (
                              <div className="grid h-72 place-items-center p-8 text-center text-slate-400">
                                <div>
                                  <Upload className="mx-auto mb-3" size={44} />
                                  <p className="text-sm font-black text-slate-600">
                                    Önizleme için görsel ekle
                                  </p>
                                  <p className="mt-1 text-xs font-semibold text-slate-400">
                                    Dosya seçebilir veya görsel URL'si
                                    kullanabilirsin.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                              Duyuru önizlemesi
                            </p>
                            <h4 className="mt-2 text-xl font-black text-slate-950">
                              {current?.title || "Duyuru başlığı"}
                            </h4>
                            <p className="mt-2 line-clamp-3 text-sm font-semibold leading-relaxed text-slate-600">
                              {current?.text ||
                                "Duyuru metni burada görünecek. Görsel ayarlarını değiştirirken bu önizleme kurum panelindeki hissi verir."}
                            </p>
                            {current?.imageAlt && (
                              <p className="mt-3 text-xs font-bold text-slate-400">
                                Görsel açıklaması: {current.imageAlt}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                          <div>
                            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                              Kaynak
                            </p>
                            <h3 className="text-lg font-black text-slate-950">
                              Görsel dosyası
                            </h3>
                          </div>
                          <label className="cursor-pointer rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-slate-800">
                            Bilgisayardan yeni görsel seç
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () =>
                                  applyImage({
                                    imageUrl: String(reader.result || ""),
                                    imageAlt: current?.imageAlt || file.name,
                                  });
                                reader.readAsDataURL(file);
                                event.target.value = "";
                              }}
                            />
                          </label>
                          <AdminInput
                            label="Görsel URL"
                            value={current?.imageUrl || ""}
                            onChange={(v) => applyImage({ imageUrl: v })}
                            placeholder="https://..."
                          />
                          <AdminInput
                            label="Görsel açıklaması"
                            value={current?.imageAlt || ""}
                            onChange={(v) => applyImage({ imageAlt: v })}
                            placeholder="Örn. LGS kampanya afişi"
                          />

                          <div className="my-1 h-px bg-slate-100" />
                          <div>
                            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                              Görünüm ayarları
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              Bu ayarlar görselin boyutunu, kırpma odağını ve
                              kurum panelinde nasıl görüneceğini belirler.
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <ControlSelect
                              label="Boyut"
                              value={imageHeight}
                              onChange={(value) =>
                                applyImage({ imageHeight: value })
                              }
                              options={announcementImageHeightOptions}
                            />
                            <ControlSelect
                              label="Yerleşim"
                              value={imageFit}
                              onChange={(value) =>
                                applyImage({ imageFit: value })
                              }
                              options={announcementImageFitOptions}
                              helper={fitDescription}
                            />
                            <ControlSelect
                              label="Odak noktası"
                              value={imagePosition}
                              onChange={(value) =>
                                applyImage({ imagePosition: value })
                              }
                              options={announcementImagePositionOptions}
                              helper="Kapla seçiliyken kırpmanın nereden yapılacağını belirler."
                            />
                            <ControlSelect
                              label="Köşe tipi"
                              value={imageRadius}
                              onChange={(value) =>
                                applyImage({ imageRadius: value })
                              }
                              options={announcementImageRadiusOptions}
                            />
                            <ControlSelect
                              label="Üzerine katman"
                              value={imageOverlay}
                              onChange={(value) =>
                                applyImage({ imageOverlay: value })
                              }
                              options={announcementImageOverlayOptions}
                              helper="Yazılı afişlerde kontrast için kullanılabilir."
                            />
                          </div>

                          <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200">
                            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                              Kırpma ayarları
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              Kapla yerleşiminde görseli yakınlaştırıp odağı
                              hassas ayarlayabilirsin.
                            </p>
                            <div className="mt-4 grid gap-4">
                              <label className="grid gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                                Yakınlaştırma: %{imageCropZoom}
                                <input
                                  type="range"
                                  min="100"
                                  max="180"
                                  value={imageCropZoom}
                                  onChange={(event) =>
                                    applyImage({
                                      imageCropZoom: Number(event.target.value),
                                    })
                                  }
                                />
                              </label>
                              <label className="grid gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                                Yatay odak: %{imageCropX}
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={imageCropX}
                                  onChange={(event) =>
                                    applyImage({
                                      imageCropX: Number(event.target.value),
                                    })
                                  }
                                />
                              </label>
                              <label className="grid gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                                Dikey odak: %{imageCropY}
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={imageCropY}
                                  onChange={(event) =>
                                    applyImage({
                                      imageCropY: Number(event.target.value),
                                    })
                                  }
                                />
                              </label>
                            </div>
                          </div>

                          <div className="grid gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-500">
                            <p>
                              Öneri: Banner/afiş için “Afiş + Kapla + Merkez”
                              iyi durur.
                            </p>
                            <p>
                              Ürün görseli veya logo için “Standart + Sığdır”
                              daha güvenlidir.
                            </p>
                          </div>

                          <div className="mt-2 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                              type="button"
                              onClick={() =>
                                applyImage({
                                  imageFit: "cover",
                                  imagePosition: "center",
                                  imageHeight: "medium",
                                  imageRadius: "soft",
                                  imageOverlay: "none",
                                  imageCropZoom: 100,
                                  imageCropX: 50,
                                  imageCropY: 50,
                                })
                              }
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 hover:border-slate-300"
                            >
                              Ayarları sıfırla
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                applyImage({
                                  imageUrl: "",
                                  imageAlt: "",
                                  imageOverlay: "none",
                                })
                              }
                              className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-100"
                            >
                              Görseli kaldır
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (editingExisting && selectedAnnouncement) {
                                  const updated = appendAnnouncementLog(
                                    selectedAnnouncement,
                                    "Görsel ayarları güncellendi",
                                    "Duyuru görseli, boyutu veya kırpma ayarları düzenlendi.",
                                  );
                                  setSelectedAnnouncement(updated);
                                  setAnnouncements((items) =>
                                    items.map((item) =>
                                      item.id === updated.id ? updated : item,
                                    ),
                                  );
                                }
                                setAnnouncementImageModal(null);
                              }}
                              className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"
                            >
                              Kaydet ve kapat
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </Modal>
              )}

              {announcementConfirmModal && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
                    <div
                      className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${
                        announcementConfirmModal.type === "danger"
                          ? "bg-red-50 text-red-700"
                          : announcementConfirmModal.type === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : announcementConfirmModal.type === "warning"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      <Megaphone size={22} />
                    </div>
                    <h3 className="text-xl font-black text-slate-950">
                      {announcementConfirmModal.title}
                    </h3>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">
                      {announcementConfirmModal.text}
                    </p>
                    <div className="mt-6 flex justify-end gap-2">
                      {announcementConfirmModal.onConfirm && (
                        <button
                          type="button"
                          onClick={() => setAnnouncementConfirmModal(null)}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
                        >
                          Vazgeç
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={
                          announcementConfirmModal.onConfirm ||
                          (() => setAnnouncementConfirmModal(null))
                        }
                        className={`rounded-2xl px-4 py-2 text-sm font-black text-white ${
                          announcementConfirmModal.type === "danger"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-700 hover:bg-blue-800"
                        }`}
                      >
                        {announcementConfirmModal.confirmLabel || "Tamam"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
          {activeTab === "settings" && (
            <section className="grid gap-6">
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-950 p-6 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-200">
                    Admin hesabı ayarları
                  </p>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black">
                        Şube operasyon ayarları
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-300">
                        Bu alan Noxelera markasını değil, giriş yapan admin
                        hesabının kendi kurumlarını, ürünlerini, sipariş akışını
                        ve Akson bağlantısını yönetir. İzmir admini ile
                        Eskişehir admini birbirinin ürün, duyuru, kurum veya
                        entegrasyon bilgilerini görmez.
                      </p>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm font-black ${settingsDirty ? "bg-amber-400 text-amber-950" : "bg-emerald-400 text-emerald-950"}`}
                    >
                      {settingsDirty
                        ? "Kaydedilmemiş değişiklik var"
                        : "Tüm ayarlar güncel"}
                    </div>
                  </div>
                </div>

                <div className="grid gap-0 xl:grid-cols-[18rem_1fr]">
                  <aside className="border-r border-slate-100 bg-slate-50 p-4">
                    <div className="grid gap-2">
                      {adminSettingsTabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => requestSettingsTabChange(tab.id)}
                          className={`rounded-2xl p-4 text-left transition ${settingsSectionTab === tab.id ? "bg-white text-blue-800 shadow-sm ring-1 ring-blue-100" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}
                        >
                          <p className="text-sm font-black">{tab.label}</p>
                          <p className="mt-1 text-xs font-bold leading-5 text-slate-400">
                            {tab.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className="p-6">
                    {settingsSectionTab === "business" && (
                      <div className="grid gap-6">
                        <div className="rounded-[1.5rem] bg-blue-50 p-5 ring-1 ring-blue-100">
                          <p className="text-sm font-black text-blue-900">
                            İşletme / şube bilgileri
                          </p>
                          <p className="mt-1 text-sm font-bold leading-6 text-blue-800">
                            Bu bilgiler yalnızca bu admin hesabına bağlı
                            kurumlara destek ve iletişim amacıyla gösterilir.
                          </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <AdminInput
                            label="İşletme adı"
                            value={adminSettings.businessName}
                            onChange={(v) =>
                              updateAdminSetting("businessName", v)
                            }
                          />
                          <AdminInput
                            label="Şube adı"
                            value={adminSettings.branchName}
                            onChange={(v) =>
                              updateAdminSetting("branchName", v)
                            }
                          />
                          <AdminInput
                            label="İşletme tipi"
                            value={adminSettings.businessType}
                            onChange={(v) =>
                              updateAdminSetting("businessType", v)
                            }
                            options={[
                              "Kitabevi",
                              "Yayınevi",
                              "Bayi",
                              "Distribütör",
                              "Diğer",
                            ]}
                          />
                          <AdminInput
                            label="İl"
                            value={adminSettings.city}
                            onChange={(v) => updateAdminSetting("city", v)}
                          />
                          <AdminInput
                            label="İlçe"
                            value={adminSettings.district}
                            onChange={(v) => updateAdminSetting("district", v)}
                          />
                          <AdminInput
                            label="Telefon"
                            value={adminSettings.phone}
                            onChange={(v) => updateAdminSetting("phone", v)}
                          />
                          <AdminInput
                            label="E-posta"
                            value={adminSettings.email}
                            onChange={(v) => updateAdminSetting("email", v)}
                          />
                          <AdminInput
                            label="WhatsApp destek hattı"
                            value={adminSettings.whatsapp}
                            onChange={(v) => updateAdminSetting("whatsapp", v)}
                          />
                          <AdminInput
                            label="Çalışma saatleri"
                            value={adminSettings.workingHours}
                            onChange={(v) =>
                              updateAdminSetting("workingHours", v)
                            }
                          />
                          <AdminInput
                            label="Navbar'da işletme adı görünsün mü?"
                            value={
                              adminSettings.showBusinessNameInCustomerNavbar
                                ? "Açık"
                                : "Kapalı"
                            }
                            onChange={(v) =>
                              updateAdminSetting(
                                "showBusinessNameInCustomerNavbar",
                                v === "Açık",
                              )
                            }
                            options={["Açık", "Kapalı"]}
                          />
                          <AdminInput
                            label="Kurumlara iletişim bilgisi gösterilsin mi?"
                            value={
                              adminSettings.showContactToCustomers
                                ? "Açık"
                                : "Kapalı"
                            }
                            onChange={(v) =>
                              updateAdminSetting(
                                "showContactToCustomers",
                                v === "Açık",
                              )
                            }
                            options={["Açık", "Kapalı"]}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="grid gap-2">
                            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                              Adres
                            </span>
                            <textarea
                              value={adminSettings.address}
                              onChange={(e) =>
                                updateAdminSetting("address", e.target.value)
                              }
                              rows={3}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                              placeholder="Şube adresi..."
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                              Kurumlara gösterilecek destek mesajı
                            </span>
                            <textarea
                              value={adminSettings.supportMessage}
                              onChange={(e) =>
                                updateAdminSetting(
                                  "supportMessage",
                                  e.target.value,
                                )
                              }
                              rows={3}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                              placeholder="Destek açıklaması..."
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {settingsSectionTab === "orders" && (
                      <div className="grid gap-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <AdminInput
                            label="Sipariş alımı"
                            value={
                              adminSettings.orderTakingEnabled
                                ? "Açık"
                                : "Kapalı"
                            }
                            onChange={(v) =>
                              updateAdminSetting(
                                "orderTakingEnabled",
                                v === "Açık",
                              )
                            }
                            options={["Açık", "Kapalı"]}
                          />
                          <AdminInput
                            label="Sipariş onay modu"
                            value={adminSettings.orderApprovalMode}
                            onChange={(v) =>
                              updateAdminSetting("orderApprovalMode", v)
                            }
                            options={orderApprovalOptions}
                          />
                          <AdminInput
                            label="Minimum sipariş adedi"
                            type="number"
                            value={adminSettings.minOrderQuantity}
                            onChange={(v) =>
                              updateAdminSetting(
                                "minOrderQuantity",
                                Number(v) || 1,
                              )
                            }
                          />
                          <AdminInput
                            label="Maksimum sipariş adedi"
                            type="number"
                            value={adminSettings.maxOrderQuantity}
                            onChange={(v) =>
                              updateAdminSetting(
                                "maxOrderQuantity",
                                Number(v) || 999,
                              )
                            }
                          />
                          <AdminInput
                            label="Kurum sipariş iptal edebilsin mi?"
                            value={
                              adminSettings.customerCanCancelOrder
                                ? "Evet"
                                : "Hayır"
                            }
                            onChange={(v) =>
                              updateAdminSetting(
                                "customerCanCancelOrder",
                                v === "Evet",
                              )
                            }
                            options={["Evet", "Hayır"]}
                          />
                          <AdminInput
                            label="Sipariş açıklaması zorunlu mu?"
                            value={
                              adminSettings.orderNoteRequired ? "Evet" : "Hayır"
                            }
                            onChange={(v) =>
                              updateAdminSetting(
                                "orderNoteRequired",
                                v === "Evet",
                              )
                            }
                            options={["Evet", "Hayır"]}
                          />
                          <AdminInput
                            label="Mesai dışı sipariş alınsın mı?"
                            value={
                              adminSettings.acceptAfterHoursOrders
                                ? "Evet"
                                : "Hayır"
                            }
                            onChange={(v) =>
                              updateAdminSetting(
                                "acceptAfterHoursOrders",
                                v === "Evet",
                              )
                            }
                            options={["Evet", "Hayır"]}
                          />
                        </div>
                        <label className="grid gap-2">
                          <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                            Sipariş kapalıyken kurumlara gösterilecek mesaj
                          </span>
                          <textarea
                            value={adminSettings.orderClosedMessage}
                            onChange={(e) =>
                              updateAdminSetting(
                                "orderClosedMessage",
                                e.target.value,
                              )
                            }
                            rows={3}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </label>
                      </div>
                    )}

                    {settingsSectionTab === "customerPortal" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {[
                          [
                            "customerCanViewProducts",
                            "Kurumlar ürünleri görebilsin",
                          ],
                          [
                            "customerCanViewPrices",
                            "Kurumlar fiyatları görebilsin",
                          ],
                          [
                            "customerCanViewOrderHistory",
                            "Kurumlar geçmiş siparişlerini görebilsin",
                          ],
                          [
                            "customerCanUseFavorites",
                            "Kurumlar favori ürün kullanabilsin",
                          ],
                          [
                            "customerCanEditProfile",
                            "Kurumlar kendi profilini düzenleyebilsin",
                          ],
                          [
                            "customerCanChangePassword",
                            "Kurumlar şifre değiştirebilsin",
                          ],
                          [
                            "showAnnouncementsInCustomerPanel",
                            "Duyurular kurum panelinde gösterilsin",
                          ],
                        ].map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              updateAdminSetting(key, !adminSettings[key])
                            }
                            className={`rounded-2xl border p-4 text-left transition ${adminSettings[key] ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-500"}`}
                          >
                            <p className="text-sm font-black">{label}</p>
                            <p className="mt-1 text-xs font-bold">
                              {adminSettings[key] ? "Açık" : "Kapalı"}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {settingsSectionTab === "products" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <AdminInput
                          label="Vitrin ürün sıralaması"
                          value={adminSettings.showcaseSortMode}
                          onChange={(v) =>
                            updateAdminSetting("showcaseSortMode", v)
                          }
                          options={showcaseSortOptions}
                        />
                        {[
                          [
                            "showOnlyActiveProducts",
                            "Sadece aktif ürünler gösterilsin",
                          ],
                          [
                            "hideOutOfStockProducts",
                            "Stok olmayan ürünler gizlensin",
                          ],
                          [
                            "ignoreDiscountOnLockedProducts",
                            "İndirimsiz ürünlerde iskonto uygulanmasın",
                          ],
                          [
                            "showPublisherOnProducts",
                            "Ürünlerde yayınevi gösterilsin",
                          ],
                          [
                            "showBarcodeOnProducts",
                            "Ürünlerde barkod gösterilsin",
                          ],
                          [
                            "showListPriceOnProducts",
                            "Ürünlerde liste fiyatı gösterilsin",
                          ],
                        ].map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              updateAdminSetting(key, !adminSettings[key])
                            }
                            className={`rounded-2xl border p-4 text-left transition ${adminSettings[key] ? "border-blue-200 bg-blue-50 text-blue-900" : "border-slate-200 bg-slate-50 text-slate-500"}`}
                          >
                            <p className="text-sm font-black">{label}</p>
                            <p className="mt-1 text-xs font-bold">
                              {adminSettings[key] ? "Açık" : "Kapalı"}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {settingsSectionTab === "security" && (
                      <div className="grid gap-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          {[
                            [
                              "forceStaffPasswordChange",
                              "Personel ilk girişte şifre değiştirsin",
                            ],
                            [
                              "forceCustomerPasswordChange",
                              "Kurum ilk girişte şifre değiştirsin",
                            ],
                            [
                              "inactiveCustomerCannotLogin",
                              "Pasif kurum giriş yapamasın",
                            ],
                            [
                              "inactiveStaffCannotLogin",
                              "Pasif kullanıcı giriş yapamasın",
                            ],
                            [
                              "lockAfterFailedAttempts",
                              "Hatalı girişte hesap kilitlensin",
                            ],
                            [
                              "confirmSensitiveActions",
                              "Hassas işlemlerde onay modalı kullanılsın",
                            ],
                          ].map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                updateAdminSetting(key, !adminSettings[key])
                              }
                              className={`rounded-2xl border p-4 text-left transition ${adminSettings[key] ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-500"}`}
                            >
                              <p className="text-sm font-black">{label}</p>
                              <p className="mt-1 text-xs font-bold">
                                {adminSettings[key] ? "Açık" : "Kapalı"}
                              </p>
                            </button>
                          ))}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <AdminInput
                            label="Hatalı giriş limiti"
                            type="number"
                            value={adminSettings.failedAttemptLimit}
                            onChange={(v) =>
                              updateAdminSetting(
                                "failedAttemptLimit",
                                Number(v) || 5,
                              )
                            }
                          />
                          <AdminInput
                            label="Oturum süresi / dakika"
                            type="number"
                            value={adminSettings.sessionDurationMinutes}
                            onChange={(v) =>
                              updateAdminSetting(
                                "sessionDurationMinutes",
                                Number(v) || 120,
                              )
                            }
                          />
                        </div>
                      </div>
                    )}

                    {settingsSectionTab === "notifications" && (
                      <div className="grid gap-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          {[
                            [
                              "notifyNewOrderToStaff",
                              "Yeni sipariş geldiğinde personele bildirim",
                            ],
                            [
                              "notifyCustomerOrderApproved",
                              "Sipariş onaylanınca kuruma bildirim",
                            ],
                            [
                              "notifyCustomerOrderCancelled",
                              "Sipariş iptal edilince kuruma bildirim",
                            ],
                            [
                              "notifyCustomersOnAnnouncement",
                              "Duyuru yayınlanınca kurumlara bildirim",
                            ],
                            [
                              "sendPasswordResetEmail",
                              "Şifre sıfırlama e-postası gönderilsin",
                            ],
                            [
                              "maintenanceMessageEnabled",
                              "Bakım mesajı aktif olsun",
                            ],
                          ].map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                updateAdminSetting(key, !adminSettings[key])
                              }
                              className={`rounded-2xl border p-4 text-left transition ${adminSettings[key] ? "border-blue-200 bg-blue-50 text-blue-900" : "border-slate-200 bg-slate-50 text-slate-500"}`}
                            >
                              <p className="text-sm font-black">{label}</p>
                              <p className="mt-1 text-xs font-bold">
                                {adminSettings[key] ? "Açık" : "Kapalı"}
                              </p>
                            </button>
                          ))}
                        </div>
                        <label className="grid gap-2">
                          <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                            Bakım mesajı
                          </span>
                          <textarea
                            value={adminSettings.maintenanceMessage}
                            onChange={(e) =>
                              updateAdminSetting(
                                "maintenanceMessage",
                                e.target.value,
                              )
                            }
                            rows={3}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </label>
                      </div>
                    )}

                    {settingsSectionTab === "integrations" && (
                      <div className="grid gap-6">
                        <div className="rounded-[1.5rem] bg-amber-50 p-5 ring-1 ring-amber-100">
                          <p className="text-sm font-black text-amber-900">
                            Admin hesabına özel entegrasyon
                          </p>
                          <p className="mt-1 text-sm font-bold leading-6 text-amber-800">
                            Fatura kes, ürün çek veya cari eşleştir gibi
                            işlemler bu admin hesabının kendi Akson/API
                            bilgileriyle yapılır. Başka şubenin bağlantı
                            bilgileriyle paylaşılmaz.
                          </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <AdminInput
                            label="Akson entegrasyonu"
                            value={
                              adminSettings.aksonEnabled ? "Aktif" : "Pasif"
                            }
                            onChange={(v) =>
                              updateAdminSetting("aksonEnabled", v === "Aktif")
                            }
                            options={["Aktif", "Pasif"]}
                          />
                          <AdminInput
                            label="Test modu"
                            value={
                              adminSettings.aksonTestMode ? "Açık" : "Kapalı"
                            }
                            onChange={(v) =>
                              updateAdminSetting("aksonTestMode", v === "Açık")
                            }
                            options={["Açık", "Kapalı"]}
                          />
                          <AdminInput
                            label="Akson API adresi"
                            value={adminSettings.aksonApiBaseUrl}
                            onChange={(v) =>
                              updateAdminSetting("aksonApiBaseUrl", v)
                            }
                          />
                          <AdminInput
                            label="Firma kodu"
                            value={adminSettings.aksonCompanyCode}
                            onChange={(v) =>
                              updateAdminSetting("aksonCompanyCode", v)
                            }
                          />
                          <AdminInput
                            label="Şube kodu"
                            value={adminSettings.aksonBranchCode}
                            onChange={(v) =>
                              updateAdminSetting("aksonBranchCode", v)
                            }
                          />
                          <AdminInput
                            label="Akson kullanıcı adı"
                            value={adminSettings.aksonUsername}
                            onChange={(v) =>
                              updateAdminSetting("aksonUsername", v)
                            }
                          />
                          <AdminInput
                            label="API token / anahtar"
                            type="password"
                            value={adminSettings.aksonApiToken}
                            onChange={(v) =>
                              updateAdminSetting("aksonApiToken", v)
                            }
                          />
                          <AdminInput
                            label="Fatura senaryosu"
                            value={adminSettings.aksonInvoiceScenario}
                            onChange={(v) =>
                              updateAdminSetting("aksonInvoiceScenario", v)
                            }
                            options={aksonInvoiceScenarioOptions}
                          />
                          <AdminInput
                            label="Fatura kes deyince Akson'a gönder"
                            value={
                              adminSettings.autoSendInvoiceToAkson
                                ? "Evet"
                                : "Hayır"
                            }
                            onChange={(v) =>
                              updateAdminSetting(
                                "autoSendInvoiceToAkson",
                                v === "Evet",
                              )
                            }
                            options={["Evet", "Hayır"]}
                          />
                          <AdminInput
                            label="Ürün çekmede Akson kullanılsın"
                            value={
                              adminSettings.useAksonForProductImport
                                ? "Evet"
                                : "Hayır"
                            }
                            onChange={(v) =>
                              updateAdminSetting(
                                "useAksonForProductImport",
                                v === "Evet",
                              )
                            }
                            options={["Evet", "Hayır"]}
                          />
                          <div className="rounded-2xl bg-amber-50 p-4 text-xs font-bold leading-5 text-amber-800 ring-1 ring-amber-100 md:col-span-2">
                            Akson ayarları sadece bu admin hesabının ürün çekme
                            ve fatura kesme işlemleri için kullanılır. Kurum
                            profilleri Akson ile doğrudan eşleştirilmez.
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={testAksonConnection}
                            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
                          >
                            Bağlantıyı test et
                          </button>
                          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold leading-5 text-slate-500 ring-1 ring-slate-100">
                            Bu test şimdilik frontend simülasyonudur. Backend
                            bağlanınca gerçek Akson bağlantı testi yapılır.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                      <p className="text-xs font-bold text-slate-400">
                        Ayarlar geçici frontend sisteminde tutulur. Backend
                        bağlandığında admin hesabı bazlı kaydedilir.
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setAdminSettings(savedAdminSettings)}
                          disabled={!settingsDirty}
                          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
                        >
                          Vazgeç
                        </button>
                        <button
                          type="button"
                          onClick={saveAdminSettings}
                          disabled={!settingsDirty}
                          className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-800"
                        >
                          Ayarları kaydet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {settingsConfirmModal && (
                <Modal
                  title={settingsConfirmModal.title}
                  eyebrow="Ayarlar / Onay"
                  onClose={() => setSettingsConfirmModal(null)}
                  width="max-w-xl"
                >
                  <div className="rounded-[1.5rem] bg-amber-50 p-5 text-amber-900 ring-1 ring-amber-100">
                    <p className="text-sm font-bold leading-6">
                      {settingsConfirmModal.text}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSettingsConfirmModal(null)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      onClick={settingsConfirmModal.onSecondary}
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-800 hover:bg-amber-100"
                    >
                      {settingsConfirmModal.secondaryLabel}
                    </button>
                    <button
                      type="button"
                      onClick={settingsConfirmModal.onConfirm}
                      className="rounded-2xl bg-blue-700 px-4 py-2 text-sm font-black text-white hover:bg-blue-800"
                    >
                      {settingsConfirmModal.confirmLabel}
                    </button>
                  </div>
                </Modal>
              )}
            </section>
          )}
        </div>
      </main>

      {systemNotice && (
        <div
          className={`fixed right-5 top-5 z-[60] max-w-sm rounded-3xl border p-4 shadow-2xl ${systemNotice.type === "error" ? "border-red-200 bg-red-50 text-red-900" : systemNotice.type === "warning" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black">{systemNotice.title}</p>
              <p className="mt-1 text-xs font-bold leading-5 opacity-80">
                {systemNotice.text}
              </p>
            </div>
            <button
              onClick={() => setSystemNotice(null)}
              className="rounded-full bg-white/70 p-1 text-current ring-1 ring-current/10"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {manualProductOpen && (
        <ProductFormModal
          mode="new"
          onClose={() => setManualProductOpen(false)}
        />
      )}
      {editingProduct && (
        <ProductFormModal
          mode="edit"
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
      {editingShowcase &&
        (() => {
          const editMainProduct = getProductById(
            editingShowcase.productAId || editingShowcase.productId,
          );
          const editPairProduct = getProductById(editingShowcase.productBId);
          const editSuggestedPair = editMainProduct
            ? findSuggestedPairProduct(editMainProduct)
            : null;
          const editNeedsPair = Boolean(
            editMainProduct &&
            (getProductBookletLetter(editMainProduct) ||
              editSuggestedPair ||
              editPairProduct),
          );
          const editPairMismatch = Boolean(
            editPairProduct &&
            editSuggestedPair &&
            String(editPairProduct.id) !== String(editSuggestedPair.id),
          );
          const editListPrice = Number(editingShowcase.listPrice || 0);
          const editDiscountRate = Number(
            editingShowcase.discountRate ??
              getDiscountForPublisher(editingShowcase.brand) ??
              0,
          );
          const editDiscountAmount = Math.round(
            editListPrice * (editDiscountRate / 100),
          );
          const editNetPrice = Math.max(0, editListPrice - editDiscountAmount);
          const editCustomerPricing = editingShowcase.useCustomerSpecificPricing
            ? customers.map((customer) => {
                const discountRate = Number(
                  editingShowcase.customerDiscounts?.[customer.id] ??
                    customer.discountRate ??
                    editDiscountRate ??
                    0,
                );
                const discountAmount = Math.round(
                  editListPrice * (discountRate / 100),
                );
                return {
                  customerId: customer.id,
                  customerName: customer.name,
                  discountRate,
                  discountAmount,
                  netPrice: Math.max(0, editListPrice - discountAmount),
                };
              })
            : [];
          const getEditProductResults = (query) => {
            const q = normalizeText(query);
            if (q.length < 1) return [];
            return productPool
              .filter((product) => product.active !== false)
              .filter((product) =>
                [
                  product.name,
                  product.publisher,
                  product.barcode,
                  product.productCode,
                  product.classLevel,
                ].some((field) => normalizeText(field).includes(q)),
              )
              .sort((a, b) =>
                `${a.publisher} ${a.name}`.localeCompare(
                  `${b.publisher} ${b.name}`,
                  "tr",
                ),
              )
              .slice(0, 8);
          };
          const updateEditMainProduct = (product) => {
            const suggestedPair = findSuggestedPairProduct(product);
            const productGroup =
              product?.classLevel?.includes("Sınıf") ||
              product?.classLevel === "LGS"
                ? "Ortaokul"
                : "Lise";
            const publisherDiscount = getDiscountForPublisher(
              product?.publisher,
            );
            const nextDiscount =
              editingShowcase.discountRate ?? publisherDiscount ?? 0;
            const nextListPrice = Number(
              editingShowcase.listPrice || product?.price || 0,
            );
            setEditingShowcase((current) => ({
              ...current,
              brand: product?.publisher || current.brand,
              group: productGroup,
              level: product?.classLevel || current.level,
              productId: product?.id || current.productId,
              productAId: product?.id || current.productAId,
              productASearch: "",
              productBId: suggestedPair?.id || current.productBId || "",
              productBSearch: "",
              productType: suggestedPair
                ? "Deneme"
                : current.productType || "Deneme",
              listPrice: nextListPrice,
              discountRate: nextDiscount,
              netPrice: Math.max(
                0,
                Math.round(
                  nextListPrice * (1 - Number(nextDiscount || 0) / 100),
                ),
              ),
              components: [product, suggestedPair].filter(Boolean),
              customerDiscounts: Object.fromEntries(
                customers.map((customer) => [
                  customer.id,
                  Number(
                    current.customerDiscounts?.[customer.id] ??
                      customer.discountRate ??
                      nextDiscount ??
                      0,
                  ),
                ]),
              ),
            }));
          };
          const updateEditPairProduct = (product) => {
            setEditingShowcase((current) => ({
              ...current,
              productBId: product?.id || "",
              productBSearch: "",
              components: [
                getProductById(current.productAId || current.productId),
                product,
              ].filter(Boolean),
            }));
          };
          return (
            <Modal
              title="Vitrin ürününü düzenle"
              eyebrow="Vitrin / Takvim"
              onClose={() => setEditingShowcase(null)}
              width="max-w-6xl"
            >
              <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="grid gap-5">
                  <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      1. Vitrin bilgileri
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <AdminInput
                        label="Vitrin adı"
                        value={editingShowcase.title}
                        onChange={(v) =>
                          setEditingShowcase({ ...editingShowcase, title: v })
                        }
                      />
                      <AdminInput
                        label="Ay"
                        value={editingShowcase.monthId}
                        onChange={(v) =>
                          setEditingShowcase({
                            ...editingShowcase,
                            monthId: v,
                            orderDeadline:
                              editingShowcase.orderDeadline ||
                              autoDeadlineForShowcaseMonth(
                                v,
                                selectedShowcaseSeason?.startYear,
                              ),
                          })
                        }
                        options={
                          showcaseSeasonMonthOptions.length
                            ? showcaseSeasonMonthOptions
                            : months.map((m) => ({
                                value: m.id,
                                label: `${m.label} ${m.year}`,
                              }))
                        }
                      />
                      <AdminInput
                        label="Grup"
                        value={editingShowcase.group || "Lise"}
                        onChange={(v) =>
                          setEditingShowcase({ ...editingShowcase, group: v })
                        }
                        options={["Lise", "Ortaokul"]}
                      />
                      <AdminInput
                        label="Sınıf"
                        value={editingShowcase.level || "TYT"}
                        onChange={(v) =>
                          setEditingShowcase({ ...editingShowcase, level: v })
                        }
                        options={
                          classOptionsByGroup[
                            editingShowcase.group || "Lise"
                          ] || classOptionsByGroup.Lise
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      2. Ürün bileşenleri
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      Ana ürün veya eş kitapçık değiştirilebilir. Eş ürün
                      sistemin önerdiğinden farklıysa uyarı görünür.
                    </p>
                    <div className="mt-4 grid gap-4">
                      <div className="relative">
                        <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Ana ürün / kitapçık
                        </label>
                        <input
                          value={
                            editingShowcase.productASearch ??
                            (editMainProduct
                              ? `${editMainProduct.publisher} • ${editMainProduct.name}`
                              : "")
                          }
                          onChange={(event) =>
                            setEditingShowcase((current) => ({
                              ...current,
                              productASearch: event.target.value,
                            }))
                          }
                          placeholder="Ürün adı, barkod veya ürün kodu yaz..."
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                        {editingShowcase.productASearch?.length > 0 && (
                          <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                            {getEditProductResults(
                              editingShowcase.productASearch,
                            ).map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => updateEditMainProduct(product)}
                                className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-blue-50"
                              >
                                <p className="text-sm font-black text-slate-950">
                                  {product.name}
                                </p>
                                <p className="mt-1 text-xs font-bold text-slate-500">
                                  {product.publisher} • {product.classLevel} •{" "}
                                  {product.barcode}
                                </p>
                              </button>
                            ))}
                            {!getEditProductResults(
                              editingShowcase.productASearch,
                            ).length && (
                              <p className="p-3 text-sm font-bold text-slate-400">
                                Eşleşen ürün bulunamadı.
                              </p>
                            )}
                          </div>
                        )}
                        {editMainProduct && !editingShowcase.productASearch && (
                          <div className="mt-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                            <p className="text-sm font-black text-slate-950">
                              {editMainProduct.name}
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-500">
                              {editMainProduct.publisher} • Barkod:{" "}
                              {editMainProduct.barcode} • Kod:{" "}
                              {editMainProduct.productCode}
                            </p>
                          </div>
                        )}
                      </div>

                      {editNeedsPair && (
                        <div className="relative">
                          <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                            Eş kitapçık
                          </label>
                          <input
                            value={
                              editingShowcase.productBSearch ??
                              (editPairProduct
                                ? `${editPairProduct.publisher} • ${editPairProduct.name}`
                                : "")
                            }
                            onChange={(event) =>
                              setEditingShowcase((current) => ({
                                ...current,
                                productBSearch: event.target.value,
                              }))
                            }
                            placeholder="Eş kitapçık için ürün adı, barkod veya kod yaz..."
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                          {editingShowcase.productBSearch?.length > 0 && (
                            <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                              {getEditProductResults(
                                editingShowcase.productBSearch,
                              ).map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onMouseDown={(event) =>
                                    event.preventDefault()
                                  }
                                  onClick={() => updateEditPairProduct(product)}
                                  className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-blue-50"
                                >
                                  <p className="text-sm font-black text-slate-950">
                                    {product.name}
                                  </p>
                                  <p className="mt-1 text-xs font-bold text-slate-500">
                                    {product.publisher} • {product.classLevel} •{" "}
                                    {product.barcode}
                                  </p>
                                </button>
                              ))}
                            </div>
                          )}
                          {editPairProduct &&
                            !editingShowcase.productBSearch && (
                              <div className="mt-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                                <p className="text-sm font-black text-slate-950">
                                  {editPairProduct.name}
                                </p>
                                <p className="mt-1 text-xs font-bold text-slate-500">
                                  {editPairProduct.publisher} • Barkod:{" "}
                                  {editPairProduct.barcode} • Kod:{" "}
                                  {editPairProduct.productCode}
                                </p>
                              </div>
                            )}
                          {editPairMismatch && (
                            <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
                              Bu ürün sistemde otomatik eşlenik olarak
                              görünmüyor. Yine de kaydedebilirsin; lütfen barkod
                              ve ürün kodunu kontrol et.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      3. Tarih, durum ve görünürlük
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <AdminInput
                        label="Son sipariş tarihi"
                        type="date"
                        value={editingShowcase.orderDeadline || ""}
                        onChange={(v) =>
                          setEditingShowcase({
                            ...editingShowcase,
                            orderDeadline: v,
                          })
                        }
                      />
                      <AdminInput
                        label="Tavsiye tarihi"
                        type="date"
                        value={
                          editingShowcase.recommendedStartDate ||
                          editingShowcase.recommendedDate ||
                          ""
                        }
                        onChange={(v) =>
                          setEditingShowcase({
                            ...editingShowcase,
                            recommendedStartDate: v,
                            recommendedDate: v,
                          })
                        }
                      />
                      <AdminInput
                        label="Minimum sipariş adedi"
                        type="number"
                        value={editingShowcase.minQuantity || 1}
                        onChange={(v) =>
                          setEditingShowcase({
                            ...editingShowcase,
                            minQuantity: v,
                          })
                        }
                      />
                      <AdminInput
                        label="Yayın durumu"
                        value={editingShowcase.active ? "Yayında" : "Kapalı"}
                        onChange={(v) =>
                          setEditingShowcase({
                            ...editingShowcase,
                            active: v === "Yayında",
                          })
                        }
                        options={["Yayında", "Kapalı"]}
                      />
                      <AdminInput
                        label="Sipariş durumu"
                        value={
                          editingShowcase.orderable === false
                            ? "Siparişe kapalı"
                            : "Siparişe açık"
                        }
                        onChange={(v) =>
                          setEditingShowcase({
                            ...editingShowcase,
                            orderable: v === "Siparişe açık",
                          })
                        }
                        options={["Siparişe açık", "Siparişe kapalı"]}
                      />
                      <AdminInput
                        label="Görünürlük"
                        value={
                          editingShowcase.visibilityMode === "selected"
                            ? "Seçili kurumlar"
                            : "Tüm kurumlar"
                        }
                        onChange={(v) =>
                          setEditingShowcase({
                            ...editingShowcase,
                            visibilityMode:
                              v === "Seçili kurumlar" ? "selected" : "all",
                            visibleCustomerIds:
                              v === "Seçili kurumlar"
                                ? editingShowcase.visibleCustomerIds || []
                                : [],
                          })
                        }
                        options={["Tüm kurumlar", "Seçili kurumlar"]}
                      />
                    </div>
                    {editingShowcase.visibilityMode === "selected" && (
                      <div className="mt-4 grid max-h-56 gap-2 overflow-y-auto rounded-2xl bg-white p-3 ring-1 ring-slate-100 md:grid-cols-2">
                        {customers.map((customer) => {
                          const checked = (
                            editingShowcase.visibleCustomerIds || []
                          ).includes(customer.id);
                          return (
                            <label
                              key={customer.id}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-bold ring-1 transition ${checked ? "bg-blue-50 text-blue-800 ring-blue-100" : "bg-slate-50 text-slate-600 ring-slate-100 hover:bg-white"}`}
                            >
                              <span className="min-w-0 truncate">
                                {customer.name}
                              </span>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setEditingShowcase((current) => {
                                    const ids =
                                      current.visibleCustomerIds || [];
                                    const exists = ids.includes(customer.id);
                                    return {
                                      ...current,
                                      visibleCustomerIds: exists
                                        ? ids.filter((id) => id !== customer.id)
                                        : [...ids, customer.id],
                                    };
                                  })
                                }
                                className="h-4 w-4 accent-blue-700"
                              />
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      4. Fiyatlandırma
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <AdminInput
                        label="Liste fiyatı"
                        type="number"
                        value={editListPrice}
                        onChange={(v) => {
                          const nextPrice = Number(v || 0);
                          setEditingShowcase({
                            ...editingShowcase,
                            listPrice: nextPrice,
                            netPrice: Math.max(
                              0,
                              Math.round(
                                nextPrice * (1 - editDiscountRate / 100),
                              ),
                            ),
                          });
                        }}
                      />
                      <AdminInput
                        label="Genel iskonto %"
                        type="number"
                        value={editDiscountRate}
                        onChange={(v) => {
                          const nextDiscount = Number(v || 0);
                          setEditingShowcase({
                            ...editingShowcase,
                            discountRate: nextDiscount,
                            netPrice: Math.max(
                              0,
                              Math.round(
                                editListPrice * (1 - nextDiscount / 100),
                              ),
                            ),
                          });
                        }}
                      />
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                        <p className="text-xs font-black uppercase text-slate-400">
                          Genel net fiyat
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-950">
                          {formatCurrency(editNetPrice)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          İskonto tutarı: {formatCurrency(editDiscountAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-sm font-black text-slate-950">
                            Kuruma özel fiyatlandırma
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-500">
                            Kapalıyken tüm kurumlara genel iskonto uygulanır.
                            Açıkken bu vitrin ürünü için kurum kurum fiyat
                            belirlenir.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingShowcase((current) => ({
                              ...current,
                              useCustomerSpecificPricing:
                                !current.useCustomerSpecificPricing,
                              customerDiscounts:
                                current.customerDiscounts ||
                                Object.fromEntries(
                                  customers.map((customer) => [
                                    customer.id,
                                    Number(
                                      customer.discountRate ??
                                        editDiscountRate ??
                                        0,
                                    ),
                                  ]),
                                ),
                            }))
                          }
                          className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                        >
                          {editingShowcase.useCustomerSpecificPricing
                            ? "Kuruma özel fiyatlandırmayı kapat"
                            : "Kuruma özel fiyatlandırmayı aç"}
                        </button>
                      </div>
                      {editingShowcase.useCustomerSpecificPricing && (
                        <div className="mt-4 grid max-h-80 gap-3 overflow-y-auto pr-1">
                          {editCustomerPricing.map((item) => (
                            <div
                              key={item.customerId}
                              className="grid gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100 lg:grid-cols-[minmax(0,1fr)_130px_150px] lg:items-center"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-slate-900">
                                  {item.customerName}
                                </p>
                                <p className="mt-1 text-xs font-bold text-slate-500">
                                  Net fiyat: {formatCurrency(item.netPrice)} •
                                  İskonto tutarı:{" "}
                                  {formatCurrency(item.discountAmount)}
                                </p>
                              </div>
                              <label className="grid gap-1 text-xs font-black uppercase text-slate-400">
                                İskonto %
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={item.discountRate}
                                  onChange={(event) =>
                                    setEditingShowcase((current) => ({
                                      ...current,
                                      customerDiscounts: {
                                        ...(current.customerDiscounts || {}),
                                        [item.customerId]: event.target.value,
                                      },
                                    }))
                                  }
                                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                              </label>
                              <div className="rounded-xl bg-white px-3 py-2 text-right ring-1 ring-slate-100">
                                <p className="text-[11px] font-black uppercase text-slate-400">
                                  Kuruma özel net
                                </p>
                                <p className="text-sm font-black text-slate-950">
                                  {formatCurrency(item.netPrice)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                    Önizleme
                  </p>
                  <h3 className="mt-3 text-2xl font-black leading-tight">
                    {editingShowcase.title || "Vitrin adı"}
                  </h3>
                  <p className="mt-2 text-sm font-bold text-slate-300">
                    {editMainProduct?.publisher ||
                      editingShowcase.brand ||
                      "Yayınevi"}{" "}
                    • {editingShowcase.group} • {editingShowcase.level}
                  </p>
                  <div className="mt-5 grid gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between gap-3 text-sm font-bold">
                      <span className="text-slate-300">Liste fiyatı</span>
                      <span>{formatCurrency(editListPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm font-bold">
                      <span className="text-slate-300">Genel iskonto</span>
                      <span>%{editDiscountRate}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-base font-black">
                      <span>Genel net</span>
                      <span>{formatCurrency(editNetPrice)}</span>
                    </div>
                  </div>
                  {editingShowcase.useCustomerSpecificPricing && (
                    <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <p className="text-sm font-black">Kuruma özel fiyatlar</p>
                      <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto pr-1">
                        {editCustomerPricing.map((item) => (
                          <div
                            key={item.customerId}
                            className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold"
                          >
                            <span className="min-w-0 truncate text-slate-200">
                              {item.customerName}
                            </span>
                            <span className="shrink-0 text-white">
                              %{item.discountRate} •{" "}
                              {formatCurrency(item.netPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-5 grid gap-2 text-xs font-bold text-slate-300">
                    <p>
                      Son sipariş:{" "}
                      <span className="text-white">
                        {editingShowcase.orderDeadline || "—"}
                      </span>
                    </p>
                    <p>
                      Tavsiye tarihi:{" "}
                      <span className="text-white">
                        {editingShowcase.recommendedStartDate ||
                          editingShowcase.recommendedDate ||
                          "—"}
                      </span>
                    </p>
                    <p>
                      Minimum sipariş:{" "}
                      <span className="text-white">
                        {editingShowcase.minQuantity || 1} adet
                      </span>
                    </p>
                    <p>
                      Görünürlük:{" "}
                      <span className="text-white">
                        {editingShowcase.visibilityMode === "selected"
                          ? `${editingShowcase.visibleCustomerIds?.length || 0} kurum`
                          : "Tüm kurumlar"}
                      </span>
                    </p>
                  </div>
                  <div className="mt-5 grid gap-2">
                    {[editMainProduct, editPairProduct]
                      .filter(Boolean)
                      .map((product, index) => (
                        <div
                          key={product.id}
                          className="rounded-xl bg-white/10 p-3 text-xs font-bold ring-1 ring-white/10"
                        >
                          <p className="font-black text-white">
                            {getComponentPartLabel(product, index)}
                          </p>
                          <p className="mt-1 text-slate-200">{product.name}</p>
                          <p className="mt-1 font-mono text-blue-200">
                            {product.barcode}
                          </p>
                        </div>
                      ))}
                  </div>
                </aside>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setEditingShowcase(null)}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => {
                    const components = [
                      getProductById(
                        editingShowcase.productAId || editingShowcase.productId,
                      ),
                      getProductById(editingShowcase.productBId),
                    ].filter(Boolean);
                    const finalCustomerPricing =
                      editingShowcase.useCustomerSpecificPricing
                        ? customers.map((customer) => {
                            const discountRate = Number(
                              editingShowcase.customerDiscounts?.[
                                customer.id
                              ] ??
                                customer.discountRate ??
                                editDiscountRate ??
                                0,
                            );
                            const discountAmount = Math.round(
                              editListPrice * (discountRate / 100),
                            );
                            return {
                              customerId: customer.id,
                              customerName: customer.name,
                              discountRate,
                              discountAmount,
                              netPrice: Math.max(
                                0,
                                editListPrice - discountAmount,
                              ),
                            };
                          })
                        : [];
                    updateShowcase(editingShowcase.id, {
                      ...editingShowcase,
                      brand: components[0]?.publisher || editingShowcase.brand,
                      listPrice: editListPrice,
                      discountRate: editDiscountRate,
                      discountAmount: editDiscountAmount,
                      netPrice: editNetPrice,
                      components,
                      productId:
                        editingShowcase.productAId || editingShowcase.productId,
                      productAId:
                        editingShowcase.productAId || editingShowcase.productId,
                      productBId: editingShowcase.productBId || "",
                      customerPricing: finalCustomerPricing,
                      customerDiscounts:
                        editingShowcase.customerDiscounts || {},
                    });
                    setEditingShowcase(null);
                  }}
                  className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white"
                >
                  Kaydet
                </button>
              </div>
            </Modal>
          );
        })()}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      {manualOrderConfirmOpen && selectedManualExam && (
        <Modal
          title="Sipariş özeti"
          eyebrow="Admin siparişi"
          onClose={() => setManualOrderConfirmOpen(false)}
          width="max-w-2xl"
        >
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Kurum
              </p>
              <p className="mt-1 text-xl font-black text-slate-950">
                {selectedManualCustomer?.name || "—"}
              </p>
              <p className="mt-2 text-sm font-bold text-slate-500">
                {selectedManualExam.title} • {manualOrderQuantity} adet
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Liste toplam
                </p>
                <p className="mt-1 text-lg font-black">
                  {formatCurrency(manualOrderListTotal)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  İskonto
                </p>
                <p className="mt-1 text-lg font-black text-rose-600">
                  %{manualOrderDiscountRate} / -
                  {formatCurrency(manualOrderDiscountAmount)}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Net toplam
                </p>
                <p className="mt-1 text-lg font-black text-emerald-700">
                  {formatCurrency(manualOrderDiscountedTotal)}
                </p>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                Fatura / Akson dağılımı
              </p>
              <div className="mt-3 grid gap-2">
                {manualOrderPricedComponents.map((component, index) => (
                  <div
                    key={`${component.id}-${index}`}
                    className="rounded-2xl bg-white p-3 ring-1 ring-blue-100"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-950">
                          {component.name}
                        </p>
                        <p className="mt-1 break-all font-mono text-xs font-bold text-slate-500">
                          {component.barcode || "Barkod yok"}
                        </p>
                      </div>
                      <Pill tone="blue">{component.componentQty} adet</Pill>
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-500">
                      Birim: {formatCurrency(component.unitPrice)} • Satır:{" "}
                      {formatCurrency(component.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2 text-sm font-bold text-slate-600 sm:grid-cols-2">
              <p>
                Fatura kes:{" "}
                <b
                  className={
                    manualOrder.invoiceAkson
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }
                >
                  {manualOrder.invoiceAkson ? "Evet" : "Hayır"}
                </b>
              </p>
              <p>
                Depodan stok düş:{" "}
                <b>{manualOrder.deductStock ? "Evet" : "Hayır"}</b>
              </p>
              {manualOrder.note && (
                <p className="sm:col-span-2">
                  Not: <b>{manualOrder.note}</b>
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setManualOrderConfirmOpen(false)}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
              >
                Vazgeç
              </button>
              <button
                onClick={createManualOrder}
                className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white"
              >
                Onayla ve oluştur
              </button>
            </div>
          </div>
        </Modal>
      )}

      {approveModalOrder && (
        <Modal
          title="Kurum talebini onayla"
          eyebrow="Sipariş"
          onClose={() => setApproveModalOrder(null)}
          width="max-w-lg"
        >
          <p className="text-sm font-semibold text-slate-500">
            Onaylanan sipariş Sipariş Takip ekranına geçer. Fatura kes seçilirse
            Akson fatura sonucu satır renginde gösterilir.
          </p>
          <label className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <input
              type="checkbox"
              checked={approveWithAkson}
              onChange={(e) => setApproveWithAkson(e.target.checked)}
              className="h-5 w-5 accent-blue-700"
            />
            <span className="text-sm font-black text-slate-700">
              Fatura kes
            </span>
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setApproveModalOrder(null)}
              className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
            >
              Vazgeç
            </button>
            <button
              onClick={confirmApproveOrder}
              className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white"
            >
              Onayla
            </button>
          </div>
        </Modal>
      )}
      {cancelModalOrder && (
        <Modal
          title="Siparişi iptal et"
          eyebrow="Sipariş"
          onClose={() => setCancelModalOrder(null)}
          width="max-w-lg"
        >
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
              İptal nedeni
            </span>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none"
              placeholder="Örn. Kurum siparişi iptal etti"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setCancelModalOrder(null)}
              className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
            >
              Vazgeç
            </button>
            <button
              onClick={confirmCancelOrder}
              className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white"
            >
              <XCircle size={16} className="mr-1 inline" />
              İptal et
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
