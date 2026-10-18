import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creatorsApi, resourcesApi } from '../services/api.service';
import type { CreatorInput, ResourceInput } from '../types';

export const mediaKeys = {
  creators:  ['creators'] as const,
  resources: ['resources'] as const,
};

export function useCreators() {
  return useQuery({ queryKey: mediaKeys.creators, queryFn: creatorsApi.getAll });
}

// One request for every category; sections filter locally. Four lists of a
// few dozen links don't justify four round trips.
export function useResources() {
  return useQuery({ queryKey: mediaKeys.resources, queryFn: () => resourcesApi.getAll() });
}

export function useSaveCreator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: CreatorInput }) =>
      id ? creatorsApi.update(id, body) : creatorsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.creators }),
  });
}

export function useDeleteCreator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => creatorsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.creators }),
  });
}

export function useSaveResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: ResourceInput }) =>
      id ? resourcesApi.update(id, body) : resourcesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.resources }),
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => resourcesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.resources }),
  });
}
