import apiClient from './client';

export interface ThesaurusTerm {
  id: string;
  category: string;
  term: string;
  description?: string;
  alt_terms: string[];
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

export const thesaurusApi = {
  // Get all categories
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get('/thesaurus/categories');
    return response.data;
  },

  // Get all terms (with optional filters)
  getTerms: async (category?: string, activeOnly = true): Promise<ThesaurusTerm[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('active_only', String(activeOnly));

    const response = await apiClient.get(`/thesaurus/?${params}`);
    return response.data;
  },

  // Get terms by category (formatted for dropdowns)
  getDropdownOptions: async (category: string): Promise<DropdownOption[]> => {
    const response = await apiClient.get(`/thesaurus/by-category/${category}`);
    return response.data;
  },

  // Get a single term
  getTerm: async (id: string): Promise<ThesaurusTerm> => {
    const response = await apiClient.get(`/thesaurus/${id}`);
    return response.data;
  },

  // Create a new term (admin only)
  createTerm: async (data: Partial<ThesaurusTerm>): Promise<ThesaurusTerm> => {
    const response = await apiClient.post('/thesaurus/', data);
    return response.data;
  },

  // Update a term (admin only)
  updateTerm: async (id: string, data: Partial<ThesaurusTerm>): Promise<ThesaurusTerm> => {
    const response = await apiClient.put(`/thesaurus/${id}`, data);
    return response.data;
  },

  // Delete a term (admin only)
  deleteTerm: async (id: string): Promise<void> => {
    await apiClient.delete(`/thesaurus/${id}`);
  },

  // Bulk create terms (admin only)
  bulkCreate: async (terms: Partial<ThesaurusTerm>[]): Promise<{ created: number; errors: string[] }> => {
    const response = await apiClient.post('/thesaurus/bulk', terms);
    return response.data;
  },

  // Sync from existing data (admin only)
  syncFromData: async (): Promise<{ message: string; added: Record<string, number> }> => {
    const response = await apiClient.post('/thesaurus/sync-from-data');
    return response.data;
  },
};
