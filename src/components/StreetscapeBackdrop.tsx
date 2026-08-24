const INK = '#4a3728';      
const PAPER = '#fffdf5';    

type Sfx = { sfx: string };

/** Wobble + paper filters. */
function Defs({ sfx }: Sfx) {
  return (
    <defs>
      <filter id={`crayon-${sfx}`} x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3"
                      seed={sfx === 'l' ? 7 : 19} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5"
                           xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}

/** Big-headed stick figure with an oversized smile. */
function Kid({
  x, y, scale = 1, skin, shirt, dress = false,
}: {
  x: number; y: number; scale?: number; skin: string; shirt: string; dress?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}
       stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {/* legs */}
      <path d="M-1 20 L-7 34" fill="none" />
      <path d="M1 20 L8 34" fill="none" />
      {/* body */}
      {dress
        ? <path d="M0 2 L-11 22 L11 22 Z" fill={shirt} />
        : <path d="M-6 3 L6 3 L7 21 L-7 21 Z" fill={shirt} />}
      {/* arms, flung out the way children draw them */}
      <path d="M-6 8 L-17 1" fill="none" />
      <path d="M6 8 L17 0" fill="none" />
      {/* head */}
      <circle cx="0" cy="-9" r="10" fill={skin} />
      <circle cx="-3.4" cy="-11" r="1.5" fill={INK} stroke="none" />
      <circle cx="3.4"  cy="-11" r="1.5" fill={INK} stroke="none" />
      <path d="M-5 -6 Q0 -0.5 5 -6" fill="none" strokeWidth="2" />
    </g>
  );
}

/** Lollipop tree: trunk plus a scribbled green blob. */
function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}
       stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-2 12 L-3 -12 L3 -12 L2 12 Z" fill="#a9714a" />
      <path d="M0 -50 Q26 -44 24 -22 Q22 -4 0 -6 Q-22 -4 -24 -22 Q-26 -44 0 -50 Z"
            fill="#5cc074" />
      <path d="M-12 -30 Q0 -22 12 -32" fill="none" strokeWidth="1.8" opacity="0.6" />
    </g>
  );
}

/** Flower on a bendy stem. */
function Flower({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 0 Q-3 -8 0 -15" fill="none" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-20" rx="3.4" ry="5"
                 fill={color} transform={`rotate(${a} 0 -15)`} />
      ))}
      <circle cx="0" cy="-15" r="2.6" fill="#ffd66b" />
    </g>
  );
}

/** Sun with spiky rays, jammed in a corner the way kids do. */
function Sun({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="2.6"
       strokeLinecap="round">
      {Array.from({ length: 10 }, (_, i) => i * 36).map((a) => (
        <path key={a} d="M0 -24 L0 -34" fill="none" transform={`rotate(${a})`} />
      ))}
      <circle cx="0" cy="0" r="20" fill="#ffd451" />
      <path d="M-7 4 Q0 11 7 4" fill="none" strokeWidth="2" />
    </g>
  );
}

/** Two-stroke bird. */
function Bird({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path d={`M${x} ${y} q${5 * s} ${-5 * s} ${9 * s} 0 q${4 * s} ${-5 * s} ${9 * s} 0`}
          fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
  );
}

/** Scribbled grass along a baseline. */
function Grass({ y, width }: { y: number; width: number }) {
  const blades = [];
  for (let x = 4; x < width; x += 11) {
    blades.push(
      <path key={x} d={`M${x} ${y} q2 -9 5 -1 q3 -8 5 0`} fill="none"
            stroke="#3f9e63" strokeWidth="2" strokeLinecap="round" />,
    );
  }
  return <g>{blades}</g>;
}

