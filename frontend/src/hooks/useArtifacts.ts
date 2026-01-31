import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artifactsApi } from '../api/artifacts';
import { ArtifactFormData } from '../types';

export const useArtifacts = (params?: {
  page?: number;
  per_page?: number;
  collection?: string;
  object_type?: string;
  material?: string;
  on_display?: boolean;
}) => {
  return useQuery({
    queryKey: ['artifacts', params],
    queryFn: () => artifactsApi.list(params),
  });
};

export const useArtifact = (id: string) => {
  return useQuery({
    queryKey: ['artifact', id],
    queryFn: () => artifactsApi.get(id),
    enabled: !!id,
  });
};

export const useArtifactMedia = (id: string) => {
  return useQuery({
    queryKey: ['artifact-media', id],
    queryFn: () => artifactsApi.getMedia(id),
    enabled: !!id,
  });
};

export const useArtifactFilters = () => {
  return useQuery({
    queryKey: ['artifact-filters'],
    queryFn: () => artifactsApi.getFilters(),
  });
};

export const useCreateArtifact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ArtifactFormData) => artifactsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
    },
  });
};

export const useUpdateArtifact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ArtifactFormData> }) =>
      artifactsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      queryClient.invalidateQueries({ queryKey: ['artifact', id] });
    },
  });
};

export const useDeleteArtifact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => artifactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
    },
  });
};
