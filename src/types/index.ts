// Set by hand in the admin UI, most pro-housing first.
export const COLOR_CODES = ['DARK_GREEN', 'GREEN', 'LIGHT_RED', 'DARK_RED'] as const;
export type ColorCode = (typeof COLOR_CODES)[number];

export interface PoliticianItem {
  text: string;
  url:  string | null;
}

export interface CityRating {
  year: number;
  permitsIssued?: number;
  permitsPer1000Residents?: number;
  housingStarts?: number;
  homesCompleted?: number;
  averagePermitDays?: number;
  population?: number;
  medianHousingPrice?: number;
  vacancyRate?: number;
}

export interface UpsertCityRatingBody {
  year: number;

  permitsIssued?: number;
  permitsPer1000Residents?: number;
  housingStarts?: number;
  homesCompleted?: number;
  averagePermitDays?: number;
  population?: number;
  medianHousingPrice?: number;
  vacancyRate?: number;
}
export interface UpsertCityRatingInput extends UpsertCityRatingBody {
  id: number;
}

export interface UpsertPoliticianBody {
  name: string;
  designation?: string | null;
  status: PoliticianStatus;
  nationalityCode: string;
  politicalLeaning?: string | null;
  notes?: string | null;
  colorCode?: ColorCode | null;
  quotes?: PoliticianItem[];
  good?: PoliticianItem[];
  bad?: PoliticianItem[];
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
  status:      PoliticianStatus;
  nationalityCode:     string | null;
  politicalLeaning: string | null;
  colorCode:       ColorCode | null;
  notes:           string | null;
  quotes:          PoliticianItem[];
  good:            PoliticianItem[];
  bad:             PoliticianItem[];
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
  sortBy?:
    | "name"
    | "countryCode"
    | "region"
    | "medianHousePrice"
    | "permitsPer1000Residents";
  sortOrder?: 'asc' | 'desc';
}


export interface PoliticianFilters extends PaginationParams {
  search?: string;
  designation?: string;
  politicalLeaning?: string;
  nationalityCode?: string;
  status?: PoliticianStatus;
  cityId?: number;

  sortBy?:
    | "name"
    | "designation"
    | "politicalLeaning"
    | "nationalityCode"
    | "colorCode";

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
  // Latest year's figure.
  permitsPer1000Residents: number | null;
  medianHousePrice: number | null;
  currency:         string | null;
  notes:            string | null;
};

export const PoliticianStatus = {
  RUNNING: "RUNNING",
  INOFFICE: "INOFFICE",
  RETIRED: "RETIRED",
  OUT: "OUT",
} as const;

export type PoliticianStatus =
  (typeof PoliticianStatus)[keyof typeof PoliticianStatus];

export const statusColors: Record<PoliticianStatus, string> = {
  RUNNING: "blue",
  INOFFICE: "green",
  RETIRED: "gold",
  OUT: "default",
};

export const statusLabels: Record<PoliticianStatus, string> = {
  RUNNING: "Running",
  INOFFICE: "In Office",
  RETIRED: "Retired",
  OUT: "Out of Office",
};
export type ResourceCategory = 'website' | 'article' | 'study';

export type CreatorPlatform = 'youtube' | 'x' | 'instagram' | 'bluesky' | 'website';
export type CreatorTag = 'transit' | 'urbanism' | 'econ' | 'policy';

export interface Creator {
  id:          number;
  name:        string;
  description: string | null;
  platform:    CreatorPlatform;
  url:         string;
  tags:        CreatorTag[];
  nationalityCode: string | null;
  sortOrder:   number;
}

export interface Resource {
  id:          number;
  category:    ResourceCategory;
  title:       string;
  url:         string;
  description: string | null;
  source:      string | null;
  publishedOn: string | null;
  sortOrder:   number;
}

// Optional fields accept "" so a cleared form field removes the stored value.
export type CreatorInput  = Partial<Omit<Creator, 'id'>> & { name: string; platform: CreatorPlatform; url: string };
export type ResourceInput = Partial<Omit<Resource, 'id'>> & { category: ResourceCategory; title: string; url: string };
