import apiClient from './client';
import { Artifact, ArtifactFormData, FilterOptions, Media } from '../types';

interface ArtifactsResponse {
  artifacts: Artifact[];
  total: number;
  pages: number;
  page: number;
  per_page: number;
}

interface Collection {
  id: string;
  name: string;
  count: number;
}

export const artifactsApi = {
  getCollections: async (): Promise<{ collections: Collection[] }> => {
    const response = await apiClient.get('/artifacts/collections');
    return response.data;
  },

  list: async (params?: {
    page?: number;
    per_page?: number;
    collection?: string;
    object_type?: string;
    material?: string;
    on_display?: boolean;
  }): Promise<ArtifactsResponse> => {
    const response = await apiClient.get('/artifacts', { params });
    return response.data;
  },

  get: async (id: string): Promise<Artifact> => {
    const response = await apiClient.get(`/artifacts/${id}`);
    return response.data;
  },

  create: async (data: ArtifactFormData): Promise<Artifact> => {
    const response = await apiClient.post('/artifacts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ArtifactFormData>): Promise<Artifact> => {
    const response = await apiClient.put(`/artifacts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/artifacts/${id}`);
  },

  getMedia: async (id: string): Promise<{ media: Media[] }> => {
    const response = await apiClient.get(`/artifacts/${id}/media`);
    return response.data;
  },

  getFilters: async (collection?: string): Promise<FilterOptions> => {
    const params = collection ? { collection } : {};
    const response = await apiClient.get('/artifacts/filters', { params });
    return response.data;
  },
};
