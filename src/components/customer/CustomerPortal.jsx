import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Download,
  Eye,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Minus,
  Package,
  Percent,
  Plus,
  Repeat,
  School,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tags,
  Trash2,
  Users,
  X,
  XCircle
} from "lucide-react";

import LogoMark from "../common/LogoMark";
import FixedCredit from "../common/DeveloperCredit";
import AdminInput from "../shared/AdminInput";
import StatusBadge from "../shared/StatusBadge";
import MonthCard from "./MonthCard";
import GroupTab from "./GroupTab";
import ExamDetailModal from "./ExamDetailModal";
import OrderDetailModal from "./OrderDetailModal";
import ProfileSettingsModal from "./ProfileSettingsModal";
import { MONTHS } from "../../data/initialData";
import { formatCurrency, formatDate, recommendedDateText } from "../../utils/format";
import { getNetPrice } from "../../utils/pricing";
import { isExamVisibleForCustomer } from "../../utils/visibility";

function getExamClassOptions(exam) {
  const explicitOptions = exam?.classCategories || exam?.classes || exam?.levels;
  if (Array.isArray(explicitOptions) && explicitOptions.length > 0) return explicitOptions;
  if (exam?.level) return [exam.level];
  return exam?.group === "Ortaokul" ? ["5", "6", "7", "8", "LGS"] : ["9", "10", "11", "12", "TYT", "AYT"];
}

