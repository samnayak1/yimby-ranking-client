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
 * The four groups sum exactly to the vacant total, and the rounded values below
 * sum to 14.0. When updating, keep both true and change the year in SOURCE.
 */

const GROUPS = [
  {
    value: '4.3 million',
    text: 'are vacation, seasonal or occasional-use homes: beach houses, ski cabins and pieds-à-terre that nobody lives in year-round.',
  },
  {
    value: '4.7 million',
    text: 'are for rent or sale, or already rented or sold and waiting for someone to move in. That’s normal turnover: without it, nobody could move.',
  },
  {
    value: '2.1 million',
    text: 'need repairs, are being renovated, or are abandoned or possibly condemned.',
  },
  {
    value: '2.9 million',
    text: 'are empty for other reasons, such as an estate being settled, a legal dispute, an owner away for a long stretch, or a home used for storage.',
  },
];

const SOURCE_LINKS = [
  { table: 'B25004', href: 'https://data.census.gov/table/ACSDT1Y2024.B25004' },
  { table: 'B25130', href: 'https://data.census.gov/table/ACSDT1Y2024.B25130' },
];

export default function VacancyMyth() {
  return (
    <section aria-labelledby="vacancy-myth" className="mt-8 max-w-2xl border-l-4 border-yimby-300 pl-5">
      <h2 id="vacancy-myth" className="sr-only">Myth and fact: vacant homes</h2>

      <p className="text-base leading-relaxed text-gray-700">
        <span className="mr-2 text-xs font-bold uppercase tracking-[0.14em] text-red-700">Myth</span>
        America has 14&nbsp;million empty homes, so we don’t need to build more.
      </p>

      <p className="mt-4 text-base leading-relaxed text-gray-700">
        <span className="mr-2 text-xs font-bold uppercase tracking-[0.14em] text-yimby-700">Fact</span>
        Of the 146.7&nbsp;million homes in the US, about 14.0&nbsp;million were vacant when
        the Census Bureau surveyed them in 2024. But “vacant” covers much more than
        empty homes waiting for a family. Of those 14.0&nbsp;million:
      </p>

      <ul className="mt-3 space-y-2 text-base leading-relaxed text-gray-600">
        {GROUPS.map(g => (
          <li key={g.value} className="flex gap-3">
            <span className="w-24 shrink-0 font-semibold tabular-nums text-gray-900">{g.value}</span>
            <span>{g.text}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-base leading-relaxed text-gray-700">
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
    </section>
  );
}
