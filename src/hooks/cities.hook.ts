import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesApi } from '../services/api.service';

export const cityKeys = {
  all: ['cities'] as const,
  detail: (id: number) => ['cities', id] as const,
};

export function useCities() {
  return useQuery({
    queryKey: cityKeys.all,
    queryFn: () => citiesApi.getAll().then(r => r.data),
  });
}

export function useCity(id: number) {
  return useQuery({
    queryKey: cityKeys.detail(id),
    queryFn: () => citiesApi.getById(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => citiesApi.create(body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: cityKeys.all }),
  });
}

export function useUpdateCity(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => citiesApi.update(id, body).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: cityKeys.all });
      qc.setQueryData(cityKeys.detail(id), data);
    },
  });
}

export function useDeleteCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => citiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: cityKeys.all }),
  });
}

export function useUpsertCityRanking(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ year, ranking }: { year: number; ranking: number }) =>
      citiesApi.upsertRanking(id, year, ranking).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cityKeys.all });
      qc.invalidateQueries({ queryKey: cityKeys.detail(id) });
    },
  });
}