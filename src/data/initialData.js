export const LOGO_SRC = "/noxelera-logo.png";
export const MADE_BY_TEXT = "Developed by Han Kop";

export const MONTH_NAMES = [
  "agustos",
  "eylul",
  "ekim",
  "kasim",
  "aralik",
  "ocak",
  "subat",
  "mart",
  "nisan",
  "mayis",
  "haziran",
  "temmuz",
];

export const MONTH_LABELS = {
  agustos: "Ağustos",
  eylul: "Eylül",
  ekim: "Ekim",
  kasim: "Kasım",
  aralik: "Aralık",
  ocak: "Ocak",
  subat: "Şubat",
  mart: "Mart",
  nisan: "Nisan",
  mayis: "Mayıs",
  haziran: "Haziran",
  temmuz: "Temmuz",
};

export function getDefaultSeasonStartYear() {
  const now = new Date();
  const monthIndex = now.getMonth();
  return monthIndex >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

export function getDefaultCurrentMonthId() {
  const now = new Date();
  const slugByMonth = ["ocak", "subat", "mart", "nisan", "mayis", "haziran", "temmuz", "agustos", "eylul", "ekim", "kasim", "aralik"];
  return `${slugByMonth[now.getMonth()]}-${now.getFullYear()}`;
}

export function createSeasonMonths(startYear = 2025, currentMonthId = "mayis-2026") {
  return MONTH_NAMES.map((name, index) => {
    const year = index <= 4 ? startYear : startYear + 1;
    const id = `${name}-${year}`;
    const currentIndex = MONTH_NAMES.findIndex((monthName, monthIndex) => `${monthName}-${monthIndex <= 4 ? startYear : startYear + 1}` === currentMonthId);
    let status = "future";
    if (currentIndex >= 0) {
      if (index < currentIndex) status = "past";
      else if (index === currentIndex) status = "current";
      else if (index === currentIndex + 1) status = "next";
    }
    return { id, label: MONTH_LABELS[name], year: String(year), status };
  });
}

export const MONTHS = createSeasonMonths(2025, "mayis-2026");

export const INITIAL_BRANDS = [
  { id: 1, name: "Apotemi", color: "Kırmızı", active: true },
  { id: 2, name: "Hız ve Renk", color: "Mavi", active: true, maxDiscountRate: 50, defaultDiscountRate: 0 },
  { id: 3, name: "Mozaik", color: "Mor", active: true, maxDiscountRate: 50, defaultDiscountRate: 0 },
  { id: 4, name: "Ulti", color: "Siyah", active: true, maxDiscountRate: 50, defaultDiscountRate: 0 },
  { id: 5, name: "Bilgi Sarmal", color: "Yeşil", active: true, maxDiscountRate: 50, defaultDiscountRate: 0 },
  { id: 6, name: "Paraf", color: "Turuncu", active: true, maxDiscountRate: 50, defaultDiscountRate: 0 },
];

export const INITIAL_CUSTOMERS = [
  {
    id: 1,
    name: "Etki Dershanesi",
    username: "abc-dershanesi",
    email: "demo@dershane.com",
    phone: "0555 000 00 00",
    city: "İstanbul",
    discountRate: 18,
    status: "Aktif",
  },
  {
    id: 2,
    name: "Fen-Cebir",
    username: "fen-cebir",
    email: "fen-cebir@akademi.com",
    phone: "0555 111 11 11",
    city: "Ankara",
    discountRate: 12,
    status: "Aktif",
  },
  {
    id: 3,
    name: "Başarı Kurs Merkezi",
    username: "başarı-kurs",
    email: "başarı@kurs.com",
    phone: "0555 222 22 22",
    city: "Eskişehir",
    discountRate: 20,
    status: "Pasif",
  },
];

export const INITIAL_EXAMS = [
  {
    id: 1,
    title: "Apotemi TYT Genel Deneme",
    brand: "Apotemi",
    level: "TYT",
    group: "Lise",
    monthId: "mart-2026",
    recommendedStartDate: "2026-03-12",
    recommendedEndDate: "2026-03-18",
    orderDeadline: "2026-03-08",
    listPrice: 65,
    minQuantity: 20,
    maxQuantity: 500,
    visibility: "all",
    visibleCustomerIds: [],
    tags: ["TYT", "Genel", "Kurumsal"],
    description: "12. sınıf ve mezun gruplar için TYT genel prova denemesi.",
    active: true,
  },
  {
    id: 2,
    title: "Hız ve Renk LGS Deneme",
    brand: "Hız ve Renk",
    level: "LGS",
    group: "Ortaokul",
    monthId: "mart-2026",
    recommendedStartDate: "2026-03-18",
    recommendedEndDate: "2026-03-24",
    orderDeadline: "2026-03-13",
    listPrice: 58,
    minQuantity: 15,
    maxQuantity: 400,
    visibility: "all",
    visibleCustomerIds: [],
    tags: ["LGS", "8. Sınıf", "Yeni Nesil"],
    description: "8. sınıf LGS hazırlık grupları için kapsamlı deneme.",
    active: true,
  },
  {
    id: 3,
    title: "Mozaik 7. Sınıf Kurumsal Deneme",
    brand: "Mozaik",
    level: "7. Sınıf",
    group: "Ortaokul",
    monthId: "nisan-2026",
    recommendedStartDate: "2026-04-03",
    recommendedEndDate: "2026-04-10",
    orderDeadline: "2026-03-28",
    listPrice: 45,
    minQuantity: 10,
    maxQuantity: 300,
    visibility: "all",
    visibleCustomerIds: [],
    tags: ["7. Sınıf", "Kazanım", "Kurumsal"],
    description: "7. sınıf öğrencileri için dönem sonu kazanım değerlendirme denemesi.",
    active: true,
  },
  {
    id: 4,
    title: "Ulti AYT Sayısal Deneme",
    brand: "Ulti",
    level: "AYT",
    group: "Lise",
    monthId: "nisan-2026",
    recommendedStartDate: "2026-04-08",
    recommendedEndDate: "2026-04-15",
    orderDeadline: "2026-04-02",
    listPrice: 72,
    minQuantity: 20,
    maxQuantity: 500,
    visibility: "all",
    visibleCustomerIds: [],
    tags: ["AYT", "Sayısal", "Fen"],
    description: "AYT sayısal grupları için matematik ve fen ağırlıklı deneme.",
    active: true,
  },
  {
    id: 5,
    title: "Bilgi Sarmal TYT Kurumsal Deneme",
    brand: "Bilgi Sarmal",
    level: "TYT",
    group: "Lise",
    monthId: "mayis-2026",
    recommendedStartDate: "2026-05-15",
    recommendedEndDate: "2026-05-21",
    orderDeadline: "2026-05-09",
    listPrice: 68,
    minQuantity: 20,
    maxQuantity: 500,
    visibility: "selected",
    visibleCustomerIds: [1, 2],
    tags: ["TYT", "Genel", "Sarmal"],
    description: "TYT genel tekrar ve sınav provası için kurumsal deneme.",
    active: true,
  },
  {
    id: 6,
    title: "Paraf 8. Sınıf LGS Deneme",
    brand: "Paraf",
    level: "LGS",
    group: "Ortaokul",
    monthId: "mayis-2026",
    recommendedStartDate: "2026-05-22",
    recommendedEndDate: "2026-05-29",
    orderDeadline: "2026-05-16",
    listPrice: 55,
    minQuantity: 15,
    maxQuantity: 400,
    visibility: "all",
    visibleCustomerIds: [],
    tags: ["LGS", "8. Sınıf", "Paraf"],
    description: "LGS hazırlık grupları için yeni nesil soru ağırlıklı deneme.",
    active: true,
  },
  {
    id: 7,
    title: "Karekök AYT Eşit Ağırlık Deneme",
    brand: "Karekök",
    level: "AYT",
    group: "Lise",
    monthId: "haziran-2026",
    recommendedStartDate: "2026-06-09",
    recommendedEndDate: "2026-06-16",
    orderDeadline: "2026-06-03",
    listPrice: 75,
    minQuantity: 20,
    maxQuantity: 500,
    visibility: "all",
    visibleCustomerIds: [],
    tags: ["AYT", "Eşit Ağırlık", "Genel"],
    description: "AYT eşit ağırlık grupları için kapsamlı deneme sınavı.",
    active: true,
  },
  {
    id: 8,
    title: "Nitelik 6. Sınıf Değerlendirme Denemesi",
    brand: "Nitelik",
    level: "6. Sınıf",
    group: "Ortaokul",
    monthId: "haziran-2026",
    recommendedStartDate: "2026-06-18",
    recommendedEndDate: "2026-06-25",
    orderDeadline: "2026-06-12",
    listPrice: 42,
    minQuantity: 10,
    maxQuantity: 300,
    visibility: "all",
    visibleCustomerIds: [],
    tags: ["6. Sınıf", "Değerlendirme", "Kazanım"],
    description: "6. sınıf öğrencileri için kazanım değerlendirme denemesi.",
    active: true,
  },
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-1001",
    customerId: 1,
    institution: "Etki Dershanesi",
    item: "Apotemi TYT Genel Deneme",
    quantity: 50,
    examDate: "2026-03-20",
    note: "12. sınıf grubu için hazırlanacak.",
    status: "Onay bekliyor",
    date: "16 Mart 2027",
    total: 2665,
    logs: ["16 Mart 2027 - Sipariş oluşturuldu."],
  },
  {
    id: "ORD-1000",
    customerId: 1,
    institution: "ABC Dershanesi",
    item: "Hız ve Renk LGS Deneme",
    quantity: 80,
    examDate: "2026-03-22",
    note: "LGS hafta sonu grubu.",
    status: "Onaylandı",
    date: "14 Mart 2027",
    total: 3805,
    logs: ["14 Mart 2027 - Sipariş oluşturuldu.", "14 Mart 2027 - Admin tarafından onaylandı."],
  },
  {
    id: "ORD-0999",
    customerId: 1,
    institution: "Etki Dershanesi",
    item: "Mozaik 7. Sınıf Kurumsal Deneme",
    quantity: 40,
    examDate: "2026-03-10",
    note: "Teslim edildi, iptal edilemez.",
    status: "Teslim edildi",
    date: "02 Mart 2027",
    total: 1476,
    logs: ["02 Mart 2027 - Sipariş oluşturuldu.", "03 Mart 2027 - Teslim edildi."],
  },
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Mart ayı denemeleri yayında",
    text: "Mart ayı TYT ve LGS denemeleri siparişe açılmıştır.",
    imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
    active: true,
  },
  {
    id: 2,
    title: "Sipariş tarihi hatırlatması",
    text: "Siparişlerinizi kapanış tarihinden önce oluşturmayı unutmayın.",
    imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=900&q=80",
    active: true,
  },
  {
    id: 3,
    title: "Yeni kurumsal deneme fırsatları",
    text: "Seçili kurumlara özel kampanya ve deneme duyuruları bu alanda yayınlanır.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    active: true,
  },
];

