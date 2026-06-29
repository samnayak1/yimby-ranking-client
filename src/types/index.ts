export interface Ranking {
  year:    number;
  ranking: number;
}

export interface Politician {
  id:              number;
  name:            string;
  designation:     string | null;
  isInOffice:      number;
  nationality:     string | null;
  politicalLeaning: string | null;
  notes:           string | null;
  rankings:        Ranking[];
}

export interface City {
  id:               number;
  name:             string;
  country:          string;
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