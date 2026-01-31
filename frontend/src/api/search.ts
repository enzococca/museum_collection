import apiClient from './client';
import { Artifact, FilterOptions } from '../types';

interface SearchResponse {
  artifacts: Artifact[];
  total: number;
  pages: number;
  page: number;
  per_page: number;
  query: string | null;
}

interface SearchSuggestion {
  type: string;
  value: string;
}

export const searchApi = {
  search: async (params: {
    q?: string;
    page?: number;
    per_page?: number;
    object_type?: string;
    material?: string;
    on_display?: boolean;
    chronology?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<SearchResponse> => {
    const response = await apiClient.get('/search', { params });
    return response.data;
  },

  suggestions: async (q: string): Promise<{ suggestions: SearchSuggestion[] }> => {
    const response = await apiClient.get('/search/suggestions', { params: { q } });
    return response.data;
  },

  getFilters: async (): Promise<FilterOptions> => {
    const response = await apiClient.get('/search/filters');
    return response.data;
  },
};
