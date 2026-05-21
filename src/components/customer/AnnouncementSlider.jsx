import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
export default function AnnouncementSlider({ announcements }) {
  const active = announcements.filter((item) => item.active);
  const [index, setIndex] = useState(0);
  useEffect(() => { if (active.length <= 1) return undefined; const t = setInterval(() => setIndex((i) => (i + 1) % active.length), 5500); return () => clearInterval(t); }, [active.length]);
  if (active.length === 0) return null;
  const item = active[index] || active[0];
  const next = () => setIndex((i) => (i + 1) % active.length);
  const prev = () => setIndex((i) => (i - 1 + active.length) % active.length);
  return <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8"><div className="relative overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-sm"><div className="grid gap-4 p-5 md:grid-cols-[1fr_220px] md:p-7"><div className="flex gap-4"><div className="hidden rounded-2xl bg-red-50 p-3 text-red-700 ring-1 ring-red-100 sm:block"><Megaphone size={24} /></div><div><p className="text-sm font-black uppercase tracking-wide text-red-700">Kurum duyuruları</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{item.title}</h2><p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{item.text}</p></div></div>{item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-36 w-full rounded-3xl object-cover" /> : <div className="flex h-36 items-center justify-center rounded-3xl bg-red-50 text-red-700"><Megaphone size={44} /></div>}</div>{active.length > 1 && <><button onClick={prev} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-red-700 shadow ring-1 ring-red-100"><ChevronLeft size={18} /></button><button onClick={next} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-red-700 shadow ring-1 ring-red-100"><ChevronRight size={18} /></button><div className="flex justify-center gap-2 pb-4">{active.map((a, dot) => <button key={a.id} onClick={() => setIndex(dot)} className={`h-2 rounded-full transition-all ${dot === index ? "w-7 bg-red-700" : "w-2 bg-red-200"}`} />)}</div></>}</div></section>;
}
