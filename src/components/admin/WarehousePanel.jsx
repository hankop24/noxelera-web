import { useEffect, useMemo, useRef, useState } from "react";
// Mobil Noxelera depo uygulamasındaki legacy_depo_app.dart ve admin_depot_screen.dart akışına göre web uyarlaması.
import {
  AlertTriangle,
  Archive,
  Barcode,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Copy,
  Edit3,
  Eye,
  Gift,
  History,
  LayoutDashboard,
  MapPin,
  Minus,
  Monitor,
  MoveRight,
  Package,
  Plus,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Truck,
  Users,
  Warehouse,
  X,
  XCircle,
} from "lucide-react";

import AdminInput from "../shared/AdminInput";
import StatusBadge from "../shared/StatusBadge";
import { formatDate } from "../../utils/format";

const CLASS_GROUPS = {
  Ortaokul: ["5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"],
  Lise: ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf", "TYT", "AYT"],
};

const CRITICAL_STOCK_THRESHOLD = 20;

const ROLE_PERMISSION_MATRIX = {
  yonetici: {
    label: "Ana Admin",
    description: "Sistemde tek ana admin olur. Tüm yetkilere otomatik sahiptir ve yetkileri değiştirilemez.",
    permissions: [
      "Tüm depo yetkileri",
      "Kullanıcı ve kurum yönetimi",
      "Yetki yönetimi",
      "Riskli işlemleri onaylama",
      "Seyir defteri, çöp kutusu ve raporlar",
    ],
  },
  yardimci_admin: {
    label: "Yardımcı Admin",
    description: "Ana adminin eklediği yönetici yardımcısıdır. Yetkileri genel veya kişisel olarak açılıp kapatılabilir.",
    permissions: [
      "Stok ekleme / düşme",
      "Sipariş hazırlama / teslim",
      "Kullanıcı ve kurum yönetimi",
      "Stok sayım farkını işleme",
      "Seyir defteri ve çöp kutusu",
    ],
  },
  personel: {
    label: "Personel",
    description: "Günlük depo işlemlerini yapar; kritik yönetim ekranlarına erişemez.",
    permissions: [
      "Deneme / kitap stok görüntüleme",
      "Barkodla ürün bulma",
      "Sipariş hazırlama",
      "Teslim kaydı görüntüleme",
    ],
  },
  dagitici: {
    label: "Dağıtıcı",
    description: "Hazırlanan sipariş ve teslim bildirimlerini takip eder.",
    permissions: [
      "Hazır siparişleri görme",
      "Dağıtıcı bildirimlerini okuma",
      "Teslim kayıtlarını görüntüleme",
    ],
  },
};

function getRolePermissions(role) {
  return ROLE_PERMISSION_MATRIX[normalizeRoleValue(role)] || ROLE_PERMISSION_MATRIX.personel;
}

function canRole(role, permission) {
  const normalized = normalizeRoleValue(role);
  return !!DEFAULT_ROLE_PERMISSION_SWITCHES[normalized]?.[permission];
}

const PERMISSION_SWITCHES = [
  { key: "viewExams", label: "Denemeleri görme", description: "Deneme listesi, detayları ve hazırlanabilir adetleri görüntüleme" },
  { key: "viewBooks", label: "Kitapları görme", description: "Kitap listesi, stok ve raf bilgilerini görüntüleme" },
  { key: "viewShelves", label: "Rafları görme", description: "Raf listesi ve raf içeriğini görüntüleme" },
  { key: "barcodeSearch", label: "Barkodla arama", description: "Barkod/QR ile deneme, kitap ve raf arama" },
  { key: "viewCritical", label: "Kritik stokları görme", description: "Kritik stok uyarılarını görüntüleme" },
  { key: "giftExams", label: "Hediye kategorisi", description: "Hediye ayrılan denemeleri görüntüleme ve yönetme" },
  { key: "viewOrders", label: "Siparişleri görme", description: "Yeni, hazır ve teslim edilen sipariş ekranlarını görüntüleme" },
  { key: "dailyReport", label: "Gün sonu raporu", description: "Günlük teslimat ve depo özet raporlarını görüntüleme" },
  { key: "editStock", label: "Stok düzenleme", description: "Deneme/kitap stok ekleme, düşme ve raf değiştirme işlemleri" },
  { key: "prepareOrders", label: "Sipariş hazırlama", description: "Yeni siparişleri hazır siparişe çevirme" },
  { key: "deliverOrders", label: "Teslim işlemi", description: "Hazır siparişi teslim edildi yapma" },
  { key: "stockCount", label: "Stok sayımı", description: "Stok sayım moduna girme ve farkları işleme" },
  { key: "viewLogs", label: "Seyir defteri", description: "Hareket kayıtlarını ve günlük kayıtları görüntüleme" },
  { key: "trash", label: "Çöp kutusu", description: "Silinen kayıtları görme / geri yükleme" },
  { key: "manageUsers", label: "Kullanıcı yönetimi", description: "Depo kullanıcılarını ekleme ve düzenleme" },
  { key: "manageInstitutions", label: "Kurum yönetimi", description: "Okul / dershane kayıtlarını yönetme" },
  { key: "riskyActions", label: "Riskli işlemler", description: "Kalıcı silme, stok sıfırlama gibi kritik işlemler" },
];

const DEFAULT_ROLE_PERMISSION_SWITCHES = {
  yonetici: Object.fromEntries(PERMISSION_SWITCHES.map((item) => [item.key, true])),
  yardimci_admin: {
    viewExams: true,
    viewBooks: true,
    viewShelves: true,
    barcodeSearch: true,
    viewCritical: true,
    giftExams: true,
    viewOrders: true,
    dailyReport: true,
    editStock: true,
    prepareOrders: true,
    deliverOrders: true,
    stockCount: true,
    viewLogs: true,
    trash: true,
    manageUsers: true,
    manageInstitutions: true,
    riskyActions: false,
  },
  personel: {
    viewExams: true,
    viewBooks: true,
    viewShelves: true,
    barcodeSearch: true,
    viewCritical: true,
    giftExams: false,
    viewOrders: true,
    dailyReport: false,
    editStock: true,
    prepareOrders: true,
    deliverOrders: false,
    stockCount: false,
    viewLogs: false,
    trash: false,
    manageUsers: false,
    manageInstitutions: false,
    riskyActions: false,
  },
  dagitici: {
    viewExams: false,
    viewBooks: false,
    viewShelves: false,
    barcodeSearch: false,
    viewCritical: false,
    giftExams: false,
    viewOrders: true,
    dailyReport: false,
    editStock: false,
    prepareOrders: false,
    deliverOrders: true,
    stockCount: false,
    viewLogs: false,
    trash: false,
    manageUsers: false,
    manageInstitutions: false,
    riskyActions: false,
  },
};

function normalizePermissionSettings(raw = {}) {
  return Object.fromEntries(Object.entries(DEFAULT_ROLE_PERMISSION_SWITCHES).map(([role, defaults]) => [role, { ...defaults, ...(raw?.[role] || {}) }]));
}

function normalizeUserPermissions(raw = {}) {
  return Object.fromEntries(PERMISSION_SWITCHES.map((item) => [item.key, raw?.[item.key] === true ? true : raw?.[item.key] === false ? false : null]));
}

function effectivePermissionsForUser(user = {}, rolePermissionSettings = DEFAULT_ROLE_PERMISSION_SWITCHES) {
  const role = normalizeRoleValue(user.role);
  if (role === "yonetici") return Object.fromEntries(PERMISSION_SWITCHES.map((item) => [item.key, true]));
  const normalizedRoleSettings = normalizePermissionSettings(rolePermissionSettings);
  const roleDefaults = normalizedRoleSettings[role] || DEFAULT_ROLE_PERMISSION_SWITCHES.personel;
  const personal = normalizeUserPermissions(user.permissions || {});

  // Öncelik sırası özellikle böyle olmalı:
  // 1) Kişisel yetki Açık/Kapalı ise doğrudan onu kullan.
  // 2) Kişisel ayar "Rolü kullan" ise genel rol yetkisine düş.
  return Object.fromEntries(PERMISSION_SWITCHES.map((item) => {
    const personalValue = personal[item.key];
    if (personalValue === true) return [item.key, true];
    if (personalValue === false) return [item.key, false];
    return [item.key, !!roleDefaults[item.key]];
  }));
}

function personalPermissionCount(user = {}) {
  return Object.values(normalizeUserPermissions(user.permissions || {})).filter((value) => value !== null).length;
}


function sameUserIdentity(a = {}, b = {}) {
  const valuesA = [a.id, a.username, a.email, a.name, a.phone].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
  const valuesB = [b.id, b.username, b.email, b.name, b.phone].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
  return valuesA.some((value) => valuesB.includes(value));
}


function safeId(prefix, value) {
  const raw = String(value || Date.now()).trim().toLowerCase();
  return `${prefix}-${raw.replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, "-").replace(/^-+|-+$/g, "")}`;
}

function normalizeRoleValue(role) {
  const value = String(role || "").toLowerCase();
  if (["admin", "ana_admin", "superadmin", "super_admin", "manager", "yonetici", "yönetici"].includes(value)) return "yonetici";
  if (["helper_admin", "assistant_admin", "yardimci_admin", "yardımcı_admin", "yardimci", "yardımcı", "yardimci yonetici", "yardımcı yönetici"].includes(value)) return "yardimci_admin";
  if (["personnel", "staff", "personel"].includes(value)) return "personel";
  if (["distributor", "delivery", "dagitici", "dağıtıcı"].includes(value)) return "dagitici";
  return value || "personel";
}

function nowTimestamp() {
  return new Date().toISOString();
}

const DEFAULT_SHELVES = [
  { id: "shelf-a-01", code: "A-01", name: "TYT Deneme Rafı", qrCode: "NXR-SHELF-A-01", note: "TYT ve 9-10 denemeleri", isActive: true, createdAt: "17 Mayıs 2026" },
  { id: "shelf-a-02", code: "A-02", name: "AYT Deneme Rafı", qrCode: "NXR-SHELF-A-02", note: "AYT ve 11-12 denemeleri", isActive: true, createdAt: "17 Mayıs 2026" },
  { id: "shelf-b-01", code: "B-01", name: "LGS Deneme Rafı", qrCode: "NXR-SHELF-B-01", note: "Ortaokul denemeleri", isActive: true, createdAt: "17 Mayıs 2026" },
  { id: "shelf-k-01", code: "K-01", name: "Kitap ve Kaynak Rafı", qrCode: "NXR-SHELF-K-01", note: "Kitap stokları", isActive: true, createdAt: "17 Mayıs 2026" },
];

const DEFAULT_EXAMS = [
  {
    id: "exam-1",
    classLevel: "TYT",
    group: "Lise",
    name: "Bilgi Sarmal TYT Kurumsal Deneme",
    shelf: "A-01",
    shelfId: "shelf-a-01",
    barcode: "869000000001",
    barcodeA: "869000000001-A",
    barcodeB: "869000000001-B",
    variants: { "Kitapçık A": 170, "Kitapçık B": 150 },
    giftDate: "",
    isGiftRecord: false,
    active: true,
    createdAt: "17 Mayıs 2026",
  },
  {
    id: "exam-2",
    classLevel: "8. Sınıf",
    group: "Ortaokul",
    name: "Paraf 8. Sınıf LGS Deneme",
    shelf: "B-01",
    shelfId: "shelf-b-01",
    barcode: "869000000002",
    barcodeA: "869000000002-A",
    barcodeB: "869000000002-B",
    variants: { "A Sayısal": 95, "A Sözel": 95, "B Sayısal": 85, "B Sözel": 85 },
    giftDate: "",
    isGiftRecord: false,
    active: true,
    createdAt: "17 Mayıs 2026",
  },
  {
    id: "exam-3",
    classLevel: "AYT",
    group: "Lise",
    name: "Karekök AYT Eşit Ağırlık Deneme",
    shelf: "A-02",
    shelfId: "shelf-a-02",
    barcode: "869000000003",
    barcodeA: "869000000003-A",
    barcodeB: "869000000003-B",
    variants: { "Kitapçık A": 70, "Kitapçık B": 70 },
    giftDate: "",
    isGiftRecord: false,
    active: true,
    createdAt: "17 Mayıs 2026",
  },
  {
    id: "exam-4",
    classLevel: "6. Sınıf",
    group: "Ortaokul",
    name: "Nitelik 6. Sınıf Değerlendirme Denemesi",
    shelf: "B-01",
    shelfId: "shelf-b-01",
    barcode: "869000000004",
    barcodeA: "869000000004-A",
    barcodeB: "869000000004-B",
    variants: { "A Sayısal": 32, "A Sözel": 30, "B Sayısal": 28, "B Sözel": 29 },
    giftDate: "",
    isGiftRecord: false,
    active: true,
    createdAt: "17 Mayıs 2026",
  },
];

const DEFAULT_BOOKS = [
  { id: "book-1", name: "TYT Matematik Soru Bankası", classLevel: "TYT", group: "Lise", stock: 95, shelf: "K-01", barcode: "978000000001", shelfId: "shelf-k-01", createdAt: "17 Mayıs 2026", active: true },
  { id: "book-2", name: "LGS Yeni Nesil Türkçe Kitabı", classLevel: "8. Sınıf", group: "Ortaokul", stock: 74, shelf: "K-01", barcode: "978000000002", shelfId: "shelf-k-01", createdAt: "17 Mayıs 2026", active: true },
  { id: "book-3", name: "AYT Edebiyat Soru Bankası", classLevel: "AYT", group: "Lise", stock: 18, shelf: "K-01", barcode: "978000000003", shelfId: "shelf-k-01", createdAt: "17 Mayıs 2026", active: true },
];

const DEFAULT_INSTITUTIONS = [
  { id: "inst-1", name: "Etki Dershanesi", type: "Dershane", isActive: true },
  { id: "inst-2", name: "Kuzey Akademi", type: "Kurs", isActive: true },
  { id: "inst-3", name: "Final Kurs Merkezi", type: "Dershane", isActive: false },
];

const DEFAULT_USERS = [
  { id: "user-1", name: "Noxelera Admin", role: "yonetici", title: "Ana Admin", phone: "0555 333 33 33", email: "admin@noxelera.app", isActive: true },
  { id: "user-2", name: "Yardımcı Admin", role: "yardimci_admin", title: "Yardımcı Admin", phone: "0555 444 44 40", email: "yardimci@noxelera.app", isActive: true },
  { id: "user-3", name: "Depo Personeli", role: "personel", title: "Personel", phone: "0555 444 44 44", email: "personel@noxelera.app", isActive: true },
  { id: "user-4", name: "Dağıtıcı", role: "dagitici", title: "Dağıtıcı", phone: "0555 555 55 55", email: "dagitici@noxelera.app", isActive: true },
];

const DEFAULT_ORDERS = [
  { id: "DPO-1001", examId: "exam-2", examName: "Paraf 8. Sınıf LGS Deneme", classLevel: "8. Sınıf", shelf: "B-01", variant: "Otomatik Set", quantity: 40, destination: "Etki Dershanesi", note: "Hafta sonu LGS grubu", status: "pending", createdBy: "Noxelera Admin", preparedBy: "", deliveredBy: "", createdAt: "18 Mayıs 2026", preparedAt: "", deliveredAt: "" },
  { id: "DPO-1000", examId: "exam-1", examName: "Bilgi Sarmal TYT Kurumsal Deneme", classLevel: "TYT", shelf: "A-01", variant: "Kitapçık A/B", quantity: 80, destination: "Kuzey Akademi", note: "TYT genel prova", status: "prepared", createdBy: "Noxelera Admin", preparedBy: "Depo Personeli", deliveredBy: "", createdAt: "17 Mayıs 2026", preparedAt: "17 Mayıs 2026", deliveredAt: "" },
];

const STATUS_LABELS = {
  pending: "Yeni Sipariş",
  prepared: "Hazırlandı",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
 };

function todayText() {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());
}

function dateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function asLegacyShelf(shelf) {
  const code = shelf.code || shelf.name || `RAF-${shelf.id}`;
  const id = String(shelf.id || safeId("shelf", code));
  return {
    id: id.startsWith("shelf-") ? id : safeId("shelf", code || id),
    code,
    name: shelf.name || code || `Raf ${id}`,
    qrCode: shelf.qrCode || `NXR-SHELF-${String(code || id).toUpperCase()}`,
    note: shelf.note || shelf.description || "",
    isActive: shelf.isActive ?? shelf.active ?? shelf.status !== "Pasif",
    createdAt: shelf.createdAt || nowTimestamp(),
    updatedAt: shelf.updatedAt || shelf.createdAt || nowTimestamp(),
  };
}