export const blankExam = {
  title: "",
  brand: "Apotemi",
  level: "TYT",
  group: "Lise",
  monthId: "mayis-2026",
  recommendedStartDate: "2026-05-12",
  recommendedEndDate: "2026-05-18",
  orderDeadline: "2026-05-08",
  listPrice: 0,
  minQuantity: 1,
  maxQuantity: 999,
  visibility: "all",
  visibleCustomerIds: [],
  tagsText: "TYT, Genel",
  description: "",
  active: true,
};

export const blankCustomer = {
  name: "",
  username: "",
  email: "",
  phone: "",
  city: "",
  discountRate: 0,
  status: "Aktif",
};

export const CLASS_CATEGORY_OPTIONS = {
  Ortaokul: ["5", "6", "7", "8", "LGS"],
  Lise: ["9", "10", "11", "12", "TYT", "AYT"],
};

export function getClassCategoryOptions(group) {
  return CLASS_CATEGORY_OPTIONS[group] || CLASS_CATEGORY_OPTIONS.Lise;
}


export const INITIAL_STAFF_USERS = [
  { id: 1, name: "Han Kop", username: "admin", email: "admin@noxelera.app", phone: "0555 333 33 33", title: "Süper Admin", role: "admin", note: "Noxelera sistem sahibi. Depo dahil tüm modüllere erişebilir.", active: true, mustChangePassword: false },
  { id: 2, name: "Depo Personeli", username: "personel", email: "personel@noxelera.app", phone: "0555 111 22 33", title: "Depo Personeli", role: "personnel", note: "Stok, raf ve sipariş hazırlama işlemlerinden sorumlu.", active: true, mustChangePassword: false },
  { id: 3, name: "Dağıtıcı Kullanıcı", username: "dagitici", email: "dagitici@noxelera.app", phone: "0555 222 44 55", title: "Dağıtıcı", role: "distributor", note: "Hazırlanan siparişleri teslim eder.", active: true, mustChangePassword: false },
];

