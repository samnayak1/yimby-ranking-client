export interface Rating {
  year:    number;
  rating: number;
}

export interface CityRating {
  year: number;

  rating: number;
  permitsIssued?: number;
  permitsPer1000Residents?: number;
  housingStarts?: number;
  homesCompleted?: number;
  averagePermitDays?: number;
  population?: number;
}

export interface UpsertCityRatingBody {
  year: number;

  rating?: number;
  permitsIssued?: number;
  permitsPer1000Residents?: number;
  housingStarts?: number;
  homesCompleted?: number;
  averagePermitDays?: number;
  population?: number;
}
export interface UpsertCityRatingInput extends UpsertCityRatingBody {
  id: number;
}

export interface UpsertPoliticianBody {
  name: string;
  designation?: string | null;
  isInOffice: number;
  nationalityCode: string;
  politicalLeaning?: string | null;
  notes?: string | null;

}
export interface UpsertPoliticianInput extends UpsertPoliticianBody {
  id: number;
}

export interface UpsertCityBody {
  name: string;
  countryCode: string;
  region?: string | null;
  medianHousePrice?: number | null;
  currency?: string | null;
  notes?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface UpsertCityInput extends UpsertCityBody {
  id: number;
}





export interface Politician {
  id:              number;
  name:            string;
  designation:     string | null;
  isInOffice:      number;
  nationalityCode:     string | null;
  politicalLeaning: string | null;
   rating:             number|null;
  notes:           string | null;
  ratings:        Rating[];
}

export interface City {
  id:               number;
  name:             string;
  countryCode:          string;
  region:           string | null;
  medianHousePrice: number | null;
  currency:         string | null;
  rating:             number|null;
  notes:            string | null;
  lat:              number | null;
  lng:              number | null;
  ratings:         CityRating[];
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
 
}

export interface CityFilters extends PaginationParams {
  search?: string;
  countryCode?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  minScore?: number;
  maxScore?: number;
  sortBy?:
    | "name"
    | "countryCode"
    | "region"
    | "medianHousePrice"
    | "rating";
  sortOrder?: 'asc' | 'desc';
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

  sortBy?:
    | "name"
    | "designation"
    | "politicalLeaning"
    | "nationalityCode"
    | "rating";

  sortOrder?: "asc" | "desc";
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


export interface ApiResponse<T> {
  data: T;
}


export type CityMapPoint = {
  id:               number;
  name:             string;
  country:          string;
  region:           string | null;
  lat:              number;
  lng:              number;
  rating:           number | null;
  medianHousePrice: number | null;
  currency:         string | null;
  notes:            string | null;
};