import type { Ranking } from "../types";


interface Props {
  rankings: Ranking[];
}

function scoreColor(score: number): string {
  if (score >= 8) return '#2da066';
  if (score >= 5) return '#d97706';
  return '#dc2626';
}

export default function ScoreBadge({ rankings }: Props) {
  if (!rankings.length) return <span className="text-gray-400 text-sm">—</span>;

  const sorted  = [...rankings].sort((a, b) => b.year - a.year);
  const latest  = sorted[0];
  const color   = scoreColor(latest.ranking);
  const pct     = (latest.ranking / 10) * 100;

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <span
        className="font-mono font-bold text-base w-5 text-right"
        style={{ color }}
      >
        {latest.ranking}
      </span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {sorted.length > 1 && (
        <select
          className="text-xs text-gray-400 bg-transparent border-none outline-none cursor-pointer"
          defaultValue={latest.year}
          title="Historical scores"
        >
          {sorted.map(r => (
            <option key={r.year} value={r.year}>
              {r.year}: {r.ranking}/10
            </option>
          ))}
        </select>
      )}
    </div>
  );
}