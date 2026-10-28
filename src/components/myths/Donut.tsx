import { useState } from 'react';

export interface DonutSlice {
  key: string;
  label: string;
  /** Centre readout while this slice is hovered. */
  short: string;
  note?: string;
  value: number;
  color: string;
}

interface Props {
  slices: DonutSlice[];
  /** Centre readout when nothing is hovered, one line per entry. */
  centerLabel: string[];
  /** Decimal places for percentages. Use 1 when a slice is under ~1%. */
  decimals?: 0 | 1;
  /** Opening words of the screen-reader summary, e.g. "Vacant homes". */
  summaryLead: string;
}

// Under a million, thousands: 450,000 as "0.5M" would quietly round it to 500K.
const millions = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1_000).toLocaleString('en-US')}K`;

/**
 * Percentages rounded so they sum to exactly 100 (largest remainder), so a
 * legend never shows a pie adding up to 101%.
 */
function roundedPercents(values: number[], decimals: number): number[] {
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

// Ring geometry, in a 260×260 viewBox. Angles run clockwise from 12 o'clock.
const C = 130;
const R_OUTER = 92;
const R_INNER = 58;
const R_LABEL = 113;
// Below this sweep a slice is narrower than the 2px gap that separates slices,
// so it skips the gap (or the gap would erase it) and its label gets a leader.
const THIN = (6 * Math.PI) / 180;

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

export default function Donut({ slices, centerLabel, decimals = 0, summaryLead }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const total = slices.reduce((a, s) => a + s.value, 0);
  const percents = roundedPercents(slices.map(s => s.value), decimals);
  const fmtPct = (p: number) => `${p.toFixed(decimals)}%`;

  // Each slice starts where the ones before it end.
  const segments = slices.map((s, i) => {
    const before = slices.slice(0, i).reduce((a, x) => a + x.value, 0);
    const a0 = (before / total) * Math.PI * 2;
    const sweep = (s.value / total) * Math.PI * 2;
    return { ...s, percent: percents[i], a0, a1: a0 + sweep, mid: a0 + sweep / 2, thin: sweep < THIN };
  });

  const activeSeg = segments.find(s => s.key === active) ?? null;
  const dim = (key: string) => (active && active !== key ? 0.3 : 1);

  const highlight = (key: string) => ({
    onMouseEnter: () => setActive(key),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(key),
    onBlur: () => setActive(null),
  });

  const summary =
    `${summaryLead}, ${millions(total)} in total: ` +
    segments.map(s => `${s.label}, ${millions(s.value)} (${fmtPct(s.percent)})`).join('; ') + '.';

  const centerLines = activeSeg ? [activeSeg.short] : centerLabel;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 260 260" className="w-48 shrink-0" role="img" aria-label={summary}>
        {segments.map(s => (
          <path
            key={s.key}
            d={segmentPath(s.a0, s.a1)}
            fill={s.color}
            // 2px surface gap between slices: white doing the separating.
            stroke={s.thin ? 'none' : '#ffffff'}
            strokeWidth={2}
            strokeLinejoin="round"
            opacity={dim(s.key)}
            style={{ transition: 'opacity 150ms', cursor: 'pointer' }}
            {...highlight(s.key)}
          >
            <title>{`${s.label}: ${millions(s.value)} (${fmtPct(s.percent)})`}</title>
          </path>
        ))}

        {/* Direct labels just outside the ring, in ink rather than the slice
            colour so the lighter slices stay readable. */}
        {segments.map(s => {
          const [x, y] = point(R_LABEL, s.mid);
          const [lx0, ly0] = point(R_OUTER + 1, s.mid);
          const [lx1, ly1] = point(R_LABEL - 11, s.mid);
          return (
            <g key={`${s.key}-label`} opacity={dim(s.key)} style={{ transition: 'opacity 150ms' }} aria-hidden="true">
              {/* In the slice's own colour, so it leads the eye to a sliver
                  that's honestly only a couple of pixels wide. */}
              {s.thin && <line x1={lx0} y1={ly0} x2={lx1} y2={ly1} stroke={s.color} strokeWidth={2.5} strokeLinecap="round" />}
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="600" fill="#374151">
                {fmtPct(s.percent)}
              </text>
            </g>
          );
        })}

        {/* Centre readout: the total, or the hovered slice. */}
        <text x={C} y={C - (centerLines.length > 1 ? 14 : 6)} textAnchor="middle" fontSize="30" fontWeight="800" fill="#111827" aria-hidden="true">
          {millions(activeSeg ? activeSeg.value : total)}
        </text>
        {centerLines.map((line, i) => (
          <text key={line} x={C} y={C + 16 + i * 16} textAnchor="middle" fontSize="14" fill="#6b7280" aria-hidden="true">
            {line}
          </text>
        ))}
      </svg>

      <ul className="w-full space-y-0.5 text-sm">
        {segments.map(s => (
          <li
            key={s.key}
            tabIndex={0}
            className={`flex gap-2.5 rounded-lg px-2.5 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-yimby-300 ${
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
                  <span className="text-gray-500"> · {fmtPct(s.percent)}</span>
                </span>
              </span>
              {s.note && <span className="block text-xs text-gray-500">{s.note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