export const STAFF_ROLE_LABELS = {
  admin: "Admin",
  personnel: "Personel",
  distributor: "Dağıtıcı",
};

export function generateTemporaryPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const INITIAL_WAREHOUSE = {
  shelves: [
    { id: 1, code: "A-1", name: "A-1 Rafı", qrCode: "RAF-A-1", description: "TYT ve AYT denemeleri", status: "Aktif" },
    { id: 2, code: "A-2", name: "A-2 Rafı", qrCode: "RAF-A-2", description: "LGS ve ortaokul denemeleri", status: "Aktif" },
    { id: 3, code: "B-1", name: "B-1 Rafı", qrCode: "RAF-B-1", description: "Kitap stok alanı", status: "Aktif" },
    { id: 4, code: "C-1", name: "C-1 Rafı", qrCode: "RAF-C-1", description: "Yedek ve kampanya ürünleri", status: "Aktif" },
  ],
  stockItems: [
    { id: 1, type: "Deneme", name: "Apotemi TYT Genel Deneme", brand: "Apotemi", category: "TYT", barcode: "869000000001", qrCode: "QR-APO-TYT-001", shelfId: 1, quantity: 320, minStock: 50, status: "Aktif" },
    { id: 2, type: "Deneme", name: "Hız ve Renk LGS Deneme", brand: "Hız ve Renk", category: "LGS", barcode: "869000000002", qrCode: "QR-HR-LGS-001", shelfId: 2, quantity: 210, minStock: 40, status: "Aktif" },
    { id: 3, type: "Kitap", name: "TYT Matematik Soru Bankası", brand: "Noxelera", category: "TYT", barcode: "869000000003", qrCode: "QR-NOX-TYT-MAT", shelfId: 3, quantity: 95, minStock: 20, status: "Aktif" },
    { id: 4, type: "Kitap", name: "AYT Edebiyat Soru Bankası", brand: "Noxelera", category: "AYT", barcode: "869000000004", qrCode: "QR-NOX-AYT-EDB", shelfId: 3, quantity: 18, minStock: 20, status: "Aktif" },
    { id: 5, type: "Deneme", name: "Paraf 8. Sınıf LGS Deneme", brand: "Paraf", category: "LGS", barcode: "869000000005", qrCode: "QR-PAR-LGS-001", shelfId: 2, quantity: 72, minStock: 30, status: "Aktif" },
  ],
  distributorTasks: [
    { id: 1, title: "Etki Dershanesi teslimatı", orderId: "ORD-1000", distributor: "Dağıtıcı 1", status: "Bekliyor", note: "LGS denemeleri teslim edilecek." },
  ],
  stockMovements: [
    { id: 1, type: "Stok", text: "Apotemi TYT Genel Deneme stok kaydı oluşturuldu.", date: "Bugün" },
    { id: 2, type: "Raf", text: "A-1 rafı QR kaydıyla aktif edildi.", date: "Bugün" },
  ],
};
