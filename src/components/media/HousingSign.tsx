/**
 * A signpost with a little house under it, pointing at the chart. The drawing is
 * decorative (aria-hidden); the message is real text laid over the board, so it
 * wraps, scales and is read by screen readers.
 *
 * Board geometry in the 340×320 viewBox: x 84–326, y 40–150, tilted -3° about
 * its centre (205, 95). The text overlay below uses the same box as percentages.
 */

const INK = '#1a6641';    // yimby-700
const DARK = '#14432c';   // yimby-900
const LEAF = '#7dd3a8';   // yimby-300
const GRASS = '#4aba84';  // yimby-400
const WOOD = '#c08a5a';
const BARK = '#7c4f2a';

const MESSAGE = 'Allowing more housing makes housing prices go down.';

/** Points left from the board toward the chart (wide screens, side by side). */
function SideArrow() {
  return (
    <g fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M86 96 C 70 96, 62 70, 48 74 C 32 79, 38 104, 52 100 C 66 96, 58 66, 38 72 C 26 76, 18 86, 6 92" />
      <path d="M17 84 L 6 92 L 18 98" />
    </g>
  );
}

/** Points up at the chart when the sign sits below it (narrow screens). */
function UpArrow() {
  return (
    <svg viewBox="0 0 60 72" className="mx-auto h-14 w-12" aria-hidden="true">
      <g fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 70 C 30 56, 14 52, 16 40 C 18 28, 40 32, 36 44 C 32 56, 18 44, 24 30 C 27 22, 30 16, 30 6" />
        <path d="M22 15 L 30 5 L 38 15" />
      </g>
    </svg>
  );
}

export default function HousingSign({ className = '' }: { className?: string }) {
  return (
    <aside className={`w-[280px] ${className}`}>
      <div className="lg:hidden">
        <UpArrow />
      </div>

      <div className="relative">
        <svg viewBox="0 0 340 320" className="block w-full" aria-hidden="true">
          {/* The side arrow only makes sense when the chart is to the left. */}
          <g className="hidden lg:inline">
            <SideArrow />
          </g>

          {/* Posts */}
          <rect x="122" y="146" width="11" height="136" rx="2" fill={WOOD} stroke={BARK} strokeWidth="2" />
          <rect x="268" y="146" width="11" height="136" rx="2" fill={WOOD} stroke={BARK} strokeWidth="2" />

          {/* Board */}
          <g transform="rotate(-3 205 95)">
            <rect x="84" y="40" width="242" height="110" rx="14" fill="#f0faf4" stroke={INK} strokeWidth="3" />
            <rect x="92" y="48" width="226" height="94" rx="9" fill="none" stroke={LEAF} strokeWidth="1.5" strokeDasharray="3 5" />
          </g>

          {/* Ground and grass */}
          <path d="M60 282 C 120 278, 220 286, 330 281" fill="none" stroke={GRASS} strokeWidth="3" strokeLinecap="round" />
          <g fill="none" stroke={GRASS} strokeWidth="2.5" strokeLinecap="round">
            <path d="M98 281 l-4 -9 M98 281 l1 -10 M98 281 l5 -8" />
            <path d="M300 281 l-4 -9 M300 281 l1 -10 M300 281 l5 -8" />
          </g>

          {/* House mascot */}
          <rect x="220" y="188" width="10" height="24" fill={WOOD} stroke={BARK} strokeWidth="2" />
          <rect x="168" y="222" width="66" height="60" rx="5" fill="#ffffff" stroke={INK} strokeWidth="3" />
          <path d="M158 226 L 201 186 L 244 226 Z" fill={LEAF} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="189" cy="246" r="4" fill={DARK} />
          <circle cx="213" cy="246" r="4" fill={DARK} />
          <circle cx="190.5" cy="244.5" r="1.3" fill="#ffffff" />
          <circle cx="214.5" cy="244.5" r="1.3" fill="#ffffff" />
          <ellipse cx="181" cy="257" rx="5" ry="3" fill="#f9a8b8" opacity="0.8" />
          <ellipse cx="221" cy="257" rx="5" ry="3" fill="#f9a8b8" opacity="0.8" />
          <path d="M193 256 Q 201 264 209 256" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Same box as the board rect, as percentages of the viewBox. */}
        <p
          className="absolute flex items-center justify-center px-4 text-center text-[15px] font-semibold leading-snug text-yimby-900"
          style={{
            left: `${(84 / 340) * 100}%`,
            top: `${(40 / 320) * 100}%`,
            width: `${(242 / 340) * 100}%`,
            height: `${(110 / 320) * 100}%`,
            transform: 'rotate(-3deg)',
          }}
        >
          {MESSAGE}
        </p>
      </div>
    </aside>
  );
}