function stockItemToLegacy(item) {
  const shelfCode = item.shelf || item.shelfCode || "Belirtilmedi";
  if ((item.type || "").toLowerCase().includes("kitap")) {
    return {
      id: `book-${item.id}`,
      name: item.name,
      classLevel: item.category || "Genel",
      group: groupForClass(item.category || "Genel"),
      stock: Number(item.quantity ?? item.stock ?? 0),
      shelf: shelfCode,
      barcode: item.barcode || item.qrCode || "",
      shelfId: String(item.shelfId || safeId("shelf", shelfCode)),
      createdAt: item.createdAt || nowTimestamp(),
      active: item.status !== "Pasif" && item.active !== false,
    };
  }
  const quantity = Number(item.quantity ?? item.stock ?? 0);
  const isMiddle = ["5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "LGS", "5", "6", "7", "8"].includes(item.category);
  return {
    id: `exam-${item.id}`,
    classLevel: normalizeClass(item.category || "TYT"),
    group: groupForClass(item.category || "TYT"),
    name: item.name,
    shelf: shelfCode,
    shelfId: String(item.shelfId || safeId("shelf", shelfCode)),
    barcode: item.barcode || item.qrCode || "",
    barcodeA: item.barcodeA || (item.barcode ? `${item.barcode}-A` : ""),
    barcodeB: item.barcodeB || (item.barcode ? `${item.barcode}-B` : ""),
    variants: item.variants || {
      "A Sayısal": Math.ceil(quantity / 4),
      "A Sözel": Math.ceil(quantity / 4),
      "B Sayısal": Math.floor(quantity / 4),
      "B Sözel": Math.floor(quantity / 4),
    },
    giftDate: "",
    isGiftRecord: false,
    active: item.status !== "Pasif" && item.active !== false,
    createdAt: item.createdAt || nowTimestamp(),
  };
}

function normalizeClass(value) {
  if (["5", "6", "7", "8", "9", "10", "11", "12"].includes(String(value))) return `${value}. Sınıf`;
  if (String(value).toUpperCase() === "LGS") return "8. Sınıf";
  return value || "Genel";
}

function groupForClass(classLevel) {
  return ["5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "5", "6", "7", "8", "LGS"].includes(classLevel) ? "Ortaokul" : "Lise";
}

function isMiddleSchool(exam) {
  return ["5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"].includes(exam.classLevel);
}

function examIsHighSchool(exam) {
  return groupForClass(exam?.classLevel || exam?.group || "") === "Lise" || exam?.group === "Lise";
}

function variantTotal(exam) {
  const summary = examStockSummary(exam || {});
  if (summary.isHighSchool) return summary.kitapcikA + summary.kitapcikB;
  return Object.values(ensureExamVariants(exam || {})).reduce((sum, value) => sum + Number(value || 0), 0);
}

function isGift(exam) {
  return Boolean(exam.giftDate || exam.isGiftRecord);
}

function examStockSummary(exam) {
  const variants = exam?.variants || {};
  const highSchool = examIsHighSchool(exam);

  if (highSchool) {
    const kitapcikA = Number(
      variants["Kitapçık A"] ??
      variants["Kitapcik A"] ??
      variants["A Kitapçığı"] ??
      variants["A Kitapcigi"] ??
      variants["A"] ??
      variants["A Sayısal"] ??
      variants["A Sayisal"] ??
      0
    );
    const kitapcikB = Number(
      variants["Kitapçık B"] ??
      variants["Kitapcik B"] ??
      variants["B Kitapçığı"] ??
      variants["B Kitapcigi"] ??
      variants["B"] ??
      variants["B Sayısal"] ??
      variants["B Sayisal"] ??
      0
    );
    const toplam = kitapcikA + kitapcikB;
    const counts = [kitapcikA, kitapcikB];
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const balanceDiff = maxCount - minCount;
    const hazirlanabilir = balanceDiff > 3 ? minCount : toplam;
    return {
      isHighSchool: true,
      kitapcikA,
      kitapcikB,
      aSayisal: kitapcikA,
      aSozel: 0,
      bSayisal: kitapcikB,
      bSozel: 0,
      sayisal: toplam,
      sozel: 0,
      hazirlanabilir,
      toplam,
      minCount,
      maxCount,
      balanceDiff,
    };
  }

  const aSayisal = Number(variants["A Sayısal"] ?? variants["A Sayisal"] ?? variants["Kitapçık A"] ?? variants["Kitapcik A"] ?? 0);
  const aSozel = Number(variants["A Sözel"] ?? variants["A Sozel"] ?? 0);
  const bSayisal = Number(variants["B Sayısal"] ?? variants["B Sayisal"] ?? variants["Kitapçık B"] ?? variants["Kitapcik B"] ?? 0);
  const bSozel = Number(variants["B Sözel"] ?? variants["B Sozel"] ?? 0);
  const sayisal = aSayisal + bSayisal;
  const sozel = aSozel + bSozel;
  const counts = [aSayisal, aSozel, bSayisal, bSozel];
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const balanceDiff = maxCount - minCount;
  const hazirlanabilir = balanceDiff > 3 ? minCount : Math.min(sayisal, sozel);
  return {
    isHighSchool: false,
    aSayisal,
    aSozel,
    bSayisal,
    bSozel,
    kitapcikA: Math.min(aSayisal, aSozel),
    kitapcikB: Math.min(bSayisal, bSozel),
    sayisal,
    sozel,
    hazirlanabilir,
    toplam: aSayisal + aSozel + bSayisal + bSozel,
    minCount,
    maxCount,
    balanceDiff,
  };
}


function normalizeVariantKey(key) {
  const map = {
    aSayisal: "A Sayısal",
    aSozel: "A Sözel",
    bSayisal: "B Sayısal",
    bSozel: "B Sözel",
    aKitapcik: "Kitapçık A",
    bKitapcik: "Kitapçık B",
    kitapcikA: "Kitapçık A",
    kitapcikB: "Kitapçık B",
    "A Sayisal": "A Sayısal",
    "A Sozel": "A Sözel",
    "B Sayisal": "B Sayısal",
    "B Sozel": "B Sözel",
    "Kitapçık A": "Kitapçık A",
    "Kitapcik A": "Kitapçık A",
    "A Kitapçığı": "Kitapçık A",
    "A Kitapcigi": "Kitapçık A",
    "Kitapçık B": "Kitapçık B",
    "Kitapcik B": "Kitapçık B",
    "B Kitapçığı": "Kitapçık B",
    "B Kitapcigi": "Kitapçık B",
  };
  return map[key] || key || "A Sayısal";
}


function ensureExamVariants(exam) {
  const variants = exam?.variants || {};
  if (examIsHighSchool(exam)) {
    const summary = examStockSummary(exam || {});
    return {
      "Kitapçık A": Number(summary.kitapcikA || 0),
      "Kitapçık B": Number(summary.kitapcikB || 0),
    };
  }
  const fallbackA = Number(variants["Kitapçık A"] ?? variants["Kitapcik A"] ?? variants["A Kitapçığı"] ?? variants["A Sayısal"] ?? variants["A Sayisal"] ?? 0);
  const fallbackB = Number(variants["Kitapçık B"] ?? variants["Kitapcik B"] ?? variants["B Kitapçığı"] ?? variants["B Sayısal"] ?? variants["B Sayisal"] ?? 0);
  return {
    "A Sayısal": Number(variants["A Sayısal"] ?? variants["A Sayisal"] ?? fallbackA ?? 0),
    "A Sözel": Number(variants["A Sözel"] ?? variants["A Sozel"] ?? variants["Kitapçık A Sözel"] ?? fallbackA ?? 0),
    "B Sayısal": Number(variants["B Sayısal"] ?? variants["B Sayisal"] ?? fallbackB ?? 0),
    "B Sözel": Number(variants["B Sözel"] ?? variants["B Sozel"] ?? variants["Kitapçık B Sözel"] ?? fallbackB ?? 0),
  };
}


function orderAvailableTotal(exam) {
  if (isGift(exam)) return 0;
  const summary = examStockSummary(exam);
  return summary.hazirlanabilir > 0 ? summary.hazirlanabilir : variantTotal(exam);
}

function deductionPlanForOrder(exam, quantity) {
  const qty = Number(quantity || 0);
  if (qty <= 0) return {};

  if (examIsHighSchool(exam)) {
    const variants = ensureExamVariants(exam);
    let remaining = qty;
    const aStock = Number(variants["Kitapçık A"] || 0);
    const bStock = Number(variants["Kitapçık B"] || 0);
    const aCount = Math.min(Math.ceil(qty / 2), aStock);
    remaining -= aCount;
    const bCount = Math.min(Math.floor(qty / 2), bStock);
    remaining -= bCount;
    const extraA = Math.min(remaining, Math.max(0, aStock - aCount));
    const finalA = aCount + extraA;
    remaining -= extraA;
    const extraB = Math.min(remaining, Math.max(0, bStock - bCount));
    const finalB = bCount + extraB;
    const plan = {};
    if (finalA > 0) plan["Kitapçık A"] = finalA;
    if (finalB > 0) plan["Kitapçık B"] = finalB;
    return plan;
  }

  const variants = ensureExamVariants(exam);
  let remaining = qty;
  const aReady = Math.min(Number(variants["A Sayısal"] || 0), Number(variants["A Sözel"] || 0));
  const bReady = Math.min(Number(variants["B Sayısal"] || 0), Number(variants["B Sözel"] || 0));
  const aCount = Math.min(Math.ceil(qty / 2), aReady);
  remaining -= aCount;
  const bCount = Math.min(remaining, bReady);
  remaining -= bCount;
  const extraA = Math.min(remaining, Math.max(0, aReady - aCount));
  const finalA = aCount + extraA;
  remaining -= extraA;
  const plan = {};
  if (finalA > 0) {
    plan["A Sayısal"] = finalA;
    plan["A Sözel"] = finalA;
  }
  if (bCount > 0) {
    plan["B Sayısal"] = bCount;
    plan["B Sözel"] = bCount;
  }
  return plan;
}


function canDeduct(exam, plan) {
  if (!exam) return false;
  const variants = ensureExamVariants(exam);
  return Object.entries(plan).every(([key, qty]) => {
    if (key === "Toplam") return variantTotal(exam) >= qty;
    return Number(variants?.[key] || 0) >= qty;
  });
}

function applyDeduction(exam, plan) {
  const next = { ...exam, variants: { ...ensureExamVariants(exam) } };
  if (plan.Toplam !== undefined) {
    const firstKey = Object.keys(next.variants)[0];
    if (firstKey) next.variants[firstKey] = Math.max(0, Number(next.variants[firstKey] || 0) - Number(plan.Toplam || 0));
    return next;
  }
  Object.entries(plan).forEach(([key, qty]) => {
    next.variants[key] = Math.max(0, Number(next.variants[key] || 0) - Number(qty || 0));
  });
  return next;
}

function hasCriticalStock(exam, threshold = CRITICAL_STOCK_THRESHOLD) {
  if (isGift(exam) || orderAvailableTotal(exam) <= 0) return false;
  return Object.values(ensureExamVariants(exam)).some((count) => count > 0 && count < threshold);
}

function criticalText(exam, threshold = CRITICAL_STOCK_THRESHOLD) {
  const critical = Object.entries(ensureExamVariants(exam))
    .filter(([, count]) => Number(count) > 0 && Number(count) < threshold)
    .map(([key, count]) => `${key}: ${count}`)
    .join(" | ");
  return critical || "Kritik stok yok";
}

function giftDaysLeft(exam) {
  if (!exam.giftDate) return 0;
  const diff = Math.floor((new Date() - new Date(exam.giftDate)) / (1000 * 60 * 60 * 24));
  return Math.max(0, 7 - diff);
}

function isExpiredGift(exam) {
  return isGift(exam) && giftDaysLeft(exam) <= 0;
}

function hasAnyStock(exam) {
  return variantTotal(exam) > 0;
}

function examIsAvailable(exam) {
  return !isGift(exam) && exam.active !== false && hasAnyStock(exam);
}

function normalizeExamStatus(exam) {
  const normalizedVariants = ensureExamVariants(exam);
  const normalizedExam = {
    ...exam,
    barcode: "",
    barcodeA: exam.barcodeA || "",
    barcodeB: exam.barcodeB || "",
    variants: normalizedVariants,
  };
  const active = isGift(normalizedExam) ? false : hasAnyStock(normalizedExam) ? exam.active !== false : false;
  return { ...normalizedExam, active };
}


function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 999)}`;
}

function makeMovement({ userName = "Noxelera Admin", action, examName, detail, before = "", after = "", entityType = "Depo", risk = false }) {
  return {
    id: nextId("mov"),
    userName,
    action,
    examName,
    detail,
    before,
    after,
    entityType,
    risk,
    createdAt: todayText(),
    createdAtIso: nowTimestamp(),
  };
}

function makeDeletedRecord(collectionName, originalId, originalData, deletedBy = "Noxelera Admin") {
  return { id: nextId("trash"), collectionName, originalId, originalData, deletedBy, deletedAt: todayText() };
}

function normalizeWarehouse(raw = {}) {
  const shelves = (raw.shelves?.length ? raw.shelves : DEFAULT_SHELVES).map(asLegacyShelf);
  const fromStock = raw.stockItems || [];
  const exams = raw.legacyExams?.length ? raw.legacyExams : raw.exams?.length ? raw.exams : fromStock.filter((i) => i.type !== "Kitap").map(stockItemToLegacy);
  const books = raw.stockBooks?.length ? raw.stockBooks : raw.books?.length ? raw.books : fromStock.filter((i) => i.type === "Kitap").map(stockItemToLegacy);
  return {
    ...raw,
    shelves,
    legacyExams: (exams.length ? exams : DEFAULT_EXAMS).filter((exam) => !isExpiredGift(exam)).map(normalizeExamStatus),
    stockBooks: books.length ? books : DEFAULT_BOOKS,
    depoOrders: raw.depoOrders?.length ? raw.depoOrders : DEFAULT_ORDERS,
    deliveryRecords: raw.deliveryRecords || [],
    institutions: raw.institutions?.length ? raw.institutions : DEFAULT_INSTITUTIONS,
    depotUsers: (raw.depotUsers?.length ? raw.depotUsers : DEFAULT_USERS).map((user) => ({ ...user, role: normalizeRoleValue(user.role), permissions: normalizeUserPermissions(user.permissions || {}) })),
    movements: raw.movements || raw.stockMovements || [],
    deletedRecords: raw.deletedRecords || raw.trash || [],
    notifications: raw.notifications || [],
    rolePermissions: normalizePermissionSettings(raw.rolePermissions),
  };
}

function Pill({ children, tone = "blue" }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    purple: "bg-violet-50 text-violet-700 ring-violet-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[tone] || styles.blue}`}>{children}</span>;
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-black text-slate-950">{title}</h3>
      {subtitle && <p className="mt-1 text-sm font-bold text-slate-500">{subtitle}</p>}
    </div>
  );
}

function EmptyBox({ text }) {
  return <div className="rounded-[1.6rem] bg-white p-6 text-center text-sm font-black text-slate-500 ring-1 ring-slate-200">{text}</div>;
}

