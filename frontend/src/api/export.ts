import apiClient from './client';

interface ExportParams {
  artifact_ids?: string[];
  query?: string;
  filters?: {
    object_type?: string;
    material?: string;
    on_display?: boolean;
  };
  include_images?: boolean;
  include_metadata?: boolean;
}

export const exportApi = {
  exportPdf: async (params: ExportParams): Promise<Blob> => {
    const response = await apiClient.post('/export/pdf', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportZip: async (params: ExportParams): Promise<Blob> => {
    const response = await apiClient.post('/export/zip', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportCsv: async (params: ExportParams): Promise<Blob> => {
    const response = await apiClient.post('/export/csv', params, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Helper to download blob
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
