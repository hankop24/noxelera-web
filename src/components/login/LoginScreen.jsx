import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Badge, LayoutDashboard, School, Truck } from "lucide-react";
import { LOGO_SRC } from "../../data/initialData";
import FixedCredit from "../common/DeveloperCredit";
import AdminInput from "../shared/AdminInput";

const staffRoles = [
  { id: "admin", label: "Admin", icon: <LayoutDashboard size={18} /> },
  { id: "personnel", label: "Personel", icon: <Badge size={18} /> },
  { id: "distributor", label: "Dağıtıcı", icon: <Truck size={18} /> },
];

export default function LoginScreen({ onLogin, staffUsers = [], warehouseUsers = [] }) {
  const [selectedLogin, setSelectedLogin] = useState(null);
  const [selectedStaffRole, setSelectedStaffRole] = useState("admin");
  const [customerEmail, setCustomerEmail] = useState("demo@dershane.com");
  const [customerPassword, setCustomerPassword] = useState("123456");
  const [staffUsername, setStaffUsername] = useState("admin");
  const [staffPassword, setStaffPassword] = useState("admin123");
  const [errorText, setErrorText] = useState("");

  const submitCustomer = (event) => {
    event.preventDefault();
    setErrorText("");
    onLogin("customer");
  };

  const normalizeRole = (role) => {
    const value = String(role || "").toLowerCase();
    if (["admin", "yonetici", "yönetici"].includes(value)) return "admin";
    if (["yardimci_admin", "yardımcı_admin", "helper_admin", "assistant_admin", "yardimci", "yardımcı"].includes(value)) return "yardimci_admin";
    if (["personnel", "personel", "staff"].includes(value)) return "personnel";
    if (["distributor", "dagitici", "dağıtıcı", "delivery"].includes(value)) return "distributor";
    return value || "personnel";
  };

  const matchesUser = (user, username) => {
    const value = String(username || "").trim().toLowerCase();
    return [user.username, user.email, user.name, user.phone].some((field) => String(field || "").trim().toLowerCase() === value);
  };

  const passwordOk = (user, password) => {
    const value = String(password || "");
    if (user?.password || user?.temporaryPassword) return value === String(user.password || user.temporaryPassword);
    return ["123456", "admin123", "personel", "dagitici"].includes(value);
  };

  const submitStaff = (event) => {
    event.preventDefault();
    setErrorText("");
    const username = staffUsername.trim();
    const allWarehouseUsers = (warehouseUsers || []).filter((user) => user?.isActive !== false);
    const allStaffUsers = (staffUsers || []).filter((user) => user?.active !== false);

    if (selectedStaffRole === "admin") {
      if ((username === "admin" || username === "noxelera") && staffPassword === "admin123") {
        onLogin("admin", { id: "main-admin", name: "Noxelera Admin", role: "yonetici", username: "admin" });
        return;
      }
      const helper = allWarehouseUsers.find((user) => normalizeRole(user.role) === "yardimci_admin" && matchesUser(user, username) && passwordOk(user, staffPassword));
      if (helper) {
        onLogin("yardimci_admin", helper);
        return;
      }
      setErrorText("Admin bilgileri hatalı.");
      return;
    }

    const expectedRole = selectedStaffRole === "personnel" ? "personnel" : "distributor";
    const warehouseMatch = allWarehouseUsers.find((user) => normalizeRole(user.role) === expectedRole && matchesUser(user, username) && passwordOk(user, staffPassword));
    const staffMatch = allStaffUsers.find((user) => normalizeRole(user.role) === expectedRole && matchesUser(user, username) && passwordOk(user, staffPassword));
    if (warehouseMatch || staffMatch) {
      onLogin(expectedRole, warehouseMatch || staffMatch);
      return;
    }
    if ((expectedRole === "personnel" && username === "personel" && staffPassword === "personel") || (expectedRole === "distributor" && username === "dagitici" && staffPassword === "dagitici")) {
      onLogin(expectedRole, { id: expectedRole, name: expectedRole === "personnel" ? "Depo Personeli" : "Dağıtıcı", role: expectedRole });
      return;
    }
    setErrorText("Kullanıcı adı veya şifre hatalı.");
  };

  const loginCards = [
    { id: "customer", title: "Kurum Girişi", icon: <School size={42} />, gradient: "from-blue-600 to-blue-950" },
    { id: "staff", title: "Yönetim Girişi", icon: <LayoutDashboard size={42} />, gradient: "from-slate-900 to-blue-800" },
  ];

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_18%_10%,#2563eb_0,#1e3a8a_30%,#111827_74%)] text-white">
      <style>{`
        html, body, #root { width: 100%; min-height: 100%; margin: 0; }
        #root { max-width: none !important; padding: 0 !important; text-align: initial !important; }
        body { overflow-x: hidden; }
      `}</style>
      <div className="pointer-events-none absolute left-[-10rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-13rem] right-[-12rem] h-[34rem] w-[34rem] rounded-full bg-blue-300/20 blur-3xl" />

      <main className="relative flex min-h-screen w-full items-center justify-center px-5 py-8">
        {!selectedLogin ? (
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-5xl">
            <div className="mb-12 flex justify-center">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] bg-white p-3 shadow-2xl ring-1 ring-white/50">
                <img src={LOGO_SRC} alt="Noxelera Logo" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {loginCards.map((card, index) => (
                <motion.button key={card.id} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 + index * 0.08 }} whileHover={{ y: -8, scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedLogin(card.id)} className="group relative min-h-[260px] overflow-hidden rounded-[2.3rem] border border-white/20 bg-white/95 p-8 text-left text-slate-950 shadow-2xl outline-none backdrop-blur transition">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition duration-300 group-hover:opacity-100`} />
                  <div className="absolute right-[-4rem] top-[-4rem] h-44 w-44 rounded-full bg-blue-100 transition duration-300 group-hover:bg-white/10" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-blue-50 text-blue-700 ring-1 ring-blue-100 transition duration-300 group-hover:bg-white/15 group-hover:text-white group-hover:ring-white/20">{card.icon}</div>
                    <div className="flex items-end justify-between gap-4"><h2 className="text-4xl font-black tracking-tight transition duration-300 group-hover:text-white">{card.title}</h2><div className="flex h-13 w-13 items-center justify-center rounded-full bg-slate-950 text-white transition duration-300 group-hover:bg-white group-hover:text-blue-700"><ArrowRight size={23} /></div></div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        ) : (
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-md">
            <div className="mb-7 flex justify-center"><div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.8rem] bg-white p-3 shadow-2xl ring-1 ring-white/50"><img src={LOGO_SRC} alt="Noxelera Logo" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div></div>
            <button onClick={() => setSelectedLogin(null)} className="mb-4 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white ring-1 ring-white/20 hover:bg-white/15">Giriş seçimine dön</button>
            {selectedLogin === "customer" ? (
              <form onSubmit={submitCustomer} className="rounded-[2.2rem] bg-white/95 p-6 text-slate-950 shadow-2xl ring-1 ring-white/50 backdrop-blur sm:p-8">
                <div className="mb-7"><p className="text-sm font-black uppercase tracking-wide text-blue-700">Kurum girişi</p><h2 className="mt-2 text-3xl font-black tracking-tight">Kurum hesabı</h2></div>
                <div className="grid gap-4"><AdminInput label="Kullanıcı adı / e-posta" value={customerEmail} onChange={setCustomerEmail} /><AdminInput label="Şifre" type="password" value={customerPassword} onChange={setCustomerPassword} /><button type="submit" className="flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg">Kurum Paneline Gir<ArrowRight size={18} /></button></div>
              </form>
            ) : (
              <form onSubmit={submitStaff} className="rounded-[2.2rem] bg-slate-950/95 p-6 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur sm:p-8">
                <div className="mb-6"><p className="text-sm font-black uppercase tracking-wide text-blue-300">Yönetim girişi</p><h2 className="mt-2 text-3xl font-black tracking-tight">Yetkili hesap</h2></div>
                <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-1 ring-1 ring-white/10">
                  {staffRoles.map((role) => <button type="button" key={role.id} onClick={() => { setSelectedStaffRole(role.id); setStaffUsername(role.id === "admin" ? "admin" : role.id === "personnel" ? "personel" : "dagitici"); setStaffPassword(role.id === "admin" ? "admin123" : role.id === "personnel" ? "personel" : "dagitici"); }} className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-black transition ${selectedStaffRole === role.id ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"}`}>{role.icon}{role.label}</button>)}
                </div>
                <div className="grid gap-4">
                  <label className="grid min-w-0 gap-2"><span className="text-xs font-black uppercase tracking-wide text-slate-200">Kullanıcı adı</span><input value={staffUsername} onChange={(e) => setStaffUsername(e.target.value)} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-300" /></label>
                  <label className="grid min-w-0 gap-2"><span className="text-xs font-black uppercase tracking-wide text-slate-200">Şifre</span><input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-300" /></label>
                  {errorText && <p className="rounded-2xl bg-red-500/10 p-3 text-xs font-bold text-red-100 ring-1 ring-red-400/20">{errorText}</p>}
                  <button type="submit" className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-lg">{selectedStaffRole === "admin" ? "Admin" : staffRoles.find((role) => role.id === selectedStaffRole)?.label} Girişi Yap<ArrowRight size={18} /></button>
                </div>
              </form>
            )}
          </motion.section>
        )}
      </main>
      <FixedCredit />
    </div>
  );
}
