import axios from 'axios';
import { getAccessToken } from './auth.service';
import type { ApiResponse, City, PaginatedResponse, Politician, UpsertCityBody, UpsertCityInput, UpsertCityRatingBody, UpsertPoliticianBody, UpsertPoliticianInput } from '../types';

const client = axios.create({
    baseURL: '/api',
});


client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});


client.interceptors.response.use(
    (res) => res,
    (err) => {
        const message = err.response?.data?.error ?? err.message ?? 'Request failed';
        throw new Error(message);
    }
);


export const politiciansApi = {
  getAll: (params?: any) =>
    client.get<PaginatedResponse<Politician>>('/politicians', { params }),

  getById: (id: number) =>
    client
      .get<ApiResponse<Politician>>(`/politicians/${id}`)
      .then((r) => r.data),

  create: (body: UpsertPoliticianBody) =>
    client
      .post<ApiResponse<Politician>>('/politicians', body)
      .then((r) => r.data),

  update: (id: number, body: UpsertPoliticianInput) =>
    client
      .patch<ApiResponse<Politician>>(`/politicians/${id}`, body)
      .then((r) => r.data),

  delete: (id: number) =>
    client.delete<void>(`/politicians/${id}`),

  upsertRatings: (
id: number, body: any,
  ) =>
    client
      .put<ApiResponse<Politician>>(
        `/politicians/${id}/ratings`,
        body,
      )
      .then((r) => r.data),

  getFilterOptions: () =>
    client.get<{
      designations: string[];
      politicalLeanings: string[];
      nationalities: string[];
    }>('/politicians/filter/filter-options'),
};

export const citiesApi = {
  getAll: (params?: any) =>
    client.get<PaginatedResponse<City>>('/cities', { params }),

  getById: (id: number) =>
    client
      .get<ApiResponse<City>>(`/cities/${id}`)
      .then((r) => r.data),

  create: (body: UpsertCityBody) =>
    client
      .post<ApiResponse<City>>('/cities', body)
      .then((r) => r.data),

  update: (id: number, body: UpsertCityInput) =>
    client
      .patch<ApiResponse<City>>(`/cities/${id}`, body)
      .then((r) => r.data),

  delete: (id: number) =>
    client.delete<void>(`/cities/${id}`),

  upsertRatings: (
    id: number,
    body: UpsertCityRatingBody,
  ) =>
    client
      .put<ApiResponse<City>>(
        `/cities/${id}/ratings`,
        body,
      )
      .then((r) => r.data),

  getFilterOptions: () =>
    client.get<{
      countries: string[];
      regions: string[];
      currencies: string[];
    }>('/cities/filter/filter-options'),
};