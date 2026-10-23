import { useState } from 'react';

/*
 * Figures: U.S. Census Bureau, 2024 American Community Survey 1-year estimates,
 * national level.
 *   B25001  housing units                        146,740,960
 *   B25004  vacant housing units                  14,003,818
 *           seasonal/recreational/occasional       4,342,127
 *           for rent + rented, not occupied +      4,695,392
 *             for sale only + sold, not occupied
 *   B25130  "other vacant", by reason:
 *           needs repairs + being repaired/        2,070,014
 *             renovated + abandoned/possibly condemned
 *           every other reason (+ migrant-worker   2,896,285
 *             housing from B25004)
 * The four slices sum exactly to the vacant total. When updating, keep that true
 * and change the year in the copy and the source links.
 *
 * Colours are slots 1–4 of the validated categorical palette, in fixed order.
 * Every pair that touches in the ring (1-2, 2-3, 3-4, 4-1) passes the colour-
 * vision checks. Slots 3 and 4 are under 3:1 against white, which is why every
 * slice also has a visible percentage label and a named legend row.
 */

const TOTAL_HOMES = 146_740_960;
const TOTAL_VACANT = 14_003_818;

interface Slice {
  key: string;
  label: string;
  short: string;   // centre readout on hover
  note: string;
  value: number;
  color: string;
}

const SLICES: Slice[] = [
  {
    key: 'seasonal',
    label: 'Vacation and seasonal homes',
    short: 'vacation homes',
    note: 'Beach houses and ski cabins nobody lives in year-round.',
    value: 4_342_127,
    color: '#2a78d6',
  },
  {
    key: 'market',
    label: 'For rent or sale, or awaiting move-in',
    short: 'on the market',
    note: 'Normal turnover. Without it, nobody could move.',
    value: 4_695_392,
    color: '#eb6834',
  },
  {
    key: 'repair',
    label: 'Need repairs or abandoned',
    short: 'need work',
    note: 'Under renovation, needing repairs, or possibly condemned.',
    value: 2_070_014,
    color: '#1baf7a',
  },
  {
    key: 'other',
    label: 'Other reasons',
    short: 'other reasons',
    note: 'An estate being settled, a legal dispute, an owner away.',
    value: 2_896_285,
    color: '#eda100',
  },
];

const SOURCE_LINKS = [
  { table: 'B25004', href: 'https://data.census.gov/table/ACSDT1Y2024.B25004' },
  { table: 'B25130', href: 'https://data.census.gov/table/ACSDT1Y2024.B25130' },
];

const millions = (n: number) => `${(n / 1_000_000).toFixed(1)}M`;

/**
 * Whole percentages that add up to exactly 100 (largest remainder), so the
 * legend never shows a pie that sums to 101%.
 */
function wholePercents(values: number[]): number[] {
  const total = values.reduce((a, b) => a + b, 0);
  const raw = values.map(v => (v / total) * 100);
  const out = raw.map(Math.floor);
  const short = 100 - out.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => ({ i, rem: r - Math.floor(r) }))
    .sort((a, b) => b.rem - a.rem)
    .slice(0, short)
    .forEach(({ i }) => { out[i] += 1; });
  return out;
}

const PERCENTS = wholePercents(SLICES.map(s => s.value));

// Ring geometry, in a 260×260 viewBox. Angles run clockwise from 12 o'clock.
const C = 130;
const R_OUTER = 92;
const R_INNER = 58;
const R_LABEL = 112;

const point = (r: number, a: number) => [C + r * Math.sin(a), C - r * Math.cos(a)] as const;

function segmentPath(a0: number, a1: number): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [ox0, oy0] = point(R_OUTER, a0);
  const [ox1, oy1] = point(R_OUTER, a1);
  const [ix1, iy1] = point(R_INNER, a1);
  const [ix0, iy0] = point(R_INNER, a0);
  return [
    `M ${ox0} ${oy0}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${ox1} ${oy1}`,
    `L ${ix1} ${iy1}`,
    `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${ix0} ${iy0}`,
    'Z',
  ].join(' ');
}

const SEGMENTS = (() => {
  let start = 0;
  return SLICES.map((s, i) => {
    const sweep = (s.value / TOTAL_VACANT) * Math.PI * 2;
    const seg = { ...s, percent: PERCENTS[i], a0: start, a1: start + sweep, mid: start + sweep / 2 };
    start += sweep;
    return seg;
  });
})();

