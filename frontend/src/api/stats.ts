import apiClient from './client';
import { DashboardStats } from '../types';

interface CollectionStats {
  coverage: {
    with_images: number;
    with_annotations: number;
    avg_images_per_artifact: number;
  };
  chronologies: { name: string; count: number }[];
  findspots: { name: string; count: number }[];
}

interface CatalogStats {
  collection: string | null;
  collection_name: string;
  narrative: string;
  totals: {
    artifacts: number;
    media: number;
    annotations: number;
    on_display: number;
    in_storage: number;
  };
  photo_coverage: {
    with_images: number;
    without_images: number;
    percentage: number;
    total_images: number;
    avg_per_artifact: number;
  };
  missing_photos: { id: string; sequence_number: string; object_type: string }[];
  documentation: {
    avg_completeness: number;
    distribution: { complete: number; partial: number; minimal: number };
    fields_tracked: string[];
  };
  materials: { name: string; count: number; percentage: number }[];
  object_types: { name: string; count: number; percentage: number }[];
  chronologies: { name: string; count: number }[];
  findspots: { name: string; count: number }[];
  highlights: {
    most_photographed: { id: string; sequence_number: string; object_type: string; image_count: number }[];
    most_annotated: { id: string; sequence_number: string; object_type: string; annotation_count: number }[];
  };
  cross_references: {
    british_museum: number;
  };
}

export const statsApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/stats/dashboard');
    return response.data;
  },

  getCollection: async (): Promise<CollectionStats> => {
    const response = await apiClient.get('/stats/collection');
    return response.data;
  },

  getCatalog: async (collection?: string): Promise<CatalogStats> => {
    const params = collection ? { collection } : {};
    const response = await apiClient.get('/stats/catalog', { params });
    return response.data;
  },
};
