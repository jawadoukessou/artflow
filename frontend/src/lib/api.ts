import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — auto-refresh on 401
let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res.data, // unwrap — backend wraps in { success, data, meta }
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
        return Promise.reject(err);
      }
      try {
        const res: any = await axios.post(`${API_BASE}/api/v1/auth/refresh`, { refreshToken });
        const { accessToken } = res.data.data;
        useAuthStore.getState().setAccessToken(accessToken);
        processQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err.response?.data || err);
  }
);

// ── API helpers ──────────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string; mfaCode?: string }) =>
    api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: (data?: { refreshToken?: string }) => api.post('/auth/logout', data),
  getMe: () => api.get('/auth/me'),
  setupMfa: () => api.get('/auth/mfa/setup'),
  enableMfa: (code: string) => api.post('/auth/mfa/enable', { code }),
};

export const customersApi = {
  list: (params?: any) => api.get('/customers', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.patch(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  aging: (id?: string) => api.get(id ? `/customers/${id}/aging` : '/customers/aging'),
};

export const invoicesApi = {
  list: (params?: any) => api.get('/invoices', { params }),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.patch(`/invoices/${id}`, data),
  sendReminder: (id: string, data?: any) => api.post(`/invoices/${id}/remind`, data),
  bulkRemind: (ids: string[]) => api.post('/invoices/bulk-remind', { ids }),
};

export const paymentsApi = {
  list: (params?: any) => api.get('/payments', { params }),
  create: (data: any) => api.post('/payments', data),
  match: (id: string, invoiceId: string) => api.post(`/payments/${id}/match`, { invoiceId }),
};

export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  aging: () => api.get('/analytics/aging'),
  collectors: () => api.get('/analytics/collectors'),
  dsoTrend: (months?: number) => api.get('/analytics/dso-trend', { params: { months } }),
  cashForecast: (days?: number) => api.get('/analytics/cash-forecast', { params: { days } }),
  riskyCustomers: () => api.get('/analytics/risky-customers'),
};

export const tasksApi = {
  list: (params?: any) => api.get('/tasks', { params }),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  complete: (id: string) => api.patch(`/tasks/${id}`, { status: 'COMPLETED' }),
};

export const disputesApi = {
  list: (params?: any) => api.get('/disputes', { params }),
  get: (id: string) => api.get(`/disputes/${id}`),
  create: (data: any) => api.post('/disputes', data),
  update: (id: string, data: any) => api.patch(`/disputes/${id}`, data),
};

export const workflowsApi = {
  list: () => api.get('/workflows'),
  get: (id: string) => api.get(`/workflows/${id}`),
  create: (data: any) => api.post('/workflows', data),
  update: (id: string, data: any) => api.patch(`/workflows/${id}`, data),
  toggle: (id: string) => api.patch(`/workflows/${id}/toggle`),
};

export const erpApi = {
  connections: () => api.get('/erp/connections'),
  syncNow: (id: string) => api.post(`/erp/connections/${id}/sync`),
  logs: (id: string) => api.get(`/erp/connections/${id}/logs`),
  createConnection: (data: any) => api.post('/erp/connections', data),
  importCsv: (file: FormData) => api.post('/erp/import/csv', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const adminApi = {
  users: () => api.get('/users'),
  createUser: (data: any) => api.post('/users', data),
  updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),
  roles: () => api.get('/admin/roles'),
  auditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
};

export const riskApi = {
  list: (params?: any) => api.get('/risk', { params }),
  compute: (customerId: string) => api.post(`/risk/compute/${customerId}`),
};
