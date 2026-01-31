import apiClient from './client';

export interface DistributionItem {
  value: string;
  count: number;
  percentage: number;
}

export interface Distribution {
  variable: string;
  total: number;
  unique_values: number;
  distribution: DistributionItem[];
  concentration_index: number;
  concentration_level: string;
  mode: string | null;
  mode_count: number;
}

export interface ChiSquareResult {
  chi_square: number;
  p_value: number;
  degrees_of_freedom: number;
  significance: 'significant' | 'not significant';
  strength: 'negligible' | 'weak' | 'moderate' | 'strong';
  interpretation: string;
}

export interface CrossTab {
  rows: string[];
  columns: string[];
  counts: number[][];
  percentages: number[][];
  row_variable: string;
  col_variable: string;
}

export interface CorrelationAnalysis {
  pair: [string, string];
  crosstab: CrossTab;
  chi_square: ChiSquareResult;
}

export interface CorrelationResult {
  variables: string[];
  analyses: CorrelationAnalysis[];
  narrative: string;
}

export interface CollectionData {
  total: number;
  object_types: Record<string, number>;
  materials: Record<string, number>;
  chronologies: Record<string, number>;
  on_display_pct: number;
}

export interface CollectionComparison {
  collections: Record<string, CollectionData>;
  commonalities: string[];
  differences: string[];
  narrative: string;
}

export interface AnalyticsSummary {
  total: number;
  collections: number;
  object_types: number;
  materials: number;
  chronologies: number;
  on_display: number;
}

export interface ComprehensiveReport {
  generated_at: string;
  total_artifacts: number;
  summary: AnalyticsSummary;
  distributions: Record<string, Distribution>;
  correlations: Record<string, { crosstab: CrossTab; chi_square: ChiSquareResult }>;
  collection_comparison?: CollectionComparison;
  main_narrative: string;
}

export interface AnalyticsVariable {
  id: string;
  name: string;
  description: string;
}

export interface SuggestedCorrelation {
  var1: string;
  var2: string;
  description: string;
}

export interface VariablesResponse {
  categorical: AnalyticsVariable[];
  suggested_correlations: SuggestedCorrelation[];
}

export const analyticsApi = {
  getReport: async (collection?: string): Promise<ComprehensiveReport> => {
    const params = collection ? { collection } : {};
    const response = await apiClient.get('/analytics/report', { params });
    return response.data;
  },

  getDistribution: async (variable: string, collection?: string): Promise<Distribution> => {
    const params = collection ? { collection } : {};
    const response = await apiClient.get(`/analytics/distribution/${variable}`, { params });
    return response.data;
  },

  getCrossTab: async (rowVar: string, colVar: string, collection?: string): Promise<{ crosstab: CrossTab; chi_square: ChiSquareResult }> => {
    const params: Record<string, string> = { row: rowVar, col: colVar };
    if (collection) params.collection = collection;
    const response = await apiClient.get('/analytics/crosstab', { params });
    return response.data;
  },

  analyzeCorrelation: async (variables: string[], collection?: string): Promise<CorrelationResult> => {
    const response = await apiClient.post('/analytics/correlation', { variables, collection });
    return response.data;
  },

  compareCollections: async (): Promise<CollectionComparison> => {
    const response = await apiClient.get('/analytics/compare-collections');
    return response.data;
  },

  getMaterialAnalysis: async (collection?: string): Promise<any> => {
    const params = collection ? { collection } : {};
    const response = await apiClient.get('/analytics/materials', { params });
    return response.data;
  },

  getChronologyAnalysis: async (collection?: string): Promise<any> => {
    const params = collection ? { collection } : {};
    const response = await apiClient.get('/analytics/chronology', { params });
    return response.data;
  },

  getVariables: async (): Promise<VariablesResponse> => {
    const response = await apiClient.get('/analytics/variables');
    return response.data;
  },

  exportExcel: async (collection?: string): Promise<Blob> => {
    const params = collection ? { collection } : {};
    const response = await apiClient.get('/analytics/export/excel', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  exportDocx: async (collection?: string): Promise<Blob> => {
    const params = collection ? { collection } : {};
    const response = await apiClient.get('/analytics/export/docx', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};
