import type { City } from '../types';

/**
 * A city's headline figure: permits per 1,000 residents from the most recent
 * year that has one. Matches how the API sorts and what the map shows.
 */
export function latestPermitsPer1000(city: Pick<City, 'ratings'>): { value: number; year: number } | null {
  const row = [...(city.ratings ?? [])]
    .sort((a, b) => b.year - a.year)
    .find(r => r.permitsPer1000Residents != null);
  return row ? { value: row.permitsPer1000Residents!, year: row.year } : null;
}

export const formatPermits = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
