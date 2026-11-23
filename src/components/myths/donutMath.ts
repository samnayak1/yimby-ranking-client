// Under a million, thousands: 450,000 as "0.5M" would quietly round it to 500K.
export const millions = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1_000).toLocaleString('en-US')}K`;

/**
 * Percentages rounded so they sum to exactly 100 (largest remainder), so a
 * legend never shows a pie adding up to 101%.
 */
export function roundedPercents(values: number[], decimals: number): number[] {
  const scale = 10 ** decimals;
  const total = values.reduce((a, b) => a + b, 0);
  const raw = values.map(v => (v / total) * 100 * scale);
  const out = raw.map(Math.floor);
  const short = 100 * scale - out.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => ({ i, rem: r - Math.floor(r) }))
    .sort((a, b) => b.rem - a.rem)
    .slice(0, short)
    .forEach(({ i }) => { out[i] += 1; });
  return out.map(v => v / scale);
}