export default function CustomerPortal({ customer, exams, orders, setOrders, announcements, demandShowcase = [], months = MONTHS, seasonLabel = "2025-2026", onLogout, isPreview = false, onBackToAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [monthStartIndex, setMonthStartIndex] = useState(7);
  const [selectedMonthId, setSelectedMonthId] = useState("mayis-2026");
  const [selectedGroup, setSelectedGroup] = useState("Lise");
  const [brandFilter, setBrandFilter] = useState("Tümü");
  const [classFilter, setClassFilter] = useState("Tümü");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminProfile, setAdminProfile] = useState({
    username: "admin",
    firstName: "Han",
    lastName: "Kop",
    email: "admin@noxelera.com",
    phone: "0555 333 33 33",
    role: "Süper Admin",
  });
  const [adminPassword, setAdminPassword] = useState({ current: "", next: "", repeat: "" });
  const [adminProfileMessage, setAdminProfileMessage] = useState("");
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [draftNote, setDraftNote] = useState("");
  const [draftExamDate, setDraftExamDate] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState(["Yeni deneme takvimi güncellendi."]);
  const [reminders, setReminders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [demandStartIndex, setDemandStartIndex] = useState(0);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profile, setProfile] = useState({
    name: customer.name,
    contactPerson: "Yetkili kişi",
    email: customer.email,
    phone: customer.phone,
    address: `${customer.city} / Türkiye`,
  });

  const visibleMonths = months.slice(monthStartIndex, monthStartIndex + 5);
  const canPrevMonth = monthStartIndex > 0;
  const canNextMonth = monthStartIndex + 5 < months.length;
  const selectedMonth = months.find((month) => month.id === selectedMonthId) || months.find((month) => month.status === "current") || months[0];
  const visibleExams = exams.filter((exam) => isExamVisibleForCustomer(exam, customer));
  const activeAnnouncements = announcements.filter((a) => a.active);
  const currentAnnouncement = activeAnnouncements[announcementIndex % Math.max(activeAnnouncements.length, 1)];

  const monthStatusForExam = (exam) => months.find((month) => month.id === exam.monthId)?.status || "closed";
  const canOrderExam = (exam) => monthStatusForExam(exam) === "current";
  const orderAvailabilityText = (exam) => {
    const status = monthStatusForExam(exam);
    if (status === "current") return "Siparişe açık";
    if (status === "next" || status === "future") return "Şimdilik sadece görüntülenebilir";
    if (status === "past") return "Sipariş dönemi kapandı";
    return "Siparişe kapalı";
  };
  const reminderForExam = (exam) => reminders.find((item) => item.examId === exam.id && item.active);
  const reminderTimeForExam = (exam) => `${formatDate(exam.orderDeadline)} 09:00`;
  const addReminderForExam = (exam) => {
    if (!exam) return;
    if (reminderForExam(exam)) {
      setNotifications((current) => [`${exam.title} için hatırlatma zaten kayıtlı.`, ...current]);
      return;
    }
    setReminders((current) => [{ id: `RMD-${Date.now()}`, examId: exam.id, title: exam.title, remindAt: reminderTimeForExam(exam), active: true }, ...current]);
    setNotifications((current) => [`${exam.title} için hatırlatma eklendi.`, ...current]);
  };
  const removeReminderForExam = (exam) => {
    if (!exam) return;
    setReminders((current) => current.map((item) => item.examId === exam.id ? { ...item, active: false } : item));
    setNotifications((current) => [`${exam.title} hatırlatıcısı kaldırıldı.`, ...current]);
  };

  useEffect(() => {
    const currentIndex = months.findIndex((month) => month.status === "current");
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    setSelectedMonthId(months[safeIndex]?.id || "");
    setMonthStartIndex(Math.max(0, Math.min(months.length - 5, safeIndex - 2)));
  }, [months]);

  useEffect(() => {
    setClassFilter("Tümü");
  }, [selectedGroup, selectedMonthId]);

  const goToPreviousAnnouncement = () => {
    if (activeAnnouncements.length <= 1) return;
    setAnnouncementIndex((value) => (value - 1 + activeAnnouncements.length) % activeAnnouncements.length);
  };

  const goToNextAnnouncement = () => {
    if (activeAnnouncements.length <= 1) return;
    setAnnouncementIndex((value) => (value + 1) % activeAnnouncements.length);
  };

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setAnnouncementIndex((value) => (value + 1) % activeAnnouncements.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [activeAnnouncements.length]);

  const monthCounts = useMemo(() => months.reduce((acc, month) => ({ ...acc, [month.id]: visibleExams.filter((exam) => exam.monthId === month.id).length }), {}), [visibleExams, months]);
  const selectedMonthExams = useMemo(() => visibleExams.filter((exam) => exam.monthId === selectedMonthId), [visibleExams, selectedMonthId]);
  const groupCounts = useMemo(() => ({ Lise: selectedMonthExams.filter((exam) => exam.group === "Lise").length, Ortaokul: selectedMonthExams.filter((exam) => exam.group === "Ortaokul").length }), [selectedMonthExams]);
  const brands = ["Tümü", ...Array.from(new Set(visibleExams.map((e) => e.brand)))];
  const classOptionsForSelectedGroup = selectedGroup === "Ortaokul"
    ? ["5", "6", "7", "8", "LGS"]
    : ["9", "10", "11", "12", "TYT", "AYT"];
  const classFilterOptions = ["Tümü", ...classOptionsForSelectedGroup];

  const filteredExams = useMemo(() => selectedMonthExams.filter((exam) => {
    const examClassOptions = getExamClassOptions(exam);
    const matchesGroup = exam.group === selectedGroup;
    const matchesBrand = brandFilter === "Tümü" || exam.brand === brandFilter;
    const matchesClass = classFilter === "Tümü" || examClassOptions.includes(classFilter);
    const matchesQuery = `${exam.title} ${exam.brand} ${exam.level} ${examClassOptions.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    return matchesGroup && matchesBrand && matchesClass && matchesQuery;
  }), [selectedMonthExams, selectedGroup, brandFilter, classFilter, query]);

  const upcomingMonthIds = months.filter((month) => month.status === "current" || month.status === "next").map((month) => month.id);
  const upcomingExams = visibleExams.filter((exam) => upcomingMonthIds.includes(exam.monthId)).slice(0, 3);
  const customerOrders = orders.filter((order) => order.customerId === customer.id);
  const demandStats = useMemo(() => {
    const showcaseMap = new Map(demandShowcase.map((item) => [item.examId, item]));
    const shouldShowAllByDefault = demandShowcase.length === 0;
    const rawList = visibleExams
      .filter((exam) => shouldShowAllByDefault || showcaseMap.get(exam.id)?.active)
      .map((exam) => {
        const matchingOrders = orders.filter((order) => order.status !== "İptal edildi" && order.item === exam.title);
        const quantity = matchingOrders.reduce((sum, order) => sum + Number(order.quantity || 0), 0);
        return {
          exam,
          examId: exam.id,
          brand: exam.brand,
          title: exam.title,
          quantity,
          orderCount: matchingOrders.length,
        };
      })
      .sort((a, b) => b.quantity - a.quantity || a.title.localeCompare(b.title, "tr"))
      .slice(0, 10);

    const leaderQuantity = Math.max(...rawList.map((item) => item.quantity), 1);
    return rawList.map((item, index) => ({
      ...item,
      rank: index + 1,
      demandLevel: Math.round((item.quantity / leaderQuantity) * 100),
    }));
  }, [orders, visibleExams, demandShowcase]);

  const visibleDemandStats = demandStats.slice(demandStartIndex, demandStartIndex + 3);
  const canPrevDemand = demandStartIndex > 0;
  const canNextDemand = demandStartIndex + 3 < demandStats.length;
  const totalDemandQuantity = demandStats.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (demandStartIndex >= demandStats.length) {
      setDemandStartIndex(Math.max(0, demandStats.length - 3));
    }
  }, [demandStartIndex, demandStats.length]);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const pendingOrderCount = customerOrders.filter((order) => order.status === "Onay bekliyor" || order.status === "Onaylandı").length;
  const groupedCart = cart.reduce((acc, item) => {
    const key = `${item.month} / ${item.group}`;
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  const openExam = (exam) => {
    setSelectedExam(exam);
    setDraftQuantity(Number(exam.minQuantity || 1));
    setDraftNote("");
    setDraftExamDate(exam.recommendedStartDate || "");
  };

  const toggleFavorite = (examId) => setFavorites((current) => current.includes(examId) ? current.filter((id) => id !== examId) : [...current, examId]);

  const addToCart = () => {
    if (!selectedExam) return;
    if (!canOrderExam(selectedExam)) {
      setNotifications((current) => [`${selectedExam.title} şu anda siparişe açık değil.`, ...current]);
      return;
    }
    const netPrice = getNetPrice(selectedExam.listPrice, customer.discountRate);
    const newCartItem = {
      cartId: `${selectedExam.id}-${Date.now()}`,
      examId: selectedExam.id,
      title: selectedExam.title,
      brand: selectedExam.brand,
      group: selectedExam.group,
      level: selectedExam.level,
      classCategory: classFilter !== "Tümü" ? classFilter : getExamClassOptions(selectedExam).join(", "),
      month: selectedMonth.label,
      quantity: draftQuantity,
      note: draftNote,
      examDate: draftExamDate,
      unitPrice: netPrice,
      total: netPrice * draftQuantity,
    };
    setCart((current) => [newCartItem, ...current]);
    setSelectedExam(null);
    setNotifications((current) => [`${selectedExam.title} sepete eklendi.`, ...current]);
    setTimeout(() => document.getElementById("sepet")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const removeCartItem = (cartId) => setCart((current) => current.filter((item) => item.cartId !== cartId));

  const submitOrder = () => {
    if (cart.length === 0) return;
    const newOrders = cart.map((item, index) => ({
      id: `ORD-${1002 + orders.length + index}`,
      customerId: customer.id,
      institution: customer.name,
      item: item.title,
      quantity: item.quantity,
      classCategory: item.classCategory,
      examDate: item.examDate,
      note: item.note || "Not eklenmedi.",
      status: "Onay bekliyor",
      date: "Bugün",
      total: item.total,
      logs: ["Bugün - Dershane tarafından sipariş oluşturuldu."],
    }));
    setOrders((current) => [...newOrders, ...current]);
    setCart([]);
    setNotifications((current) => ["Siparişiniz Noxelera onayına gönderildi.", ...current]);
    setTimeout(() => document.getElementById("siparisler")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const cancelOrder = (orderId, itemName) => setOrders((current) => current.map((order) => order.id === orderId && order.item === itemName && order.status !== "Teslim edildi" ? { ...order, status: "İptal edildi", logs: [...(order.logs || []), "Bugün - Dershane tarafından iptal edildi."] } : order));

  const repeatOrder = (order) => {
    const exam = exams.find((e) => e.title === order.item);
    if (!exam) return;
    const netPrice = getNetPrice(exam.listPrice, customer.discountRate);
    setCart((current) => [{
      cartId: `${exam.id}-${Date.now()}`,
      examId: exam.id,
      title: exam.title,
      brand: exam.brand,
      group: exam.group,
      level: exam.level,
      classCategory: order.classCategory || getExamClassOptions(exam)[0] || exam.level,
      month: months.find((m) => m.id === exam.monthId)?.label || "",
      quantity: order.quantity,
      note: order.note,
      examDate: order.examDate,
      unitPrice: netPrice,
      total: netPrice * order.quantity,
    }, ...current]);
    setSelectedOrder(null);
    setTimeout(() => document.getElementById("sepet")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f7_0%,#fff_44%,#fff7f7_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <LogoMark />
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex"><a href="#takvim" className="hover:text-blue-700">Deneme Takvimi</a><a href="#sepet" className="hover:text-blue-700">Sepet</a><a href="#siparisler" className="hover:text-blue-700">Siparişlerim</a></nav>
          <div className="hidden items-center gap-3 md:flex">
            <div className="relative">
              <button onClick={() => setShowNotifications((value) => !value)} className="relative rounded-full border border-blue-100 bg-white p-2 text-blue-700 hover:bg-blue-50">
                <Bell size={18} />
                {notifications.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-blue-700 px-1.5 text-[10px] font-black text-white">{notifications.length}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-3xl border border-blue-100 bg-white p-4 text-slate-900 shadow-2xl">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-black text-blue-700">Bildirimler</p>
                    <button onClick={() => setNotifications([])} className="text-xs font-black text-slate-400 hover:text-blue-700">Temizle</button>
                  </div>
                  <div className="grid max-h-72 gap-2 overflow-y-auto">
                    {notifications.length === 0 ? <p className="rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-500">Yeni bildirim yok.</p> : notifications.map((item, index) => (
                      <div key={`${item}-${index}`} className="rounded-2xl bg-blue-50 p-3 text-xs font-bold leading-5 text-blue-900 ring-1 ring-blue-100">{item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowProfileSettings(true)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800">Profilim</button>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-800 ring-1 ring-blue-100"><Building2 size={16} />{profile.name}</div>
            <button onClick={onLogout} className="rounded-full border border-blue-100 p-2 text-blue-700 hover:bg-blue-50"><LogOut size={18} /></button>
          </div>
          <button className="rounded-xl border border-blue-100 p-2 md:hidden" onClick={() => setMobileMenuOpen((value) => !value)}>{mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
        {mobileMenuOpen && <div className="border-t border-blue-100 bg-white px-4 py-4 md:hidden"><div className="grid gap-3 text-sm font-bold text-slate-700"><a href="#takvim">Deneme Takvimi</a><a href="#sepet">Sepet</a><a href="#siparisler">Siparişlerim</a><button onClick={() => setShowProfileSettings(true)} className="text-left text-slate-950">Profilim</button><button onClick={onLogout} className="text-left text-blue-700">Çıkış Yap</button></div></div>}
      </header>

      {isPreview && <div className="sticky top-[89px] z-30 border-b border-amber-200 bg-amber-50/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3 text-amber-900"><Eye size={20} /><div><p className="text-sm font-black">Ön izleme modu</p><p className="text-xs font-semibold">{customer.name} hesabının göreceği ekranı inceliyorsunuz.</p></div></div><button onClick={onBackToAdmin} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800">Admin paneline geri dön</button></div></div>}

      <main>
        {activeAnnouncements.length > 0 && currentAnnouncement && (
          <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="relative">
              {activeAnnouncements.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousAnnouncement}
                    className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-lg transition hover:bg-blue-50 max-sm:left-3 max-sm:translate-x-0"
                    aria-label="Önceki duyuru"
                  >
                    <ChevronLeft size={21} />
                  </button>
                  <button
                    onClick={goToNextAnnouncement}
                    className="absolute right-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-lg transition hover:bg-blue-50 max-sm:right-3 max-sm:translate-x-0"
                    aria-label="Sonraki duyuru"
                  >
                    <ChevronRight size={21} />
                  </button>
                </>
              )}

              <div className="overflow-hidden rounded-[2.1rem] border border-blue-100 bg-white shadow-lg">
                <div className="grid min-h-[260px] lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="flex flex-col justify-between p-7 sm:p-9">
                    <div>
                      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 ring-1 ring-blue-100">
                        <Megaphone size={18} /> Kurum duyuruları
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentAnnouncement.id}
                          initial={{ opacity: 0, x: 26 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -26 }}
                          transition={{ duration: 0.35 }}
                        >
                          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{currentAnnouncement.title}</h2>
                          <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-600">{currentAnnouncement.text}</p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="mt-8 flex items-center gap-2">
                      {activeAnnouncements.map((item, index) => (
                        <span
                          key={item.id}
                          className={`h-2 rounded-full transition-all ${index === announcementIndex % activeAnnouncements.length ? "w-9 bg-blue-700" : "w-2 bg-slate-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="relative min-h-[230px] bg-slate-100">
                    {currentAnnouncement.imageUrl ? (
                      <img src={currentAnnouncement.imageUrl} alt={currentAnnouncement.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-700 to-slate-950 text-white"><Megaphone size={70} /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 ring-1 ring-blue-100">
                  <BarChart3 size={17} /> Sipariş talep oranları
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">En çok talep edilen denemeler</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                  En çok sipariş edilen denemeler öne çıkar. Talep seviyesi, listedeki lider ürüne göre hesaplanır ve sipariş oluşturuldukça anlık güncellenir.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right ring-1 ring-slate-100">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">Toplam talep</p>
                  <p className="text-xl font-black text-blue-700">{totalDemandQuantity.toLocaleString("tr-TR")} adet</p>
                </div>
                <button disabled={!canPrevDemand} onClick={() => setDemandStartIndex((value) => Math.max(value - 1, 0))} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Önceki talep kartları">
                  <ChevronLeft size={20} />
                </button>
                <button disabled={!canNextDemand} onClick={() => setDemandStartIndex((value) => Math.min(value + 1, Math.max(demandStats.length - 3, 0)))} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Sonraki talep kartları">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {demandStats.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-6 text-sm font-bold text-slate-500 ring-1 ring-slate-100">Henüz yayınlanan veya sipariş alan deneme bulunmuyor.</div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                {visibleDemandStats.map((item, index) => (
                  <motion.button
                    key={`${item.brand}-${item.title}`}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    onClick={() => openExam(item.exam)}
                    className="rounded-[1.6rem] border border-blue-100 bg-gradient-to-br from-slate-50 to-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">#{item.rank} • {item.brand}</span>
                        <h3 className="mt-4 line-clamp-2 text-lg font-black leading-snug text-slate-950">{item.title}</h3>
                        <p className="mt-2 text-xs font-bold text-slate-500">Sipariş oluşturmak için karta tıklayın.</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 text-blue-700 shadow-sm ring-1 ring-blue-100">
                        <Package size={20} />
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Toplam talep</p>
                        <p className="mt-1 text-3xl font-black text-slate-950">{item.quantity.toLocaleString("tr-TR")}</p>
                        <p className="text-xs font-bold text-slate-500">{item.orderCount} sipariş isteği</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Talep seviyesi</p>
                        <p className="mt-1 text-2xl font-black text-blue-700">%{item.demandLevel}</p>
                      </div>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-blue-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-800 transition-all" style={{ width: `${Math.max(item.demandLevel, item.quantity > 0 ? 6 : 0)}%` }} />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="overflow-hidden rounded-[2.3rem] bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 text-white shadow-2xl"><div className="relative p-7 sm:p-9"><div className="absolute right-[-6rem] top-[-8rem] h-72 w-72 rounded-full bg-white/10 blur-3xl" /><div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/90 ring-1 ring-white/15"><CalendarDays size={17} />{seasonLabel} sezon takvimi</div><h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Ayı seçin, gruba göre denemeleri görüntüleyin ve sipariş oluşturun.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">Sipariş tarihi, adet ve not bilgisi kurum tarafından belirlenebilir.</p></div><div className="grid gap-3 sm:grid-cols-3 lg:min-w-[470px]"><div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur"><ShoppingCart size={20} /><p className="mt-3 text-sm font-bold text-blue-100">Sepette</p><p className="mt-1 text-3xl font-black">{cart.length}</p></div><div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur"><Package size={20} /><p className="mt-3 text-sm font-bold text-blue-100">Toplam adet</p><p className="mt-1 text-3xl font-black">{totalQuantity}</p></div><div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur"><BadgeCheck size={20} /><p className="mt-3 text-sm font-bold text-blue-100">Aktif sipariş</p><p className="mt-1 text-3xl font-black">{pendingOrderCount}</p></div></div></div></div></div></section>

        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8"><div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-3"><Star className="text-blue-700" /><h2 className="text-2xl font-black">Yaklaşan denemeler</h2></div><div className="grid gap-3 md:grid-cols-3">{upcomingExams.map((exam) => <button key={exam.id} onClick={() => openExam(exam)} className="rounded-2xl bg-slate-50 p-4 text-left hover:bg-blue-50"><p className="font-black">{exam.title}</p><p className="mt-1 text-sm font-semibold text-slate-500">{recommendedDateText(exam)}</p></button>)}</div></div></section>

        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3"><Heart className="text-blue-700" /><h2 className="text-2xl font-black">Favorilerim</h2></div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {favorites.length === 0 && <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500 md:col-span-2 lg:col-span-3">Henüz favori deneme eklenmedi. Deneme kartlarındaki kalp ikonuna basarak favorilerine ekleyebilirsin.</div>}
                {visibleExams.filter((exam) => favorites.includes(exam.id)).map((exam) => (
                  <button key={exam.id} onClick={() => openExam(exam)} className="rounded-2xl bg-slate-50 p-4 text-left hover:bg-blue-50">
                    <p className="font-black">{exam.title}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{exam.brand} • {recommendedDateText(exam)}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3"><Bell className="text-blue-700" /><h2 className="text-2xl font-black">Hatırlatıcılarım</h2></div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reminders.filter((item) => item.active).length === 0 && <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500 md:col-span-2 lg:col-span-3">Henüz hatırlatma eklenmedi. Gelecek ay denemelerinde hatırlatma oluşturabilirsin.</div>}
              {reminders.filter((item) => item.active).map((item) => (
                <div key={item.id} className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                  <p className="font-black text-blue-950">{item.title}</p>
                  <p className="mt-1 text-sm font-semibold text-blue-700">{item.remindAt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="takvim" className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wide text-blue-700">Sezon ayları</p><h2 className="mt-2 text-3xl font-black tracking-tight">Deneme takvimi</h2></div><div className="hidden gap-2 sm:flex"><button disabled={!canPrevMonth} onClick={() => setMonthStartIndex((value) => Math.max(value - 1, 0))} className="rounded-2xl border border-blue-100 bg-white p-3 text-blue-700 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={20} /></button><button disabled={!canNextMonth} onClick={() => setMonthStartIndex((value) => Math.min(value + 1, months.length - 5))} className="rounded-2xl border border-blue-100 bg-white p-3 text-blue-700 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={20} /></button></div></div>
          <div className="grid grid-cols-[44px_1fr_44px] items-center gap-3"><button disabled={!canPrevMonth} onClick={() => setMonthStartIndex((value) => Math.max(value - 1, 0))} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-700 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={20} /></button><div className="overflow-hidden"><div className="grid gap-4 md:grid-cols-5">{visibleMonths.map((month) => <MonthCard key={month.id} month={month} selected={selectedMonthId === month.id} count={monthCounts[month.id] || 0} onClick={() => setSelectedMonthId(month.id)} />)}</div></div><button disabled={!canNextMonth} onClick={() => setMonthStartIndex((value) => Math.min(value + 1, months.length - 5))} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-700 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={20} /></button></div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="grid content-start gap-4">
              <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Grup seçimi</p><p className="mt-2 text-sm leading-6 text-slate-500">Seçtiğiniz aya ait ortaokul ve lise denemelerini ayrı ayrı görüntüleyebilirsiniz.</p><div className="mt-5 grid gap-3"><GroupTab active={selectedGroup === "Lise"} icon={<GraduationCap size={22} />} title="Lise Grubu" count={groupCounts.Lise} onClick={() => setSelectedGroup("Lise")} /><GroupTab active={selectedGroup === "Ortaokul"} icon={<School size={22} />} title="Ortaokul Grubu" count={groupCounts.Ortaokul} onClick={() => setSelectedGroup("Ortaokul")} /></div></div>
              <label className="flex items-center gap-2 rounded-[1.4rem] border border-blue-100 bg-white px-4 py-4 shadow-sm focus-within:border-blue-500"><Search size={18} className="text-blue-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Deneme ara" className="w-full bg-transparent text-sm font-bold outline-none" /></label>
              <AdminInput label="Marka" value={brandFilter} onChange={setBrandFilter} options={brands} />
              <AdminInput label="Sınıf / kategori" value={classFilter} onChange={setClassFilter} options={classFilterOptions} />
              <div className="rounded-[1.4rem] border border-blue-100 bg-white p-4 shadow-sm"><p className="mb-2 text-sm font-black text-blue-700">Favoriler</p><p className="text-sm font-semibold text-slate-500">{favorites.length} deneme favorilerde.</p></div>
            </aside>

            <section className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-blue-700">{selectedMonth.label} {selectedMonth.year} / {selectedGroup}</p><h3 className="mt-1 text-2xl font-black">Bu ayın denemeleri</h3></div><p className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">{filteredExams.length} deneme bulundu</p></div>
              {filteredExams.length === 0 ? <div className="rounded-3xl bg-slate-50 p-8 text-center"><p className="text-lg font-black">{classFilter !== "Tümü" ? `Bu sınıfın bu ay denemesi yok.` : "Bu seçim için deneme bulunmuyor."}</p><p className="mt-2 text-sm text-slate-500">Farklı ay veya grup seçerek tekrar deneyebilirsiniz.</p></div> : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredExams.map((exam) => (
                    <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-md">
                      <div className="flex items-start justify-between gap-4"><button onClick={() => openExam(exam)} className="flex-1 text-left"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">{exam.brand}</span><h4 className="mt-4 text-xl font-black leading-snug text-slate-950">{exam.title}</h4><p className="mt-2 text-sm leading-6 text-slate-600">{exam.description}</p></button><button onClick={() => toggleFavorite(exam.id)} className={`rounded-2xl p-3 shadow-sm ${favorites.includes(exam.id) ? "bg-blue-700 text-white" : "bg-white text-blue-700"}`}><Heart size={20} /></button></div>
                      <div className="mt-4 flex flex-wrap gap-2">{exam.tags.map((tag) => <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-100">{tag}</span>)}</div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white p-3"><p className="text-xs font-bold text-slate-500">Sınıf / kategori</p><p className="mt-1 font-black">{getExamClassOptions(exam).join(", ")}</p></div><div className="rounded-2xl bg-white p-3"><p className="text-xs font-bold text-slate-500">Tavsiye</p><p className="mt-1 font-black">{recommendedDateText(exam)}</p></div></div>
                      <button onClick={() => openExam(exam)} className="mt-4 w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-800">Sipariş oluştur</button>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>

        <section id="sepet" className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm"><div className="flex items-center gap-3 text-blue-700"><ShoppingCart size={24} /><h2 className="text-2xl font-black text-slate-950">Sepet</h2></div><div className="mt-5 grid gap-4">{cart.length === 0 ? <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">Henüz sepete deneme eklenmedi.</div> : Object.entries(groupedCart).map(([groupName, items]) => <div key={groupName} className="rounded-3xl bg-slate-50 p-4"><p className="mb-3 font-black text-blue-700">{groupName}</p><div className="grid gap-3">{items.map((item) => <div key={item.cartId} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100"><div className="flex items-start justify-between gap-4"><div><p className="font-black">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.month} / {item.group} / {item.classCategory || item.level}</p></div><button onClick={() => removeCartItem(item.cartId)} className="rounded-xl bg-blue-50 p-2 text-blue-700 shadow-sm hover:bg-blue-100"><Trash2 size={17} /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-[100px_150px_130px_1fr]"><div className="rounded-2xl bg-slate-50 p-3 text-center"><p className="text-xs font-bold text-slate-500">Adet</p><p className="mt-1 text-xl font-black text-blue-700">{item.quantity}</p></div><div className="rounded-2xl bg-slate-50 p-3 text-center"><p className="text-xs font-bold text-slate-500">Tarih</p><p className="mt-1 text-sm font-black text-blue-700">{formatDate(item.examDate)}</p></div><div className="rounded-2xl bg-slate-50 p-3 text-center"><p className="text-xs font-bold text-slate-500">Toplam</p><p className="mt-1 text-xl font-black text-blue-700">{formatCurrency(item.total)}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">Not</p><p className="mt-1 text-sm font-semibold text-slate-700">{item.note || "Not eklenmedi."}</p></div></div></div>)}</div></div>)}</div></div>
          <aside className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm"><h3 className="text-xl font-black">Sipariş özeti</h3><div className="mt-5 grid gap-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Ürün çeşidi</span><span className="font-black">{cart.length}</span></div><div className="flex justify-between"><span className="text-slate-500">Toplam adet</span><span className="font-black">{totalQuantity}</span></div><div className="flex justify-between border-t border-blue-100 pt-4 text-lg"><span className="font-black">Sepet toplamı</span><span className="font-black text-blue-700">{formatCurrency(cartTotal)}</span></div></div><button onClick={submitOrder} disabled={cart.length === 0} className="mt-6 w-full rounded-2xl bg-blue-700 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">Siparişi Gönder</button><p className="mt-3 text-center text-xs leading-5 text-slate-500">Sipariş gönderildikten sonra Noxelera yönetici onayına düşer.</p></aside>
        </section>

        <section id="siparisler" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"><div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-black uppercase tracking-wide text-blue-700">Takip</p><h2 className="mt-1 text-2xl font-black">Siparişlerim</h2></div></div><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead><tr className="border-b border-blue-100 text-slate-500"><th className="py-3 pr-4 font-black">Sipariş No</th><th className="py-3 pr-4 font-black">Deneme</th><th className="py-3 pr-4 font-black">Adet</th><th className="py-3 pr-4 font-black">Yapılacak Tarih</th><th className="py-3 pr-4 font-black">Toplam</th><th className="py-3 pr-4 font-black">Durum</th><th className="py-3 pr-4 font-black">İşlem</th></tr></thead><tbody>{customerOrders.map((order) => { const canCancel = order.status !== "Teslim edildi" && order.status !== "İptal edildi"; return <tr key={`${order.id}-${order.item}-${order.quantity}`} className="border-b border-slate-100"><td className="py-4 pr-4 font-black">{order.id}</td><td className="py-4 pr-4"><p className="font-bold">{order.item}</p><p className="mt-1 text-xs font-bold text-slate-400">Sınıf/Kategori: {order.classCategory || "Belirtilmedi"}</p></td><td className="py-4 pr-4">{order.quantity}</td><td className="py-4 pr-4 font-semibold">{formatDate(order.examDate)}</td><td className="py-4 pr-4 font-black text-blue-700">{formatCurrency(order.total)}</td><td className="py-4 pr-4"><StatusBadge status={order.status} /></td><td className="py-4 pr-4"><div className="flex flex-wrap gap-2"><button onClick={() => setSelectedOrder(order)} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">Detay</button><button onClick={() => repeatOrder(order)} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Tekrarla</button>{canCancel && <button onClick={() => cancelOrder(order.id, order.item)} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100">İptal et</button>}</div></td></tr>; })}</tbody></table></div></div></section>
      </main>
      <FixedCredit />
      <AnimatePresence>
        {selectedExam && <ExamDetailModal exam={selectedExam} quantity={draftQuantity} note={draftNote} examDate={draftExamDate} canOrder={canOrderExam(selectedExam)} availabilityText={orderAvailabilityText(selectedExam)} reminderActive={Boolean(reminderForExam(selectedExam))} reminderText={reminderForExam(selectedExam)?.remindAt || ""} onQuantityChange={setDraftQuantity} onNoteChange={setDraftNote} onExamDateChange={setDraftExamDate} onAddToCart={addToCart} onAddReminder={() => addReminderForExam(selectedExam)} onRemoveReminder={() => removeReminderForExam(selectedExam)} onClose={() => setSelectedExam(null)} />}
        {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onRepeat={repeatOrder} />}
        {showProfileSettings && <ProfileSettingsModal profile={profile} setProfile={setProfile} seasonLabel={seasonLabel} onClose={() => setShowProfileSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}