function Header({ title, subtitle, icon, actions }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-50 p-4 text-blue-700 ring-1 ring-blue-100">{icon}</div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{subtitle}</p>
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

function DashboardTile({ title, value, icon, tone = "blue" }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    purple: "bg-violet-50 text-violet-700 ring-violet-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <div className="rounded-[1.7rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ring-1 ${styles[tone] || styles.blue}`}>{icon}</div>
      </div>
    </div>
  );
}

function QuickAction({ title, subtitle, icon, tone = "blue", onClick }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white",
    purple: "bg-violet-50 text-violet-700 group-hover:bg-violet-700 group-hover:text-white",
    amber: "bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white",
    green: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white",
    slate: "bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white",
  };
  return (
    <button onClick={onClick} className="group rounded-[1.7rem] bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
      <div className={`mb-8 flex h-14 w-14 items-center justify-center rounded-2xl transition ${styles[tone] || styles.blue}`}>{icon}</div>
      <p className="text-lg font-black text-slate-950">{title}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-slate-500">{subtitle}</p>
    </button>
  );
}

function MobileMenuCard({ title, subtitle, icon, tone = "blue", badge, onClick }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    purple: "bg-violet-50 text-violet-700 ring-violet-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    teal: "bg-teal-50 text-teal-700 ring-teal-100",
  };
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-[1.35rem] bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${styles[tone] || styles.blue}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-lg font-black text-slate-950">{title}</p>
            {badge && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600 ring-1 ring-slate-200">{badge}</span>}
          </div>
          <p className="mt-1 text-sm font-bold leading-5 text-slate-500">{subtitle}</p>
        </div>
        <ChevronRight className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" size={24} />
      </div>
    </button>
  );
}

function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">{title}</h3>
            {subtitle && <p className="mt-1 text-sm font-bold text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white" />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white">
        {options.map((option) => <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>)}
      </select>
    </label>
  );
}

export default function WarehousePanel({ orders = [], setOrders, warehouseData, setWarehouseData, currentStaffRole = "admin", currentStaffUser = null, staffUsers = [], noxInstitutions = [], noxProducts = [], hideDepotUsers = false, hideDepotInstitutions = false, hideDailyReport = false, hideDepotOrders = false }) {
  const warehouse = normalizeWarehouse(warehouseData);
  const [tab, setTab] = useState("panel");
  const [subPage, setSubPage] = useState(null);
  const [query, setQuery] = useState("");
  const [examGroup, setExamGroup] = useState("Ortaokul");
  const [bookGroup, setBookGroup] = useState("Ortaokul");
  const [selectedClass, setSelectedClass] = useState("8. Sınıf");
  const [showOnlyAvailableExams, setShowOnlyAvailableExams] = useState(false);
  const [selectedBookClass, setSelectedBookClass] = useState("8. Sınıf");
  const [modal, setModal] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [scanQuery, setScanQuery] = useState("");
  const [orderForm, setOrderForm] = useState({ group: "Ortaokul", classLevel: "8. Sınıf", examId: "", quantity: 1, destination: "", note: "", variant: "Otomatik" });
  const [orderView, setOrderView] = useState("pending");
  const [showOrderCreator, setShowOrderCreator] = useState(false);
  const [editOrderForm, setEditOrderForm] = useState({ orderId: "", examId: "", quantity: 1, destination: "", note: "", variant: "Otomatik" });
  const [stockCountDraft, setStockCountDraft] = useState({});
  const [stockCountSearch, setStockCountSearch] = useState("");
  const [movementFilters, setMovementFilters] = useState({ search: "", action: "Tümü", user: "Tümü" });
  const [deliverySearch, setDeliverySearch] = useState("");
  const [institutionForm, setInstitutionForm] = useState({ name: "", type: "Dershane", isActive: true });
  const [userForm, setUserForm] = useState({ name: "", role: "personel", title: "Personel", phone: "", email: "", password: "", isActive: true });
  const [examEditForm, setExamEditForm] = useState(null);
  const [bookEditForm, setBookEditForm] = useState(null);
  const [shelfEditForm, setShelfEditForm] = useState(null);
  const [userEditForm, setUserEditForm] = useState(null);
  const [productForm, setProductForm] = useState({ group: "Ortaokul", classLevel: "8. Sınıf", name: "", shelfId: "shelf-b-01", barcodeA: "", barcodeB: "", variantMode: "Ortaokul", aSayisal: 0, aSozel: 0, bSayisal: 0, bSozel: 0, kitapcikA: 0, kitapcikB: 0 });
  const [bookForm, setBookForm] = useState({ group: "Ortaokul", classLevel: "8. Sınıf", name: "", stock: 0, shelfId: "shelf-k-01", barcode: "" });
  const [shelfForm, setShelfForm] = useState({ name: "", qrCode: "", note: "" });
  const [userPermissionForm, setUserPermissionForm] = useState(null);
  const viewStackRef = useRef([]);
  const returnViewRef = useRef({ tab: "panel", subPage: null });
  const scrollPositionsRef = useRef({});
  const modalScrollRef = useRef(0);
  const wasModalOpenRef = useRef(false);
  const lastViewKeyRef = useRef("panel:home");
  const activeViewKey = `${tab}:${subPage || "home"}`;
  const rolePermissionSettings = normalizePermissionSettings(warehouse.rolePermissions);

  const saveWarehouse = (updater) => {
    setWarehouseData?.((current) => {
      const base = normalizeWarehouse(current || warehouseData || {});
      const next = typeof updater === "function" ? updater(base) : updater;
      return next;
    });
  };

  const rememberScrollPosition = () => {
    scrollPositionsRef.current[activeViewKey] = window.scrollY || document.documentElement.scrollTop || 0;
  };

  const restoreScrollPosition = (key = activeViewKey) => {
    const target = scrollPositionsRef.current[key] ?? 0;
    window.requestAnimationFrame(() => window.scrollTo({ top: target, behavior: "auto" }));
  };

  const snapshotCurrentView = () => ({ tab, subPage });

  const switchWarehouseView = (nextTab, nextSubPage = null, options = {}) => {
    rememberScrollPosition();
    const currentView = snapshotCurrentView();
    const nextViewKey = `${nextTab}:${nextSubPage || "home"}`;
    if (!options.replace && activeViewKey !== nextViewKey) {
      const last = viewStackRef.current[viewStackRef.current.length - 1];
      if (!last || last.tab !== currentView.tab || last.subPage !== currentView.subPage) {
        viewStackRef.current.push(currentView);
      }
    }
    setTab(nextTab);
    setSubPage(nextSubPage);
  };

  const rememberOverlayReturnView = () => {
    rememberScrollPosition();
    returnViewRef.current = snapshotCurrentView();
  };

  const closeOverlay = () => {
    const returnView = returnViewRef.current || { tab: "panel", subPage: null };
    setSelectedExam(null);
    setSelectedBook(null);
    setSelectedShelf(null);
    setSelectedOrder(null);
    setModal(null);
    setTab(returnView.tab);
    setSubPage(returnView.subPage);
    window.requestAnimationFrame(() => restoreScrollPosition(`${returnView.tab}:${returnView.subPage || "home"}`));
  };

  const openModal = (config) => {
    rememberOverlayReturnView();
    setModal(config);
  };

  const openExamDetail = (exam) => { rememberOverlayReturnView(); setSelectedExam(exam); };
  const openBookDetail = (book) => { rememberOverlayReturnView(); setSelectedBook(book); };
  const openShelfDetail = (shelf) => { rememberOverlayReturnView(); setSelectedShelf(shelf); };
  const openOrderDetail = (order) => { rememberOverlayReturnView(); setSelectedOrder(order); };

  const setRolePermission = (role, key, value) => {
    saveWarehouse((base) => ({
      ...base,
      rolePermissions: normalizePermissionSettings({
        ...(base.rolePermissions || rolePermissionSettings),
        [role]: { ...normalizePermissionSettings(base.rolePermissions || rolePermissionSettings)[role], [key]: value },
      }),
    }));
  };

  const openUserPermissions = (user) => {
    if (normalizeRoleValue(user.role) === "yonetici") return alert("Ana admin tüm yetkilere otomatik sahiptir. Yetkileri değiştirilemez.");
    setUserPermissionForm({ ...user, role: normalizeRoleValue(user.role), permissions: normalizeUserPermissions(user.permissions || {}) });
    openModal({ type: "userPermissions" });
  };

  const setPersonalPermissionDraft = (key, value) => {
    setUserPermissionForm((form) => form ? { ...form, permissions: { ...normalizeUserPermissions(form.permissions || {}), [key]: value } } : form);
  };

  const saveUserPermissions = () => {
    if (!userPermissionForm?.id) return;
    saveWarehouse((base) => addMovement({
      ...base,
      depotUsers: base.depotUsers.map((user) => String(user.id) === String(userPermissionForm.id) ? { ...user, permissions: normalizeUserPermissions(userPermissionForm.permissions || {}), updatedAt: nowTimestamp() } : user),
    }, makeMovement({ action: "Kişisel yetkiler güncellendi", examName: userPermissionForm.name, detail: `${personalPermissionCount(userPermissionForm)} kişisel yetki ayarı` })));
    setUserPermissionForm(null);
    setModal(null);
  };

  const resetUserPermissions = () => {
    if (!userPermissionForm?.id) return;
    if (!confirmRisk(`${userPermissionForm.name} için kişisel yetkiler sıfırlanacak ve rol yetkileri kullanılacak. Emin misin?`)) return;
    saveWarehouse((base) => addMovement({
      ...base,
      depotUsers: base.depotUsers.map((user) => String(user.id) === String(userPermissionForm.id) ? { ...user, permissions: normalizeUserPermissions({}), updatedAt: nowTimestamp() } : user),
    }, makeMovement({ action: "Kişisel yetkiler sıfırlandı", examName: userPermissionForm.name, detail: "Kullanıcı rol yetkilerine döndürüldü" })));
    setUserPermissionForm(null);
    setModal(null);
  };

  const cyclePersonalPermission = (user, key) => {
    const current = normalizeUserPermissions(user.permissions || {})[key];
    const next = current === null ? true : current === true ? false : null;
    const label = next === null ? "Rolü kullan" : next ? "Açık" : "Kapalı";
    saveWarehouse((base) => addMovement({
      ...base,
      depotUsers: base.depotUsers.map((item) => String(item.id) === String(user.id) ? {
        ...item,
        permissions: { ...normalizeUserPermissions(item.permissions || {}), [key]: next },
        updatedAt: nowTimestamp(),
      } : item),
    }, makeMovement({ action: "Kişisel yetki değiştirildi", examName: user.name, detail: `${key}: ${label}` })));
  };

  useEffect(() => {
    const storeScroll = () => {
      scrollPositionsRef.current[activeViewKey] = window.scrollY || document.documentElement.scrollTop || 0;
    };
    window.addEventListener("scroll", storeScroll, { passive: true });
    return () => window.removeEventListener("scroll", storeScroll);
  }, [activeViewKey]);

  useEffect(() => {
    if (lastViewKeyRef.current !== activeViewKey) {
      lastViewKeyRef.current = activeViewKey;
      restoreScrollPosition(activeViewKey);
    }
  }, [activeViewKey]);

  const shelfById = (id) => warehouse.shelves.find((s) => String(s.id) === String(id));
  const shelfLabel = (id) => shelfById(id)?.name || "Raf yok";
  const totalExamStock = warehouse.legacyExams.reduce((sum, exam) => sum + variantTotal(exam), 0);
  const totalBookStock = warehouse.stockBooks.reduce((sum, book) => sum + Number(book.stock || 0), 0);
  const criticalExams = warehouse.legacyExams.filter((exam) => hasCriticalStock(exam));
  const criticalBooks = warehouse.stockBooks.filter((book) => Number(book.stock || 0) > 0 && Number(book.stock || 0) < CRITICAL_STOCK_THRESHOLD);
  const pendingOrders = warehouse.depoOrders.filter((o) => o.status === "pending");
  const preparedOrders = warehouse.depoOrders.filter((o) => o.status === "prepared");
  const deliveredOrders = warehouse.depoOrders.filter((o) => o.status === "delivered");
  const externalPendingOrders = orders.filter((o) => o.status === "Onay bekliyor");
  const normalizedCurrentRole = normalizeRoleValue(currentStaffUser?.role || currentStaffRole);
  const storedCurrentUser = currentStaffUser
    ? warehouse.depotUsers.find((u) => sameUserIdentity(u, currentStaffUser))
    : null;
  const currentWarehouseUser = storedCurrentUser
    ? { ...currentStaffUser, ...storedCurrentUser, role: normalizeRoleValue(storedCurrentUser.role || currentStaffUser?.role || normalizedCurrentRole) }
    : currentStaffUser?.id
      ? { ...currentStaffUser, role: normalizeRoleValue(currentStaffUser.role || normalizedCurrentRole), permissions: normalizeUserPermissions(currentStaffUser.permissions || {}) }
      : (warehouse.depotUsers.find((u) => normalizeRoleValue(u.role) === normalizedCurrentRole && u.isActive !== false) || warehouse.depotUsers.find((u) => normalizeRoleValue(u.role) === "yonetici") || { name: "Noxelera Admin", role: normalizedCurrentRole, permissions: normalizeUserPermissions({}) });
  const effectiveCurrentRole = normalizeRoleValue(currentWarehouseUser.role || normalizedCurrentRole);
  const roleLabel = ROLE_PERMISSION_MATRIX[effectiveCurrentRole]?.label || "Personel";
  const currentUserName = currentWarehouseUser.name || "Noxelera Admin";
  const connectedStaffCount = staffUsers.length;
  const rolePermissions = getRolePermissions(effectiveCurrentRole);
  const currentEffectivePermissions = effectivePermissionsForUser(currentWarehouseUser, rolePermissionSettings);
  const roleCan = (permission) => !!currentEffectivePermissions[permission];
  const canManageUsers = roleCan("manageUsers");
  const canUseStockCount = roleCan("stockCount");
  const canViewLogs = roleCan("viewLogs");
  const canEditStock = roleCan("editStock");
  const canRiskyActions = roleCan("riskyActions");
  const guardPermission = (permission, message = "Bu işlem için yetkin yok.") => {
    if (roleCan(permission)) return true;
    window.alert(message);
    return false;
  };
  const PermissionDenied = ({ title = "Yetki gerekli", text = "Bu bölümü görüntülemek için yetkin yok." }) => (
    <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100"><ShieldCheck size={26} /></div>
      <h3 className="text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-bold text-slate-500">{text}</p>
      <button onClick={() => switchWarehouseView("panel", null)} className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Depo menüsüne dön</button>
    </div>
  );
  const isModalOpen = Boolean(modal || selectedExam || selectedBook || selectedShelf || selectedOrder);

  useEffect(() => {
    if (isModalOpen && !wasModalOpenRef.current) {
      modalScrollRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    }
    if (!isModalOpen && wasModalOpenRef.current) {
      const target = modalScrollRef.current || scrollPositionsRef.current[activeViewKey] || 0;
      window.requestAnimationFrame(() => window.scrollTo({ top: target, behavior: "auto" }));
    }
    wasModalOpenRef.current = isModalOpen;
  }, [isModalOpen, activeViewKey]);

  const confirmRisk = (message) => {
    if (!canRiskyActions) {
      window.alert("Bu riskli işlem için yetkin yok.");
      return false;
    }
    return window.confirm(message || "Bu işlem riskli. Devam etmek istediğine emin misin?");
  };
  const goWarehouseBack = () => {
    if (isModalOpen) {
      closeOverlay();
      return;
    }
    rememberScrollPosition();
    const previous = viewStackRef.current.pop();
    if (previous) {
      setTab(previous.tab);
      setSubPage(previous.subPage);
      window.requestAnimationFrame(() => restoreScrollPosition(`${previous.tab}:${previous.subPage || "home"}`));
      return;
    }
    if (tab !== "panel" || subPage) {
      setTab("panel");
      setSubPage(null);
      window.requestAnimationFrame(() => restoreScrollPosition("panel:home"));
    }
  };
  const BackButton = ({ label = "Geri" }) => (
    <button onClick={goWarehouseBack} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200">
      <ChevronLeft size={16} />{label}
    </button>
  );

  const addMovement = (base, movement) => ({
    ...base,
    movements: [{
      ...movement,
      userName: movement?.userName || currentUserName,
      userRole: normalizedCurrentRole,
      roleLabel,
      createdAt: movement?.createdAt || todayText(),
      createdAtIso: movement?.createdAtIso || nowTimestamp(),
    }, ...(base.movements || [])],
  });

  const cleanBarcode = (value) => String(value || "").trim();
  const sameBarcode = (a, b) => cleanBarcode(a).toLowerCase() === cleanBarcode(b).toLowerCase();
  const collectBarcodes = (base = warehouse, ignore = {}) => {
    const rows = [];
    (base.legacyExams || []).forEach((exam) => {
      if (ignore.type === "exam" && String(ignore.id) === String(exam.id)) return;
      if (cleanBarcode(exam.barcodeA)) rows.push({ code: exam.barcodeA, title: exam.name, kind: "Deneme A barkodu" });
      if (cleanBarcode(exam.barcodeB)) rows.push({ code: exam.barcodeB, title: exam.name, kind: "Deneme B barkodu" });
      if (cleanBarcode(exam.barcode)) rows.push({ code: exam.barcode, title: exam.name, kind: "Deneme barkodu" });
    });
    (base.stockBooks || []).forEach((book) => {
      if (ignore.type === "book" && String(ignore.id) === String(book.id)) return;
      if (cleanBarcode(book.barcode)) rows.push({ code: book.barcode, title: book.name, kind: "Kitap barkodu" });
    });
    (base.shelves || []).forEach((shelf) => {
      if (ignore.type === "shelf" && String(ignore.id) === String(shelf.id)) return;
      if (cleanBarcode(shelf.qrCode)) rows.push({ code: shelf.qrCode, title: shelf.name || shelf.code, kind: "Raf barkodu" });
    });
    return rows;
  };
  const hasDuplicateBarcode = (codes, ignore = {}) => {
    const cleanCodes = codes.map(cleanBarcode).filter(Boolean);
    const repeatedInside = cleanCodes.find((code, index) => cleanCodes.findIndex((item) => sameBarcode(item, code)) !== index);
    if (repeatedInside) {
      window.alert(`Aynı barkod iki kez kullanılamaz: ${repeatedInside}`);
      return true;
    }
    const existing = collectBarcodes(warehouse, ignore);
    const found = cleanCodes.map((code) => existing.find((item) => sameBarcode(item.code, code))).find(Boolean);
    if (found) {
      window.alert(`Bu barkod zaten kayıtlı: ${found.code}\nKayıt: ${found.title}\nTür: ${found.kind}`);
      return true;
    }
    return false;
  };

  const updateExam = (examId, updater, movement) => {
    saveWarehouse((base) => {
      let updatedExam = null;
      let next = {
        ...base,
        legacyExams: base.legacyExams.map((exam) => {
          if (String(exam.id) !== String(examId)) return exam;
          updatedExam = updater(exam);
          return updatedExam;
        }),
      };
      if (updatedExam) {
        setSelectedExam((selected) => (String(selected?.id) === String(examId) ? updatedExam : selected));
      }
      if (movement) next = addMovement(next, movement);
      return next;
    });
  };

  const updateBook = (bookId, updater, movement) => {
    saveWarehouse((base) => {
      let next = { ...base, stockBooks: base.stockBooks.map((book) => String(book.id) === String(bookId) ? updater(book) : book) };
      if (movement) next = addMovement(next, movement);
      return next;
    });
  };

  const updateOrder = (orderId, updater, movement) => {
    saveWarehouse((base) => {
      let next = { ...base, depoOrders: base.depoOrders.map((order) => String(order.id) === String(orderId) ? updater(order) : order) };
      if (movement) next = addMovement(next, movement);
      return next;
    });
  };

  const addShelf = () => {
    if (!guardPermission("editStock", "Raf eklemek için stok düzenleme yetkisi gerekli.")) return;
    if (!shelfForm.name.trim()) return;
    const shelfName = shelfForm.name.trim();
    const shelfBarcode = shelfForm.qrCode.trim() || `RAF-${Date.now()}`;
    if (hasDuplicateBarcode([shelfBarcode])) return;
    saveWarehouse((base) => ({
      ...base,
      shelves: [
        {
          id: safeId("shelf", shelfName),
          code: shelfName,
          name: shelfName,
          qrCode: shelfBarcode,
          note: shelfForm.note.trim(),
          isActive: true,
          createdAt: nowTimestamp(),
          updatedAt: nowTimestamp(),
        },
        ...base.shelves,
      ],
    }));
    setShelfForm({ name: "", qrCode: "", note: "" });
    setModal(null);
  };

  const addExam = () => {
    if (!guardPermission("editStock", "Deneme eklemek için stok düzenleme yetkisi gerekli.")) return;
    if (!productForm.name.trim()) return;
    const isMiddle = groupForClass(productForm.classLevel) === "Ortaokul";
    const nextBarcodeA = productForm.barcodeA.trim() || `EX-${Date.now()}-A`;
    const nextBarcodeB = productForm.barcodeB.trim() || `EX-${Date.now()}-B`;
    if (hasDuplicateBarcode([nextBarcodeA, nextBarcodeB])) return;
    const shelf = shelfById(productForm.shelfId);
    const exam = {
      id: nextId("exam"),
      classLevel: productForm.classLevel,
      group: groupForClass(productForm.classLevel),
      name: productForm.name.trim(),
      shelf: shelf?.name || "Belirtilmedi",
      shelfId: String(productForm.shelfId),
      barcode: "",
      barcodeA: nextBarcodeA,
      barcodeB: nextBarcodeB,
      variants: isMiddle
        ? { "A Sayısal": Number(productForm.aSayisal || 0), "A Sözel": Number(productForm.aSozel || 0), "B Sayısal": Number(productForm.bSayisal || 0), "B Sözel": Number(productForm.bSozel || 0) }
        : { "Kitapçık A": Number(productForm.kitapcikA || 0), "Kitapçık B": Number(productForm.kitapcikB || 0) },
      giftDate: "",
      isGiftRecord: false,
      active: true,
      createdAt: nowTimestamp(),
    };
    exam.active = variantTotal(exam) > 0;
    saveWarehouse((base) => addMovement({ ...base, legacyExams: [exam, ...base.legacyExams] }, makeMovement({ action: "Deneme eklendi", examName: exam.name, detail: `${exam.classLevel} • ${variantTotal(exam)} adet` })));
    setProductForm({ group: "Ortaokul", classLevel: "8. Sınıf", name: "", shelfId: "shelf-b-01", barcodeA: "", barcodeB: "", variantMode: "Ortaokul", aSayisal: 0, aSozel: 0, bSayisal: 0, bSozel: 0, kitapcikA: 0, kitapcikB: 0 });
    setModal(null);
  };

  const addBook = () => {
    if (!guardPermission("editStock", "Kitap eklemek için stok düzenleme yetkisi gerekli.")) return;
    if (!bookForm.name.trim()) return;
    const nextBookBarcode = bookForm.barcode.trim() || `BK-${Date.now()}`;
    if (hasDuplicateBarcode([nextBookBarcode])) return;
    const shelf = shelfById(bookForm.shelfId);
    const book = {
      id: nextId("book"),
      name: bookForm.name.trim(),
      classLevel: bookForm.classLevel,
      group: groupForClass(bookForm.classLevel),
      stock: Number(bookForm.stock || 0),
      shelf: shelf?.name || "Belirtilmedi",
      shelfId: String(bookForm.shelfId),
      barcode: nextBookBarcode,
      createdAt: nowTimestamp(),
      active: true,
    };
    saveWarehouse((base) => addMovement({ ...base, stockBooks: [book, ...base.stockBooks] }, makeMovement({ action: "Kitap eklendi", examName: book.name, detail: `${book.classLevel} • ${book.stock} adet` })));
    setBookForm({ group: "Ortaokul", classLevel: "8. Sınıf", name: "", stock: 0, shelfId: "shelf-k-01", barcode: "" });
    setModal(null);
  };

  const changeVariant = (exam, key, delta, note = "") => {
    if (!guardPermission("editStock", "Stok düzenlemek için yetkin yok.")) return;
    const variantKey = normalizeVariantKey(key);
    updateExam(exam.id, (current) => {
      const normalized = ensureExamVariants(current);
      const variants = {
        ...normalized,
        [variantKey]: Math.max(0, Number(normalized?.[variantKey] || 0) + Number(delta || 0)),
      };
      const next = { ...current, variants };
      return normalizeExamStatus(next);
    }, makeMovement({ action: delta >= 0 ? "Stok girişi" : "Stok çıkışı", examName: exam.name, detail: `${variantKey}: ${Math.abs(delta)} adet ${note}` }));
  };

  const bulkAddExamSets = (exam, totalCount) => {
    if (!guardPermission("editStock", "Toplu stok eklemek için yetkin yok.")) return;
    const amount = Number(totalCount || 0);
    if (!amount || amount < 1) {
      alert("Lütfen geçerli bir deneme adedi girin.");
      return;
    }
    const aCount = Math.ceil(amount / 2);
    const bCount = Math.floor(amount / 2);
    const highSchool = examIsHighSchool(exam);
    updateExam(
      exam.id,
      (current) => {
        const normalized = ensureExamVariants(current);
        const variants = highSchool
          ? {
              ...normalized,
              "Kitapçık A": Number(normalized["Kitapçık A"] || 0) + aCount,
              "Kitapçık B": Number(normalized["Kitapçık B"] || 0) + bCount,
            }
          : {
              ...normalized,
              "A Sayısal": Number(normalized["A Sayısal"] || 0) + aCount,
              "A Sözel": Number(normalized["A Sözel"] || 0) + aCount,
              "B Sayısal": Number(normalized["B Sayısal"] || 0) + bCount,
              "B Sözel": Number(normalized["B Sözel"] || 0) + bCount,
            };
        return normalizeExamStatus({ ...current, variants, active: true });
      },
      makeMovement({
        action: "Toplu deneme girişi",
        examName: exam.name,
        detail: `${amount} deneme eklendi. A kitapçığı: ${aCount}, B kitapçığı: ${bCount}.`,
      })
    );
  };


  const changeBookStock = (book, delta, note = "") => {
    if (!guardPermission("editStock", "Kitap stoğu düzenlemek için yetkin yok.")) return;
    updateBook(book.id, (current) => ({ ...current, stock: Math.max(0, Number(current.stock || 0) + Number(delta || 0)) }), makeMovement({ action: delta >= 0 ? "Kitap stok girişi" : "Kitap stok çıkışı", examName: book.name, detail: `${Math.abs(delta)} adet ${note}` }));
  };

  const moveExamShelf = (exam, shelfId) => {
    if (!guardPermission("editStock", "Raf değiştirmek için yetkin yok.")) return;
    const shelf = shelfById(shelfId);
    updateExam(exam.id, (current) => ({ ...current, shelfId: String(shelfId), shelf: shelf?.name || current.shelf }), makeMovement({ action: "Raf değiştirildi", examName: exam.name, detail: `${shelf?.name || "Raf yok"} rafına taşındı.` }));
  };

  const moveBookShelf = (book, shelfId) => {
    if (!guardPermission("editStock", "Raf değiştirmek için yetkin yok.")) return;
    const shelf = shelfById(shelfId);
    updateBook(book.id, (current) => ({ ...current, shelfId: String(shelfId), shelf: shelf?.name || current.shelf }), makeMovement({ action: "Kitap rafı değiştirildi", examName: book.name, detail: `${shelf?.name || "Raf yok"} rafına taşındı.` }));
  };

  const toggleExam = (exam) => { if (!guardPermission("editStock", "Deneme durumunu değiştirmek için yetkin yok.")) return; updateExam(exam.id, (current) => ({ ...current, active: !current.active }), makeMovement({ action: exam.active ? "Deneme pasife alındı" : "Deneme aktif edildi", examName: exam.name, detail: "Durum değiştirildi." }));
  };
  const toggleBook = (book) => { if (!guardPermission("editStock", "Kitap durumunu değiştirmek için yetkin yok.")) return; updateBook(book.id, (current) => ({ ...current, active: !current.active }), makeMovement({ action: book.active ? "Kitap pasife alındı" : "Kitap aktif edildi", examName: book.name, detail: "Durum değiştirildi." }));

  };

  const resetExamStock = (exam) => {
    if (!guardPermission("riskyActions", "Stok sıfırlamak için riskli işlem yetkisi gerekli.")) return;
    if (!confirmRisk(`“${exam.name}” stokları tamamen sıfırlanacak ve deneme pasife düşecek. Emin misin?`)) return;
    updateExam(
      exam.id,
      (current) =>
        normalizeExamStatus({
          ...current,
          variants: Object.fromEntries(Object.keys(current.variants || {}).map((key) => [key, 0])),
          active: false,
        }),
      makeMovement({
        action: "Deneme stokları sıfırlandı",
        examName: exam.name,
        detail: "A/B sayısal-sözel tüm stoklar sıfırlandı ve deneme pasife alındı.",
      })
    );
    setSelectedExam(null);
  };

  const markGift = (exam) => {
    if (!guardPermission("giftExams", "Hediye kategorisi için yetkin yok.")) return;
    if (!guardPermission("riskyActions", "Hediye ayırma riskli işlem yetkisi gerektirir.")) return;
    const giftQuantity = orderAvailableTotal(exam);
    if (!confirmRisk(`“${exam.name}” hediye kategorisine alınacak ve mevcut stokları sıfırlanacak. Deneme bilgileri pasif olarak listede kalacak. Emin misin?`)) return;
    updateExam(exam.id, (current) => ({
      ...current,
      variants: Object.fromEntries(Object.keys(ensureExamVariants(current) || {}).map((key) => [key, 0])),
      giftQuantity,
      giftDate: new Date().toISOString(),
      isGiftRecord: true,
      active: false,
    }), makeMovement({ action: "Hediye kategorisine alındı", examName: exam.name, detail: `${giftQuantity} adet hediye olarak ayrıldı. Stok sıfırlandı, deneme pasif olarak listede kaldı. 7 günlük hediye takibi başladı.` }));
    setSelectedExam(null);
  };

  const deleteExam = (exam) => {
    if (!guardPermission("riskyActions", "Kalıcı silme için riskli işlem yetkisi gerekli.")) return;
    if (!confirmRisk(`“${exam.name}” tamamen ve kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misin?`)) return;
    saveWarehouse((base) => addMovement({ ...base, legacyExams: base.legacyExams.filter((item) => item.id !== exam.id) }, makeMovement({ action: "Deneme kalıcı silindi", examName: exam.name, detail: "Denemenin tüm bilgileri sistemden kaldırıldı." })));
    setSelectedExam(null);
  };

  const deleteBook = (book) => {
    if (!guardPermission("riskyActions", "Silme işlemi için riskli işlem yetkisi gerekli.")) return;
    if (!confirmRisk(`“${book.name}” çöp kutusuna taşınacak. Emin misin?`)) return;
    saveWarehouse((base) => addMovement({ ...base, stockBooks: base.stockBooks.filter((item) => item.id !== book.id), deletedRecords: [makeDeletedRecord("books", book.id, book, currentUserName), ...base.deletedRecords] }, makeMovement({ action: "Kitap silindi", examName: book.name, detail: "Kayıt çöp kutusuna taşındı." })));
    setSelectedBook(null);
  };

  const openEditExam = (exam) => {
    setExamEditForm({ id: exam.id, name: exam.name || "", classLevel: exam.classLevel || "8. Sınıf", barcodeA: exam.barcodeA || "", barcodeB: exam.barcodeB || "", shelfId: String(exam.shelfId || ""), active: exam.active !== false });
    setSelectedExam(null);
    openModal({ type: "editExam" });
  };

  const saveEditedExam = () => {
    if (!guardPermission("editStock", "Deneme düzenlemek için yetkin yok.")) return;
    if (!examEditForm?.name?.trim()) return;
    if (hasDuplicateBarcode([examEditForm.barcodeA, examEditForm.barcodeB], { type: "exam", id: examEditForm.id })) return;
    const shelf = shelfById(examEditForm.shelfId);
    updateExam(examEditForm.id, (current) => ({
      ...current,
      name: examEditForm.name.trim(),
      classLevel: examEditForm.classLevel,
      group: groupForClass(examEditForm.classLevel),
      barcode: "",
      barcodeA: examEditForm.barcodeA.trim(),
      barcodeB: examEditForm.barcodeB.trim(),
      shelfId: String(examEditForm.shelfId),
      shelf: shelf?.name || current.shelf,
      active: examEditForm.active && variantTotal(current) > 0,
      updatedAt: nowTimestamp(),
    }), makeMovement({ action: "Deneme bilgisi düzenlendi", examName: examEditForm.name.trim(), detail: `${examEditForm.classLevel} • ${shelf?.name || "Raf yok"}` }));
    setExamEditForm(null);
    setModal(null);
  };

  const openEditBook = (book) => {
    setBookEditForm({ id: book.id, name: book.name || "", classLevel: book.classLevel || "8. Sınıf", barcode: book.barcode || "", shelfId: String(book.shelfId || ""), stock: Number(book.stock || 0), active: book.active !== false });
    setSelectedBook(null);
    openModal({ type: "editBook" });
  };

  const saveEditedBook = () => {
    if (!guardPermission("editStock", "Kitap düzenlemek için yetkin yok.")) return;
    if (!bookEditForm?.name?.trim()) return;
    if (hasDuplicateBarcode([bookEditForm.barcode], { type: "book", id: bookEditForm.id })) return;
    const shelf = shelfById(bookEditForm.shelfId);
    updateBook(bookEditForm.id, (current) => ({
      ...current,
      name: bookEditForm.name.trim(),
      classLevel: bookEditForm.classLevel,
      group: groupForClass(bookEditForm.classLevel),
      barcode: bookEditForm.barcode.trim(),
      shelfId: String(bookEditForm.shelfId),
      shelf: shelf?.name || current.shelf,
      stock: Math.max(0, Number(bookEditForm.stock || 0)),
      active: bookEditForm.active,
      updatedAt: nowTimestamp(),
    }), makeMovement({ action: "Kitap bilgisi düzenlendi", examName: bookEditForm.name.trim(), detail: `${bookEditForm.classLevel} • ${shelf?.name || "Raf yok"}` }));
    setBookEditForm(null);
    setModal(null);
  };

  const openEditShelf = (shelf) => {
    setShelfEditForm({ id: shelf.id, name: shelf.name || shelf.code || "", qrCode: shelf.qrCode || "", note: shelf.note || "", isActive: shelf.isActive !== false });
    setSelectedShelf(null);
    openModal({ type: "editShelf" });
  };

  const saveEditedShelf = () => {
    if (!guardPermission("editStock", "Raf düzenlemek için yetkin yok.")) return;
    if (!shelfEditForm?.name?.trim()) return;
    const shelfName = shelfEditForm.name.trim();
    const shelfBarcode = shelfEditForm.qrCode.trim() || `RAF-${Date.now()}`;
    if (hasDuplicateBarcode([shelfBarcode], { type: "shelf", id: shelfEditForm.id })) return;
    saveWarehouse((base) => addMovement({
      ...base,
      shelves: base.shelves.map((item) => item.id === shelfEditForm.id ? { ...item, code: shelfName, name: shelfName, qrCode: shelfBarcode, note: shelfEditForm.note.trim(), isActive: shelfEditForm.isActive, updatedAt: nowTimestamp() } : item),
    }, makeMovement({ action: "Raf düzenlendi", examName: shelfName, detail: shelfEditForm.isActive ? "Aktif" : "Pasif" })));
    setShelfEditForm(null);
    setModal(null);
  };

  const toggleShelf = (shelf) => { if (!guardPermission("editStock", "Raf durumunu değiştirmek için yetkin yok.")) return; saveWarehouse((base) => addMovement({ ...base, shelves: base.shelves.map((item) => item.id === shelf.id ? { ...item, isActive: !item.isActive, updatedAt: nowTimestamp() } : item) }, makeMovement({ action: shelf.isActive ? "Raf pasife alındı" : "Raf aktif edildi", examName: shelf.name || shelf.code, detail: "Durum değiştirildi" })));

  };

  const createOrder = () => {
    if (!guardPermission("viewOrders", "Sipariş oluşturmak için sipariş yetkisi gerekli.")) return;
    const exam = warehouse.legacyExams.find((item) => item.id === orderForm.examId);
    if (!exam || Number(orderForm.quantity) <= 0 || !orderForm.destination.trim()) return;
    const order = {
      id: nextId("DPO"),
      examId: exam.id,
      examName: exam.name,
      classLevel: exam.classLevel,
      shelf: exam.shelf,
      variant: orderForm.variant || "Otomatik",
      quantity: Number(orderForm.quantity),
      destination: orderForm.destination.trim(),
      note: orderForm.note.trim(),
      status: "pending",
      createdBy: currentUserName,
      preparedBy: "",
      deliveredBy: "",
      createdAt: nowTimestamp(),
      preparedAt: "",
      deliveredAt: "",
    };
    saveWarehouse((base) => addMovement({ ...base, depoOrders: [order, ...base.depoOrders] }, makeMovement({ action: "Sipariş oluşturuldu", examName: exam.name, detail: `${order.destination} • ${order.quantity} adet` })));
    setOrderForm({ examId: "", quantity: 1, destination: "", note: "", variant: "Otomatik" });
    setOrderView("pending");
    setModal(null);
  };

  const deliverOrder = (order) => {
    if (!guardPermission("deliverOrders", "Teslim işlemi için yetkin yok.")) return;
    const delivered = { ...order, status: "delivered", deliveredBy: currentUserName, deliveredAt: todayText() };
    const record = {
      id: nextId("delivery"),
      orderId: order.id,
      examName: order.examName,
      quantity: order.quantity,
      destination: order.destination,
      note: order.note,
      deliveredBy: currentUserName,
      preparedBy: order.preparedBy || currentUserName,
      deliveredAt: todayText(),
      dateKey: dateKey(),
    };
    saveWarehouse((base) => addMovement({ ...base, depoOrders: base.depoOrders.map((item) => item.id === order.id ? delivered : item), deliveryRecords: [record, ...base.deliveryRecords] }, makeMovement({ action: "Sipariş teslim edildi", examName: order.examName, detail: `${order.destination} • ${order.quantity} adet` })));
    setSelectedOrder(null);
  };

  const cancelOrder = (order) => {
    if (!guardPermission("riskyActions", "Sipariş iptali için riskli işlem yetkisi gerekli.")) return;
    if (!confirmRisk(`“${order.examName}” siparişi iptal edilecek. Emin misin?`)) return;
    updateOrder(order.id, (current) => ({ ...current, status: "cancelled" }), makeMovement({ action: "Sipariş iptal edildi", examName: order.examName, detail: order.destination }));
  };

  const openEditOrder = (order) => {
    setEditOrderForm({ orderId: order.id, examId: order.examId, quantity: order.quantity, destination: order.destination, note: order.note || "", variant: order.variant || "Otomatik" });
    setSelectedOrder(null);
    openModal({ type: "editOrder" });
  };

  const saveEditedOrder = () => {
    if (!guardPermission("viewOrders", "Sipariş düzenlemek için sipariş yetkisi gerekli.")) return;
    const exam = warehouse.legacyExams.find((item) => item.id === editOrderForm.examId);
    if (!exam || Number(editOrderForm.quantity) <= 0 || !editOrderForm.destination.trim()) return;
    saveWarehouse((base) => addMovement({
      ...base,
      depoOrders: base.depoOrders.map((item) => item.id === editOrderForm.orderId ? {
        ...item,
        examId: exam.id,
        examName: exam.name,
        classLevel: exam.classLevel,
        shelf: exam.shelf,
        quantity: Number(editOrderForm.quantity || 0),
        destination: editOrderForm.destination.trim(),
        note: editOrderForm.note.trim(),
        variant: editOrderForm.variant || "Otomatik",
      } : item),
    }, makeMovement({ action: "Sipariş düzenlendi", examName: exam.name, detail: `${editOrderForm.destination} • ${editOrderForm.quantity} adet` })));
    setModal(null);
  };

  const prepareOrder = (order) => {
    if (!guardPermission("prepareOrders", "Sipariş hazırlamak için yetkin yok.")) return;
    const exam = warehouse.legacyExams.find((item) => item.id === order.examId);
    if (!exam) return;
    const plan = deductionPlanForOrder(exam, order.quantity);
    if (!canDeduct(exam, plan)) {
      openModal({ type: "info", title: "Stok yetersiz", text: `Bu sipariş için yeterli kitapçık/set yok. Plan: ${Object.entries(plan).map(([k, v]) => `${k}: ${v}`).join(" | ")}` });
      return;
    }
    saveWarehouse((base) => {
      const nextExams = base.legacyExams.map((item) => item.id === exam.id ? normalizeExamStatus(applyDeduction(item, plan)) : item);
      const nextOrders = base.depoOrders.map((item) => item.id === order.id ? { ...item, status: "prepared", preparedBy: currentUserName, preparedAt: todayText() } : item);
      const notification = { id: nextId("ntf"), title: "Yeni teslimat hazır", body: `${order.destination} için ${order.examName} hazırlandı.`, orderId: order.id, createdAt: nowTimestamp(), read: false };
      return addMovement({ ...base, legacyExams: nextExams, depoOrders: nextOrders, notifications: [notification, ...(base.notifications || [])] }, makeMovement({ action: "Sipariş hazırlandı", examName: order.examName, detail: Object.entries(plan).map(([k, v]) => `${k}: ${v}`).join(" | ") }));
    });
    setSelectedOrder(null);
  };

  const saveStockCount = (exam) => {
    if (!guardPermission("stockCount", "Stok sayımı yapmak için yetkin yok.")) return;
    const currentVariants = ensureExamVariants(exam);
    const counted = Object.fromEntries(Object.keys(currentVariants).map((key) => [key, Math.max(0, Number(stockCountDraft[key] ?? currentVariants[key] ?? 0))]));
    const changes = Object.entries(counted).filter(([key, value]) => Number(currentVariants[key] || 0) !== Number(value));
    if (changes.length === 0) {
      window.alert("Sayımda değişen bir stok bulunmadı.");
      return;
    }
    const diffText = changes.map(([key, value]) => `${key}: ${currentVariants[key] || 0} → ${value}`).join(" | ");
    const before = Object.entries(currentVariants).map(([key, value]) => `${key}: ${value}`).join(" | ");
    const after = Object.entries(counted).map(([key, value]) => `${key}: ${value}`).join(" | ");
    updateExam(exam.id, (current) => normalizeExamStatus({ ...current, variants: counted }), makeMovement({
      action: "Stok sayımı kaydedildi",
      examName: exam.name,
      detail: diffText,
      before,
      after,
      entityType: "Stok Sayımı",
      risk: true,
    }));
    setModal(null);
    setStockCountDraft({});
  };

  const addInstitution = () => {
    if (!institutionForm.name.trim()) return;
    saveWarehouse((base) => addMovement({ ...base, institutions: [{ id: nextId("inst"), ...institutionForm, name: institutionForm.name.trim() }, ...base.institutions] }, makeMovement({ action: "Kurum eklendi", examName: institutionForm.name.trim(), detail: institutionForm.type })));
    setInstitutionForm({ name: "", type: "Dershane", isActive: true });
    setModal(null);
  };

  const toggleInstitution = (inst) => saveWarehouse((base) => ({ ...base, institutions: base.institutions.map((item) => item.id === inst.id ? { ...item, isActive: !item.isActive } : item) }));

  const addDepotUser = () => {
    if (!guardPermission("manageUsers", "Kullanıcı eklemek için yetkin yok.")) return;
    if (!userForm.name.trim()) return;
    saveWarehouse((base) => addMovement({ ...base, depotUsers: [{ id: nextId("user"), ...userForm, role: normalizeRoleValue(userForm.role), permissions: normalizeUserPermissions({}), name: userForm.name.trim(), createdAt: nowTimestamp(), updatedAt: nowTimestamp() }, ...base.depotUsers] }, makeMovement({ action: "Depo kullanıcısı eklendi", examName: userForm.name.trim(), detail: userForm.title || userForm.role })));
    setUserForm({ name: "", role: "personel", title: "Personel", phone: "", email: "", password: "", isActive: true });
    setModal(null);
  };

  const toggleDepotUser = (user) => {
    if (normalizeRoleValue(user.role) === "yonetici") return alert("Ana admin pasife alınamaz. Sistemde tek ana admin aktif kalmalı.");
    saveWarehouse((base) => addMovement({ ...base, depotUsers: base.depotUsers.map((item) => item.id === user.id ? { ...item, isActive: !item.isActive, updatedAt: nowTimestamp() } : item) }, makeMovement({ action: user.isActive ? "Depo kullanıcısı pasife alındı" : "Depo kullanıcısı aktif edildi", examName: user.name, detail: user.role })));
  };

  const openEditDepotUser = (user) => {
    setUserEditForm({ id: user.id, name: user.name || "", role: normalizeRoleValue(user.role), title: user.title || "", phone: user.phone || "", email: user.email || "", password: user.password || "", isActive: user.isActive !== false });
    openModal({ type: "editDepotUser" });
  };

  const saveEditedDepotUser = () => {
    if (!guardPermission("manageUsers", "Kullanıcı düzenlemek için yetkin yok.")) return;
    if (!userEditForm?.name?.trim()) return;
    saveWarehouse((base) => addMovement({
      ...base,
      depotUsers: base.depotUsers.map((item) => item.id === userEditForm.id ? { ...item, ...userEditForm, role: normalizeRoleValue(item.role) === "yonetici" ? "yonetici" : (normalizeRoleValue(userEditForm.role) === "yonetici" ? "yardimci_admin" : normalizeRoleValue(userEditForm.role)), title: ROLE_PERMISSION_MATRIX[normalizeRoleValue(item.role) === "yonetici" ? "yonetici" : (normalizeRoleValue(userEditForm.role) === "yonetici" ? "yardimci_admin" : normalizeRoleValue(userEditForm.role))]?.label || userEditForm.title, name: userEditForm.name.trim(), updatedAt: nowTimestamp() } : item),
    }, makeMovement({ action: "Depo kullanıcısı düzenlendi", examName: userEditForm.name.trim(), detail: userEditForm.role })));
    setUserEditForm(null);
    setModal(null);
  };

  const deleteDepotUser = (user) => saveWarehouse((base) => addMovement({ ...base, depotUsers: base.depotUsers.filter((item) => item.id !== user.id), deletedRecords: [makeDeletedRecord("depotUsers", user.id, user, currentUserName), ...base.deletedRecords] }, makeMovement({ action: "Depo kullanıcısı silindi", examName: user.name, detail: "Kayıt çöp kutusuna taşındı" })));

  const deleteDeliveryRecord = (record) => {
    if (!confirmRisk("Teslim kaydı çöp kutusuna taşınacak. Emin misin?")) return;
    saveWarehouse((base) => ({ ...base, deliveryRecords: base.deliveryRecords.filter((item) => item.id !== record.id), deletedRecords: [makeDeletedRecord("deliveryRecords", record.id, record, currentUserName), ...base.deletedRecords] }));
  };

  const deleteMovementRecord = (movement) => {
    if (!confirmRisk("Seyir defteri kaydı çöp kutusuna taşınacak. Emin misin?")) return;
    saveWarehouse((base) => ({ ...base, movements: base.movements.filter((item) => item.id !== movement.id), deletedRecords: [makeDeletedRecord("movements", movement.id, movement, currentUserName), ...base.deletedRecords] }));
  };

  const markNotificationRead = (notificationId) => saveWarehouse((base) => ({ ...base, notifications: base.notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n) }));

  const restoreDeleted = (record) => {
    if (!guardPermission("trash", "Çöp kutusu işlemi için yetkin yok.")) return;
    saveWarehouse((base) => {
      let next = { ...base, deletedRecords: base.deletedRecords.filter((item) => item.id !== record.id) };
      if (record.collectionName === "exams") next = { ...next, legacyExams: [record.originalData, ...next.legacyExams] };
      if (record.collectionName === "books") next = { ...next, stockBooks: [record.originalData, ...next.stockBooks] };
      if (record.collectionName === "deliveryRecords") next = { ...next, deliveryRecords: [record.originalData, ...next.deliveryRecords] };
      if (record.collectionName === "movements") next = { ...next, movements: [record.originalData, ...next.movements] };
      if (record.collectionName === "depotUsers") next = { ...next, depotUsers: [record.originalData, ...next.depotUsers] };
      return addMovement(next, makeMovement({ action: "Kayıt geri yüklendi", examName: record.title || record.collectionName, detail: record.originalId }));
    });
  };

  const permanentlyDeleteRecord = (record) => {
    if (!guardPermission("riskyActions", "Kalıcı silme için riskli işlem yetkisi gerekli.")) return;
    if (!confirmRisk("Bu kayıt kalıcı olarak silinecek. Geri alınamaz. Emin misin?")) return;
    saveWarehouse((base) => addMovement({ ...base, deletedRecords: base.deletedRecords.filter((item) => item.id !== record.id) }, makeMovement({ action: "Kayıt kalıcı silindi", examName: record.originalData?.name || record.originalData?.examName || record.collectionName, detail: record.originalId })));
  };

  const searchResults = useMemo(() => {
    const q = scanQuery.trim().toLowerCase();
    if (!q) return [];
    const shelves = warehouse.shelves.filter((shelf) => `${shelf.name} ${shelf.qrCode} ${shelf.note}`.toLowerCase().includes(q)).map((item) => ({ type: "Raf", item }));
    const exams = warehouse.legacyExams.filter((exam) => `${exam.name} ${exam.barcode} ${exam.barcodeA || ""} ${exam.barcodeB || ""} ${exam.classLevel} ${exam.shelf}`.toLowerCase().includes(q)).map((item) => ({ type: "Deneme", item }));
    const books = warehouse.stockBooks.filter((book) => `${book.name} ${book.barcode} ${book.classLevel} ${book.shelf}`.toLowerCase().includes(q)).map((item) => ({ type: "Kitap", item }));
    return [...shelves, ...exams, ...books];
  }, [scanQuery, warehouse]);

  const filteredExams = warehouse.legacyExams.filter((exam) => {
    const q = query.toLowerCase();
    return `${exam.name} ${exam.classLevel} ${exam.group} ${exam.barcode} ${exam.barcodeA || ""} ${exam.barcodeB || ""} ${exam.shelf}`.toLowerCase().includes(q);
  });

  const visibleClassExams = warehouse.legacyExams.filter((exam) => {
    const classMatch = exam.group === examGroup && exam.classLevel === selectedClass;
    if (!classMatch) return false;
    return showOnlyAvailableExams ? examIsAvailable(exam) : true;
  });
  const visibleClassBooks = warehouse.stockBooks.filter((book) => book.group === bookGroup && book.classLevel === selectedBookClass && `${book.name} ${book.barcode} ${book.shelf}`.toLowerCase().includes(query.toLowerCase()));

  const renderDashboard = () => {
    const isManager = normalizedCurrentRole === "yonetici";
    const isDistributor = normalizedCurrentRole === "dagitici";
    const mobileMenuItems = [
      { id: "exams", title: "Denemeler", subtitle: "Ortaokul ve lise deneme stoklarını yönetin", icon: <ClipboardCheck size={24} />, tone: "blue", badge: `${warehouse.legacyExams.length} kayıt`, visible: roleCan("viewExams"), action: () => { switchWarehouseView("stock", "exams"); } },
      { id: "books", title: "Kitaplar", subtitle: "Kitap adı, stok adedi ve raf konumlarını yönetin", icon: <BookOpen size={24} />, tone: "purple", badge: `${warehouse.stockBooks.length} kayıt`, visible: roleCan("viewBooks"), action: () => { switchWarehouseView("stock", "books"); } },
      { id: "shelves", title: "Raflar", subtitle: "Raf listesi, QR numarası ve raf içindeki ürünleri görün", icon: <Warehouse size={24} />, tone: "amber", badge: `${warehouse.shelves.filter((s) => s.isActive).length} aktif`, visible: roleCan("viewShelves"), action: () => { switchWarehouseView("shelves", null); } },
      { id: "barcode", title: "Barkodla Bul", subtitle: "Barkod/QR okutarak raf, deneme veya kitap bulun", icon: <QrCode size={24} />, tone: "green", visible: roleCan("barcodeSearch"), action: () => { switchWarehouseView("more", "barcode"); } },
      { id: "critical", title: "Kritik Stok Uyarıları", subtitle: "20 altına düşen stokları görün", icon: <AlertTriangle size={24} />, tone: "red", badge: `${criticalExams.length + criticalBooks.length} uyarı`, visible: roleCan("viewCritical"), action: () => { switchWarehouseView("more", "critical"); } },
      { id: "gift", title: "Hediye Denemeler", subtitle: "7 gün içinde silinecek hediye kayıtlarını yönetin", icon: <Gift size={24} />, tone: "green", visible: roleCan("giftExams"), action: () => { switchWarehouseView("more", "gift"); } },
      { id: "institutions", title: "Kayıtlı Okullar / Dershaneler", subtitle: "Noxelera ana Dershaneler modülünden yönetilir", icon: <Building2 size={24} />, tone: "indigo", badge: `${noxInstitutions.length || warehouse.institutions.length} kurum`, visible: !hideDepotInstitutions && roleCan("manageInstitutions"), action: () => { switchWarehouseView("more", "institutions"); } },
      { id: "orders", title: "Siparişler", subtitle: "Siparişler artık Noxelera ana Siparişler bölümünden yönetilir", icon: <Truck size={24} />, tone: "teal", badge: `${pendingOrders.length + preparedOrders.length} aktif`, visible: !hideDepotOrders && roleCan("viewOrders"), action: () => { setOrderView("pending"); setShowOrderCreator(false); switchWarehouseView("orders", null); } },
      { id: "notifications", title: "Dağıtıcı Bildirimleri", subtitle: "Hazırlanan sipariş bildirimlerini gör", icon: <Bell size={24} />, tone: "green", badge: `${warehouse.notifications.filter((n) => !n.read).length} yeni`, visible: roleCan("deliverOrders") || isDistributor || isManager, action: () => { switchWarehouseView("more", "notifications"); } },
      { id: "movements", title: "Seyir Defteri", subtitle: "Stok, deneme, kullanıcı ve kurum hareketlerini gör", icon: <History size={24} />, tone: "amber", visible: canViewLogs, action: () => { switchWarehouseView("more", "movements"); } },
      { id: "report", title: "Gün Sonu Raporu", subtitle: "Noxelera ana menüsündeki Gün Sonu Raporu bölümüne taşındı", icon: <ClipboardCheck size={24} />, tone: "teal", visible: !hideDailyReport && roleCan("dailyReport"), action: () => { switchWarehouseView("more", "report"); } },
      { id: "stockCount", title: "Stok Sayım Modu", subtitle: "Sayım farklarını kontrol et ve stoğu düzelt", icon: <Settings size={24} />, tone: "blue", visible: canUseStockCount, action: () => { switchWarehouseView("more", "stockCount"); } },
      { id: "trash", title: "Çöp Kutusu", subtitle: "Silinen hareket ve teslim kayıtlarını geri yükle", icon: <Trash2 size={24} />, tone: "red", visible: roleCan("trash"), action: () => { switchWarehouseView("more", "trash"); } },
      { id: "users", title: "Depo Kullanıcıları", subtitle: "Noxelera ana Kullanıcılar bölümüne taşındı", icon: <Users size={24} />, tone: "slate", visible: !hideDepotUsers && canManageUsers, action: () => { switchWarehouseView("more", "users"); } },
      { id: "permissions", title: "Yetki Matrisi", subtitle: "Noxelera ana Kullanıcılar bölümüne taşındı", icon: <ShieldCheck size={24} />, tone: "indigo", visible: !hideDepotUsers && canManageUsers, action: () => { switchWarehouseView("more", "permissions"); } },
    ].filter((item) => item.visible !== false);

    return (
      <div className="grid gap-6">
        <Header
          title="Depo Yönetimi"
          subtitle={`Mobil Depo App ana menüsüyle aynı mantık • ${roleLabel} modu • ${connectedStaffCount || warehouse.depotUsers.length} yetkili`}
          icon={<Warehouse size={26} />}
          actions={
            <div className="flex flex-wrap gap-2">
              <button onClick={() => openModal({ type: "notifications" })} className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100">Bildirimler</button>
              <button onClick={() => { switchWarehouseView("more", "barcode"); }} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Barkodla bul</button>
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardTile title="Toplam Stok" value={totalExamStock + totalBookStock} icon={<Boxes size={24} />} />
          <DashboardTile title="Kritik Uyarı" value={criticalExams.length + criticalBooks.length} icon={<AlertTriangle size={24} />} tone="red" />
          <DashboardTile title="Aktif Sipariş" value={pendingOrders.length + preparedOrders.length} icon={<Truck size={24} />} tone="green" />
          <DashboardTile title="Raf" value={warehouse.shelves.filter((s) => s.isActive).length} icon={<Warehouse size={24} />} tone="amber" />
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <SectionTitle title="Kategoriler" subtitle="Stokları, barkodları ve hareketleri buradan yönetin." />
          <div className="grid gap-3">
            {mobileMenuItems.map((item) => (
              <MobileMenuCard
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                tone={item.tone}
                badge={item.badge}
                onClick={item.action}
              />
            ))}
          </div>
        </div>


        <p className="text-right text-xs font-bold italic text-slate-400">Developed by Han KOP</p>
      </div>
    );
  };

  const renderStock = () => {
    if (subPage === "books") return renderBookHome();
    return renderExamHome();
  };

  const renderExamHome = () => (
    <div className="grid gap-6">
      <Header title="Denemeler" subtitle="Ortaokul ve lise deneme stoklarını buradan yönetin" icon={<ClipboardCheck size={26} />} actions={canEditStock ? <div className="flex flex-wrap gap-2"><button onClick={() => openModal({ type: "addExam" })} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"><Plus size={16} className="mr-1 inline" />Deneme ekle</button></div> : null} />
      <div className="grid gap-4 md:grid-cols-2">
        <QuickAction title="Ortaokul" subtitle="5, 6, 7 ve 8. sınıf denemeleri" icon={<ShieldCheck size={24} />} onClick={() => { setExamGroup("Ortaokul"); setSelectedClass("8. Sınıf"); rememberScrollPosition(); setSubPage("examClasses"); }} />
        <QuickAction title="Lise" subtitle="9, 10, 11, 12, TYT ve AYT denemeleri" icon={<BookOpen size={24} />} tone="purple" onClick={() => { setExamGroup("Lise"); setSelectedClass("TYT"); rememberScrollPosition(); setSubPage("examClasses"); }} />
      </div>
    </div>
  );

  const renderExamClasses = () => (
    <div className="grid gap-6">
      <Header title={`${examGroup} Denemeleri`} subtitle="Sınıf seçerek deneme stoklarını yönetin" icon={<ClipboardCheck size={26} />} actions={null} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{CLASS_GROUPS[examGroup].map((className) => <button key={className} onClick={() => setSelectedClass(className)} className={`rounded-[1.6rem] p-5 text-center text-xl font-black shadow-sm ring-1 transition ${selectedClass === className ? "bg-blue-700 text-white ring-blue-700" : "bg-white text-slate-900 ring-slate-200 hover:bg-blue-50"}`}>{className}</button>)}</div>
      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle title={`${selectedClass} Denemeleri`} subtitle="Kitapçık A/B barkodları ve stok durumları" />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
              <input type="checkbox" checked={showOnlyAvailableExams} onChange={(e) => setShowOnlyAvailableExams(e.target.checked)} />
              Mevcut olanları göster
            </label>
            {canEditStock && <button onClick={() => openModal({ type: "addExam" })} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"><Plus size={16} className="mr-1 inline" />Yeni deneme</button>}
          </div>
        </div>
        <div className="grid gap-3">{visibleClassExams.length === 0 ? <EmptyBox text={showOnlyAvailableExams ? "Bu sınıfta mevcut deneme yok." : "Bu sınıfta kayıtlı deneme yok."} /> : visibleClassExams.map((exam) => <ExamStockCard key={exam.id} exam={exam} shelfLabel={shelfLabel} onOpen={() => openExamDetail(exam)} onGift={() => markGift(exam)} />)}</div>
      </div>
    </div>
  );

  const renderBookHome = () => (
    <div className="grid gap-6">
      <Header title="Kitaplar" subtitle="Kitap stoklarını ortaokul ve lise sınıflarına göre yönetin" icon={<BookOpen size={26} />} actions={canEditStock ? <div className="flex flex-wrap gap-2"><button onClick={() => openModal({ type: "addBook" })} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"><Plus size={16} className="mr-1 inline" />Kitap ekle</button></div> : null} />
      <div className="grid gap-4 md:grid-cols-2">
        <QuickAction title="Ortaokul Kitapları" subtitle="5, 6, 7 ve 8. sınıf kitapları" icon={<ShieldCheck size={24} />} onClick={() => { setBookGroup("Ortaokul"); setSelectedBookClass("8. Sınıf"); rememberScrollPosition(); setSubPage("bookClasses"); }} />
        <QuickAction title="Lise Kitapları" subtitle="9, 10, 11, 12, TYT ve AYT kitapları" icon={<BookOpen size={24} />} tone="purple" onClick={() => { setBookGroup("Lise"); setSelectedBookClass("TYT"); rememberScrollPosition(); setSubPage("bookClasses"); }} />
      </div>
    </div>
  );

  const renderBookClasses = () => (
    <div className="grid gap-6">
      <Header title={`${bookGroup} Kitapları`} subtitle="Sınıf seçerek kitap stoklarını yönetin" icon={<BookOpen size={26} />} actions={null} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{CLASS_GROUPS[bookGroup].map((className) => <button key={className} onClick={() => setSelectedBookClass(className)} className={`rounded-[1.6rem] p-5 text-center text-xl font-black shadow-sm ring-1 transition ${selectedBookClass === className ? "bg-blue-700 text-white ring-blue-700" : "bg-white text-slate-900 ring-slate-200 hover:bg-blue-50"}`}>{className}</button>)}</div>
      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle title={`${selectedBookClass} Kitapları`} subtitle="Kitap stok listesi" />
          {canEditStock && <button onClick={() => openModal({ type: "addBook" })} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"><Plus size={16} className="mr-1 inline" />Yeni kitap</button>}
        </div>
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><Search size={18} className="text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Kitap ara..." className="w-full bg-transparent text-sm font-bold outline-none" /></div>
        <div className="grid gap-3">{visibleClassBooks.length === 0 ? <EmptyBox text="Bu sınıfta kayıtlı kitap yok." /> : visibleClassBooks.map((book) => <BookStockCard key={book.id} book={book} onOpen={() => openBookDetail(book)} />)}</div>
      </div>
    </div>
  );

  const renderShelves = () => (
    <div className="grid gap-6">
      <Header title="Raf Yönetimi" subtitle="Raf adı, raf barkodu ve raf içeriği" icon={<Warehouse size={26} />} actions={canEditStock ? <div className="flex flex-wrap gap-2"><button onClick={() => openModal({ type: "addShelf" })} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white"><Plus size={16} className="mr-1 inline" />Raf ekle</button><button onClick={() => { switchWarehouseView("more", "barcode"); }} className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100"><QrCode size={16} className="mr-1 inline" />Barkod ara</button></div> : null} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{warehouse.shelves.map((shelf) => {
        const products = productsForShelf(shelf);
        return <div key={shelf.id} className="rounded-[1.7rem] bg-white p-5 shadow-sm ring-1 ring-slate-200"><button onClick={() => openShelfDetail(shelf)} className="w-full text-left"><div className="flex items-start gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><Warehouse size={24} /></div><div className="min-w-0 flex-1"><p className="text-xl font-black text-slate-950">{shelf.name}</p><p className="mt-1 text-sm font-bold text-slate-500">{products.exams.length + products.books.length} ürün</p><div className="mt-3 flex flex-wrap gap-2"><Pill>Barkod: {shelf.qrCode}</Pill>{!shelf.isActive && <Pill tone="slate">Pasif</Pill>}{shelf.note && <Pill tone="amber">{shelf.note}</Pill>}</div></div></div></button><div className="mt-4 flex gap-2"><button onClick={() => toggleShelf(shelf)} className="flex-1 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">{shelf.isActive ? "Pasife al" : "Aktif et"}</button><button onClick={() => openShelfDetail(shelf)} className="flex-1 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Detay</button></div></div>;
      })}</div>
    </div>
  );

  const productsForShelf = (shelf) => ({
    exams: warehouse.legacyExams.filter((exam) => String(exam.shelfId) === String(shelf.id) || exam.shelf === shelf.name || exam.shelf === shelf.code),
    books: warehouse.stockBooks.filter((book) => String(book.shelfId) === String(shelf.id) || book.shelf === shelf.name || book.shelf === shelf.code),
  });

  const dailyOrderRecords = [...warehouse.depoOrders, ...warehouse.deliveryRecords]
    .filter((item) => String(item.createdAt || item.deliveredAt || "").includes(todayText()) || String(item.createdAt || item.deliveredAt || "").includes(new Date().getFullYear()))
    .sort((a, b) => String(b.createdAt || b.deliveredAt || "").localeCompare(String(a.createdAt || a.deliveredAt || "")));

  const orderTabs = [
    { id: "pending", label: "Yeni siparişler", count: pendingOrders.length },
    { id: "prepared", label: "Hazır siparişler", count: preparedOrders.length },
    { id: "delivered", label: "Teslim edilen", count: deliveredOrders.length },
    { id: "daily", label: "Günlük kayıt", count: dailyOrderRecords.length },
  ];

  const renderOrderList = (list, emptyText) => (
    <div className="grid gap-3">
      {list.length === 0 ? <EmptyBox text={emptyText} /> : list.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onOpen={() => openOrderDetail(order)}
          onPrepare={() => openOrderDetail(order)}
          onDeliver={() => openOrderDetail(order)}
          onCancel={() => cancelOrder(order)}
        />
      ))}
    </div>
  );

  const renderOrders = () => (
    <div className="relative grid gap-6 pb-28">
      <Header title="Sipariş Yönetimi" subtitle="Mobil uygulama mantığı: yeni siparişler, hazır siparişler, teslim edilenler ve günlük kayıt" icon={<ClipboardCheck size={26} />} actions={null} />

      <div className="grid gap-3 rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-slate-200 md:grid-cols-4">
        {orderTabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setOrderView(item.id)}
            className={`rounded-[1.4rem] px-4 py-4 text-left text-sm font-black transition ${orderView === item.id ? "bg-blue-700 text-white shadow-lg shadow-blue-700/20" : "bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700"}`}
          >
            <span>{item.label}</span>
            {item.count !== null && <span className={`ml-2 rounded-full px-2 py-1 text-xs ${orderView === item.id ? "bg-white/20 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}>{item.count}</span>}
          </button>
        ))}
      </div>

      {orderView === "pending" && renderOrderList(pendingOrders, "Yeni sipariş yok.")}
      {orderView === "prepared" && renderOrderList(preparedOrders, "Hazır sipariş yok.")}
      {orderView === "delivered" && renderOrderList(deliveredOrders, "Teslim edilen sipariş yok.")}
      {orderView === "daily" && (
        <div className="grid gap-3">
          {dailyOrderRecords.length === 0 ? <EmptyBox text="Bugün için sipariş/teslim kaydı yok." /> : dailyOrderRecords.map((item) => {
            const isDelivery = Boolean(item.deliveredAt && !item.status);
            const status = item.status || "delivered";
            return (
              <div key={`${item.id}-${isDelivery ? "delivery" : "order"}`} className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Pill tone={status === "pending" ? "amber" : status === "prepared" ? "green" : status === "delivered" ? "green" : "slate"}>{isDelivery ? "Teslim kaydı" : (STATUS_LABELS[status] || status)}</Pill>
                    <p className="mt-3 font-black text-slate-950">{item.examName}</p>
                    <p className="mt-1 text-sm font-bold text-slate-500">{item.destination} • {item.quantity} adet</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">{item.createdAt || item.deliveredAt}</p>
                  </div>
                  {!isDelivery && <button onClick={() => openOrderDetail(item)} className="rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Detay</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => openModal({ type: "createOrder" })}
        className="fixed bottom-6 right-6 z-40 flex flex-col items-center justify-center rounded-3xl bg-blue-700 px-5 py-4 text-white shadow-2xl shadow-blue-700/35 transition hover:-translate-y-1 hover:bg-blue-800"
        title="Yeni sipariş ekle"
      >
        <Plus size={28} />
        <span className="mt-1 text-xs font-black leading-none">Sipariş ver</span>
      </button>
    </div>
  );

  const renderMore = () => {
    const items = [
      ["delivery", "Teslim Kayıtları", "90 günlük teslim geçmişi", <CheckCircle2 size={24} />, "green"],
      ["notifications", "Dağıtıcı Bildirimleri", "Hazırlanan sipariş uyarıları", <Bell size={24} />, "green"],
      ["barcode", "Barkod / QR Arama", "Raf barkodu veya ürün bul", <QrCode size={24} />, "blue"],
      ["critical", "Kritik Stok", "Eşik altı ürünler", <AlertTriangle size={24} />, "amber"],
      ["gift", "Hediye Kategorisi", "Hediye ayrılan ürünler", <Gift size={24} />, "purple"],
      ["institutions", "Kurumlar", "Kurum listesi", <Building2 size={24} />, "blue"],
      ...(!hideDepotUsers ? [["users", "Kullanıcılar", "Personel ve dağıtıcılar", <Users size={24} />, "slate"]] : []),
      ["movements", "Seyir Defteri", "Stok hareketleri ve loglar", <History size={24} />, "amber"],
      ["trash", "Çöp Kutusu", "Silinen kayıtlar", <Trash2 size={24} />, "red"],
      ...(!hideDailyReport ? [["report", "Gün Sonu Raporu", "Teslim ve stok özeti", <ClipboardCheck size={24} />, "green"]] : []),
      ["stockCount", "Stok Sayımı", "Deneme bazlı fiziksel sayım", <Settings size={24} />, "blue"],
      ["tv", "TV Sipariş Ekranı", "Projeksiyon görünümü", <Monitor size={24} />, "slate"],
    ];
    if (!subPage || subPage === "moreHome") {
      return <div className="grid gap-6"><Header title="Depo Menü" subtitle="Depo App içindeki tüm bölümler" icon={<Package size={26} />} actions={null} /><div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="grid gap-3">{items.map(([id, title, subtitle, icon, tone]) => <MobileMenuCard key={id} title={title} subtitle={subtitle} icon={icon} tone={tone} onClick={() => switchWarehouseView("more", id)} />)}</div></div></div>;
    }
    return renderMoreSubPage();
  };

  const renderMoreSubPage = () => {
    const back = null;
    if (subPage === "barcode") return <div className="grid gap-6"><Header title="Barkod / QR Arama" subtitle="Raf QR, ürün barkodu veya ürün adına göre arama" icon={<QrCode size={26} />} actions={back} /><div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><Search size={18} className="text-slate-400" /><input value={scanQuery} onChange={(e) => setScanQuery(e.target.value)} placeholder="QR, barkod, ürün veya raf ara..." className="w-full bg-transparent text-sm font-bold outline-none" /></div><div className="mt-5 grid gap-3">{scanQuery.trim() === "" ? <EmptyBox text="Arama yapmak için barkod, QR veya ürün adı girin." /> : searchResults.length === 0 ? <EmptyBox text="Kayıt bulunamadı." /> : searchResults.map((result, index) => <button key={`${result.type}-${index}`} onClick={() => { if (result.type === "Raf") openShelfDetail(result.item); if (result.type === "Deneme") openExamDetail(result.item); if (result.type === "Kitap") openBookDetail(result.item); }} className="rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-100 hover:bg-blue-50"><Pill>{result.type}</Pill><p className="mt-2 font-black text-slate-950">{result.item.name || result.item.code}</p><p className="text-sm font-bold text-slate-500">{result.item.barcode || result.item.qrCode || result.item.shelf}</p></button>)}</div></div></div>;
    if (subPage === "critical") return <SimplePage title="Kritik Stok" subtitle="Eşik altı deneme ve kitaplar" icon={<AlertTriangle size={26} />} back={null}>{[...criticalExams.map((e) => <ExamStockCard key={e.id} exam={e} shelfLabel={shelfLabel} onOpen={() => openExamDetail(e)} />), ...criticalBooks.map((b) => <BookStockCard key={b.id} book={b} onOpen={() => openBookDetail(b)} />)].length === 0 ? <EmptyBox text="Kritik stok yok." /> : [...criticalExams.map((e) => <ExamStockCard key={e.id} exam={e} shelfLabel={shelfLabel} onOpen={() => openExamDetail(e)} />), ...criticalBooks.map((b) => <BookStockCard key={b.id} book={b} onOpen={() => openBookDetail(b)} />)]}</SimplePage>;
    if (subPage === "gift") return <SimplePage title="Hediye Kategorisi" subtitle="Hediye ayrılan ürünler burada sadece adet olarak takip edilir. Deneme normal listede pasif kalır; hediye kaydı 7 gün sonra silinir." icon={<Gift size={26} />} back={null}>{warehouse.legacyExams.filter(isGift).length === 0 ? <EmptyBox text="Hediye kategorisinde deneme yok." /> : warehouse.legacyExams.filter(isGift).map((exam) => <div key={exam.id} className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200"><div className="flex flex-wrap gap-2"><Pill tone="purple">{giftDaysLeft(exam)} gün kaldı</Pill><Pill tone="green">{Number(exam.giftQuantity || 0)} adet</Pill></div><p className="mt-3 font-black text-slate-950">{exam.name}</p><p className="text-sm font-bold text-slate-500">{exam.classLevel} • stok sıfırlandı</p></div>)}</SimplePage>;
    if (subPage === "delivery") {
      const records = warehouse.deliveryRecords.filter((record) => `${record.examName} ${record.destination} ${record.deliveredBy} ${record.preparedBy}`.toLowerCase().includes(deliverySearch.toLowerCase()));
      return <SimplePage title="Teslim Kayıtları" subtitle="Teslim edilen sipariş geçmişi" icon={<CheckCircle2 size={26} />} back={null}><div className="rounded-[2rem] bg-white p-5 ring-1 ring-slate-200"><div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><Search size={18} className="text-slate-400" /><input value={deliverySearch} onChange={(e) => setDeliverySearch(e.target.value)} placeholder="Kurum, deneme veya personel ara..." className="w-full bg-transparent text-sm font-bold outline-none" /></div><div className="grid gap-3">{records.length === 0 ? <EmptyBox text="Teslim kaydı yok." /> : records.map((record) => <div key={record.id} className="rounded-[1.6rem] bg-slate-50 p-4 ring-1 ring-slate-100"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-black text-slate-950">{record.examName}</p><p className="mt-1 text-sm font-bold text-slate-500">{record.destination} • {record.quantity} adet • {record.deliveredAt}</p><p className="mt-2 text-xs font-bold text-slate-400">Hazırlayan: {record.preparedBy} • Teslim eden: {record.deliveredBy}</p></div><button onClick={() => deleteDeliveryRecord(record)} className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100">Çöpe taşı</button></div></div>)}</div></div></SimplePage>;
    }
    if (subPage === "notifications") return <SimplePage title="Dağıtıcı Bildirimleri" subtitle="Hazırlanan siparişler dağıtıcı ekranına düşer" icon={<Bell size={26} />} back={null}>{warehouse.notifications.length === 0 ? <EmptyBox text="Yeni bildirim yok." /> : warehouse.notifications.map((n) => <div key={n.id} className={`rounded-[1.6rem] p-4 ring-1 ${n.read ? "bg-white ring-slate-200" : "bg-emerald-50 ring-emerald-100"}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><Pill tone={n.read ? "slate" : "green"}>{n.read ? "Okundu" : "Yeni"}</Pill><p className="mt-3 font-black text-slate-950">{n.title}</p><p className="mt-1 text-sm font-bold text-slate-500">{n.body}</p><p className="mt-2 text-xs font-bold text-slate-400">{n.createdAt}</p></div>{!n.read && <button onClick={() => markNotificationRead(n.id)} className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">Okundu yap</button>}</div></div>)}</SimplePage>;
    if (subPage === "institutions" && hideDepotInstitutions) return <SimplePage title="Kurumlar" subtitle="Bu alan Noxelera ana Dershaneler modülüne taşındı" icon={<Building2 size={26} />} back={null}><EmptyBox text="Kurumlar artık ana Dershaneler bölümünden yönetilir." /></SimplePage>;
    if (subPage === "institutions") return <SimplePage title="Kurumlar" subtitle="Siparişlerde seçilecek okul / dershane listesi" icon={<Building2 size={26} />} back={<div className="flex flex-wrap gap-2"><button onClick={() => openModal({ type: "addInstitution" })} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Kurum ekle</button></div>}>{warehouse.institutions.map((item) => <div key={item.id} className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-slate-950">{item.name}</p><p className="mt-1 text-sm font-bold text-slate-500">{item.type} • {item.isActive ? "Aktif" : "Pasif"}</p></div><button onClick={() => toggleInstitution(item)} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">{item.isActive ? "Pasife al" : "Aktif et"}</button></div></div>)}</SimplePage>;
    if (subPage === "users" && hideDepotUsers) return <SimplePage title="Kullanıcılar" subtitle="Bu alan Noxelera ana Kullanıcılar modülüne taşındı" icon={<Users size={26} />} back={null}><EmptyBox text="Depo kullanıcıları artık ana Kullanıcılar bölümünden yönetilir." /></SimplePage>;
    if (subPage === "users") return <SimplePage title="Kullanıcılar" subtitle="Personel ve dağıtıcılar" icon={<Users size={26} />} back={<div className="flex flex-wrap gap-2"><button onClick={() => openModal({ type: "addDepotUser" })} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Kullanıcı ekle</button></div>}>
      <div className="grid gap-4 lg:grid-cols-3">
        {Object.entries(ROLE_PERMISSION_MATRIX).map(([role, config]) => <RolePermissionCard key={role} role={role} config={config} />)}
      </div>
      <div className="grid gap-3">
        {warehouse.depotUsers.map((item) => {
          const normalizedItemRole = normalizeRoleValue(item.role); const permissionInfo = { ...getRolePermissions(item.role), permissions: PERMISSION_SWITCHES.filter((permission) => effectivePermissionsForUser(item, rolePermissionSettings)?.[permission.key]).map((permission) => permission.label) }; const personalCount = personalPermissionCount(item);
          return <div key={item.id} className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-slate-950">{item.name}</p><p className="mt-1 text-sm font-bold text-slate-500">{item.title || permissionInfo.label} • {item.phone || "Telefon yok"} • {item.email || "E-posta yok"}</p><p className="mt-1 text-xs font-black text-slate-400">Rol değeri: {normalizedItemRole} • {item.isActive ? "Aktif" : "Pasif"} • {permissionInfo.permissions.length} etkin yetki • {personalCount ? `${personalCount} kişisel ayar` : "rol yetkisi"}</p><div className="mt-2 flex flex-wrap gap-1">{permissionInfo.permissions.slice(0, 3).map((permission) => <span key={permission} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">{permission}</span>)}</div></div><div className="flex flex-wrap gap-2">{normalizedItemRole !== "yonetici" && <button onClick={() => openUserPermissions(item)} className="rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 ring-1 ring-indigo-100">Yetkiler</button>}<button onClick={() => openEditDepotUser(item)} className="rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Düzenle</button>{normalizedItemRole !== "yonetici" ? <><button onClick={() => toggleDepotUser(item)} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">{item.isActive ? "Pasife al" : "Aktif et"}</button><button onClick={() => { if (confirmRisk(`${item.name} kullanıcısı silinecek. Emin misin?`)) deleteDepotUser(item); }} className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100">Sil</button></> : <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">Sabit ana admin</span>}</div></div></div>;
        })}
      </div>
    </SimplePage>;
    if (subPage === "permissions" && hideDepotUsers) return <SimplePage title="Yetki Yönetimi" subtitle="Bu alan Noxelera ana Kullanıcılar modülüne taşındı" icon={<ShieldCheck size={26} />} back={null}><EmptyBox text="Yetki matrisi artık ana Kullanıcılar bölümünde yönetilir." /></SimplePage>;
    if (subPage === "permissions") return <SimplePage title="Yetki Yönetimi" subtitle="Ana admin sabittir; yardımcı admin, personel ve dağıtıcı için rol bazlı ve kişisel yetkileri buradan açıp kapatabilirsin." icon={<ShieldCheck size={26} />} back={null}>
      <div className="grid gap-4 lg:grid-cols-3">
        {Object.entries(ROLE_PERMISSION_MATRIX).map(([role, config]) => <RolePermissionCard key={role} role={role} config={{ ...config, permissions: PERMISSION_SWITCHES.filter((item) => rolePermissionSettings[role]?.[item.key]).map((item) => item.label) }} />)}
      </div>
      <div className="grid gap-4">
        {Object.entries(ROLE_PERMISSION_MATRIX).filter(([role]) => role !== "yonetici").map(([role, config]) => (
          <div key={role} className="rounded-[1.7rem] bg-white p-5 ring-1 ring-slate-200">
            <SectionTitle title={`${config.label} yetkileri`} subtitle={config.description} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {PERMISSION_SWITCHES.map((permission) => {
                const enabled = !!rolePermissionSettings[role]?.[permission.key];
                return (
                  <button
                    key={`${role}-${permission.key}`}
                    onClick={() => setRolePermission(role, permission.key, !enabled)}
                    className={`rounded-2xl p-4 text-left ring-1 transition ${enabled ? "bg-emerald-50 ring-emerald-100" : "bg-slate-50 ring-slate-200"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm font-black ${enabled ? "text-emerald-800" : "text-slate-500"}`}>{permission.label}</p>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black ${enabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>{enabled ? "Açık" : "Kapalı"}</span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-500">{permission.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-[1.7rem] bg-white p-5 ring-1 ring-slate-200">
        <SectionTitle title="Kişisel Yetkiler" subtitle="Her kullanıcı için genel rol ayarının üstüne özel yetki ver. Butona her tıklamada Rol → Açık → Kapalı şeklinde değişir." />
        <div className="grid gap-4">
          {warehouse.depotUsers.filter((user) => normalizeRoleValue(user.role) !== "yonetici").map((user) => {
            const personal = normalizeUserPermissions(user.permissions || {});
            const effective = effectivePermissionsForUser(user, rolePermissionSettings);
            const roleName = ROLE_PERMISSION_MATRIX[normalizeRoleValue(user.role)]?.label || user.role;
            return <div key={user.id} className="rounded-[1.6rem] bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-slate-950">{user.name}</p>
                  <p className="text-xs font-black text-slate-500">{roleName} • {personalPermissionCount(user)} kişisel ayar • {user.isActive ? "Aktif" : "Pasif"}</p>
                </div>
                <button onClick={() => openUserPermissions(user)} className="rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-black text-white">Detaylı düzenle</button>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {PERMISSION_SWITCHES.map((permission) => {
                  const draft = personal[permission.key];
                  const ok = !!effective[permission.key];
                  const label = draft === null ? "Rol" : draft ? "Açık" : "Kapalı";
                  return <button key={`${user.id}-${permission.key}`} onClick={() => cyclePersonalPermission(user, permission.key)} className={`rounded-2xl p-3 text-left text-xs font-black ring-1 transition ${ok ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-white text-slate-500 ring-slate-200"}`}>
                    <span className="block">{permission.label}</span>
                    <span className="mt-1 block text-[10px] opacity-70">{label} • tıkla değiştir</span>
                  </button>;
                })}
              </div>
            </div>;
          })}
        </div>
      </div>
      <div className="rounded-[1.7rem] bg-white p-5 ring-1 ring-slate-200">
        <SectionTitle title="Aktif rolün" subtitle="Şu an giriş yapan rol için açık özellikler." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PERMISSION_SWITCHES.slice(0, 8).map((permission) => {
            const ok = roleCan(permission.key);
            return <div key={permission.key} className={`rounded-2xl p-4 text-sm font-black ring-1 ${ok ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-50 text-slate-400 ring-slate-200"}`}>{permission.label}: {ok ? "Açık" : "Kapalı"}</div>;
          })}
        </div>
      </div>
    </SimplePage>;

    if (subPage === "movements") {
      const actions = ["Tümü", ...new Set(warehouse.movements.map((m) => m.action).filter(Boolean))];
      const users = ["Tümü", ...new Set(warehouse.movements.map((m) => m.userName).filter(Boolean))];
      const logs = warehouse.movements.filter((m) => {
        const text = `${m.userName} ${m.action} ${m.examName} ${m.detail}`.toLowerCase();
        return text.includes(movementFilters.search.toLowerCase()) && (movementFilters.action === "Tümü" || m.action === movementFilters.action) && (movementFilters.user === "Tümü" || m.userName === movementFilters.user);
      });
      const stockCountLogs = logs.filter((m) => String(m.action || "").includes("Stok sayımı")).length;
      const riskyLogs = logs.filter((m) => m.risk).length;
      return <SimplePage title="Seyir Defteri" subtitle="Stok hareketleri, kullanıcı ve sipariş logları" icon={<History size={26} />} back={null}>
        <div className="grid gap-3 md:grid-cols-3">
          <DashboardTile title="Filtrelenen kayıt" value={logs.length} icon={<History size={18} />} tone="amber" />
          <DashboardTile title="Sayım kaydı" value={stockCountLogs} icon={<ClipboardCheck size={18} />} tone="blue" />
          <DashboardTile title="Riskli işlem" value={riskyLogs} icon={<AlertTriangle size={18} />} tone="red" />
        </div>
        <div className="rounded-[2rem] bg-white p-5 ring-1 ring-slate-200"><div className="mb-4 grid gap-3 lg:grid-cols-3"><TextInput label="Ara" value={movementFilters.search} onChange={(v) => setMovementFilters((f) => ({ ...f, search: v }))} placeholder="Ürün, kullanıcı, işlem..." /><SelectInput label="İşlem" value={movementFilters.action} onChange={(v) => setMovementFilters((f) => ({ ...f, action: v }))} options={actions} /><SelectInput label="Kullanıcı" value={movementFilters.user} onChange={(v) => setMovementFilters((f) => ({ ...f, user: v }))} options={users} /></div><div className="grid gap-2">{logs.length === 0 ? <EmptyBox text="Hareket kaydı yok." /> : logs.map((m) => <MovementCard key={m.id} movement={m} onDelete={() => deleteMovementRecord(m)} />)}</div></div>
      </SimplePage>;
    }
    if (subPage === "trash") return <SimplePage title="Çöp Kutusu" subtitle="Silinen kayıtlar" icon={<Trash2 size={26} />} back={null}>{warehouse.deletedRecords.length === 0 ? <EmptyBox text="Silinen kayıt bulunmuyor." /> : warehouse.deletedRecords.map((r) => <div key={r.id} className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200"><p className="font-black text-slate-950">{r.collectionName}</p><p className="mt-1 text-sm font-bold text-slate-500">{r.originalData?.name || r.originalData?.examName || r.originalId}</p><p className="mt-1 text-xs font-bold text-slate-400">Silen: {r.deletedBy || "-"} • {r.deletedAt}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => restoreDeleted(r)} className="rounded-2xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Geri yükle</button><button onClick={() => permanentlyDeleteRecord(r)} className="rounded-2xl bg-red-50 px-4 py-2 text-xs font-black text-red-700 ring-1 ring-red-100">Kalıcı sil</button></div></div>)}</SimplePage>;
    if (subPage === "report" && hideDailyReport) return <SimplePage title="Gün Sonu Raporu" subtitle="Bu alan Noxelera ana menüsüne taşındı" icon={<ClipboardCheck size={26} />} back={null}><EmptyBox text="Gün sonu raporu artık Noxelera ana menüsünde ayrı bölüm olarak yer alır." /></SimplePage>;
    if (subPage === "report") return <SimplePage title="Gün Sonu Raporu" subtitle="Teslim, stok ve işlem özeti" icon={<ClipboardCheck size={26} />} back={null}><div className="grid gap-4 md:grid-cols-2"><DashboardTile title="Teslim" value={deliveredOrders.length + warehouse.deliveryRecords.length} icon={<CheckCircle2 size={24} />} tone="green" /><DashboardTile title="Adet" value={warehouse.deliveryRecords.reduce((s, r) => s + Number(r.quantity || 0), 0)} icon={<Package size={24} />} /><DashboardTile title="Stok" value={totalExamStock + totalBookStock} icon={<Warehouse size={24} />} tone="purple" /><DashboardTile title="Hareket" value={warehouse.movements.length} icon={<History size={24} />} tone="amber" /></div></SimplePage>;
    if (subPage === "stockCount") {
      const stockQuery = stockCountSearch.trim().toLowerCase();
      const countableExams = warehouse.legacyExams.filter((exam) => `${exam.name} ${exam.classLevel} ${exam.group} ${exam.shelf}`.toLowerCase().includes(stockQuery));
      const latestCountLogs = warehouse.movements.filter((m) => String(m.action || "").includes("Stok sayımı")).slice(0, 5);
      return <SimplePage title="Stok Sayımı" subtitle="Mobildeki gibi deneme seç, fiziksel sayımı gir, farkı gör ve stoğu düzelt" icon={<Settings size={26} />} back={null}>
        <div className="grid gap-3 md:grid-cols-3">
          <DashboardTile title="Sayılacak deneme" value={countableExams.length} icon={<ClipboardCheck size={18} />} tone="blue" />
          <DashboardTile title="Toplam deneme stoğu" value={totalExamStock} icon={<Boxes size={18} />} tone="green" />
          <DashboardTile title="Kritik deneme" value={criticalExams.length} icon={<AlertTriangle size={18} />} tone="red" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-4">
            <div className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200"><SectionTitle title="Sınıf özetleri" subtitle="Deneme ve kitap toplamları" />{Object.entries(CLASS_GROUPS).map(([group, classes]) => <div key={group} className="mb-4"><p className="mb-2 font-black text-blue-700">{group}</p><div className="grid gap-2">{classes.map((className) => { const examTotal = warehouse.legacyExams.filter((e) => e.classLevel === className).reduce((sum, e) => sum + variantTotal(e), 0); const bookTotal = warehouse.stockBooks.filter((b) => b.classLevel === className).reduce((sum, b) => sum + Number(b.stock || 0), 0); return <div key={className} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span className="font-black text-slate-700">{className}</span><span className="font-black text-slate-950">D: {examTotal} / K: {bookTotal}</span></div>; })}</div></div>)}</div>
            <div className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200"><SectionTitle title="Son sayım kayıtları" subtitle="Seyir defterinden gelen son stok sayımları" />{latestCountLogs.length === 0 ? <EmptyBox text="Henüz sayım kaydı yok." /> : <div className="grid gap-2">{latestCountLogs.map((log) => <MovementCard key={log.id} movement={log} />)}</div>}</div>
          </div>
          <div className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200"><SectionTitle title="Deneme bazlı sayım" subtitle="Mobil SingleExamStockCountPage karşılığı" /><div className="mb-4"><TextInput label="Deneme ara" value={stockCountSearch} onChange={setStockCountSearch} placeholder="Deneme adı, sınıf, raf..." /></div><div className="grid gap-3">{countableExams.length === 0 ? <EmptyBox text="Sayılacak deneme yok." /> : countableExams.map((exam) => <button key={exam.id} onClick={() => { setStockCountDraft({ ...ensureExamVariants(exam) }); openModal({ type: "stockCount", examId: exam.id }); }} className="rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-100 hover:bg-blue-50"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-slate-950">{exam.name}</p><p className="text-sm font-bold text-slate-500">{exam.classLevel} • Raf: {shelfLabel(exam.shelfId)} • Hazırlanabilir: {orderAvailableTotal(exam)} • Toplam: {variantTotal(exam)}</p></div><Pill>Sayım yap</Pill></div></button>)}</div></div>
        </div>
      </SimplePage>;
    }
    if (subPage === "tv") return <TvOrderDisplay orders={warehouse.depoOrders} onBack={() => switchWarehouseView("more", "moreHome")} />;
    return null;
  };

  function SimplePage({ title, subtitle, icon, back, children }) {
    return <div className="grid gap-6"><Header title={title} subtitle={subtitle} icon={icon} actions={back} /><div className="grid gap-3">{children}</div></div>;
  }

  const activeContent = () => {
    if (tab === "panel") return renderDashboard();
    if (tab === "stock") {
      if (subPage === "examClasses" && !roleCan("viewExams")) return <PermissionDenied />;
      if (subPage === "books" && !roleCan("viewBooks")) return <PermissionDenied />;
      if (subPage === "bookClasses" && !roleCan("viewBooks")) return <PermissionDenied />;
      if (subPage === "examClasses") return renderExamClasses();
      if (subPage === "books") return renderBookHome();
      if (subPage === "bookClasses") return renderBookClasses();
      return renderStock();
    }
    if (tab === "shelves") return roleCan("viewShelves") ? renderShelves() : <PermissionDenied />;
    if (tab === "orders") return hideDepotOrders ? <SimplePage title="Siparişler" subtitle="Bu alan Noxelera ana Siparişler modülüne taşındı" icon={<Truck size={26} />} back={null}><EmptyBox text="Siparişler artık ana Siparişler bölümünden yönetilir." /></SimplePage> : roleCan("viewOrders") ? renderOrders() : <PermissionDenied />;
    if (tab === "more") {
      const permissionMap = { barcode: "barcodeSearch", critical: "viewCritical", gift: "giftExams", institutions: "manageInstitutions", notifications: "deliverOrders", movements: "viewLogs", report: "dailyReport", stockCount: "stockCount", trash: "trash", users: "manageUsers", permissions: "manageUsers" };
      const needed = permissionMap[subPage];
      if (needed && !roleCan(needed)) return <PermissionDenied />;
      return renderMore();
    }
    return renderDashboard();
  };

  return (
    <div className="grid gap-6">
      {(tab !== "panel" || subPage) && (
        <div className="flex justify-start">
          <BackButton />
        </div>
      )}
      {activeContent()}

      {selectedExam && <ExamDetailModal exam={selectedExam} shelves={warehouse.shelves} shelfLabel={shelfLabel} onClose={closeOverlay} onVariantChange={changeVariant} onBulkAdd={bulkAddExamSets} onMoveShelf={moveExamShelf} onToggle={toggleExam} onGift={markGift} onDelete={deleteExam} onResetStock={resetExamStock} onEdit={openEditExam} movements={warehouse.movements.filter((m) => m.examName === selectedExam.name)} />}
      {selectedBook && <BookDetailModal book={selectedBook} shelves={warehouse.shelves} onClose={closeOverlay} onStockChange={changeBookStock} onMoveShelf={moveBookShelf} onToggle={toggleBook} onDelete={deleteBook} onEdit={openEditBook} />}
      {selectedShelf && <ShelfDetailModal shelf={selectedShelf} products={productsForShelf(selectedShelf)} onClose={closeOverlay} onExamOpen={openExamDetail} onBookOpen={openBookDetail} onEdit={openEditShelf} onToggle={toggleShelf} />}
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={closeOverlay} onPrepare={prepareOrder} onDeliver={deliverOrder} onCancel={cancelOrder} onEdit={openEditOrder} exam={warehouse.legacyExams.find((e) => e.id === selectedOrder.examId)} />}
      {modal?.type === "addShelf" && <Modal title="Yeni Raf Ekle" subtitle="Sadece raf adı ve raf barkodu yeterlidir" onClose={closeOverlay}><div className="grid gap-4"><TextInput label="Raf adı" value={shelfForm.name} onChange={(v) => setShelfForm((s) => ({ ...s, name: v }))} placeholder="Örn: TYT Deneme Rafı" /><TextInput label="Raf barkodu" value={shelfForm.qrCode} onChange={(v) => setShelfForm((s) => ({ ...s, qrCode: v }))} placeholder="Örn: RAF-TYT-01" /><TextInput label="Not" value={shelfForm.note} onChange={(v) => setShelfForm((s) => ({ ...s, note: v }))} /><button onClick={addShelf} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Kaydet</button></div></Modal>}
      {modal?.type === "addExam" && <Modal title="Yeni Deneme Ekle" subtitle="Ortaokulda A/B sayısal-sözel, lisede kitapçık A/B stokları girilir" onClose={closeOverlay}><AddExamForm form={productForm} setForm={setProductForm} shelves={warehouse.shelves} onSave={addExam} /></Modal>}
      {modal?.type === "addBook" && <Modal title="Yeni Kitap Ekle" subtitle="Kitap adı, sınıf, raf ve stok bilgisi" onClose={closeOverlay}><AddBookForm form={bookForm} setForm={setBookForm} shelves={warehouse.shelves} onSave={addBook} /></Modal>}
      {modal?.type === "editExam" && examEditForm && <Modal title="Deneme Bilgisini Düzenle" subtitle="Ad, sınıf, barkod, raf ve aktiflik bilgisini mobil mantıkla güncelle" onClose={closeOverlay}><EditExamForm form={examEditForm} setForm={setExamEditForm} shelves={warehouse.shelves} onSave={saveEditedExam} /></Modal>}
      {modal?.type === "editBook" && bookEditForm && <Modal title="Kitap Bilgisini Düzenle" subtitle="Ad, sınıf, barkod, raf, stok ve aktiflik bilgisini güncelle" onClose={closeOverlay}><EditBookForm form={bookEditForm} setForm={setBookEditForm} shelves={warehouse.shelves} onSave={saveEditedBook} /></Modal>}
      {modal?.type === "editShelf" && shelfEditForm && <Modal title="Raf Bilgisini Düzenle" subtitle="Raf adı, raf barkodu, not ve aktif/pasif durumunu güncelle" onClose={closeOverlay}><EditShelfForm form={shelfEditForm} setForm={setShelfEditForm} onSave={saveEditedShelf} /></Modal>}
      {modal?.type === "createOrder" && <Modal title="Sipariş Oluştur" subtitle="Okul türü, sınıf, deneme, adet ve açıklama girin" onClose={closeOverlay}><CreateOrderForm form={orderForm} setForm={setOrderForm} exams={warehouse.legacyExams} institutions={noxInstitutions.length ? noxInstitutions.map((item) => ({ id: item.id, name: item.name, type: "Dershane", isActive: item.status !== "Pasif" })) : warehouse.institutions} onSave={createOrder} /></Modal>}
      {modal?.type === "info" && <Modal title={modal.title} subtitle="İşlem tamamlanamadı" onClose={closeOverlay}><div className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800 ring-1 ring-amber-100">{modal.text}</div></Modal>}
      {modal?.type === "editOrder" && <Modal title="Sipariş Düzenle" subtitle="Sadece aktif siparişlerde deneme, adet, kurum ve not değiştir" onClose={closeOverlay}><CreateOrderForm form={editOrderForm} setForm={setEditOrderForm} exams={warehouse.legacyExams} institutions={noxInstitutions.length ? noxInstitutions.map((item) => ({ id: item.id, name: item.name, type: "Dershane", isActive: item.status !== "Pasif" })) : warehouse.institutions} onSave={saveEditedOrder} saveLabel="Değişiklikleri kaydet" /></Modal>}
      {modal?.type === "stockCount" && (() => { const exam = warehouse.legacyExams.find((e) => e.id === modal.examId); const variants = exam ? ensureExamVariants(exam) : {}; const changes = Object.entries(variants).filter(([key, value]) => Number(stockCountDraft[key] ?? value) !== Number(value)); return exam ? <Modal title={`Sayım: ${exam.name}`} subtitle="Fiziksel sayım adetlerini gir. Farklar Seyir Defteri'ne yazılır." onClose={closeOverlay}><div className="grid gap-4"><div className="rounded-2xl bg-blue-50 p-4 text-sm font-black text-blue-700 ring-1 ring-blue-100">Hazırlanabilir: {orderAvailableTotal(exam)} • Toplam stok: {variantTotal(exam)} • Değişen alan: {changes.length}</div>{Object.entries(variants).map(([key, value]) => { const draftValue = stockCountDraft[key] ?? value; const diff = Number(draftValue || 0) - Number(value || 0); return <div key={key} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100"><TextInput label={`${key} / Sistemde: ${value}`} type="number" value={draftValue} onChange={(v) => setStockCountDraft((d) => ({ ...d, [key]: v }))} />{diff !== 0 && <p className={`mt-2 text-xs font-black ${diff > 0 ? "text-emerald-700" : "text-red-700"}`}>Fark: {diff > 0 ? "+" : ""}{diff}</p>}</div>; })}<button onClick={() => { if (confirmRisk("Sayım farkları stoklara işlenecek. Emin misin?")) saveStockCount(exam); }} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Sayımı kaydet</button></div></Modal> : null; })()}
      {modal?.type === "addInstitution" && <Modal title="Kurum Ekle" subtitle="Siparişlerde seçilecek okul / dershane kaydı" onClose={closeOverlay}><div className="grid gap-4"><TextInput label="Kurum adı" value={institutionForm.name} onChange={(v) => setInstitutionForm((f) => ({ ...f, name: v }))} /><SelectInput label="Tür" value={institutionForm.type} onChange={(v) => setInstitutionForm((f) => ({ ...f, type: v }))} options={["Dershane", "Kurs", "Okul", "Kurum"]} /><button onClick={addInstitution} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Kaydet</button></div></Modal>}
      {modal?.type === "addDepotUser" && <Modal title="Depo Kullanıcısı Ekle" subtitle="Personel veya dağıtıcı hesabı" onClose={closeOverlay}><UserForm form={userForm} setForm={setUserForm} onSave={addDepotUser} /></Modal>}
      {modal?.type === "editDepotUser" && userEditForm && <Modal title="Depo Kullanıcısını Düzenle" subtitle="Rol, iletişim, aktiflik ve şifre bilgisini güncelle" onClose={closeOverlay}><UserForm form={userEditForm} setForm={setUserEditForm} onSave={saveEditedDepotUser} saveLabel="Değişiklikleri kaydet" /></Modal>}
      {modal?.type === "userPermissions" && userPermissionForm && <Modal title="Kişisel Yetkiler" subtitle={`${userPermissionForm.name} • ${ROLE_PERMISSION_MATRIX[normalizeRoleValue(userPermissionForm.role)]?.label || userPermissionForm.role}`} onClose={() => { setUserPermissionForm(null); setModal(null); }} wide>
        <div className="grid gap-4">
          <div className="rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-800 ring-1 ring-indigo-100">
            Gri ayarlar rol yetkisinden gelir. Açık/Kapalı seçersen bu kullanıcı için kişisel override olur. “Rolü kullan” seçeneği kişisel ayarı kaldırır.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {PERMISSION_SWITCHES.map((permission) => {
              const draft = normalizeUserPermissions(userPermissionForm.permissions || {})[permission.key];
              const roleValue = !!rolePermissionSettings[normalizeRoleValue(userPermissionForm.role)]?.[permission.key];
              const effective = draft === null ? roleValue : draft;
              return <div key={permission.key} className={`rounded-[1.4rem] p-4 ring-1 ${effective ? "bg-emerald-50 ring-emerald-100" : "bg-slate-50 ring-slate-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div><p className={`font-black ${effective ? "text-emerald-800" : "text-slate-600"}`}>{permission.label}</p><p className="mt-1 text-xs font-bold leading-5 text-slate-500">{permission.description}</p><p className="mt-2 text-[11px] font-black text-slate-400">Kaynak: {draft === null ? "Rol yetkisi" : "Kişisel ayar"} • Rol: {roleValue ? "Açık" : "Kapalı"}</p></div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button onClick={() => setPersonalPermissionDraft(permission.key, true)} className={`rounded-xl px-3 py-2 text-xs font-black ${draft === true ? "bg-emerald-600 text-white" : "bg-white text-emerald-700 ring-1 ring-emerald-100"}`}>Açık</button>
                  <button onClick={() => setPersonalPermissionDraft(permission.key, false)} className={`rounded-xl px-3 py-2 text-xs font-black ${draft === false ? "bg-red-600 text-white" : "bg-white text-red-700 ring-1 ring-red-100"}`}>Kapalı</button>
                  <button onClick={() => setPersonalPermissionDraft(permission.key, null)} className={`rounded-xl px-3 py-2 text-xs font-black ${draft === null ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>Rolü kullan</button>
                </div>
              </div>;
            })}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button onClick={saveUserPermissions} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Kişisel yetkileri kaydet</button>
            <button onClick={resetUserPermissions} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">Kişisel ayarları sıfırla</button>
          </div>
        </div>
      </Modal>}
      {modal?.type === "notifications" && <Modal title="Bildirimler" subtitle="Dağıtıcı ve depo bildirimleri" onClose={closeOverlay}>{warehouse.notifications.length === 0 ? <EmptyBox text="Yeni bildirim yok." /> : <div className="grid gap-3">{warehouse.notifications.map((n) => <div key={n.id} className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-800 ring-1 ring-blue-100">{n.title} — {n.body}</div>)}</div>}</Modal>}
    </div>
  );
}

function AddExamForm({ form, setForm, shelves, onSave }) {
  const classOptions = [...CLASS_GROUPS.Ortaokul, ...CLASS_GROUPS.Lise];
  const highSchool = groupForClass(form.classLevel) === "Lise";
  const summary = highSchool
    ? examStockSummary({ classLevel: form.classLevel, group: "Lise", variants: { "Kitapçık A": form.kitapcikA, "Kitapçık B": form.kitapcikB } })
    : examStockSummary({ classLevel: form.classLevel, group: "Ortaokul", variants: { "A Sayısal": form.aSayisal, "A Sözel": form.aSozel, "B Sayısal": form.bSayisal, "B Sözel": form.bSozel } });

  return <div className="grid gap-4"><SelectInput label="Sınıf" value={form.classLevel} onChange={(v) => setForm((s) => ({ ...s, classLevel: v, group: groupForClass(v) }))} options={classOptions} /><TextInput label="Deneme adı" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} /><div className="grid gap-3 sm:grid-cols-2"><TextInput label="A kitapçığı barkodu" value={form.barcodeA || ""} onChange={(v) => setForm((s) => ({ ...s, barcodeA: v }))} /><TextInput label="B kitapçığı barkodu" value={form.barcodeB || ""} onChange={(v) => setForm((s) => ({ ...s, barcodeB: v }))} /></div><SelectInput label="Raf" value={form.shelfId} onChange={(v) => setForm((s) => ({ ...s, shelfId: String(v) }))} options={shelves.map((s) => ({ value: s.id, label: `${s.name} - ${s.qrCode || "Barkod yok"}` }))} /><div className="rounded-[1.6rem] bg-slate-50 p-4 ring-1 ring-slate-100"><SectionTitle title="Stok dağılımı" subtitle={highSchool ? "Lise için sadece A ve B kitapçığı adedi girilir." : "Ortaokul için A/B kitapçığı sayısal ve sözel adetleri girilir."} />{highSchool ? <div className="grid gap-3 sm:grid-cols-2"><TextInput label="A Kitapçığı" type="number" value={form.kitapcikA} onChange={(v) => setForm((s) => ({ ...s, kitapcikA: v }))} /><TextInput label="B Kitapçığı" type="number" value={form.kitapcikB} onChange={(v) => setForm((s) => ({ ...s, kitapcikB: v }))} /></div> : <div className="grid gap-3 sm:grid-cols-2"><TextInput label="A Sayısal" type="number" value={form.aSayisal} onChange={(v) => setForm((s) => ({ ...s, aSayisal: v }))} /><TextInput label="A Sözel" type="number" value={form.aSozel} onChange={(v) => setForm((s) => ({ ...s, aSozel: v }))} /><TextInput label="B Sayısal" type="number" value={form.bSayisal} onChange={(v) => setForm((s) => ({ ...s, bSayisal: v }))} /><TextInput label="B Sözel" type="number" value={form.bSozel} onChange={(v) => setForm((s) => ({ ...s, bSozel: v }))} /></div>}<div className="mt-3 flex flex-wrap gap-2">{highSchool ? <><Pill>A {summary.kitapcikA}</Pill><Pill>B {summary.kitapcikB}</Pill><Pill tone="green">Hazırlanabilir {summary.hazirlanabilir}</Pill></> : <><Pill>Sayısal {summary.sayisal}</Pill><Pill>Sözel {summary.sozel}</Pill><Pill tone="green">Hazırlanabilir {summary.hazirlanabilir}</Pill></>}</div></div><button onClick={onSave} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Kaydet</button></div>;
}


function AddBookForm({ form, setForm, shelves, onSave }) {
  const classOptions = [...CLASS_GROUPS.Ortaokul, ...CLASS_GROUPS.Lise];
  return <div className="grid gap-4"><SelectInput label="Sınıf" value={form.classLevel} onChange={(v) => setForm((s) => ({ ...s, classLevel: v, group: groupForClass(v) }))} options={classOptions} /><TextInput label="Kitap adı" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} /><TextInput label="Stok sayısı" type="number" value={form.stock} onChange={(v) => setForm((s) => ({ ...s, stock: v }))} /><TextInput label="Barkod" value={form.barcode} onChange={(v) => setForm((s) => ({ ...s, barcode: v }))} /><SelectInput label="Raf" value={form.shelfId} onChange={(v) => setForm((s) => ({ ...s, shelfId: String(v) }))} options={shelves.map((s) => ({ value: s.id, label: `${s.name} - ${s.qrCode || "Barkod yok"}` }))} /><button onClick={onSave} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Kaydet</button></div>;
}


function EditExamForm({ form, setForm, shelves, onSave }) {
  const classOptions = [...CLASS_GROUPS.Ortaokul, ...CLASS_GROUPS.Lise];
  return <div className="grid gap-4"><SelectInput label="Sınıf" value={form.classLevel} onChange={(v) => setForm((s) => ({ ...s, classLevel: v }))} options={classOptions} /><TextInput label="Deneme adı" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} /><div className="grid gap-3 sm:grid-cols-2"><TextInput label="A kitapçığı barkodu" value={form.barcodeA || ""} onChange={(v) => setForm((s) => ({ ...s, barcodeA: v }))} /><TextInput label="B kitapçığı barkodu" value={form.barcodeB || ""} onChange={(v) => setForm((s) => ({ ...s, barcodeB: v }))} /></div><SelectInput label="Raf" value={form.shelfId} onChange={(v) => setForm((s) => ({ ...s, shelfId: String(v) }))} options={shelves.map((s) => ({ value: s.id, label: `${s.name} - ${s.qrCode || "Barkod yok"}` }))} /><label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700 ring-1 ring-slate-100"><input type="checkbox" checked={form.active} onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))} />Aktif kayıt</label><button onClick={onSave} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Değişiklikleri kaydet</button></div>;
}

function EditBookForm({ form, setForm, shelves, onSave }) {
  const classOptions = [...CLASS_GROUPS.Ortaokul, ...CLASS_GROUPS.Lise];
  return <div className="grid gap-4"><SelectInput label="Sınıf" value={form.classLevel} onChange={(v) => setForm((s) => ({ ...s, classLevel: v }))} options={classOptions} /><TextInput label="Kitap adı" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} /><TextInput label="Barkod" value={form.barcode} onChange={(v) => setForm((s) => ({ ...s, barcode: v }))} /><TextInput label="Stok" type="number" value={form.stock} onChange={(v) => setForm((s) => ({ ...s, stock: v }))} /><SelectInput label="Raf" value={form.shelfId} onChange={(v) => setForm((s) => ({ ...s, shelfId: String(v) }))} options={shelves.map((s) => ({ value: s.id, label: `${s.name} - ${s.qrCode || "Barkod yok"}` }))} /><label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700 ring-1 ring-slate-100"><input type="checkbox" checked={form.active} onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))} />Aktif kayıt</label><button onClick={onSave} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Değişiklikleri kaydet</button></div>;
}

function EditShelfForm({ form, setForm, onSave }) {
  return <div className="grid gap-4"><TextInput label="Raf adı" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} /><TextInput label="Raf barkodu" value={form.qrCode} onChange={(v) => setForm((s) => ({ ...s, qrCode: v }))} /><TextInput label="Not" value={form.note} onChange={(v) => setForm((s) => ({ ...s, note: v }))} /><label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700 ring-1 ring-slate-100"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))} />Aktif raf</label><button onClick={onSave} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Değişiklikleri kaydet</button></div>;
}

function UserForm({ form, setForm, onSave, saveLabel = "Kaydet" }) {
  return <div className="grid gap-4"><TextInput label="Ad soyad" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} /><SelectInput label="Rol" value={normalizeRoleValue(form.role)} onChange={(v) => { const role = normalizeRoleValue(v); setForm((f) => ({ ...f, role, title: ROLE_PERMISSION_MATRIX[role]?.label || "Personel" })); }} options={[{ value: "yardimci_admin", label: "Yardımcı Admin" }, { value: "personel", label: "Personel" }, { value: "dagitici", label: "Dağıtıcı" }]} /><TextInput label="Telefon" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} /><TextInput label="E-posta" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} /><TextInput label="Şifre" value={form.password || ""} onChange={(v) => setForm((f) => ({ ...f, password: v }))} placeholder="Mobil giriş için şifre" /><label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700 ring-1 ring-slate-100"><input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />Aktif kullanıcı</label><button onClick={onSave} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">{saveLabel}</button></div>;
}

function CreateOrderForm({ form, setForm, exams, institutions, onSave, saveLabel = "Sipariş oluştur" }) {
  const selectedGroup = form.group || "Ortaokul";
  const classOptions = CLASS_GROUPS[selectedGroup] || CLASS_GROUPS.Ortaokul;
  const selectedClass = form.classLevel && classOptions.includes(form.classLevel) ? form.classLevel : classOptions[0];
  const availableExams = exams.filter((exam) => examIsAvailable(exam) && exam.group === selectedGroup && exam.classLevel === selectedClass);
  const selected = availableExams.find((e) => e.id === form.examId) || availableExams[0];
  const max = selected ? orderAvailableTotal(selected) : 0;
  const quantity = Math.max(0, Number(form.quantity || 0));
  const plan = selected && quantity > 0 ? deductionPlanForOrder(selected, quantity) : {};
  const groupOptions = [{ value: "Ortaokul", label: "Ortaokul" }, { value: "Lise", label: "Lise" }];
  const examOptions = availableExams.length
    ? availableExams.map((e) => ({ value: e.id, label: `${e.name} — stok ${orderAvailableTotal(e)}` }))
    : [{ value: "", label: "Bu sınıfta aktif/stoklu deneme yok" }];

  const changeGroup = (value) => {
    const nextClasses = CLASS_GROUPS[value] || CLASS_GROUPS.Ortaokul;
    setForm((state) => ({ ...state, group: value, classLevel: nextClasses[0], examId: "", quantity: 1 }));
  };

  const changeClass = (value) => setForm((state) => ({ ...state, classLevel: value, examId: "", quantity: 1 }));

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectInput label="Okul türü" value={selectedGroup} onChange={changeGroup} options={groupOptions} />
        <SelectInput label="Sınıf" value={selectedClass} onChange={changeClass} options={classOptions.map((item) => ({ value: item, label: item }))} />
      </div>

      <SelectInput
        label="Deneme seçimi"
        value={form.examId || selected?.id || ""}
        onChange={(v) => setForm((state) => ({ ...state, examId: v }))}
        options={examOptions}
      />

      <div className="grid gap-2">
        <TextInput
          label="Deneme adedi"
          type="number"
          value={form.quantity}
          onChange={(v) => setForm((state) => ({ ...state, quantity: v }))}
          placeholder="Örn. 30"
        />
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
          Stok: <span className="text-blue-700">{selected ? `${max} hazırlanabilir` : "deneme seçilmedi"}</span>
          {selected && quantity > max && <span className="ml-2 text-red-600">Girilen adet stoktan fazla.</span>}
        </div>
      </div>

      <TextInput label="Açıklama" value={form.note} onChange={(v) => setForm((state) => ({ ...state, note: v }))} placeholder="Sipariş notu / açıklama" />

      {selected && quantity > 0 && (
        <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
          <p className="text-sm font-black text-blue-800">Otomatik düşüm planı</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(plan).length === 0 ? <Pill tone="slate">Plan oluşmadı</Pill> : Object.entries(plan).map(([k, v]) => <Pill key={k}>{k}: {v}</Pill>)}
          </div>
        </div>
      )}

      <button
        onClick={onSave}
        disabled={!selected || quantity <= 0 || quantity > max}
        className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {saveLabel}
      </button>
    </div>
  );
}

function ExamStockCard({ exam, shelfLabel, onOpen, onGift, compact = false }) {
  const available = examIsAvailable(exam);
  const passive = exam.active === false || !hasAnyStock(exam);
  const summary = examStockSummary(exam);
  const highSchool = summary.isHighSchool;
  return (
    <div className={`rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-slate-200 transition ${passive ? "opacity-45 grayscale" : ""}`}>
      <button onClick={onOpen} className="w-full text-left">
        <div className="flex items-start gap-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${available ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}><ClipboardCheck size={24} /></div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-slate-950">{exam.name}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{exam.group} • {exam.classLevel} • {shelfLabel(exam.shelfId) || exam.shelf}</p>
            <div className="mt-2 grid gap-1 text-xs font-bold text-slate-500 sm:grid-cols-2">
              <span>A barkod: {exam.barcodeA || "-"}</span>
              <span>B barkod: {exam.barcodeB || "-"}</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {highSchool ? (
                <>
                  <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">A Kitapçığı {summary.kitapcikA}</div>
                  <div className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700">B Kitapçığı {summary.kitapcikB}</div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Hazırlanabilir {summary.hazirlanabilir}</div>
                </>
              ) : (
                <>
                  <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">Sayısal {summary.sayisal}</div>
                  <div className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700">Sözel {summary.sozel}</div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Hazırlanabilir {summary.hazirlanabilir}</div>
                </>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill tone={available ? "green" : "slate"}>{available ? "Mevcut" : "Pasif / stok yok"}</Pill>
              <Pill tone="slate">Toplam {variantTotal(exam)}</Pill>
              {hasCriticalStock(exam) && <Pill tone="amber">Kritik</Pill>}
              {isGift(exam) && <Pill tone="purple">Hediye</Pill>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-950">{summary.hazirlanabilir}</p>
            <p className="text-[11px] font-black text-slate-400">hazırlanabilir</p>
          </div>
        </div>
      </button>
      {!compact && <div className="mt-4 grid gap-2 sm:grid-cols-2"><button onClick={onOpen} className="rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Detay</button><button onClick={onGift} className="rounded-2xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 ring-1 ring-violet-100">Hediye ayır</button></div>}
    </div>
  );
}


function BookStockCard({ book, compact = false, onOpen }) {
  const critical = Number(book.stock || 0) > 0 && Number(book.stock || 0) < CRITICAL_STOCK_THRESHOLD;
  return <div className="rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-slate-200"><button onClick={onOpen} className="w-full text-left"><div className="flex items-start gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><BookOpen size={24} /></div><div className="min-w-0 flex-1"><p className="font-black text-slate-950">{book.name}</p><p className="mt-1 text-xs font-bold text-slate-500">{book.group} • {book.classLevel} • {book.shelf}</p><div className="mt-2 flex flex-wrap gap-2"><Pill tone="purple">Kitap</Pill>{critical && <Pill tone="amber">Kritik</Pill>}</div></div><div className="text-right"><p className="text-3xl font-black text-slate-950">{book.stock}</p><p className="text-[11px] font-black text-slate-400">stok</p></div></div></button>{!compact && <button onClick={onOpen} className="mt-4 w-full rounded-2xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 ring-1 ring-violet-100">Detay</button>}</div>;
}

function RolePermissionCard({ role, config }) {
  return <div className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200">
    <div className="flex items-start gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"><ShieldCheck size={22} /></div>
      <div>
        <p className="font-black text-slate-950">{config.label}</p>
        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{config.description}</p>
      </div>
    </div>
    <div className="mt-4 grid gap-2">
      {config.permissions.map((permission) => <div key={permission} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-100">{permission}</div>)}
    </div>
  </div>;
}

function MovementCard({ movement, onDelete }) {
  const risk = movement.risk || String(movement.action || "").toLowerCase().includes("sil") || String(movement.action || "").toLowerCase().includes("sıfır");
  return <div className={`rounded-[1.6rem] bg-white p-4 ring-1 ${risk ? "ring-red-100" : "ring-slate-200"}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <Clock size={18} className={`mt-1 ${risk ? "text-red-700" : "text-blue-700"}`} />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black text-slate-950">{movement.action}</p>
            {risk && <Pill tone="red">Riskli işlem</Pill>}
            {movement.entityType && <Pill tone="slate">{movement.entityType}</Pill>}
          </div>
          <p className="mt-1 text-sm font-bold text-slate-500">{movement.examName || "Kayıt"}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">{movement.detail} • {movement.createdAt}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1">Kullanıcı: {movement.userName || "-"}</span>
            {movement.roleLabel && <span className="rounded-full bg-slate-100 px-2 py-1">Rol: {movement.roleLabel}</span>}
          </div>
          {(movement.before || movement.after) && <div className="mt-3 grid gap-2 text-xs font-bold text-slate-500 md:grid-cols-2">
            {movement.before && <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100"><span className="font-black text-slate-700">Önce:</span> {movement.before}</div>}
            {movement.after && <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100"><span className="font-black">Sonra:</span> {movement.after}</div>}
          </div>}
        </div>
      </div>
      {onDelete && <button onClick={onDelete} className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100">Çöpe taşı</button>}
    </div>
  </div>;
}

function ExamDetailModal({ exam, shelves = [], shelfLabel, onClose, onVariantChange, onBulkAdd, onMoveShelf, onToggle, onGift, onDelete, onResetStock, onEdit, movements = [] }) {
  const safeExam = exam || {};
  const safeShelfLabel = typeof shelfLabel === "function" ? shelfLabel : () => "Raf yok";
  const highSchool = examIsHighSchool(safeExam);
  const normalizedVariants = ensureExamVariants(safeExam);
  const summary = examStockSummary({ ...safeExam, variants: normalizedVariants });
  const [delta, setDelta] = useState({ aSayisal: "", aSozel: "", bSayisal: "", bSozel: "", aKitapcik: "", bKitapcik: "" });
  const [bulkCount, setBulkCount] = useState("");
  const [moveShelf, setMoveShelf] = useState(String(safeExam.shelfId || shelves?.[0]?.id || ""));

  const variantRows = highSchool
    ? [
        ["aKitapcik", "A Kitapçığı"],
        ["bKitapcik", "B Kitapçığı"],
      ]
    : [
        ["aSayisal", "A Sayısal"],
        ["aSozel", "A Sözel"],
        ["bSayisal", "B Sayısal"],
        ["bSozel", "B Sözel"],
      ];

  const changeSafe = (key, direction) => {
    const amount = Number(delta[key] || 0);
    if (!amount || amount < 1) {
      alert("Lütfen geçerli bir adet girin.");
      return;
    }
    onVariantChange?.(safeExam, key, direction * amount, direction > 0 ? "manuel giriş" : "manuel çıkış");
    setDelta((current) => ({ ...current, [key]: "" }));
  };

  const bulkAddSafe = () => {
    const amount = Number(bulkCount || 0);
    if (!amount || amount < 1) {
      alert("Lütfen geçerli bir deneme adedi girin.");
      return;
    }
    onBulkAdd?.(safeExam, amount);
    setBulkCount("");
  };

  const selectedShelfLabel = safeExam.shelf || safeShelfLabel(safeExam.shelfId) || "Raf yok";

  return (
    <Modal title="Deneme Detayı" subtitle={`${safeExam.name || "Deneme"} • ${safeExam.classLevel || "Sınıf yok"} • ${selectedShelfLabel}`} onClose={onClose} wide>
      <div className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-3">
          {highSchool ? (
            <>
              <div className="rounded-[1.6rem] bg-blue-50 p-4 ring-1 ring-blue-100">
                <p className="text-xs font-black uppercase text-blue-700">A Kitapçığı</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{summary.kitapcikA}</p>
              </div>
              <div className="rounded-[1.6rem] bg-purple-50 p-4 ring-1 ring-purple-100">
                <p className="text-xs font-black uppercase text-purple-700">B Kitapçığı</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{summary.kitapcikB}</p>
              </div>
              <div className="rounded-[1.6rem] bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-black uppercase text-emerald-700">Hazırlanabilir</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{summary.hazirlanabilir}</p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-[1.6rem] bg-blue-50 p-4 ring-1 ring-blue-100">
                <p className="text-xs font-black uppercase text-blue-700">Sayısal</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{summary.sayisal}</p>
              </div>
              <div className="rounded-[1.6rem] bg-purple-50 p-4 ring-1 ring-purple-100">
                <p className="text-xs font-black uppercase text-purple-700">Sözel</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{summary.sozel}</p>
              </div>
              <div className="rounded-[1.6rem] bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-black uppercase text-emerald-700">Hazırlanabilir</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{summary.hazirlanabilir}</p>
              </div>
            </>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.6rem] bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs font-black uppercase text-slate-500">A Kitapçığı Barkodu</p>
            <p className="mt-2 break-all text-lg font-black text-slate-950">{safeExam.barcodeA || "-"}</p>
          </div>
          <div className="rounded-[1.6rem] bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs font-black uppercase text-slate-500">B Kitapçığı Barkodu</p>
            <p className="mt-2 break-all text-lg font-black text-slate-950">{safeExam.barcodeB || "-"}</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.6rem] bg-blue-50 p-4 ring-1 ring-blue-100 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-black text-blue-900">Toplu deneme girişi</p>
            <p className="mt-1 text-xs font-bold text-blue-700">Girilen adet A ve B kitapçıklarına otomatik bölünür. Tek sayı girilirse fazlalık A kitapçığına eklenir.</p>
            <input
              type="number"
              min="1"
              value={bulkCount}
              onChange={(e) => setBulkCount(e.target.value)}
              placeholder="Örn: 30 deneme"
              className="mt-3 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-black outline-none focus:border-blue-400"
            />
          </div>
          <button onClick={bulkAddSafe} className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-sm">Toplu ekle</button>
        </div>

        <div className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200">
          <SectionTitle
            title={highSchool ? "A/B kitapçık stokları" : "A/B sayısal-sözel stokları"}
            subtitle={highSchool ? "Lisede yalnızca A ve B kitapçığı adedi tutulur." : "Toplam sayısal, toplam sözel ve hazırlanabilir adet otomatik hesaplanır."}
          />
          <div className="grid gap-3 md:grid-cols-2">
            {variantRows.map(([key, label]) => (
              <div key={key} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{label}</p>
                    <p className="text-sm font-bold text-slate-500">Mevcut: {Number(normalizedVariants[normalizeVariantKey(key)] || 0)}</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={delta[key] || ""}
                    onChange={(e) => setDelta((current) => ({ ...current, [key]: e.target.value }))}
                    placeholder="Adet"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-black outline-none focus:border-blue-400 sm:w-28"
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => changeSafe(key, 1)} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">Ekle</button>
                  <button onClick={() => changeSafe(key, -1)} className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 ring-1 ring-amber-100">Düşür</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <SelectInput label="Raf değiştir" value={moveShelf} onChange={setMoveShelf} options={(shelves || []).map((s) => ({ value: s.id, label: `${s.name} - ${s.qrCode || "Barkod yok"}` }))} />
          <button onClick={() => onMoveShelf?.(safeExam, moveShelf)} className="self-end rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Taşı</button>
        </div>

        <div className="grid gap-2 sm:grid-cols-5">
          <button onClick={() => onEdit?.(safeExam)} className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100">Bilgileri düzenle</button>
          <button onClick={() => onToggle?.(safeExam)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">{safeExam.active !== false ? "Pasife al" : "Aktif et"}</button>
          <button onClick={() => onResetStock?.(safeExam)} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-black text-amber-700 ring-1 ring-amber-100">Stokları sıfırla</button>
          <button onClick={() => onGift?.(safeExam)} className="rounded-2xl bg-violet-50 px-4 py-3 text-sm font-black text-violet-700 ring-1 ring-violet-100">Hediye kategorisine al</button>
          <button onClick={() => onDelete?.(safeExam)} className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 ring-1 ring-red-100">Tamamen sil</button>
        </div>

        <div className="rounded-[1.6rem] bg-slate-50 p-4 ring-1 ring-slate-100">
          <SectionTitle title="Seyir geçmişi" subtitle="Bu ürünle ilgili hareketler" />
          {Array.isArray(movements) && movements.length > 0 ? <div className="grid gap-2">{movements.map((m) => <MovementCard key={m.id} movement={m} />)}</div> : <EmptyBox text="Bu ürün için hareket yok." />}
        </div>
      </div>
    </Modal>
  );
}


function BookDetailModal({ book, shelves, onClose, onStockChange, onMoveShelf, onToggle, onDelete, onEdit }) {
  const [delta, setDelta] = useState(0);
  const [moveShelf, setMoveShelf] = useState(String(book.shelfId || shelves[0]?.id || ""));
  return <Modal title="Kitap Detayı" subtitle={`${book.classLevel} • ${book.shelf}`} onClose={onClose}><div className="grid gap-4"><DashboardTile title="Stok" value={book.stock} icon={<BookOpen size={22} />} tone="purple" /><div className="grid gap-2 sm:grid-cols-3"><button onClick={() => onEdit(book)} className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100">Bilgileri düzenle</button><button onClick={() => onToggle(book)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">{book.active ? "Pasife al" : "Aktif et"}</button><button onClick={() => onDelete(book)} className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 ring-1 ring-red-100">Sil / çöpe taşı</button></div><TextInput label="Adet" type="number" value={delta} onChange={setDelta} /><div className="grid gap-2 sm:grid-cols-2"><button onClick={() => onStockChange(book, Number(delta), "manuel giriş")} className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">Stok ekle</button><button onClick={() => onStockChange(book, -Number(delta), "manuel çıkış")} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-black text-amber-700 ring-1 ring-amber-100">Stok düşür</button></div><div className="grid gap-3 md:grid-cols-[1fr_auto]"><SelectInput label="Raf değiştir" value={moveShelf} onChange={setMoveShelf} options={shelves.map((s) => ({ value: s.id, label: `${s.name} - ${s.qrCode || "Barkod yok"}` }))} /><button onClick={() => onMoveShelf(book, moveShelf)} className="self-end rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Taşı</button></div></div></Modal>;
}

function ShelfDetailModal({ shelf, products, onClose, onExamOpen, onBookOpen, onEdit, onToggle }) {
  return <Modal title={shelf.name || "Raf Detayı"} subtitle={`${shelf.qrCode || "Barkod yok"} • ${shelf.isActive ? "Aktif" : "Pasif"}`} onClose={onClose} wide><div className="grid gap-5"><div className="rounded-[1.6rem] bg-amber-50 p-5 ring-1 ring-amber-100"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-3xl font-black text-slate-950">{shelf.name}</p><p className="mt-2 text-sm font-bold text-slate-600">Barkod: {shelf.qrCode}</p>{shelf.note && <p className="mt-2 text-sm font-bold text-amber-800">{shelf.note}</p>}</div><div className="flex flex-wrap gap-2"><button onClick={() => onEdit(shelf)} className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Rafı düzenle</button><button onClick={() => onToggle(shelf)} className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">{shelf.isActive ? "Pasife al" : "Aktif et"}</button></div></div></div><div><SectionTitle title="Bu raftaki denemeler" />{products.exams.length === 0 ? <EmptyBox text="Bu rafta deneme yok." /> : <div className="grid gap-3">{products.exams.map((exam) => <ExamStockCard key={exam.id} exam={exam} shelfLabel={() => shelf.name} onOpen={() => onExamOpen(exam)} />)}</div>}</div><div><SectionTitle title="Bu raftaki kitaplar" />{products.books.length === 0 ? <EmptyBox text="Bu rafta kitap yok." /> : <div className="grid gap-3">{products.books.map((book) => <BookStockCard key={book.id} book={book} onOpen={() => onBookOpen(book)} />)}</div>}</div></div></Modal>;
}

function OrderCard({ order, compact = false, onOpen, onPrepare, onDeliver, onCancel }) {
  const closed = ["delivered", "cancelled"].includes(order.status);
  return <div className="rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-slate-200"><button onClick={onOpen} className="w-full text-left"><div className="flex items-start justify-between gap-3"><div><Pill tone={order.status === "pending" ? "amber" : order.status === "prepared" ? "green" : order.status === "delivered" ? "green" : "slate"}>{STATUS_LABELS[order.status] || order.status}</Pill><p className="mt-3 text-lg font-black text-slate-950">{order.examName}</p><p className="mt-1 text-sm font-bold text-slate-500">{order.destination} • {order.quantity} adet • {order.classLevel}</p></div><p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-500 ring-1 ring-slate-100">{order.id}</p></div></button>{!compact && !closed && <div className="mt-4 flex flex-wrap gap-2"><button onClick={onPrepare} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Hazırla</button><button onClick={onDeliver} className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">Teslim edildi</button><button onClick={onCancel} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200">İptal</button></div>}</div>;
}

function OrderDetailModal({ order, onClose, onPrepare, onDeliver, onCancel, onEdit, exam }) {
  const plan = exam ? deductionPlanForOrder(exam, order.quantity) : {};
  const canPrepare = order.status === "pending";
  const canDeliver = order.status === "prepared";
  const canCancel = !["delivered", "cancelled"].includes(order.status);
  return <Modal title="Sipariş Detayı" subtitle={`${order.id} • ${STATUS_LABELS[order.status]}`} onClose={onClose}><div className="grid gap-4"><div className="rounded-[1.6rem] bg-slate-50 p-4 ring-1 ring-slate-100"><DetailLine label="Kurum" value={order.destination} /><DetailLine label="Deneme" value={order.examName} /><DetailLine label="Sınıf" value={order.classLevel} /><DetailLine label="Adet" value={String(order.quantity)} /><DetailLine label="Raf" value={order.shelf} /><DetailLine label="Not" value={order.note || "-"} /></div><div className="rounded-[1.6rem] bg-blue-50 p-4 ring-1 ring-blue-100"><p className="text-sm font-black text-blue-800">Hazırlama / düşüm planı</p><div className="mt-2 flex flex-wrap gap-2">{Object.entries(plan).map(([k, v]) => <Pill key={k}>{k}: {v}</Pill>)}</div></div><div className="grid gap-2 sm:grid-cols-4">{canPrepare && <button onClick={() => onEdit(order)} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100">Düzenle</button>}{canPrepare && <button onClick={() => onPrepare(order)} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white">Siparişi onayla / hazırla</button>}{canDeliver && <button onClick={() => onDeliver(order)} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">Teslim edildi yap</button>}{canCancel && <button onClick={() => onCancel(order)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">İptal et</button>}</div></div></Modal>;
}

function DetailLine({ label, value }) {
  return <div className="mb-2 grid grid-cols-[110px_1fr] gap-3 text-sm"><p className="font-black text-slate-500">{label}</p><p className="font-black text-slate-900">{value}</p></div>;
}

function TvOrderDisplay({ orders, onBack }) {
  const pending = orders.filter((o) => o.status === "pending");
  const prepared = orders.filter((o) => o.status === "prepared");
  return <div className="min-h-[620px] rounded-[2rem] bg-slate-950 p-5 text-white"><div className="mb-5 flex items-center justify-between"><h2 className="text-3xl font-black">TV Sipariş Ekranı</h2><button onClick={onBack} className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950">Geri</button></div><div className="grid gap-5 lg:grid-cols-2"><TvColumn title="YENİ SİPARİŞLER" color="amber" orders={pending} /><TvColumn title="HAZIRLANANLAR" color="green" orders={prepared} /></div></div>;
}

function TvColumn({ title, orders, color }) {
  const border = color === "amber" ? "border-amber-400 text-amber-300" : "border-emerald-400 text-emerald-300";
  return <div className={`rounded-3xl border-2 p-4 ${border}`}><p className="mb-4 text-2xl font-black">{title} ({orders.length})</p><div className="grid gap-3">{orders.length === 0 ? <p className="text-white/60">Sipariş yok</p> : orders.map((o) => <div key={o.id} className="rounded-2xl bg-white p-4 text-slate-950"><p className="text-lg font-black">{o.destination}</p><p className="mt-1 font-bold">{o.examName}</p><p className="text-sm font-bold text-slate-500">{o.quantity} adet • {o.classLevel}</p></div>)}</div></div>;
}
