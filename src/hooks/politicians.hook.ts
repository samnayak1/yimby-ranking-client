import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { politiciansApi } from '../services/api.service';

export const politicianKeys = {
  all:    ['politicians']                as const,
  detail: (id: number) => ['politicians', id] as const,
};

export function usePoliticians() {
  return useQuery({
    queryKey: politicianKeys.all,
    queryFn:  () => politiciansApi.getAll().then(r => r.data),
  });
}

export function usePolitician(id: number) {
  return useQuery({
    queryKey: politicianKeys.detail(id),
    queryFn:  () => politiciansApi.getById(id).then(r => r.data),
    enabled:  !!id,
  });
}

export function useCreatePolitician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => politiciansApi.create(body).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: politicianKeys.all }),
  });
}

export function useUpdatePolitician(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => politiciansApi.update(id, body).then(r => r.data),
    onSuccess:  (data) => {
      qc.invalidateQueries({ queryKey: politicianKeys.all });
      qc.setQueryData(politicianKeys.detail(id), data);
    },
  });
}

export function useDeletePolitician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => politiciansApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: politicianKeys.all }),
  });
}

export function useUpsertPoliticianRanking(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ year, ranking }: { year: number; ranking: number }) =>
      politiciansApi.upsertRanking(id, year, ranking).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: politicianKeys.all });
      qc.invalidateQueries({ queryKey: politicianKeys.detail(id) });
    },
  });
}