/* ---- Left panel: the colorful five-over-one ---- */
function LeftScene() {
  const storeys = [
    { y: 300, fill: '#f6a04a' },
    { y: 362, fill: '#77bdf0' },
    { y: 424, fill: '#f9d96b' },
    { y: 486, fill: '#8fd7a3' },
  ];
  return (
    <svg viewBox="0 0 200 900" preserveAspectRatio="xMaxYMax slice"
         className="h-full w-full" aria-hidden="true" focusable="false">
      <Defs sfx="l" />
      <rect width="200" height="900" fill={PAPER} />
      <rect y="0" width="200" height="640" fill="#d9eefb" />

      <g filter="url(#crayon-l)">
        <Sun x={40} y={78} />
        <Bird x={118} y={120} />
        <Bird x={146} y={96} s={0.8} />

        {/* cloud as three bumps */}
        <path d="M96 176 q10 -18 24 -8 q12 -14 22 4 q10 2 4 12 l-52 0 q-8 -4 2 -8 Z"
              fill="#ffffff" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />

        {/* the building — deliberately not plumb */}
        {storeys.map((s, i) => (
          <path key={s.y}
                d={`M${26 + i} ${s.y} L${157 - i} ${s.y - 1} L${156 - i} ${s.y + 62} L${25 + i} ${s.y + 61} Z`}
                fill={s.fill} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        ))}

        {/* windows: squares with a cross, the classic kid window */}
        <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
          {storeys.map((s, si) =>
            [42, 72, 102, 130].map((wx, wi) => {
              const wy = s.y + 16 + (wi % 2 ? 1 : -1);
              return (
                <g key={`${si}-${wx}`}>
                  <rect x={wx} y={wy} width="21" height="27" rx="1.5" fill="#fffbe9" />
                  <path d={`M${wx + 10.5} ${wy} L${wx + 10.5} ${wy + 27}`} fill="none" strokeWidth="1.8" />
                  <path d={`M${wx} ${wy + 13.5} L${wx + 21} ${wy + 13.5}`} fill="none" strokeWidth="1.8" />
                </g>
              );
            }),
          )}
        </g>

        {/* shopfronts with zigzag awnings */}
        <path d="M26 548 L156 546 L157 624 L25 623 Z" fill="#fdf3e0"
              stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 566 L84 565 L78 548 L36 549 Z" fill="#ef6a5e"
              stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M98 565 L152 566 L146 548 L104 549 Z" fill="#4cb87a"
              stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <rect x="35" y="574" width="42" height="40" rx="2" fill="#bfe4f5"
              stroke={INK} strokeWidth="2.2" />
        <rect x="103" y="573" width="42" height="40" rx="2" fill="#bfe4f5"
              stroke={INK} strokeWidth="2.2" />
        <path d="M84 572 L98 572 L97 624 L85 624 Z" fill="#a9714a"
              stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx="95" cy="600" r="2" fill={INK} />

        {/* pavement line */}
        <path d="M0 626 Q100 620 200 627" fill="none" stroke={INK} strokeWidth="2.6" />
        <Grass y={640} width={200} />

        <Tree x={178} y={624} scale={0.85} />
        <Tree x={12} y={628} scale={0.7} />

        <Kid x={58} y={676} scale={0.95} skin="#f3caa4" shirt="#4cb87a" />
        <Kid x={92} y={674} scale={0.95} skin="#8d5524" shirt="#ef6a5e" dress />
        <Kid x={118} y={686} scale={0.62} skin="#c98c5e" shirt="#f9d96b" />

        <Flower x={30} y={716} color="#ef6a5e" />
        <Flower x={150} y={722} color="#c77dd6" />
      </g>
    </svg>
  );
}

/* ---- Right panel: a Brooklyn Heights brownstone row ----
   Flat roofs under heavy cornices, tall arched windows, high stoops with iron
   railings, area fences and a cast-iron lamppost. Still drawn in crayon. */
function Stoop({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="2.4"
       strokeLinejoin="round" strokeLinecap="round">
      {/* steps */}
      <path d="M-13 42 L-8 0 L9 0 L14 42 Z" fill="#d9c7ad" />
      {[8, 17, 26, 35].map((sy) => (
        <path key={sy} d={`M${-8 - sy * 0.13} ${sy} L${9 + sy * 0.13} ${sy}`} fill="none" strokeWidth="1.8" />
      ))}
      {/* iron railings */}
      <path d="M-9 -2 L-14 42" fill="none" strokeWidth="2.6" />
      <path d="M10 -2 L15 42" fill="none" strokeWidth="2.6" />
      <path d="M-11 18 L-16 44" fill="none" strokeWidth="1.6" opacity="0.7" />
      <path d="M12 18 L17 44" fill="none" strokeWidth="1.6" opacity="0.7" />
    </g>
  );
}

/** Area fence: iron bars with spear tips. */
function Fence({ x, y, width }: { x: number; y: number; width: number }) {
  const bars = [];
  for (let i = 0; i <= width; i += 6) {
    bars.push(<path key={i} d={`M${x + i} ${y} L${x + i} ${y + 22}`} fill="none" />);
    bars.push(<path key={`t${i}`} d={`M${x + i} ${y} l-2 3 l2 -1 l2 1 z`} fill={INK} stroke="none" />);
  }
  return (
    <g stroke={INK} strokeWidth="1.8" strokeLinecap="round">
      {bars}
      <path d={`M${x} ${y + 6} L${x + width} ${y + 6}`} fill="none" strokeWidth="2" />
    </g>
  );
}

function Lamppost({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="2.6"
       strokeLinejoin="round" strokeLinecap="round">
      <path d="M0 0 L0 -78" fill="none" />
      <path d="M-7 0 L7 0 L5 -6 L-5 -6 Z" fill="#5b5b5b" />
      <path d="M-9 -78 L9 -78 L5 -96 L-5 -96 Z" fill="#ffd451" />
      <path d="M-6 -96 L6 -96 L0 -104 Z" fill="#5b5b5b" />
    </g>
  );
}

