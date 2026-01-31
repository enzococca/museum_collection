import apiClient from './client';
import { Media, MediaUrl } from '../types';

export const mediaApi = {
  upload: async (artifactId: string, file: File, folder?: string, caption?: string): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('artifact_id', artifactId);
    if (folder) formData.append('folder', folder);
    if (caption) formData.append('caption', caption);

    const response = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  get: async (id: string): Promise<Media> => {
    const response = await apiClient.get(`/media/${id}`);
    return response.data;
  },

  getUrl: async (id: string): Promise<MediaUrl> => {
    const response = await apiClient.get(`/media/${id}/url`);
    return response.data;
  },

  setPrimary: async (id: string): Promise<Media> => {
    const response = await apiClient.put(`/media/${id}/primary`);
    return response.data;
  },

  update: async (id: string, data: { caption?: string; sort_order?: number }): Promise<Media> => {
    const response = await apiClient.put(`/media/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/media/${id}`);
  },

  getFolders: async (artifactId?: string): Promise<string[]> => {
    const url = artifactId ? `/media/folders/${artifactId}` : '/media/folders';
    const response = await apiClient.get(url);
    return response.data.folders;
  },
};
