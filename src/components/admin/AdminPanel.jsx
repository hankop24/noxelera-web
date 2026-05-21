import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
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
import AdminInput from "../shared/AdminInput";
import StatusBadge from "../shared/StatusBadge";
import OrderDetailModal from "../customer/OrderDetailModal";
import WarehousePanel from "./WarehousePanel";
import { MADE_BY_TEXT, MONTHS, blankCustomer, blankExam, getClassCategoryOptions } from "../../data/initialData";
import { formatCurrency, formatDate, recommendedDateText } from "../../utils/format";

function AdminStatCard({ icon, title, value, subtitle }) {
  return <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-slate-500">{title}</p><p className="mt-2 text-3xl font-black text-slate-950">{value}</p><p className="mt-2 text-xs font-semibold text-slate-500">{subtitle}</p></div><div className="rounded-2xl bg-blue-50 p-3 text-blue-700 ring-1 ring-blue-100">{icon}</div></div></div>;
}


export default function AdminPanel({ customers, setCustomers, exams, setExams, orders, setOrders, brands, setBrands, announcements, setAnnouncements, demandShowcase = [], setDemandShowcase, warehouseData, setWarehouseData, staffUsers = [], setStaffUsers, currentStaffRole = "admin", months = MONTHS, seasonStartYear, setSeasonStartYear, currentMonthId, setCurrentMonthId, seasonLabel, previewCustomerId, setPreviewCustomerId, onPortalOpen, onLogout }) {
  const [activeTab, setActiveTab] = useState(() => currentStaffRole === "admin" ? "dashboard" : "warehouse");
  const [orderFilter, setOrderFilter] = useState("Tümü");
  const [newExam, setNewExam] = useState(blankExam);
  const [newCustomer, setNewCustomer] = useState(blankCustomer);
  const [newCustomerPassword, setNewCustomerPassword] = useState("123456");
  const [newBrand, setNewBrand] = useState({ name: "", color: "Kırmızı", active: true });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", text: "", imageUrl: "", active: true });
  const [editingExamId, setEditingExamId] = useState(null);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [passwordDrafts, setPasswordDrafts] = useState({});
  const [passwordMessages, setPasswordMessages] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStaffUser, setNewStaffUser] = useState({ name: "", username: "", email: "", phone: "", title: "Personel", role: "personnel", note: "", temporaryPassword: "123456" });
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffMessage, setStaffMessage] = useState("");

  useEffect(() => {
    if (currentStaffRole !== "admin" && activeTab !== "warehouse") {
      setActiveTab("warehouse");
    }
  }, [currentStaffRole, activeTab]);
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
  const [warehouseQuery, setWarehouseQuery] = useState("");
  const [selectedShelfId, setSelectedShelfId] = useState("Tümü");
  const [newShelf, setNewShelf] = useState({ code: "", name: "", description: "", status: "Aktif" });
  const [newStockItem, setNewStockItem] = useState({ type: "Deneme", name: "", brand: "", category: "TYT", barcode: "", shelfId: "", quantity: 0, minStock: 0, status: "Aktif" });
  const safeWarehouseData = warehouseData || { shelves: [], stockItems: [], distributorTasks: [] };
  const shelfNameById = (shelfId) => safeWarehouseData.shelves.find((shelf) => shelf.id === Number(shelfId))?.code || "Raf yok";

  const totalRevenue = orders.filter((order) => order.status !== "İptal edildi").reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status === "Onay bekliyor").length;
  const approvedOrders = orders.filter((order) => order.status === "Onaylandı").length;
  const deliveredOrders = orders.filter((order) => order.status === "Teslim edildi").length;
  const activeCustomerCount = customers.filter((customer) => customer.status === "Aktif").length;
  const activeExamCount = exams.filter((exam) => exam.active).length;
  const visibleOrders = orderFilter === "Tümü" ? orders : orders.filter((order) => order.status === orderFilter);
  const demandShowcaseMap = new Map(demandShowcase.map((item) => [item.examId, item]));
  const adminDemandStats = exams
    .map((exam) => {
      const matchingOrders = orders.filter((order) => order.status !== "İptal edildi" && order.item === exam.title);
      const quantity = matchingOrders.reduce((sum, order) => sum + Number(order.quantity || 0), 0);
      const setting = demandShowcaseMap.get(exam.id);
      return {
        exam,
        quantity,
        orderCount: matchingOrders.length,
        active: setting ? setting.active : true,
      };
    })
    .sort((a, b) => b.quantity - a.quantity || a.exam.title.localeCompare(b.exam.title, "tr"));
  const activeDemandCount = adminDemandStats.filter((item) => item.active).length;
  const topDemandQuantity = Math.max(...adminDemandStats.map((item) => item.quantity), 1);
  const warehouseTotalStock = safeWarehouseData.stockItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const lowStockCount = safeWarehouseData.stockItems.filter((item) => Number(item.quantity || 0) <= Number(item.minStock || 0)).length;
  const filteredStockItems = safeWarehouseData.stockItems.filter((item) => {
    const matchesQuery = `${item.name} ${item.brand} ${item.category} ${item.barcode}`.toLowerCase().includes(warehouseQuery.toLowerCase());
    const matchesShelf = selectedShelfId === "Tümü" || Number(item.shelfId) === Number(selectedShelfId);
    return matchesQuery && matchesShelf;
  });

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "orders", label: "Siparişler", icon: <ClipboardCheck size={18} /> },
    { id: "exams", label: "Denemeler", icon: <BookOpen size={18} /> },
    { id: "customers", label: "Dershaneler", icon: <Users size={18} /> },
    { id: "pricing", label: "Fiyat & İskonto", icon: <Percent size={18} /> },
    { id: "brands", label: "Markalar", icon: <Tags size={18} /> },
    { id: "announcements", label: "Duyurular", icon: <Megaphone size={18} /> },
    { id: "demand", label: "Talep Vitrini", icon: <BarChart3 size={18} /> },
    { id: "warehouse", label: "Depo", icon: <Package size={18} /> },
    { id: "users", label: "Kullanıcılar", icon: <Users size={18} /> },
    { id: "profile", label: "Profil", icon: <Users size={18} /> },
    { id: "settings", label: "Ayarlar", icon: <Settings size={18} /> },
  ];

  const isAdminRole = currentStaffRole === "admin";
  const visibleTabs = isAdminRole ? tabs : tabs.filter((tab) => tab.id === "warehouse");
  const roleTitle = currentStaffRole === "distributor" ? "Dağıtıcı Depo Paneli" : currentStaffRole === "personnel" ? "Personel Depo Paneli" : "Admin Yönetim Paneli";
  const roleBadge = currentStaffRole === "distributor" ? "Dağıtıcı" : currentStaffRole === "personnel" ? "Depo Personeli" : "Admin";

  const addLog = (order, text) => ({ ...order, logs: [...(order.logs || []), `Bugün - ${text}`] });
  const updateOrderStatus = (id, item, status) => setOrders((current) => current.map((order) => order.id === id && order.item === item ? addLog({ ...order, status }, `Sipariş durumu '${status}' olarak güncellendi.`) : order));

  const exportOrders = () => {
    const header = "Sipariş No,Dershane,Deneme,Adet,Tarih,Tutar,Durum";
    const rows = orders.map((o) => `${o.id},${o.institution},${o.item},${o.quantity},${formatDate(o.examDate)},${Math.round(o.total)},${o.status}`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "noxelera-siparisler.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const addExam = () => {
    if (!newExam.title || !newExam.brand) return;
    const created = {
      ...newExam,
      id: Date.now(),
      listPrice: Number(newExam.listPrice || 0),
      minQuantity: Number(newExam.minQuantity || 1),
      maxQuantity: Number(newExam.maxQuantity || 999),
      tags: newExam.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
      active: true,
    };
    delete created.tagsText;
    setExams((current) => [created, ...current]);
    setNewExam(blankExam);
  };

  const updateExam = (examId, field, value) => setExams((current) => current.map((exam) => exam.id === examId ? { ...exam, [field]: ["listPrice", "minQuantity", "maxQuantity"].includes(field) ? Number(value) : field === "tagsText" ? value.split(",").map((t) => t.trim()).filter(Boolean) : value } : exam));
  const deleteExam = (examId) => setExams((current) => current.filter((exam) => exam.id !== examId));
  const toggleExam = (examId) => setExams((current) => current.map((exam) => exam.id === examId ? { ...exam, active: !exam.active } : exam));
  const toggleExamCustomerVisibility = (examId, customerId) => setExams((current) => current.map((exam) => {
    if (exam.id !== examId) return exam;
    const exists = exam.visibleCustomerIds.includes(customerId);
    return { ...exam, visibleCustomerIds: exists ? exam.visibleCustomerIds.filter((id) => id !== customerId) : [...exam.visibleCustomerIds, customerId] };
  }));

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) return;
    setCustomers((current) => [{ ...newCustomer, id: Date.now(), username: newCustomer.username || newCustomer.email, passwordSet: Boolean(newCustomerPassword), discountRate: Number(newCustomer.discountRate || 0) }, ...current]);
    setNewCustomer(blankCustomer);
    setNewCustomerPassword("123456");
  };

  const updateCustomer = (customerId, field, value) => setCustomers((current) => current.map((customer) => customer.id === customerId ? { ...customer, [field]: field === "discountRate" ? Number(value) : value } : customer));
  const deleteCustomer = (customerId) => setCustomers((current) => current.filter((customer) => customer.id !== customerId));
  const startPasswordReset = (customerId) => { setPasswordDrafts((current) => ({ ...current, [customerId]: "" })); setPasswordMessages((current) => ({ ...current, [customerId]: "" })); };
  const savePasswordReset = (customerId) => { if (!passwordDrafts[customerId]) return; setPasswordDrafts((current) => { const next = { ...current }; delete next[customerId]; return next; }); setPasswordMessages((current) => ({ ...current, [customerId]: "Şifre güncellendi. Admin eski şifreyi görüntüleyemez." })); };
  const addBrand = () => { if (!newBrand.name) return; setBrands((current) => [{ ...newBrand, id: Date.now() }, ...current]); setNewBrand({ name: "", color: "Kırmızı", active: true }); };
  const updateBrand = (brandId, field, value) => setBrands((current) => current.map((brand) => brand.id === brandId ? { ...brand, [field]: value } : brand));
  const addAnnouncement = () => { if (!newAnnouncement.title || !newAnnouncement.text) return; setAnnouncements((current) => [{ ...newAnnouncement, id: Date.now() }, ...current]); setNewAnnouncement({ title: "", text: "", imageUrl: "", active: true }); };
  const updateAnnouncement = (id, field, value) => setAnnouncements((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  const toggleDemandShowcase = (examId) => {
    if (!setDemandShowcase) return;
    setDemandShowcase((current) => {
      const exists = current.find((item) => item.examId === examId);
      if (exists) return current.map((item) => item.examId === examId ? { ...item, active: !item.active } : item);
      return [...current, { examId, active: false }];
    });
  };
  const publishAllDemandShowcase = () => {
    if (!setDemandShowcase) return;
    setDemandShowcase(exams.map((exam) => ({ examId: exam.id, active: true })));
  };
  const hideAllDemandShowcase = () => {
    if (!setDemandShowcase) return;
    setDemandShowcase(exams.map((exam) => ({ examId: exam.id, active: false })));
  };
  const handleAnnouncementImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Görsel dosyası en fazla 2 MB olmalıdır.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNewAnnouncement((current) => ({ ...current, imageUrl: reader.result, imageName: file.name }));
    reader.readAsDataURL(file);
  };
  const saveAdminProfile = () => setAdminProfileMessage("Profil bilgileri güncellendi.");
  const updateAdminPassword = () => {
    if (!adminPassword.next || adminPassword.next !== adminPassword.repeat) {
      setAdminProfileMessage("Yeni şifreler eşleşmiyor.");
      return;
    }
    setAdminPassword({ current: "", next: "", repeat: "" });
    setAdminProfileMessage("Admin şifresi güncellendi.");
  };


  const addShelf = () => {
    if (!newShelf.code || !newShelf.name) return;
    const shelf = {
      ...newShelf,
      id: Date.now(),
      qrCode: `RAF-${newShelf.code.toUpperCase().replace(/\s+/g, "-")}`,
    };
    setWarehouseData((current) => ({ ...current, shelves: [shelf, ...(current?.shelves || [])] }));
    setNewShelf({ code: "", name: "", description: "", status: "Aktif" });
  };

  const addStockItem = () => {
    if (!newStockItem.name || !newStockItem.shelfId) return;
    const item = {
      ...newStockItem,
      id: Date.now(),
      shelfId: Number(newStockItem.shelfId),
      quantity: Number(newStockItem.quantity || 0),
      minStock: Number(newStockItem.minStock || 0),
      barcode: newStockItem.barcode || `BRK-${Date.now()}`,
    };
    setWarehouseData((current) => ({ ...current, stockItems: [item, ...(current?.stockItems || [])] }));
    setNewStockItem({ type: "Deneme", name: "", brand: "", category: "TYT", barcode: "", shelfId: "", quantity: 0, minStock: 0, status: "Aktif" });
  };

  const updateStockQuantity = (itemId, delta) => {
    setWarehouseData((current) => ({
      ...current,
      stockItems: (current?.stockItems || []).map((item) => item.id === itemId ? { ...item, quantity: Math.max(0, Number(item.quantity || 0) + delta) } : item),
    }));
  };

  const deleteStockItem = (itemId) => {
    setWarehouseData((current) => ({ ...current, stockItems: (current?.stockItems || []).filter((item) => item.id !== itemId) }));
  };

  const deleteShelf = (shelfId) => {
    setWarehouseData((current) => ({
      ...current,
      shelves: (current?.shelves || []).filter((shelf) => shelf.id !== shelfId),
      stockItems: (current?.stockItems || []).map((item) => item.shelfId === shelfId ? { ...item, shelfId: "" } : item),
    }));
  };

  const generateTempPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };
  const addStaffUser = () => {
    if (!setStaffUsers || !newStaffUser.name.trim()) return;
    const username = (newStaffUser.username || newStaffUser.name).trim().toLowerCase().replace(/\s+/g, ".");
    if (staffUsers.some((user) => user.username === username)) {
      setStaffMessage("Bu kullanıcı adı zaten var.");
      return;
    }
    setStaffUsers((current) => [{ ...newStaffUser, id: Date.now(), username, active: true, mustChangePassword: true }, ...current]);
    setStaffMessage(`Kullanıcı oluşturuldu. Geçici şifre: ${newStaffUser.temporaryPassword}`);
    setNewStaffUser({ name: "", username: "", email: "", phone: "", title: "Personel", role: "personnel", note: "", temporaryPassword: "123456" });
  };
  const updateStaffUser = (id, field, value) => setStaffUsers?.((current) => current.map((user) => user.id === id ? { ...user, [field]: value } : user));
  const toggleStaffUser = (id) => setStaffUsers?.((current) => current.map((user) => user.id === id ? { ...user, active: !user.active } : user));
  const deleteStaffUser = (id) => setStaffUsers?.((current) => current.filter((user) => user.id !== id));
  const resetStaffPassword = (id) => {
    const temp = generateTempPassword();
    setStaffUsers?.((current) => current.map((user) => user.id === id ? { ...user, mustChangePassword: true, temporaryPassword: temp } : user));
    setStaffMessage(`Geçici şifre oluşturuldu: ${temp}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <style>{`
        .admin-side-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(96, 165, 250, 0.55) transparent;
        }
        .admin-side-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .admin-side-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-side-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(59,130,246,0.8) 0%, rgba(29,78,216,0.95) 100%);
          border-radius: 999px;
          border: 2px solid rgba(2, 6, 23, 0.85);
        }
        .admin-side-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(96,165,250,0.95) 0%, rgba(37,99,235,1) 100%);
        }
      `}</style>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[290px] flex-col border-r border-slate-200 bg-slate-950 p-5 text-white lg:flex">
        <LogoMark dark />
        <div className="relative mt-8 min-h-0 flex-1">
          <div className="admin-side-scroll h-full overflow-y-auto pr-2 pb-6">
            <div className="grid gap-2 rounded-[1.6rem] bg-white/[0.03] p-1">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`sidebar-menu-button group grid h-[54px] min-h-[54px] w-full grid-cols-[28px_1fr] items-center gap-3 rounded-[1.15rem] px-4 py-0 text-sm font-black transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white ring-1 ring-blue-400/40"
                      : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <span className={`sidebar-menu-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                    activeTab === tab.id
                      ? "bg-white/15 text-white"
                      : "bg-white/[0.04] text-slate-300 group-hover:bg-white/[0.08] group-hover:text-white"
                  }`}>
                    {tab.icon}
                  </span>
                  <span className="sidebar-menu-label flex h-full items-center whitespace-nowrap leading-none">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">{isAdminRole && <button onClick={onPortalOpen} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 hover:bg-blue-50"><Eye size={17} />Seçili kurumu ön izle</button>}<button onClick={onLogout} className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/15"><LogOut size={17} />Çıkış Yap</button></div>
      </aside>

      <main className="lg:pl-[290px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-wide text-blue-700">Noxelera</p>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">{roleTitle}</h1>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">{roleBadge}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)} className="min-w-[190px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none lg:hidden">{visibleTabs.map((tab) => <option key={tab.id} value={tab.id}>{tab.label}</option>)}</select>
              {isAdminRole && (
                <>
                  <select value={previewCustomerId} onChange={(e) => setPreviewCustomerId(Number(e.target.value))} className="min-w-[210px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none">{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select>
                  <button onClick={onPortalOpen} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800">Ön İzle</button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {activeTab === "dashboard" && <div className="grid gap-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><AdminStatCard icon={<ShoppingCart size={22} />} title="Toplam Sipariş" value={orders.length} subtitle={`${pendingOrders} onay bekliyor`} /><AdminStatCard icon={<BarChart3 size={22} />} title="Ciro" value={formatCurrency(totalRevenue)} subtitle="İptaller hariç toplam" /><AdminStatCard icon={<BookOpen size={22} />} title="Aktif Deneme" value={activeExamCount} subtitle={`${exams.length} kayıt içinde`} /><AdminStatCard icon={<Store size={22} />} title="Aktif Dershane" value={activeCustomerCount} subtitle={`${customers.length} toplam kurum`} /></div><div className="grid gap-6 xl:grid-cols-[1fr_420px]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-black uppercase tracking-wide text-blue-700">Son siparişler</p><h2 className="text-2xl font-black">Sipariş akışı</h2></div><button onClick={() => setActiveTab("orders")} className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Tümünü gör</button></div><div className="grid gap-3">{orders.slice(0, 5).map((order) => <button key={`${order.id}-${order.item}`} onClick={() => setSelectedOrder(order)} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 text-left hover:bg-blue-50"><div><p className="font-black">{order.item}</p><p className="mt-1 text-sm text-slate-500">{order.institution} • {order.quantity} adet • {formatDate(order.examDate)}</p></div><div className="text-right"><StatusBadge status={order.status} /><p className="mt-2 font-black text-blue-700">{formatCurrency(order.total)}</p></div></button>)}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Durum özeti</p><h2 className="mt-1 text-2xl font-black">Operasyon</h2><div className="mt-5 grid gap-3">{[["Onay bekliyor", pendingOrders], ["Onaylandı", approvedOrders], ["Teslim edildi", deliveredOrders]].map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><div className="flex justify-between text-sm font-black"><span>{label}</span><span>{value}</span></div><div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-blue-700" style={{ width: `${Math.min((value / Math.max(orders.length, 1)) * 100, 100)}%` }} /></div></div>)}</div></div></div></div>}

          {activeTab === "orders" && <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-blue-700">Sipariş yönetimi</p><h2 className="text-2xl font-black">Tüm siparişler</h2></div><div className="flex gap-2"><button onClick={exportOrders} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white"><Download size={16} className="mr-2 inline" />CSV indir</button><select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black outline-none"><option>Tümü</option><option>Onay bekliyor</option><option>Onaylandı</option><option>Teslim edildi</option><option>İptal edildi</option></select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[1150px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-3 pr-4 font-black">No</th><th className="py-3 pr-4 font-black">Dershane</th><th className="py-3 pr-4 font-black">Deneme</th><th className="py-3 pr-4 font-black">Adet</th><th className="py-3 pr-4 font-black">Tarih</th><th className="py-3 pr-4 font-black">Tutar</th><th className="py-3 pr-4 font-black">Durum</th><th className="py-3 pr-4 font-black">İşlem</th></tr></thead><tbody>{visibleOrders.map((order) => { const delivered = order.status === "Teslim edildi"; return <tr key={`${order.id}-${order.item}`} className="border-b border-slate-100"><td className="py-4 pr-4 font-black">{order.id}</td><td className="py-4 pr-4">{order.institution}</td><td className="py-4 pr-4 font-bold">{order.item}</td><td className="py-4 pr-4">{order.quantity}</td><td className="py-4 pr-4">{formatDate(order.examDate)}</td><td className="py-4 pr-4 font-black text-blue-700">{formatCurrency(order.total)}</td><td className="py-4 pr-4"><StatusBadge status={order.status} /></td><td className="py-4 pr-4">{delivered ? <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">Teslim edildi, işlem kapalı</span> : <div className="flex flex-wrap gap-2"><button onClick={() => setSelectedOrder(order)} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">Detay</button><button onClick={() => updateOrderStatus(order.id, order.item, "Onaylandı")} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Onayla</button><button onClick={() => updateOrderStatus(order.id, order.item, "Teslim edildi")} className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">Teslim</button><button onClick={() => updateOrderStatus(order.id, order.item, "İptal edildi")} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200">İptal</button></div>}</td></tr>; })}</tbody></table></div></div>}

          {activeTab === "exams" && <div className="grid gap-6 xl:grid-cols-[410px_1fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-wide text-blue-700">Yeni deneme</p><h2 className="mb-5 text-2xl font-black">Deneme ekle</h2>
              <div className="grid gap-4">
                <AdminInput label="Deneme adı" value={newExam.title} onChange={(v) => setNewExam({ ...newExam, title: v })} />
                <AdminInput label="Marka" value={newExam.brand} onChange={(v) => setNewExam({ ...newExam, brand: v })} options={brands.map((b) => b.name)} />
                <AdminInput label="Grup" value={newExam.group} onChange={(v) => setNewExam({ ...newExam, group: v, level: getClassCategoryOptions(v)[0] })} options={["Lise", "Ortaokul"]} />
                <AdminInput label="Sınıf / Kategori" value={newExam.level} onChange={(v) => setNewExam({ ...newExam, level: v })} options={getClassCategoryOptions(newExam.group)} />
                <AdminInput label="Ay" value={newExam.monthId} onChange={(v) => setNewExam({ ...newExam, monthId: v })} options={months.map((m) => ({ value: m.id, label: `${m.label} ${m.year}` }))} />
                <div className="grid gap-3 sm:grid-cols-2"><AdminInput label="Tavsiye başlangıç" type="date" value={newExam.recommendedStartDate} onChange={(v) => setNewExam({ ...newExam, recommendedStartDate: v })} /><AdminInput label="Tavsiye bitiş" type="date" value={newExam.recommendedEndDate} onChange={(v) => setNewExam({ ...newExam, recommendedEndDate: v })} /></div>
                <AdminInput label="Son sipariş tarihi" type="date" value={newExam.orderDeadline} onChange={(v) => setNewExam({ ...newExam, orderDeadline: v })} />
                <AdminInput label="Liste fiyatı" type="number" value={newExam.listPrice} onChange={(v) => setNewExam({ ...newExam, listPrice: v })} />
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2"><AdminInput label="Min adet" type="number" value={newExam.minQuantity} onChange={(v) => setNewExam({ ...newExam, minQuantity: v })} /><AdminInput label="Maks adet" type="number" value={newExam.maxQuantity} onChange={(v) => setNewExam({ ...newExam, maxQuantity: v })} /></div>
                <AdminInput label="Görünürlük" value={newExam.visibility} onChange={(v) => setNewExam({ ...newExam, visibility: v })} options={[{ value: "all", label: "Tüm dershaneler" }, { value: "selected", label: "Seçili dershaneler" }]} />
                <AdminInput label="Etiketler" value={newExam.tagsText} onChange={(v) => setNewExam({ ...newExam, tagsText: v })} />
                <label className="grid min-w-0 gap-2"><span className="text-xs font-black uppercase tracking-wide text-slate-500">Açıklama</span><textarea value={newExam.description} onChange={(e) => setNewExam({ ...newExam, description: e.target.value })} className="h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white" /></label>
                <button onClick={addExam} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"><Plus size={17} className="mr-2 inline" />Deneme ekle</button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Deneme yönetimi</p><h2 className="mb-5 text-2xl font-black">Kayıtlı denemeler</h2><div className="grid gap-3">{exams.map((exam) => <div key={exam.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">{exam.brand}</span><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{exam.group}</span><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{exam.active ? "Aktif" : "Pasif"}</span></div><p className="mt-3 text-lg font-black">{exam.title}</p><p className="mt-1 text-sm text-slate-500">{exam.level} • {recommendedDateText(exam)} • Son sipariş: {formatDate(exam.orderDeadline)} • Liste: {formatCurrency(exam.listPrice)}</p>{exam.visibility === "selected" && <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100"><p className="mb-2 text-xs font-black text-slate-500">Görünecek kurumlar</p><div className="flex flex-wrap gap-2">{customers.map((c) => <button key={c.id} onClick={() => toggleExamCustomerVisibility(exam.id, c.id)} className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${exam.visibleCustomerIds.includes(c.id) ? "bg-blue-700 text-white ring-blue-700" : "bg-white text-slate-600 ring-slate-200"}`}>{c.name}</button>)}</div></div>}</div><div className="flex flex-wrap gap-2"><button onClick={() => setEditingExamId(editingExamId === exam.id ? null : exam.id)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">{editingExamId === exam.id ? "Kaydet" : "Düzenle"}</button><button onClick={() => toggleExam(exam.id)} className="rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 ring-1 ring-amber-100">{exam.active ? "Pasifleştir" : "Aktifleştir"}</button><button onClick={() => deleteExam(exam.id)} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Sil</button></div></div>{editingExamId === exam.id && <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 md:grid-cols-2 xl:grid-cols-3"><AdminInput label="Ad" value={exam.title} onChange={(v) => updateExam(exam.id, "title", v)} /><AdminInput label="Marka" value={exam.brand} onChange={(v) => updateExam(exam.id, "brand", v)} options={brands.map((b) => b.name)} /><AdminInput label="Grup" value={exam.group} onChange={(v) => { updateExam(exam.id, "group", v); updateExam(exam.id, "level", getClassCategoryOptions(v)[0]); }} options={["Lise", "Ortaokul"]} /><AdminInput label="Sınıf / Kategori" value={exam.level} onChange={(v) => updateExam(exam.id, "level", v)} options={getClassCategoryOptions(exam.group)} /><AdminInput label="Ay" value={exam.monthId} onChange={(v) => updateExam(exam.id, "monthId", v)} options={months.map((m) => ({ value: m.id, label: `${m.label} ${m.year}` }))} /><AdminInput label="Tavsiye başlangıç" type="date" value={exam.recommendedStartDate} onChange={(v) => updateExam(exam.id, "recommendedStartDate", v)} /><AdminInput label="Tavsiye bitiş" type="date" value={exam.recommendedEndDate} onChange={(v) => updateExam(exam.id, "recommendedEndDate", v)} /><AdminInput label="Son sipariş" type="date" value={exam.orderDeadline} onChange={(v) => updateExam(exam.id, "orderDeadline", v)} /><AdminInput label="Liste fiyatı" type="number" value={exam.listPrice} onChange={(v) => updateExam(exam.id, "listPrice", v)} /><AdminInput label="Görünürlük" value={exam.visibility} onChange={(v) => updateExam(exam.id, "visibility", v)} options={[{ value: "all", label: "Tüm kurumlar" }, { value: "selected", label: "Seçili kurumlar" }]} /><AdminInput label="Min adet" type="number" value={exam.minQuantity} onChange={(v) => updateExam(exam.id, "minQuantity", v)} /><AdminInput label="Maks adet" type="number" value={exam.maxQuantity} onChange={(v) => updateExam(exam.id, "maxQuantity", v)} />{exam.visibility === "selected" && <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 md:col-span-2 xl:col-span-3"><p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Seçili kurumlar</p><div className="flex flex-wrap gap-2">{customers.map((c) => <button key={c.id} onClick={() => toggleExamCustomerVisibility(exam.id, c.id)} className={`rounded-full px-3 py-2 text-xs font-black ring-1 ${exam.visibleCustomerIds.includes(c.id) ? "bg-blue-700 text-white ring-blue-700" : "bg-white text-slate-600 ring-slate-200"}`}>{c.name}</button>)}</div></div>}</div>}</div>)}</div></div>
          </div>}

          {activeTab === "customers" && <div className="grid gap-6 xl:grid-cols-[390px_1fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Yeni kurum</p><h2 className="mb-5 text-2xl font-black">Kurum ekle</h2><div className="grid gap-4"><AdminInput label="Kurum adı" value={newCustomer.name} onChange={(v) => setNewCustomer({ ...newCustomer, name: v })} /><AdminInput label="Kullanıcı adı" value={newCustomer.username} onChange={(v) => setNewCustomer({ ...newCustomer, username: v })} /><AdminInput label="E-posta" value={newCustomer.email} onChange={(v) => setNewCustomer({ ...newCustomer, email: v })} /><AdminInput label="Telefon" value={newCustomer.phone} onChange={(v) => setNewCustomer({ ...newCustomer, phone: v })} /><AdminInput label="Şehir" value={newCustomer.city} onChange={(v) => setNewCustomer({ ...newCustomer, city: v })} /><AdminInput label="İskonto %" type="number" value={newCustomer.discountRate} onChange={(v) => setNewCustomer({ ...newCustomer, discountRate: v })} /><AdminInput label="Geçici şifre" type="password" value={newCustomerPassword} onChange={setNewCustomerPassword} /><AdminInput label="Durum" value={newCustomer.status} onChange={(v) => setNewCustomer({ ...newCustomer, status: v })} options={["Aktif", "Pasif"]} /><button onClick={addCustomer} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"><Plus size={17} className="mr-2 inline" />Kurum ekle</button></div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Kurum yönetimi</p><h2 className="mb-5 text-2xl font-black">Kayıtlı kurumlar</h2><div className="grid gap-3">{customers.map((customer) => { const editing = editingCustomerId === customer.id; return <div key={customer.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="grid flex-1 gap-3 md:grid-cols-2">{editing ? <><AdminInput label="Kurum" value={customer.name} onChange={(v) => updateCustomer(customer.id, "name", v)} /><AdminInput label="Kullanıcı adı" value={customer.username || customer.email} onChange={(v) => updateCustomer(customer.id, "username", v)} /><AdminInput label="E-posta" value={customer.email} onChange={(v) => updateCustomer(customer.id, "email", v)} /><AdminInput label="Telefon" value={customer.phone} onChange={(v) => updateCustomer(customer.id, "phone", v)} /><AdminInput label="Şehir" value={customer.city} onChange={(v) => updateCustomer(customer.id, "city", v)} /><AdminInput label="İskonto %" type="number" value={customer.discountRate} onChange={(v) => updateCustomer(customer.id, "discountRate", v)} /><AdminInput label="Durum" value={customer.status} onChange={(v) => updateCustomer(customer.id, "status", v)} options={["Aktif", "Pasif"]} /></> : <div className="md:col-span-2"><p className="text-lg font-black">{customer.name}</p><p className="mt-1 text-sm text-slate-500">{customer.email} • {customer.phone} • {customer.city}</p><p className="mt-1 text-xs font-bold text-slate-400">Kullanıcı adı: {customer.username || customer.email}</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">%{customer.discountRate} iskonto</span><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{customer.status}</span></div></div>}</div><div className="flex flex-wrap gap-2"><button onClick={() => setPreviewCustomerId(customer.id)} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Ön izle</button><button onClick={() => setEditingCustomerId(editing ? null : customer.id)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">{editing ? "Kaydet" : "Düzenle"}</button><button onClick={() => startPasswordReset(customer.id)} className="rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 ring-1 ring-amber-100">Şifre yenile</button><button onClick={() => deleteCustomer(customer.id)} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Sil</button></div></div>{passwordDrafts[customer.id] !== undefined && <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-amber-100 md:grid-cols-[1fr_auto]"><AdminInput label="Yeni şifre" type="password" value={passwordDrafts[customer.id]} onChange={(v) => setPasswordDrafts((current) => ({ ...current, [customer.id]: v }))} /><button onClick={() => savePasswordReset(customer.id)} className="self-end rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Şifreyi güncelle</button><p className="text-xs font-semibold text-slate-500 md:col-span-2">Admin mevcut şifreyi göremez; yalnızca yeni şifre tanımlayabilir.</p></div>}{passwordMessages[customer.id] && <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">{passwordMessages[customer.id]}</p>}</div>; })}</div></div></div>}

          {activeTab === "pricing" && <div className="grid gap-6 xl:grid-cols-2"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Kurum bazlı iskonto</p><h2 className="mb-5 text-2xl font-black">İskonto ayarları</h2><div className="grid gap-3">{customers.map((customer) => <div key={customer.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"><div><p className="font-black">{customer.name}</p><p className="mt-1 text-xs font-semibold text-slate-500">Bu oran sepette toplam fiyata yansır.</p></div><div className="flex items-center gap-2"><input type="number" value={customer.discountRate} onChange={(e) => updateCustomer(customer.id, "discountRate", e.target.value)} className="w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-center font-black outline-none focus:border-blue-500" /><span className="font-black text-blue-700">%</span></div></div>)}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Ürün fiyatları</p><h2 className="mb-5 text-2xl font-black">Liste fiyatı yönetimi</h2><div className="grid gap-3">{exams.map((exam) => <div key={exam.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"><div><p className="font-black">{exam.title}</p><p className="mt-1 text-xs font-semibold text-slate-500">{exam.brand} • {exam.level}</p></div><div className="flex items-center gap-2"><input type="number" value={exam.listPrice} onChange={(e) => updateExam(exam.id, "listPrice", e.target.value)} className="w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-center font-black outline-none focus:border-blue-500" /><span className="font-black text-blue-700">₺</span></div></div>)}</div></div></div>}

          {activeTab === "brands" && <div className="grid gap-6 xl:grid-cols-[390px_1fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Yeni marka</p><h2 className="mb-2 text-2xl font-black">Marka ekle</h2><p className="mb-5 text-sm font-semibold leading-6 text-slate-500">Etiket rengi, marka kartlarında küçük görsel etiket rengi olarak kullanılacak opsiyonel bir alandır.</p><div className="grid gap-4"><AdminInput label="Marka adı" value={newBrand.name} onChange={(v) => setNewBrand({ ...newBrand, name: v })} /><AdminInput label="Etiket rengi (opsiyonel)" value={newBrand.color} onChange={(v) => setNewBrand({ ...newBrand, color: v })} /><button onClick={addBrand} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800">Marka ekle</button></div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Marka yönetimi</p><h2 className="mb-5 text-2xl font-black">Markalar</h2><div className="grid gap-3">{brands.map((brand) => <div key={brand.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"><div><p className="font-black">{brand.name}</p><p className="text-sm font-semibold text-slate-500">Renk: {brand.color}</p></div><button onClick={() => updateBrand(brand.id, "active", !brand.active)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">{brand.active ? "Aktif" : "Pasif"}</button></div>)}</div></div></div>}

          {activeTab === "announcements" && <div className="grid gap-6 xl:grid-cols-[390px_1fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Yeni duyuru</p><h2 className="mb-5 text-2xl font-black">Duyuru ekle</h2><div className="grid gap-4"><AdminInput label="Başlık" value={newAnnouncement.title} onChange={(v) => setNewAnnouncement({ ...newAnnouncement, title: v })} /><AdminInput label="Görsel URL" value={newAnnouncement.imageUrl || ""} onChange={(v) => setNewAnnouncement({ ...newAnnouncement, imageUrl: v })} /><label className="grid min-w-0 gap-2"><span className="text-xs font-black uppercase tracking-wide text-slate-500">Görsel dosyası ekle</span><input type="file" accept="image/*" onChange={(e) => handleAnnouncementImageFile(e.target.files?.[0])} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none file:mr-3 file:rounded-full file:border-0 file:bg-blue-700 file:px-3 file:py-1.5 file:text-xs file:font-black file:text-white" /><p className="text-xs font-semibold text-slate-500">En fazla 2 MB. Dosya seçilirse duyuruda kullanılır.</p></label><label className="grid min-w-0 gap-2"><span className="text-xs font-black uppercase tracking-wide text-slate-500">Duyuru metni</span><textarea value={newAnnouncement.text} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, text: e.target.value })} className="h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white" /></label><button onClick={addAnnouncement} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800">Duyuru ekle</button></div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Duyuru yönetimi</p><h2 className="mb-5 text-2xl font-black">Duyurular</h2><div className="grid gap-3">{announcements.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><div className="flex gap-4"><div className="h-20 w-28 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">{item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-blue-700"><Megaphone size={24} /></div>}</div><div className="flex-1"><p className="font-black">{item.title}</p><p className="mt-1 text-sm font-semibold text-slate-500">{item.text}</p></div></div><button onClick={() => updateAnnouncement(item.id, "active", !item.active)} className="mt-3 rounded-full bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">{item.active ? "Yayından kaldır" : "Yayınla"}</button></div>)}</div></div></div>}

          {activeTab === "demand" && <div className="grid gap-6 xl:grid-cols-[420px_1fr]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Talep vitrini</p><h2 className="mb-3 text-2xl font-black">Kurum panelinde görünecek ürünler</h2><p className="text-sm font-semibold leading-6 text-slate-500">Bu bölüm kurum sayfasında duyuruların altında görünür. En çok sipariş edilen ürünler otomatik olarak öne sıralanır. Maksimum 10 ürün listelenir.</p><div className="mt-5 grid gap-3"><div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100"><p className="text-xs font-black uppercase tracking-wide text-blue-600">Yayındaki ürün</p><p className="mt-1 text-3xl font-black text-blue-800">{activeDemandCount}</p></div><div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><p className="text-xs font-black uppercase tracking-wide text-slate-500">Sıralama mantığı</p><p className="mt-1 text-sm font-bold leading-6 text-slate-700">Sipariş adedi yüksek olan denemeler otomatik olarak en öne gelir. Pasif ürünler kurum tarafında görünmez.</p></div><div className="grid gap-2 sm:grid-cols-2"><button onClick={publishAllDemandShowcase} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800">Tümünü yayınla</button><button onClick={hideAllDemandShowcase} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800">Tümünü pasifleştir</button></div></div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-blue-700">Ürün yönetimi</p><h2 className="text-2xl font-black">Talep kartları</h2></div><p className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">Maks. 10 ürün gösterilir</p></div><div className="grid gap-3">{adminDemandStats.map((item, index) => { const demandLevel = Math.round((item.quantity / topDemandQuantity) * 100); return <div key={item.exam.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">#{index + 1}</span><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{item.exam.brand}</span><span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${item.active ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-500 ring-slate-200"}`}>{item.active ? "Yayında" : "Pasif"}</span></div><p className="font-black text-slate-950">{item.exam.title}</p><p className="mt-1 text-sm font-semibold text-slate-500">{item.quantity.toLocaleString("tr-TR")} adet • {item.orderCount} sipariş isteği • Talep seviyesi %{demandLevel}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-700" style={{ width: `${Math.max(demandLevel, item.quantity > 0 ? 6 : 0)}%` }} /></div></div><button onClick={() => toggleDemandShowcase(item.exam.id)} className={`rounded-2xl px-4 py-3 text-sm font-black ${item.active ? "bg-slate-950 text-white hover:bg-slate-800" : "bg-blue-700 text-white hover:bg-blue-800"}`}>{item.active ? "Pasife çek" : "Yayınla"}</button></div></div>; })}</div></div></div>}

          {activeTab === "warehouse" && (
            <WarehousePanel
              orders={orders}
              setOrders={setOrders}
              warehouseData={safeWarehouseData}
              setWarehouseData={setWarehouseData}
              currentStaffRole={currentStaffRole}
              staffUsers={staffUsers}
            />
          )}

          {activeTab === "users" && <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-wide text-blue-700">Yeni kullanıcı</p>
              <h2 className="mb-5 text-2xl font-black">Personel / dağıtıcı ekle</h2>
              <div className="grid gap-4">
                <AdminInput label="Ad soyad" value={newStaffUser.name} onChange={(v) => setNewStaffUser({ ...newStaffUser, name: v })} />
                <AdminInput label="Kullanıcı adı" value={newStaffUser.username} onChange={(v) => setNewStaffUser({ ...newStaffUser, username: v })} />
                <AdminInput label="E-posta" value={newStaffUser.email} onChange={(v) => setNewStaffUser({ ...newStaffUser, email: v })} />
                <AdminInput label="Telefon" value={newStaffUser.phone} onChange={(v) => setNewStaffUser({ ...newStaffUser, phone: v })} />
                <AdminInput label="Unvan" value={newStaffUser.title} onChange={(v) => setNewStaffUser({ ...newStaffUser, title: v })} />
                <AdminInput label="Rol" value={newStaffUser.role} onChange={(v) => setNewStaffUser({ ...newStaffUser, role: v, title: v === "admin" ? "Admin" : v === "distributor" ? "Dağıtıcı" : "Depo Personeli" })} options={[{ value: "admin", label: "Admin" }, { value: "personnel", label: "Personel" }, { value: "distributor", label: "Dağıtıcı" }]} />
                <AdminInput label="Geçici şifre" value={newStaffUser.temporaryPassword} onChange={(v) => setNewStaffUser({ ...newStaffUser, temporaryPassword: v })} />
                <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-wide text-slate-500">Not</span><textarea value={newStaffUser.note} onChange={(e) => setNewStaffUser({ ...newStaffUser, note: e.target.value })} className="h-24 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white" /></label>
                <button onClick={addStaffUser} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800">Kullanıcı ekle</button>
                {staffMessage && <p className="rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-700 ring-1 ring-blue-100">{staffMessage}</p>}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-wide text-blue-700">Kullanıcı yönetimi</p>
              <h2 className="mb-5 text-2xl font-black">Admin / personel / dağıtıcı</h2>
              <div className="grid gap-3">
                {staffUsers.map((user) => {
                  const editing = editingStaffId === user.id;
                  return <div key={user.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="grid flex-1 gap-3 md:grid-cols-2">
                        {editing ? <>
                          <AdminInput label="Ad soyad" value={user.name} onChange={(v) => updateStaffUser(user.id, "name", v)} />
                          <AdminInput label="Kullanıcı adı" value={user.username} onChange={(v) => updateStaffUser(user.id, "username", v)} />
                          <AdminInput label="E-posta" value={user.email} onChange={(v) => updateStaffUser(user.id, "email", v)} />
                          <AdminInput label="Telefon" value={user.phone} onChange={(v) => updateStaffUser(user.id, "phone", v)} />
                          <AdminInput label="Unvan" value={user.title} onChange={(v) => updateStaffUser(user.id, "title", v)} />
                          <AdminInput label="Rol" value={user.role} onChange={(v) => updateStaffUser(user.id, "role", v)} options={[{ value: "admin", label: "Admin" }, { value: "personnel", label: "Personel" }, { value: "distributor", label: "Dağıtıcı" }]} />
                        </> : <div className="md:col-span-2"><p className="text-lg font-black">{user.name}</p><p className="mt-1 text-sm font-semibold text-slate-500">{user.username} • {user.email} • {user.phone}</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">{user.title}</span><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{user.role === "admin" ? "Admin" : user.role === "distributor" ? "Dağıtıcı" : "Personel"}</span><span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${user.active ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-500 ring-slate-200"}`}>{user.active ? "Aktif" : "Pasif"}</span>{user.mustChangePassword && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">Şifre değişimi gerekli</span>}</div></div>}
                      </div>
                      <div className="flex flex-wrap gap-2"><button onClick={() => setEditingStaffId(editing ? null : user.id)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">{editing ? "Kaydet" : "Düzenle"}</button><button onClick={() => resetStaffPassword(user.id)} className="rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 ring-1 ring-amber-100">Şifre sıfırla</button><button onClick={() => toggleStaffUser(user.id)} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">{user.active ? "Pasifleştir" : "Aktifleştir"}</button><button onClick={() => deleteStaffUser(user.id)} className="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100">Sil</button></div>
                    </div>
                  </div>;
                })}
              </div>
            </div>
          </div>}

          {activeTab === "profile" && <div className="grid gap-6 xl:grid-cols-[1fr_420px]"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Admin profili</p><h2 className="mb-5 text-2xl font-black">Hesap bilgileri</h2><div className="grid gap-4 md:grid-cols-2"><AdminInput label="Kullanıcı adı" value={adminProfile.username} onChange={(v) => setAdminProfile({ ...adminProfile, username: v })} /><AdminInput label="Rol" value={adminProfile.role} onChange={(v) => setAdminProfile({ ...adminProfile, role: v })} options={["Süper Admin", "Yönetici", "Operasyon"]} /><AdminInput label="İsim" value={adminProfile.firstName} onChange={(v) => setAdminProfile({ ...adminProfile, firstName: v })} /><AdminInput label="Soyisim" value={adminProfile.lastName} onChange={(v) => setAdminProfile({ ...adminProfile, lastName: v })} /><AdminInput label="E-posta" value={adminProfile.email} onChange={(v) => setAdminProfile({ ...adminProfile, email: v })} /><AdminInput label="Telefon" value={adminProfile.phone} onChange={(v) => setAdminProfile({ ...adminProfile, phone: v })} /></div><button onClick={saveAdminProfile} className="mt-5 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800">Profili kaydet</button>{adminProfileMessage && <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">{adminProfileMessage}</p>}</div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Güvenlik</p><h2 className="mb-5 text-2xl font-black">Şifre güncelle</h2><div className="grid gap-4"><AdminInput label="Mevcut şifre" type="password" value={adminPassword.current} onChange={(v) => setAdminPassword({ ...adminPassword, current: v })} /><AdminInput label="Yeni şifre" type="password" value={adminPassword.next} onChange={(v) => setAdminPassword({ ...adminPassword, next: v })} /><AdminInput label="Yeni şifre tekrar" type="password" value={adminPassword.repeat} onChange={(v) => setAdminPassword({ ...adminPassword, repeat: v })} /><button onClick={updateAdminPassword} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">Şifreyi güncelle</button><p className="text-xs font-semibold leading-5 text-slate-500">Demo sürümde şifre tarayıcı içinde simüle edilir. Gerçek veritabanına geçince bu alan güvenli kimlik doğrulama ile çalışacak.</p></div></div></div>}

          {activeTab === "settings" && <div className="grid gap-6 xl:grid-cols-2"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Sistem ayarları</p><h2 className="mb-5 text-2xl font-black">Portal görünümü</h2><div className="grid gap-4"><div className="rounded-2xl bg-slate-50 p-4"><p className="mb-3 font-black">Sezon ayarları</p><div className="grid gap-3 sm:grid-cols-2"><AdminInput label="Sezon başlangıç yılı" type="number" value={seasonStartYear} onChange={(v) => { const year = Number(v) || 2025; setSeasonStartYear(year); setCurrentMonthId(`mayis-${year + 1}`); }} /><AdminInput label="Geçerli ay" value={currentMonthId} onChange={setCurrentMonthId} options={months.map((m) => ({ value: m.id, label: `${m.label} ${m.year}` }))} /></div><p className="mt-3 text-sm font-semibold text-slate-500">Aktif sezon: {seasonLabel}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="font-black">Logo dosyası</p><p className="mt-1 text-sm text-slate-500">public/noxelera-logo.png dosyası kullanılıyor.</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="font-black">Sezon aralığı</p><p className="mt-1 text-sm text-slate-500">{seasonLabel}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="font-black">Geliştirici ibaresi</p><p className="mt-1 text-sm text-slate-500">{MADE_BY_TEXT}</p></div></div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Sonraki aşama</p><h2 className="mb-5 text-2xl font-black">Veritabanı bağlantısı</h2><div className="rounded-2xl bg-blue-50 p-4 text-sm font-bold leading-6 text-blue-900 ring-1 ring-blue-100">Bu panel şu an demo veriyle çalışıyor. Firebase/Supabase bağlandığında tüm deneme, kurum, sipariş, duyuru ve fiyat verileri kalıcı hale gelecek.</div></div></div>}
        </div>
      </main>
      <AnimatePresence>{selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}</AnimatePresence>
    </div>
  );
}

