import apiClient from './client';
import { Annotation, AnnotationFormData } from '../types';

export const annotationsApi = {
  getForMedia: async (mediaId: string): Promise<{ annotations: Annotation[] }> => {
    const response = await apiClient.get(`/annotations/media/${mediaId}`);
    return response.data;
  },

  create: async (data: AnnotationFormData): Promise<Annotation> => {
    const response = await apiClient.post('/annotations', data);
    return response.data;
  },

  get: async (id: string): Promise<Annotation> => {
    const response = await apiClient.get(`/annotations/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<AnnotationFormData>): Promise<Annotation> => {
    const response = await apiClient.put(`/annotations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/annotations/${id}`);
  },
};
