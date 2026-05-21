import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import AdminInput from "../shared/AdminInput";

export default function ProfileSettingsModal({ profile, setProfile, seasonLabel = "2025-2026", onClose }) {
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", newPasswordAgain: "" });
  const [message, setMessage] = useState("");

  const savePassword = () => {
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.newPasswordAgain) {
      setMessage("Yeni şifre alanları eşleşmiyor.");
      return;
    }
    setPasswordForm({ currentPassword: "", newPassword: "", newPasswordAgain: "" });
    setMessage("Şifre güncelleme talebiniz kaydedildi.");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-gradient-to-br from-blue-700 to-slate-950 p-6 text-white">
          <div>
            <p className="text-sm font-black text-blue-100">Kurum ayarları</p>
            <h3 className="mt-2 text-2xl font-black">Profil bilgilerim</h3>
            <p className="mt-1 text-sm text-blue-50">Bu bilgiler yalnızca kurum hesabınız içinde görüntülenir.</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/20 p-2 hover:bg-white/10"><X size={20} /></button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
            <p className="mb-4 text-sm font-black uppercase tracking-wide text-blue-700">Kurum bilgileri</p>
            <div className="grid gap-4">
              <AdminInput label="Kurum adı" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
              <AdminInput label="Yetkili kişi" value={profile.contactPerson} onChange={(v) => setProfile({ ...profile, contactPerson: v })} />
              <AdminInput label="E-posta" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
              <AdminInput label="Telefon" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
              <AdminInput label="Adres" value={profile.address} onChange={(v) => setProfile({ ...profile, address: v })} />
              <button onClick={() => setMessage("Profil bilgileriniz güncellendi.")} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800">Bilgileri güncelle</button>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
            <p className="mb-4 text-sm font-black uppercase tracking-wide text-blue-700">Şifre güncelle</p>
            <div className="grid gap-4">
              <AdminInput label="Mevcut şifre" type="password" value={passwordForm.currentPassword} onChange={(v) => setPasswordForm({ ...passwordForm, currentPassword: v })} />
              <AdminInput label="Yeni şifre" type="password" value={passwordForm.newPassword} onChange={(v) => setPasswordForm({ ...passwordForm, newPassword: v })} />
              <AdminInput label="Yeni şifre tekrar" type="password" value={passwordForm.newPasswordAgain} onChange={(v) => setPasswordForm({ ...passwordForm, newPasswordAgain: v })} />
              <button onClick={savePassword} className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800">Şifreyi güncelle</button>
              {message && <p className="rounded-2xl bg-white p-3 text-xs font-bold text-slate-600 ring-1 ring-slate-100">{message}</p>}
              <p className="text-xs font-semibold leading-5 text-slate-500">Admin mevcut şifrenizi göremez. Şifre yönetimi sadece bu kurum hesabından yapılır.</p>
              <p className="rounded-2xl bg-white p-3 text-xs font-bold text-slate-600 ring-1 ring-slate-100">Sezon aralığı: {seasonLabel}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

