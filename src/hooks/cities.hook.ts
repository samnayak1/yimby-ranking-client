import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesApi } from '../services/api.service';
import type {  CityFilters, UpsertCityRatingInput } from '../types';

export const cityKeys = {
  all: ['cities'] as const,
  lists: () => [...cityKeys.all, 'list'] as const,
  list: (filters: CityFilters) => [...cityKeys.lists(), filters] as const,
  details: () => [...cityKeys.all, 'detail'] as const,
  detail: (id: number) => [...cityKeys.details(), id] as const,
  filterOptions: () => [...cityKeys.all, 'filter-options'] as const,
};

interface UpdateCityInput {
  id: number;
  name: string;
  countryCode: string;
  region?: string;
  medianHousePrice?: number;
  currency?: string;
  notes?: string;
  lat?: number;
  lng?: number;
}


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

export function useUpdateCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateCityInput) => {
      return citiesApi.update(id, body);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cities'],
      });
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

export function useUpsertCityRatings() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: UpsertCityRatingInput) =>
      citiesApi.upsertRatings(id, body).then((res) => res.data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: cityKeys.lists() });
      qc.invalidateQueries({ queryKey: cityKeys.detail(variables.id) });
    },
  });
}