import { useState } from "react";
import { BookOpen } from "lucide-react";
import { LOGO_SRC } from "../../data/initialData";

export default function LogoMark({ dark = false, compact = false }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl ${dark ? "bg-white" : "bg-white ring-1 ring-blue-100"} shadow-sm`}>
        {!logoFailed ? (
          <img src={LOGO_SRC} alt="Noxelera Logo" className="h-full w-full object-contain p-1.5" onError={() => setLogoFailed(true)} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-700 text-white">
            <BookOpen size={26} />
          </div>
        )}
      </div>
      {!compact && (
        <div>
          <p className={`text-xl font-black tracking-tight ${dark ? "text-white" : "text-slate-950"}`}>Noxelera</p>
          <p className={`text-xs font-bold ${dark ? "text-blue-100" : "text-blue-700"}`}>Kurumsal Sipariş Portalı</p>
        </div>
      )}
    </div>
  );
}

