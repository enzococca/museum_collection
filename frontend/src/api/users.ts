import apiClient from './client';
import { User } from '../types';

interface UsersResponse {
  users: User[];
  total: number;
  pages: number;
  page: number;
  per_page: number;
}

interface CreateUserData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'editor' | 'viewer';
  is_active?: boolean;
}

export const usersApi = {
  list: async (params?: {
    page?: number;
    per_page?: number;
    role?: string;
    is_active?: boolean;
  }): Promise<UsersResponse> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  get: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateUserData>): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
