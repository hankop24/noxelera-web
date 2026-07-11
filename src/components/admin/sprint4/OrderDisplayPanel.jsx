import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Monitor, PackageCheck, Truck } from 'lucide-react';
import { orderDisplayApi } from '../../../api/client';

const STATUS_LABELS = {
  APPROVED: 'Onaylandı',
  PREPARING: 'Hazırlanıyor',
  READY: 'Hazır',
  OUT_FOR_DELIVERY: 'Dağıtımda',
  DELIVERED: 'Teslim edildi',
};

const NEXT_ACTIONS = [
  { status: 'PREPARING', label: 'Hazırlanıyor', icon: <Clock size={16} /> },
  { status: 'READY', label: 'Hazır', icon: <PackageCheck size={16} /> },
  { status: 'OUT_FOR_DELIVERY', label: 'Dağıtımda', icon: <Truck size={16} /> },
  { status: 'DELIVERED', label: 'Teslim edildi', icon: <CheckCircle2 size={16} /> },
];

export default function OrderDisplayPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      setError('');
      const response = await orderDisplayApi.list();
      setOrders(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, 15000);
    return () => clearInterval(timer);
  }, []);

  const updateStatus = async (orderId, status) => {
    await orderDisplayApi.updateStatus(orderId, status);
    await loadOrders();
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-blue-700">Noxelera Sipariş Ekranı</p>
          <h2 className="text-2xl font-black text-slate-950">TV Panel / Hazırlanacak Siparişler</h2>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">
          <Monitor size={17} /> Canlı ekran
        </div>
      </div>

      {loading && <p className="mt-6 text-sm font-semibold text-slate-500">Yükleniyor...</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-black text-slate-950">{order.orderNo}</p>
                <p className="text-sm font-bold text-slate-500">{order.institution?.name}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {(order.items || []).map((item) => (
                <div key={item.id} className="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700">
                  {item.product?.brand?.name} / {item.product?.name} × {item.quantity}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {NEXT_ACTIONS.map((action) => (
                <button key={action.status} type="button" onClick={() => updateStatus(order.id, action.status)} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-950 hover:text-white">
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {!loading && orders.length === 0 && <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">TV ekranına düşen sipariş yok.</p>}
      </div>
    </section>
  );
}
