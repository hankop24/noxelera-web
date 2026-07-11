import { useEffect, useState } from 'react';
import { Archive, Boxes, Package, Plus, Warehouse } from 'lucide-react';
import { warehouseApi } from '../../../api/client';

export default function WarehouseApiPanel() {
  const [overview, setOverview] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newShelf, setNewShelf] = useState({ code: '', name: '', description: '' });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const [overviewRes, shelvesRes, stocksRes, tasksRes] = await Promise.all([
        warehouseApi.overview(),
        warehouseApi.shelves(),
        warehouseApi.stocks(),
        warehouseApi.tasks(),
      ]);
      setOverview(overviewRes.data);
      setShelves(shelvesRes.data || []);
      setStocks(stocksRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const createShelf = async () => {
    if (!newShelf.code || !newShelf.name) return;
    await warehouseApi.createShelf(newShelf);
    setNewShelf({ code: '', name: '', description: '' });
    await load();
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><Warehouse /></div>
          <div>
            <p className="text-sm font-bold text-blue-700">Opsiyonel Depo Modülü</p>
            <h2 className="text-2xl font-black text-slate-950">Raf, stok ve hazırlama operasyonları</h2>
          </div>
        </div>
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat title="Raf" value={overview?.shelfCount || 0} icon={<Archive />} />
          <Stat title="Stok Satırı" value={overview?.stockRowCount || 0} icon={<Boxes />} />
          <Stat title="Toplam Stok" value={overview?.totalStockQty || 0} icon={<Package />} />
          <Stat title="Kritik Stok" value={overview?.criticalStockCount || 0} icon={<Warehouse />} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">Raflar</h3>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="Kod" value={newShelf.code} onChange={(e) => setNewShelf((c) => ({ ...c, code: e.target.value }))} />
            <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="Ad" value={newShelf.name} onChange={(e) => setNewShelf((c) => ({ ...c, name: e.target.value }))} />
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white" onClick={createShelf}><Plus size={16} /> Ekle</button>
          </div>
          <div className="mt-4 space-y-2">
            {shelves.map((shelf) => <div key={shelf.id} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">{shelf.code} — {shelf.name}</div>)}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">Depo Görevleri</h3>
          <div className="mt-4 space-y-2">
            {tasks.map((task) => <div key={task.id} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">{task.order?.orderNo} — {task.status}</div>)}
            {tasks.length === 0 && <p className="text-sm font-semibold text-slate-500">Henüz depo görevi yok.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Raf Stokları</h3>
        <div className="mt-4 grid gap-2">
          {stocks.map((stock) => <div key={stock.id} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">{stock.shelf?.code} / {stock.product?.name} / {stock.booklet?.name || '-'} — {stock.quantity}</div>)}
          {stocks.length === 0 && <p className="text-sm font-semibold text-slate-500">Henüz raf stoğu yok.</p>}
        </div>
      </div>
    </section>
  );
}

function Stat({ title, value, icon }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><div className="text-blue-700">{icon}</div><p className="mt-2 text-sm font-bold text-slate-500">{title}</p><p className="text-2xl font-black text-slate-950">{value}</p></div>;
}
