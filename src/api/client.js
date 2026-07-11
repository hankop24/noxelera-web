const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function getToken() {
  return localStorage.getItem('noxelera_token') || '';
}

export function setToken(token) {
  if (token) localStorage.setItem('noxelera_token', token);
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = options.token ?? getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || 'API isteği başarısız.');
  }

  return payload;
}

export const orderDisplayApi = {
  list: () => apiRequest('/order-display'),
  tv: (branchId) => apiRequest(`/order-display/tv/${branchId}`, { token: '' }),
  updateStatus: (id, status, note) => apiRequest(`/order-display/${id}/status`, { method: 'PATCH', body: { status, note } }),
};

export const warehouseApi = {
  overview: () => apiRequest('/warehouse/overview'),
  shelves: () => apiRequest('/warehouse/shelves'),
  createShelf: (data) => apiRequest('/warehouse/shelves', { method: 'POST', body: data }),
  stocks: () => apiRequest('/warehouse/stocks'),
  upsertStock: (data) => apiRequest('/warehouse/stocks', { method: 'POST', body: data }),
  createStockMovement: (data) => apiRequest('/warehouse/stock-movements', { method: 'POST', body: data }),
  tasks: () => apiRequest('/warehouse/tasks'),
  createTaskFromOrder: (orderId) => apiRequest(`/warehouse/tasks/from-order/${orderId}`, { method: 'POST' }),
  updateTaskStatus: (id, status, note) => apiRequest(`/warehouse/tasks/${id}/status`, { method: 'PATCH', body: { status, note } }),
};
