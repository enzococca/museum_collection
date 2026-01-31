import apiClient from './client';
import { Submission, SubmissionFormData, SubmissionImage } from '../types';

interface SubmissionsResponse {
  submissions: Submission[];
  total: number;
  pages: number;
  page: number;
  per_page: number;
}

// Public API (no auth required)
export const publicSubmissionsApi = {
  create: async (data: SubmissionFormData): Promise<{ id: string; message: string; tracking_id: string }> => {
    const response = await apiClient.post('/submissions', data);
    return response.data;
  },

  uploadImage: async (submissionId: string, file: File): Promise<SubmissionImage> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/submissions/${submissionId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getStatus: async (submissionId: string): Promise<{
    id: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
  }> => {
    const response = await apiClient.get(`/submissions/${submissionId}/status`);
    return response.data;
  },
};

// Authenticated API (editor+ required)
export const submissionsApi = {
  list: async (params?: {
    page?: number;
    per_page?: number;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<SubmissionsResponse> => {
    const response = await apiClient.get('/submissions', { params });
    return response.data;
  },

  get: async (id: string): Promise<Submission> => {
    const response = await apiClient.get(`/submissions/${id}`);
    return response.data;
  },

  approve: async (id: string, data?: {
    sequence_number?: string;
    review_notes?: string;
  }): Promise<{ message: string; artifact: any }> => {
    const response = await apiClient.post(`/submissions/${id}/approve`, data);
    return response.data;
  },

  reject: async (id: string, review_notes?: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/submissions/${id}/reject`, { review_notes });
    return response.data;
  },
};
