import axios from 'axios';
import {
  Customer,
  CustomerWorkOrderDetail,
  DashboardSummary,
  NotificationItem,
  PageResponse,
  Part,
  PartUsage,
  ReportSummary,
  Role,
  Site,
  TimeLog,
  User,
  WorkOrderDetail,
  WorkOrderSummary,
  WorkOrderStatus,
  Priority,
  SlaStatus,
  CustomerStatus
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer Token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('keystone_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't loop if login fails
      if (!error.config.url.includes('/api/auth/login')) {
        localStorage.removeItem('keystone_token');
        localStorage.removeItem('keystone_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// API Services
// ==========================================

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{
      token: string;
      tokenType: string;
      id: number;
      email: string;
      fullName: string;
      phone?: string;
      role: Role;
      customerId?: number;
    }>('/api/auth/login', data),

  getMe: () => api.get<User>('/api/auth/me'),

  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: Role;
    customerId?: number;
  }) => api.post<User>('/api/auth/register', data),

  getTechnicians: () => api.get<User[]>('/api/auth/technicians'),

  getAllUsers: () => api.get<User[]>('/api/auth/users'),
};

export const workOrdersApi = {
  search: (params?: {
    customerId?: number;
    siteId?: number;
    technicianId?: number;
    status?: WorkOrderStatus;
    priority?: Priority;
    slaStatus?: SlaStatus;
    query?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) => api.get<PageResponse<WorkOrderSummary>>('/api/work-orders', { params }),

  getTechnicianJobs: (params?: {
    status?: WorkOrderStatus;
    query?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) => api.get<PageResponse<WorkOrderSummary>>('/api/technician/work-orders', { params }),

  getCustomerRequests: (params?: {
    siteId?: number;
    status?: WorkOrderStatus;
    query?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) => api.get<PageResponse<WorkOrderSummary>>('/api/customer/work-orders', { params }),

  getById: (id: number) => api.get<WorkOrderDetail | CustomerWorkOrderDetail>(`/api/work-orders/${id}`),

  create: (data: {
    title: string;
    description: string;
    priority: Priority;
    customerId: number;
    siteId: number;
    assignedTechnicianId?: number;
    internalNotes?: string;
  }) => api.post<WorkOrderDetail>('/api/work-orders', data),

  createCustomerRequest: (data: {
    title: string;
    description: string;
    priority: Priority;
    siteId: number;
  }) => api.post<WorkOrderDetail>('/api/work-orders/customer-request', data),

  update: (id: number, data: {
    title: string;
    description: string;
    priority: Priority;
    siteId: number;
    internalNotes?: string;
  }) => api.put<WorkOrderDetail>(`/api/work-orders/${id}`, data),

  assign: (id: number, data: { technicianId: number; note?: string }) =>
    api.post<WorkOrderDetail>(`/api/work-orders/${id}/assign`, data),

  transitionStatus: (id: number, data: {
    targetStatus: WorkOrderStatus;
    note?: string;
    cancellationReason?: string;
  }) => api.post<WorkOrderDetail>(`/api/work-orders/${id}/status`, data),

  logPart: (id: number, data: { partId: number; quantity: number }) =>
    api.post<PartUsage>(`/api/work-orders/${id}/parts`, data),

  getParts: (id: number) => api.get<PartUsage[]>(`/api/work-orders/${id}/parts`),

  logTime: (id: number, data: { minutes: number; note?: string; loggedAt?: string }) =>
    api.post<TimeLog>(`/api/work-orders/${id}/time`, data),

  getTimeLogs: (id: number) => api.get<TimeLog[]>(`/api/work-orders/${id}/time`),

  uploadAttachment: (id: number, formData: FormData) =>
    api.post(`/api/work-orders/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getAttachments: (id: number) => api.get(`/api/work-orders/${id}/attachments`),
};

export const customersApi = {
  search: (params?: {
    query?: string;
    status?: CustomerStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) => api.get<PageResponse<Customer>>('/api/customers', { params }),

  getActive: () => api.get<Customer[]>('/api/customers/active'),

  getById: (id: number) => api.get<Customer>(`/api/customers/${id}`),

  create: (data: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    status?: CustomerStatus;
  }) => api.post<Customer>('/api/customers', data),

  update: (id: number, data: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    status?: CustomerStatus;
  }) => api.put<Customer>(`/api/customers/${id}`, data),
};

export const sitesApi = {
  search: (params?: {
    customerId?: number;
    query?: string;
    active?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) => api.get<PageResponse<Site>>('/api/sites', { params }),

  getForCustomer: (customerId: number) => api.get<Site[]>(`/api/sites/customer/${customerId}`),

  getById: (id: number) => api.get<Site>(`/api/sites/${id}`),

  create: (data: {
    customerId: number;
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    contactPerson?: string;
    contactPhone?: string;
    active?: boolean;
  }) => api.post<Site>('/api/sites', data),

  update: (id: number, data: {
    customerId?: number;
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    contactPerson?: string;
    contactPhone?: string;
    active?: boolean;
  }) => api.put<Site>(`/api/sites/${id}`, data),
};

export const partsApi = {
  search: (params?: {
    query?: string;
    category?: string;
    active?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) => api.get<PageResponse<Part>>('/api/parts', { params }),

  getActive: () => api.get<Part[]>('/api/parts/active'),

  getLowStock: () => api.get<Part[]>('/api/parts/low-stock'),

  getById: (id: number) => api.get<Part>(`/api/parts/${id}`),

  create: (data: {
    sku: string;
    name: string;
    description?: string;
    category: string;
    unitCost: number;
    stockQuantity: number;
    leadTimeDays: number;
    active?: boolean;
  }) => api.post<Part>('/api/parts', data),

  update: (id: number, data: {
    sku: string;
    name: string;
    description?: string;
    category: string;
    unitCost: number;
    stockQuantity: number;
    leadTimeDays: number;
    active?: boolean;
  }) => api.put<Part>(`/api/parts/${id}`, data),
};

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/api/dashboard/summary'),
};

export const reportsApi = {
  getSummary: () => api.get<ReportSummary>('/api/reports/summary'),
};

export const notificationsApi = {
  getAll: (params?: { page?: number; size?: number }) =>
    api.get<PageResponse<NotificationItem>>('/api/notifications', { params }),

  getRecent: () => api.get<NotificationItem[]>('/api/notifications/recent'),

  getUnreadCount: () => api.get<{ unreadCount: number }>('/api/notifications/unread-count'),

  markAsRead: (id: number) => api.post<void>(`/api/notifications/${id}/read`),

  markAllAsRead: () => api.post<void>('/api/notifications/read-all'),
};