function RightScene() {
  const houses = [
    { x: 4,   fill: '#d98a5c', cornice: '#b3673c', door: '#7c4a2d' },
    { x: 70,  fill: '#e7a377', cornice: '#c47c4d', door: '#69402a' },
    { x: 136, fill: '#c8764c', cornice: '#a55a32', door: '#7c4a2d' },
  ];
  return (
    <svg viewBox="0 0 200 900" preserveAspectRatio="xMinYMax slice"
         className="h-full w-full" aria-hidden="true" focusable="false">
      <Defs sfx="r" />
      <rect width="200" height="900" fill={PAPER} />
      <rect y="0" width="200" height="700" fill="#d9eefb" />

      <g filter="url(#crayon-r)">
        <Bird x={36} y={128} />
        <Bird x={72} y={102} s={0.8} />
        <path d="M108 178 q10 -18 24 -8 q12 -14 22 4 q10 2 4 12 l-52 0 q-8 -4 2 -8 Z"
              fill="#ffffff" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />

        {houses.map((h, i) => {
          const top = 292 + i * 5;
          return (
            <g key={h.x} stroke={INK} strokeWidth="3" strokeLinejoin="round">
              {/* facade */}
              <path d={`M${h.x} ${top + 18} L${h.x + 58} ${top + 16} L${h.x + 57} 664 L${h.x + 1} 664 Z`}
                    fill={h.fill} />
              {/* cornice — the brownstone signature, flat roof not a gable */}
              <path d={`M${h.x - 5} ${top + 18} L${h.x + 63} ${top + 16} L${h.x + 62} ${top} L${h.x - 4} ${top + 2} Z`}
                    fill={h.cornice} />
              {[0, 1, 2, 3].map((b) => (
                <path key={b} d={`M${h.x - 2 + b * 16} ${top + 4} L${h.x - 2 + b * 16} ${top + 17}`}
                      fill="none" strokeWidth="1.6" opacity="0.55" />
              ))}

              {/* tall arched windows, two per floor */}
              {[top + 40, top + 112, top + 184].map((wy) =>
                [h.x + 10, h.x + 34].map((wx) => (
                  <g key={`${wy}-${wx}`} strokeWidth="2.2">
                    <path d={`M${wx} ${wy + 44} L${wx} ${wy + 9} Q${wx + 7} ${wy - 2} ${wx + 14} ${wy + 9} L${wx + 14} ${wy + 44} Z`}
                          fill="#fdf6e4" />
                    <path d={`M${wx + 7} ${wy + 2} L${wx + 7} ${wy + 44}`} fill="none" strokeWidth="1.5" />
                    <path d={`M${wx} ${wy + 24} L${wx + 14} ${wy + 24}`} fill="none" strokeWidth="1.5" />
                  </g>
                )),
              )}

              {/* parlour-floor door, raised above the street */}
              <path d={`M${h.x + 20} 620 L${h.x + 20} 578 Q${h.x + 29} 564 ${h.x + 38} 578 L${h.x + 38} 620 Z`}
                    fill={h.door} strokeWidth="2.6" />
              <circle cx={h.x + 34} cy="600" r="1.8" fill="#ffd451" stroke="none" />

              {/* basement window under the stoop */}
              <rect x={h.x + 5} y="632" width="12" height="16" rx="1.5" fill="#fdf6e4" strokeWidth="2" />

              <Stoop x={h.x + 29} y={620} />
              <Fence x={h.x + 42} y={640} width={14} />
            </g>
          );
        })}

        {/* sidewalk and kerb */}
        <path d="M0 666 Q100 660 200 667" fill="none" stroke={INK} strokeWidth="2.6" />
        <rect y="666" width="200" height="46" fill="#efe7d6" />
        <path d="M0 712 Q100 706 200 713" fill="none" stroke={INK} strokeWidth="2.6" />
        <rect y="712" width="200" height="188" fill="#ddd8cf" />

        {/* tree pit + street tree, and the lamppost */}
        <Tree x={172} y={700} scale={0.9} />
        <Lamppost x={22} y={706} />

        {/* neighbours on the sidewalk */}
        <Kid x={60} y={772} scale={1} skin="#c98c5e" shirt="#77bdf0" />
        <Kid x={88} y={778} scale={0.6} skin="#f3caa4" shirt="#f6a04a" />
        <Kid x={132} y={790} scale={1.05} skin="#8d5524" shirt="#4cb87a" dress />
        <Kid x={156} y={796} scale={0.62} skin="#f3caa4" shirt="#ef6a5e" />

        <Flower x={168} y={716} color="#ef6a5e" />
        <Flower x={182} y={720} color="#ffd451" />
      </g>
    </svg>
  );
}

export default function StreetscapeBackdrop() {
  // Pins each panel to the gutter beside the max-w-6xl (72rem) column, so the
  // artwork never runs under the content.
  // Width is the gutter beside the max-w-6xl (72rem) column, but capped: on a
  // wide monitor an uncapped gutter is ~380px a side and the artwork starts
  // competing with the page instead of framing it.
  const panel =
    'pointer-events-none select-none fixed inset-y-0 z-0 hidden ' +
    'min-[1400px]:block w-[min(calc((100vw-72rem)/2),190px)] overflow-hidden';

  return (
    <div aria-hidden="true">
      <div className={`${panel} left-0`}><LeftScene /></div>
      <div className={`${panel} right-0`}><RightScene /></div>
    </div>
  );
}
