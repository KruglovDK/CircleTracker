import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { Token, User, Category, Transaction, TransactionCreate, Group, Invite, CustomItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post<Token>(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('refresh_token', response.data.refresh_token);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          }
          
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (username: string, password: string) =>
    api.post<Token>('/auth/register', { username, password }),
  
  login: (username: string, password: string) =>
    api.post<Token>('/auth/login', { username, password }),
  
  refresh: (refresh_token: string) =>
    api.post<Token>('/auth/refresh', { refresh_token }),
};

// Users API
export const usersApi = {
  getMe: () => api.get<User>('/users/me'),
  getByUsername: (username: string) => api.get<User>(`/users/${username}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (name: string) => api.post<Category>('/categories', { name }),
  update: (id: number, name: string) => api.put<Category>(`/categories/${id}`, { name }),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Transactions API
export const transactionsApi = {
  getAll: (params?: {
    date_from?: string;
    date_to?: string;
    category_id?: number;
    group_id?: number;
  }) => api.get<Transaction[]>('/transactions', { params }),
  
  getById: (id: number) => api.get<Transaction>(`/transactions/${id}`),
  
  create: (data: TransactionCreate) => api.post<Transaction>('/transactions', data),
  
  update: (id: number, data: Partial<TransactionCreate>) =>
    api.put<Transaction>(`/transactions/${id}`, data),
  
  delete: (id: number) => api.delete(`/transactions/${id}`),
};

// Groups API
export const groupsApi = {
  getAll: () => api.get<Group[]>('/groups'),
  getById: (id: number) => api.get<Group>(`/groups/${id}`),
  getTransactions: (id: number) => api.get<Transaction[]>(`/groups/${id}/transactions`),
  create: (name: string) => api.post<Group>('/groups', { name }),
  update: (id: number, name: string) => api.put<Group>(`/groups/${id}`, { name }),
  delete: (id: number) => api.delete(`/groups/${id}`),
  createInvite: (groupId: number, username: string) =>
    api.post<Invite>(`/groups/${groupId}/invites`, { username }),
};

// Invites API
export const invitesApi = {
  getAll: () => api.get<Invite[]>('/invites'),
  accept: (id: number) => api.post<Invite>(`/invites/${id}/accept`),
  decline: (id: number) => api.post<Invite>(`/invites/${id}/decline`),
};

// Custom Items API
export const customItemsApi = {
  getAll: () => api.get<CustomItem[]>('/custom-items'),
  suggest: (query: string) => api.get<CustomItem[]>('/custom-items/suggest', { params: { q: query } }),
  create: (name: string, last_category_id?: number) =>
    api.post<CustomItem>('/custom-items', { name, last_category_id }),
  update: (id: number, data: { name?: string; last_category_id?: number }) =>
    api.put<CustomItem>(`/custom-items/${id}`, data),
  delete: (id: number) => api.delete(`/custom-items/${id}`),
};

export default api;
