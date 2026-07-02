import axios from 'axios';
import { getAccessToken } from './auth.service';
import type { City, PaginatedResponse, Politician } from '../types';

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
    getAll: (params?: any) => client.get<PaginatedResponse<Politician>>('/politicians', { params }),
    getById: (id: number) => client.get<{ data: any }>(`/politicians/${id}`).then(r => r.data),
    create: (body: any) => client.post<{ data: any }>('/politicians', body).then(r => r.data),
    update: (id: number, body: any) => client.patch<{ data: any }>(`/politicians/${id}`, body).then(r => r.data),
    delete: (id: number) => client.delete(`/politicians/${id}`),
    upsertRanking: (id: number, year: number, ranking: number) => client.put<{ data: any }>(`/politicians/${id}/rankings`, { year, ranking }).then(r => r.data),
    getFilterOptions: () => client.get<{ designations: string[]; politicalLeanings: string[]; nationalities: string[]; }>('/politicians/filter/filter-options'),
};



export const citiesApi = {
    getAll: (params?: any) => client.get<PaginatedResponse<City>>('/cities', { params }),
    getById: (id: number) => client.get<{ data: City }>(`/cities/${id}`).then(r => r.data),
    create: (body: any) => client.post<{ data: any }>('/cities', body).then(r => r.data),
    update: (id: number, body: any) => client.patch<{ data: any }>(`/cities/${id}`, body).then(r => r.data),
    delete: (id: number) => client.delete(`/cities/${id}`),
    upsertRanking: (id: number, year: number, ranking: number) => client.put<{ data: any }>(`/cities/${id}/rankings`, { year, ranking }).then(r => r.data),
    getFilterOptions: () => client.get<{ countries: string[], regions: string[], currencies: string[] }>('/cities/filter/filter-options'),
};