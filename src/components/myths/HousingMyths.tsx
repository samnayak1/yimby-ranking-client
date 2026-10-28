import type { ReactNode } from 'react';
import Donut, { type DonutSlice } from './Donut';

/*
 * Each chart is an emphasis chart: the slices the fact is about are in colour,
 * everything else is grey. Grey shades step in lightness and every slice is
 * separated by a 2px white gap, so the grey divisions stay visible. Every
 * slice also has a printed percentage and a named legend row, so colour never
 * carries meaning alone.
 *
 * Every figure below is from a primary source and each chart's slices sum
 * exactly to its total. When updating, keep that true and update the years in
 * the copy and the source lines.
 */

const GREEN = '#2da066';                                  // yimby-500: available
const BLUE = '#2a78d6';                                   // the myth's subject
const BLUE_LIGHT = '#86b6ef';
const GREYS = ['#4b5563', '#6b7280', '#9ca3af', '#cbd1d8'];

interface Source { label: string; href: string }

interface Myth {
  key: string;
  myth: string;
  fact: ReactNode;
  slices: DonutSlice[];
  centerLabel: string[];
  decimals?: 0 | 1;
  summaryLead: string;
  sourceText: string;
  sources: Source[];
}

const MYTHS: Myth[] = [
  {
    // ACS 2024 1-year, B25004 + B25130. Sum: 14,003,818 vacant homes.
    key: 'vacancy',
    myth: 'America has 14 million empty homes, so we don’t need to build more.',
    fact: (
      <>
        Only about <strong className="text-gray-900">1 in 4</strong> of the 14.0&nbsp;million
        vacant homes are actually for rent or for sale. The rest are vacation homes, already
        taken, need work, or are empty for other reasons.
      </>
    ),
    slices: [
      { key: 'available', label: 'For rent or for sale', short: 'for rent or sale', note: 'Available to move into now.', value: 3_649_763, color: GREEN },
      { key: 'seasonal', label: 'Vacation and seasonal homes', short: 'vacation homes', note: 'Beach houses and cabins nobody lives in year-round.', value: 4_342_127, color: GREYS[0] },
      { key: 'awaiting', label: 'Rented or sold, awaiting move-in', short: 'already taken', note: 'Already spoken for.', value: 1_045_629, color: GREYS[1] },
      { key: 'repair', label: 'Need repairs or abandoned', short: 'need work', note: 'Under renovation, needing repairs, or possibly condemned.', value: 2_070_014, color: GREYS[2] },
      { key: 'other', label: 'Other reasons', short: 'other reasons', note: 'An estate being settled, a legal dispute, an owner away.', value: 2_896_285, color: GREYS[3] },
    ],
    centerLabel: ['vacant homes'],
    summaryLead: 'Vacant homes in 2024',
    sourceText: 'U.S. Census Bureau, 2024 American Community Survey, tables',
    sources: [
      { label: 'B25004', href: 'https://data.census.gov/table/ACSDT1Y2024.B25004' },
      { label: 'B25130', href: 'https://data.census.gov/table/ACSDT1Y2024.B25130' },
    ],
  },
  {
    // Occupied single-family homes (1-unit detached + attached), ACS 2024 B25032:
    // owner 76,766,387 + renter 14,392,315 = 91,158,702. Large investors: GAO-24-106643
    // (citing Urban Institute): 32 investors with 1,000+ homes owned "nearly
    // 450,000" in June 2022. Other landlords = renter-occupied minus that.
    key: 'corporations',
    myth: 'Corporations are buying up all the homes.',
    fact: (
      <>
        Large investors own about <strong className="text-gray-900">1 in 200</strong>{' '}
        single-family homes. More than 8 in 10 are lived in by the people who own them.
      </>
    ),
    slices: [
      { key: 'large', label: 'Large investors (1,000+ homes)', short: 'large investors', note: '32 companies, as of June 2022.', value: 450_000, color: BLUE },
      { key: 'landlords', label: 'Other landlords', short: 'other landlords', note: 'Landlords with fewer than 1,000 homes.', value: 13_942_315, color: GREYS[2] },
      { key: 'owners', label: 'Lived in by their owners', short: 'owner-occupied', value: 76_766_387, color: GREYS[1] },
    ],
    centerLabel: ['single-family', 'homes'],
    decimals: 1,
    summaryLead: 'Occupied single-family homes by owner',
    sourceText: 'U.S. Census Bureau, 2024 American Community Survey, table',
    sources: [
      { label: 'B25032', href: 'https://data.census.gov/table/ACSDT1Y2024.B25032' },
      { label: 'GAO-24-106643 (investor count, 2022)', href: 'https://www.gao.gov/products/gao-24-106643' },
    ],
  },
  {
    // ACS 2024 1-year, S0501 row 116 (occupied housing units by nativity of
    // householder): 111,217,375 + 12,841,318 + 8,678,453 = 132,737,146.
    // Foreign-born are 14.8% of the population (same table, row 001).
    key: 'immigrants',
    myth: 'Immigrants are taking all the housing.',
    fact: (
      <>
        Immigrants head about <strong className="text-gray-900">1 in 6</strong> US households,
        close to their 15% share of the population. Most of them are US citizens.
      </>
    ),
    slices: [
      { key: 'noncitizen', label: 'Born abroad, not a citizen', short: 'not a citizen', note: 'Green-card holders, visa holders and others.', value: 8_678_453, color: BLUE },
      { key: 'naturalized', label: 'Born abroad, now a citizen', short: 'naturalized', value: 12_841_318, color: BLUE_LIGHT },
      { key: 'native', label: 'Born in the US', short: 'born in the US', value: 111_217_375, color: GREYS[2] },
    ],
    centerLabel: ['households'],
    summaryLead: 'US households by where the head of household was born',
    sourceText: 'U.S. Census Bureau, 2024 American Community Survey, table',
    sources: [
      { label: 'S0501', href: 'https://data.census.gov/table/ACSST1Y2024.S0501' },
    ],
  },
];

function SourceLine({ text, sources }: { text: string; sources: Source[] }) {
  return (
    <p className="mt-4 text-xs text-gray-400">
      Source: {text}{' '}
      {sources.map((s, i) => (
        <span key={s.href}>
          {i > 0 && (i === sources.length - 1 ? ' and ' : ', ')}
          <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-600">
            {s.label}
          </a>
        </span>
      ))}
      .
    </p>
  );
}

export default function HousingMyths() {
  return (
    <section aria-labelledby="housing-myths" className="mt-10">
      <h2 id="housing-myths" className="text-xs font-semibold uppercase tracking-[0.14em] text-yimby-600">
        Housing myths
      </h2>

      <div className="mt-5 grid gap-12 lg:grid-cols-3 lg:gap-8">
        {MYTHS.map(m => (
          <article key={m.key} aria-labelledby={`myth-${m.key}`} className="flex min-w-0 flex-col">
            <p className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-red-700">Myth</p>
            <p id={`myth-${m.key}`} className="mt-2 text-base leading-relaxed text-gray-700">
              “{m.myth}”
            </p>

            <p className="mt-6 text-3xl sm:text-4xl font-black tracking-tight leading-none text-yimby-700">Fact</p>
            <p className="mt-2 text-base leading-relaxed text-gray-700">{m.fact}</p>

            <div className="mt-5">
              <Donut slices={m.slices} centerLabel={m.centerLabel} decimals={m.decimals} summaryLead={m.summaryLead} />
            </div>

            <SourceLine text={m.sourceText} sources={m.sources} />
          </article>
        ))}
      </div>
    </section>
  );
}
