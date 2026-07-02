import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesApi } from '../services/api.service';
import type {  CityFilters } from '../types';

export const cityKeys = {
  all: ['cities'] as const,
  lists: () => [...cityKeys.all, 'list'] as const,
  list: (filters: CityFilters) => [...cityKeys.lists(), filters] as const,
  details: () => [...cityKeys.all, 'detail'] as const,
  detail: (id: number) => [...cityKeys.details(), id] as const,
  filterOptions: () => [...cityKeys.all, 'filter-options'] as const,
};

export function useCities(filters: CityFilters = {}) {
  return useQuery({
    queryKey: cityKeys.list(filters),
    queryFn: () => citiesApi.getAll(filters).then(res => res.data)
  });
}

export function useCity(id: number) {
  return useQuery({
    queryKey: cityKeys.detail(id),
    queryFn: () => citiesApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCityFilterOptions() {
  return useQuery({
    queryKey: cityKeys.filterOptions(),
    queryFn: () => citiesApi.getFilterOptions().then(res => res.data),
    retry: false,
    initialData: { countries: [], regions: [], currencies: [] },
  });
}

export function useCreateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => citiesApi.create(data).then(res => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cityKeys.lists() });
    },
  });
}

export function useUpdateCity(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => citiesApi.update(id, data).then(res => res.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: cityKeys.lists() });
      qc.setQueryData(cityKeys.detail(id), data);
    },
  });
}

export function useDeleteCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => citiesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cityKeys.lists() });
    },
  });
}

export function useUpsertCityRanking(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ year, ranking }: { year: number; ranking: number }) =>
      citiesApi.upsertRanking(id, year, ranking).then(res => res.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: cityKeys.lists() });
      qc.setQueryData(cityKeys.detail(id), data);
    },
  });
}