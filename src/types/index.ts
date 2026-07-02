export interface Ranking {
  year:    number;
  ranking: number;
}

export interface Politician {
  id:              number;
  name:            string;
  designation:     string | null;
  isInOffice:      number;
  nationalityCode:     string | null;
  politicalLeaning: string | null;
  notes:           string | null;
  rankings:        Ranking[];
}

export interface City {
  id:               number;
  name:             string;
  countryCode:          string;
  region:           string | null;
  medianHousePrice: number | null;
  currency:         string | null;
  notes:            string | null;
  lat:              number | null;
  lng:              number | null;
  rankings:         Ranking[];
}

export interface AuthUser {
  sub:    string;
  email:  string;
  groups: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CityFilters extends PaginationParams {
  search?: string;
  countryCode?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  minScore?: number;
  maxScore?: number;
}


export interface PoliticianFilters extends PaginationParams {
  search?: string;
  designation?: string;
  politicalLeaning?: string;
  nationalityCode?: string;
  isInOffice?: boolean;
  minScore?: number;
  maxScore?: number;
  cityId?: number;
}

export type CityFilterOptions = {
  countries: string[];
  regions: string[];
  currencies: string[];
}

export type PoliticianFilterOptions = {
  designations: string[];
  politicalLeanings: string[];
  nationalities: string[];
}