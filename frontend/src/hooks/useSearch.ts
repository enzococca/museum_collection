import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/search';

export const useSearch = (params: {
  q?: string;
  page?: number;
  per_page?: number;
  object_type?: string;
  material?: string;
  on_display?: boolean;
  chronology?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchApi.search(params),
    enabled: !!(params.q || params.object_type || params.material || params.chronology),
  });
};

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => searchApi.suggestions(query),
    enabled: query.length >= 2,
  });
};

export const useSearchFilters = () => {
  return useQuery({
    queryKey: ['search-filters'],
    queryFn: () => searchApi.getFilters(),
  });
};
