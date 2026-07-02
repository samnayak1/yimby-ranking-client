import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { politiciansApi } from '../services/api.service';
import type { PoliticianFilters} from '../types';

export const politicianKeys = {
  all: ['politicians'] as const,
  lists: () => [...politicianKeys.all, 'list'] as const,
  list: (filters: PoliticianFilters) => [...politicianKeys.lists(), filters] as const,
  details: () => [...politicianKeys.all, 'detail'] as const,
  detail: (id: number) => [...politicianKeys.details(), id] as const,
  filterOptions: () => [...politicianKeys.all, 'filter-options'] as const,
};



export function usePoliticianFilterOptions() {
  return useQuery({
    queryKey: politicianKeys.filterOptions(),
    queryFn: () => politiciansApi.getFilterOptions().then(res => res.data),
    retry: false,
    initialData: { designations: [], politicalLeanings: [], nationalities: [] },
  });
}

export function usePoliticians(filters: PoliticianFilters = {}) {
  return useQuery({
    queryKey: politicianKeys.list(filters),
    queryFn: () => politiciansApi.getAll(filters).then(res => res.data)
  });
}

export function usePolitician(id: number) {
  return useQuery({
    queryKey: politicianKeys.detail(id),
    queryFn: () => politiciansApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
}



export function useCreatePolitician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => politiciansApi.create(data).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: politicianKeys.lists() });
    },
  });
}

export function useUpdatePolitician(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => politiciansApi.update(id, data).then(res => res.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: politicianKeys.lists() });
      qc.setQueryData(politicianKeys.detail(id), data);
    },
  });
}

export function useDeletePolitician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => politiciansApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: politicianKeys.lists() });
    },
  });
}

export function useUpsertPoliticianRanking(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ year, ranking }: { year: number; ranking: number }) =>
      politiciansApi.upsertRanking(id, year, ranking).then(res => res.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: politicianKeys.lists() });
      qc.setQueryData(politicianKeys.detail(id), data);
    },
  });
}