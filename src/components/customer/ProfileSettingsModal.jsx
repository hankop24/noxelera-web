import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import AdminInput from "../shared/AdminInput";

export default function ProfileSettingsModal({
  profile,
  setProfile,
  seasonLabel = "2025-2026",
  canEditProfile = true,
  canChangePassword = true,
  onClose,
}) {
  const [draftProfile, setDraftProfile] = useState(profile);
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordAgain: "",
  });
  const [message, setMessage] = useState("");

  const updateDraft = (key, value) =>
    setDraftProfile((current) => ({ ...current, [key]: value }));

  const saveProfile = () => {
    setProfile(draftProfile);
    setMessage("Profil bilgileriniz güncellendi.");
  };

  const savePassword = () => {
    if (
      !passwordForm.newPassword ||
      passwordForm.newPassword !== passwordForm.newPasswordAgain
    ) {
      setMessage("Yeni şifre alanları eşleşmiyor.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage("Yeni şifre en az 6 karakter olmalı.");
      return;
    }
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      newPasswordAgain: "",
    });
    setMessage("Şifre güncelleme talebiniz kaydedildi.");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl"
      >
        <div className="shrink-0 flex items-start justify-between gap-4 bg-gradient-to-br from-blue-700 to-slate-950 p-6 text-white">
          <div>
            <p className="text-sm font-black text-blue-100">Kurum ayarları</p>
            <h3 className="mt-2 text-2xl font-black">Profil bilgilerim</h3>
            <p className="mt-1 text-sm text-blue-50">
              Kurum iletişim, adres, teslimat ve fatura bilgileri bu alandan
              yönetilir.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 p-2 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-0">
          <div className="mb-5 flex flex-wrap gap-2 rounded-[1.4rem] bg-slate-50 p-2 ring-1 ring-slate-100">
            {[
              ["profile", "Kurum bilgileri"],
              ["address", "Adresler"],
              ["invoice", "Fatura bilgileri"],
              ["security", "Şifre"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${activeTab === key ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:bg-white"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "profile" && (
            <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
              <p className="mb-4 text-sm font-black uppercase tracking-wide text-blue-700">
                Kurum ve iletişim bilgileri
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminInput
                  label="Kurum adı"
                  disabled={!canEditProfile}
                  value={draftProfile.name || ""}
                  onChange={(v) => updateDraft("name", v)}
                />
                <AdminInput
                  label="Kurum tipi"
                  disabled={!canEditProfile}
                  value={draftProfile.type || ""}
                  onChange={(v) => updateDraft("type", v)}
                  options={["Dershane", "Kurs", "Okul", "Kitabevi", "Diğer"]}
                />
                <AdminInput
                  label="Ana e-posta"
                  disabled={!canEditProfile}
                  value={draftProfile.email || ""}
                  onChange={(v) => updateDraft("email", v)}
                />
                <AdminInput
                  label="Ana telefon"
                  disabled={!canEditProfile}
                  value={draftProfile.phone || ""}
                  onChange={(v) => updateDraft("phone", v)}
                />
                <AdminInput
                  label="Yetkili kişi"
                  disabled={!canEditProfile}
                  value={draftProfile.contactPerson || ""}
                  onChange={(v) => updateDraft("contactPerson", v)}
                />
                <AdminInput
                  label="Yetkili telefon"
                  disabled={!canEditProfile}
                  value={draftProfile.contactPhone || ""}
                  onChange={(v) => updateDraft("contactPhone", v)}
                />
                <AdminInput
                  label="Yetkili e-posta"
                  disabled={!canEditProfile}
                  value={draftProfile.contactEmail || ""}
                  onChange={(v) => updateDraft("contactEmail", v)}
                />
                <AdminInput
                  label="Şehir"
                  disabled={!canEditProfile}
                  value={draftProfile.city || ""}
                  onChange={(v) => updateDraft("city", v)}
                />
                <AdminInput
                  label="İlçe"
                  disabled={!canEditProfile}
                  value={draftProfile.district || ""}
                  onChange={(v) => updateDraft("district", v)}
                />
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
              <p className="mb-4 text-sm font-black uppercase tracking-wide text-blue-700">
                Adres bilgileri
              </p>
              <div className="grid gap-4">
                <AdminInput
                  label="Kurum açık adresi"
                  disabled={!canEditProfile}
                  value={draftProfile.address || ""}
                  onChange={(v) => updateDraft("address", v)}
                />
                <AdminInput
                  label="Teslimat adresi"
                  disabled={!canEditProfile}
                  value={draftProfile.deliveryAddress || ""}
                  onChange={(v) => updateDraft("deliveryAddress", v)}
                />
                <AdminInput
                  label="Fatura adresi"
                  disabled={!canEditProfile}
                  value={draftProfile.billingAddress || ""}
                  onChange={(v) => updateDraft("billingAddress", v)}
                />
              </div>
            </div>
          )}

          {activeTab === "invoice" && (
            <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
              <p className="mb-4 text-sm font-black uppercase tracking-wide text-blue-700">
                Fatura bilgileri
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminInput
                  label="Fatura unvanı"
                  disabled={!canEditProfile}
                  value={draftProfile.invoiceTitle || ""}
                  onChange={(v) => updateDraft("invoiceTitle", v)}
                />
                <AdminInput
                  label="Vergi / T.C. numarası"
                  disabled={!canEditProfile}
                  value={draftProfile.taxNumber || ""}
                  onChange={(v) => updateDraft("taxNumber", v)}
                />
                <AdminInput
                  label="Vergi dairesi"
                  disabled={!canEditProfile}
                  value={draftProfile.taxOffice || ""}
                  onChange={(v) => updateDraft("taxOffice", v)}
                />
              </div>
              <p className="mt-4 rounded-2xl bg-white p-3 text-xs font-bold leading-5 text-slate-500 ring-1 ring-slate-100">
                Bu bilgiler kurum profilinin parçasıdır. Akson entegrasyonu
                kurum profiline bağlanmaz; fatura/entegrasyon işlemleri admin
                hesabının sistem ayarları üzerinden yürütülür.
              </p>
            </div>
          )}

          {activeTab === "security" && (
            <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
              <p className="mb-4 text-sm font-black uppercase tracking-wide text-blue-700">
                Şifre güncelle
              </p>
              <div className="grid gap-4">
                {canChangePassword ? (
                  <>
                    <AdminInput
                      label="Mevcut şifre"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(v) =>
                        setPasswordForm({ ...passwordForm, currentPassword: v })
                      }
                    />
                    <AdminInput
                      label="Yeni şifre"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(v) =>
                        setPasswordForm({ ...passwordForm, newPassword: v })
                      }
                    />
                    <AdminInput
                      label="Yeni şifre tekrar"
                      type="password"
                      value={passwordForm.newPasswordAgain}
                      onChange={(v) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPasswordAgain: v,
                        })
                      }
                    />
                    <button
                      onClick={savePassword}
                      className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"
                    >
                      Şifreyi güncelle
                    </button>
                  </>
                ) : (
                  <p className="rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-800 ring-1 ring-amber-100">
                    Şifre değiştirme bu admin hesabında kapalıdır.
                  </p>
                )}
                <p className="text-xs font-semibold leading-5 text-slate-500">
                  Admin mevcut şifrenizi göremez. Şifre yönetimi sadece izin
                  veriliyorsa bu kurum hesabından yapılır.
                </p>
                <p className="rounded-2xl bg-white p-3 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                  Sezon aralığı: {seasonLabel}
                </p>
              </div>
            </div>
          )}

          <div className="sticky bottom-0 -mx-6 mt-6 border-t border-slate-100 bg-white/95 px-6 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {message ? (
                <p className="rounded-2xl bg-blue-50 p-3 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
                  {message}
                </p>
              ) : (
                <span className="hidden sm:block" />
              )}
              <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
                <button
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
                >
                  Kapat
                </button>
                {canEditProfile ? (
                  <button
                    onClick={saveProfile}
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
                  >
                    Profil bilgilerini kaydet
                  </button>
                ) : (
                  <p className="rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-800 ring-1 ring-amber-100">
                    Profil düzenleme bu admin hesabında kapalıdır.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