const CHART_SUMMARY =
  `Donut chart of the ${millions(TOTAL_VACANT)} vacant homes: ` +
  SEGMENTS.map(s => `${s.label}, ${millions(s.value)} (${s.percent}%)`).join('; ') + '.';

export default function VacancyMyth() {
  const [active, setActive] = useState<string | null>(null);
  const activeSlice = SEGMENTS.find(s => s.key === active) ?? null;

  const highlight = (key: string) => ({
    onMouseEnter: () => setActive(key),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(key),
    onBlur: () => setActive(null),
  });

  return (
    <section aria-labelledby="vacancy-myth" className="mt-8 max-w-3xl">
      <h2 id="vacancy-myth" className="sr-only">Myth and fact: vacant homes</h2>

      <div>
        <p className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-red-700">Myth</p>
        <p className="mt-2 text-base sm:text-lg leading-relaxed text-gray-700">
          “America has 14&nbsp;million empty homes, so we don’t need to build more.”
        </p>
      </div>

      <div className="mt-8">
        <p className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-yimby-700">Fact</p>
        <p className="mt-2 text-base sm:text-lg leading-relaxed text-gray-700">
          Of the {(TOTAL_HOMES / 1_000_000).toFixed(1)}&nbsp;million homes in the US, about{' '}
          {(TOTAL_VACANT / 1_000_000).toFixed(1)}&nbsp;million were vacant in 2024. But “vacant”
          covers much more than empty homes waiting for a family:
        </p>

        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
          <svg
            viewBox="0 0 260 260"
            className="w-48 shrink-0 sm:w-52"
            role="img"
            aria-label={CHART_SUMMARY}
          >
            {SEGMENTS.map(s => (
              <path
                key={s.key}
                d={segmentPath(s.a0, s.a1)}
                fill={s.color}
                // 2px surface gap between slices: white doing the separating.
                stroke="#ffffff"
                strokeWidth={2}
                strokeLinejoin="round"
                opacity={active && active !== s.key ? 0.3 : 1}
                style={{ transition: 'opacity 150ms', cursor: 'pointer' }}
                {...highlight(s.key)}
              >
                <title>{`${s.label}: ${millions(s.value)} (${s.percent}%)`}</title>
              </path>
            ))}

            {/* Direct labels just outside the ring, in ink rather than the slice
                colour so the lighter slices stay readable. */}
            {SEGMENTS.map(s => {
              const [x, y] = point(R_LABEL, s.mid);
              return (
                <text
                  key={`${s.key}-label`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fontWeight="600"
                  fill="#374151"
                  opacity={active && active !== s.key ? 0.3 : 1}
                  style={{ transition: 'opacity 150ms' }}
                  aria-hidden="true"
                >
                  {s.percent}%
                </text>
              );
            })}

            {/* Centre readout: the total, or the hovered slice. */}
            <text x={C} y={C - 6} textAnchor="middle" fontSize="26" fontWeight="800" fill="#111827" aria-hidden="true">
              {millions(activeSlice ? activeSlice.value : TOTAL_VACANT)}
            </text>
            <text x={C} y={C + 16} textAnchor="middle" fontSize="11" fill="#6b7280" aria-hidden="true">
              {activeSlice ? activeSlice.short : 'vacant homes'}
            </text>
          </svg>

          <ul className="w-full space-y-1 text-sm">
            {SEGMENTS.map(s => (
              <li
                key={s.key}
                tabIndex={0}
                className={`flex gap-3 rounded-lg px-3 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-yimby-300 ${
                  active === s.key ? 'bg-gray-100' : ''
                }`}
                {...highlight(s.key)}
              >
                <span className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-semibold text-gray-900">{s.label}</span>
                    <span className="tabular-nums text-gray-900">
                      <span className="font-semibold">{millions(s.value)}</span>
                      <span className="text-gray-500"> · {s.percent}%</span>
                    </span>
                  </span>
                  <span className="block text-xs text-gray-500">{s.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-5 text-sm sm:text-base leading-relaxed text-gray-700">
          There isn’t a hidden supply of 14&nbsp;million homes waiting for people. Most are
          vacation homes, homes between occupants, or homes that need work.
        </p>

        <p className="mt-3 text-xs text-gray-400">
          Source: U.S. Census Bureau, 2024 American Community Survey (1-year), tables{' '}
          {SOURCE_LINKS.map((s, i) => (
            <span key={s.table}>
              {i > 0 && ' and '}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-gray-600"
              >
                {s.table}
              </a>
            </span>
          ))}
          .
        </p>
      </div>
    </section>
  );
}
