import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newsApi } from '../services/api.service';
import type { NewsQuery } from '../types';

export const newsKeys = {
  all:       ['news'] as const,
  list:      (query: NewsQuery, admin: boolean) => ['news', 'list', admin, query] as const,
  countries: ['news', 'countries'] as const,
};

/** Pages of scraped articles, newest first; fetchNextPage loads the next 20. */
export function useNews(query: NewsQuery, admin: boolean) {
  return useInfiniteQuery({
    queryKey: newsKeys.list(query, admin),
    queryFn: ({ pageParam }) => newsApi.getPage(query, pageParam, admin),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });
}

export function useNewsCountries() {
  return useQuery({ queryKey: newsKeys.countries, queryFn: newsApi.getCountries });
}

export function useSetNewsHidden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hidden }: { id: number; hidden: boolean }) => newsApi.setHidden(id, hidden),
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.all }),
  });
}
