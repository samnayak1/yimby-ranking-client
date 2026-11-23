import type { DonutSlice } from './Donut';
import { millions, roundedPercents } from './donutMath';

export interface MythCard {
  myth:      string;
  factText:  string;
  slices:    DonutSlice[];
  decimals?: 0 | 1;
  centerLabel: string[];
  source:    string;
}

/*
 * Renders a myth as a self-contained PNG for pasting into social posts: the
 * myth, the fact, the donut with its legend, and the source. Drawn straight
 * onto a canvas so there's no DOM-to-image dependency. Colours and type
 * follow the on-page version.
 */

const W = 1200;
const PAD = 72;
const FONT = 'Inter, system-ui, sans-serif';

const INK = '#111827';
const BODY = '#374151';
const MUTED = '#6b7280';
const RED = '#b91c1c';      // red-700
const GREEN = '#1a6641';    // yimby-700

// Ring geometry, mirroring Donut.tsx at 1.6× scale.
const RING = 1.6;
const R_OUTER = 92 * RING;
const R_INNER = 58 * RING;
const R_LABEL = 113 * RING;
const THIN = (6 * Math.PI) / 180;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  for (const line of wrap(ctx, text, maxWidth)) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function draw(ctx: CanvasRenderingContext2D, card: MythCard): number {
  const decimals = card.decimals ?? 0;
  const total = card.slices.reduce((a, s) => a + s.value, 0);
  const percents = roundedPercents(card.slices.map(s => s.value), decimals);
  const fmtPct = (p: number) => `${p.toFixed(decimals)}%`;

  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  let y = PAD;

  ctx.fillStyle = RED;
  ctx.font = `900 56px ${FONT}`;
  ctx.fillText('Myth', PAD, y);
  y += 72;
  ctx.fillStyle = BODY;
  ctx.font = `400 30px ${FONT}`;
  y = paragraph(ctx, `“${card.myth}”`, PAD, y, W - PAD * 2, 42) + 32;

  ctx.fillStyle = GREEN;
  ctx.font = `900 56px ${FONT}`;
  ctx.fillText('Fact', PAD, y);
  y += 72;
  ctx.fillStyle = INK;
  ctx.font = `600 32px ${FONT}`;
  y = paragraph(ctx, card.factText, PAD, y, W - PAD * 2, 44) + 40;

  // Donut on the left, legend on the right.
  const cx = PAD + R_LABEL + 20;
  const cy = y + R_LABEL + 20;
  let a0 = 0;
  card.slices.forEach((s, i) => {
    const sweep = (s.value / total) * Math.PI * 2;
    const a1 = a0 + sweep;
    const mid = a0 + sweep / 2;
    // Canvas angles run from 3 o'clock; the page's run from 12.
    const start = a0 - Math.PI / 2;
    const end = a1 - Math.PI / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, R_OUTER, start, end);
    ctx.arc(cx, cy, R_INNER, end, start, true);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    if (sweep >= THIN) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    const px = (r: number) => cx + r * Math.sin(mid);
    const py = (r: number) => cy - r * Math.cos(mid);
    if (sweep < THIN) {
      ctx.beginPath();
      ctx.moveTo(px(R_OUTER + 1), py(R_OUTER + 1));
      ctx.lineTo(px(R_LABEL - 18), py(R_LABEL - 18));
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.fillStyle = BODY;
    ctx.font = `600 24px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fmtPct(percents[i]), px(R_LABEL), py(R_LABEL));

    a0 = a1;
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = INK;
  ctx.font = `800 46px ${FONT}`;
  const centerTop = card.centerLabel.length > 1 ? cy - 22 : cy - 10;
  ctx.fillText(millions(total), cx, centerTop);
  ctx.fillStyle = MUTED;
  ctx.font = `400 22px ${FONT}`;
  card.centerLabel.forEach((line, i) => ctx.fillText(line, cx, centerTop + 38 + i * 26));

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const lx = cx + R_LABEL + 56;
  const legendWidth = W - PAD - lx - 24;
  const rowHeight = 40;
  let ly = cy - (card.slices.length * rowHeight) / 2;
  card.slices.forEach((s, i) => {
    ctx.fillStyle = s.color;
    ctx.fillRect(lx, ly + 6, 18, 18);
    ctx.fillStyle = INK;
    ctx.font = `600 22px ${FONT}`;
    const value = `${millions(s.value)} · ${fmtPct(percents[i])}`;
    ctx.fillText(wrap(ctx, s.label, legendWidth - 170)[0], lx + 32, ly);
    ctx.textAlign = 'right';
    ctx.fillStyle = BODY;
    ctx.font = `400 22px ${FONT}`;
    ctx.fillText(value, W - PAD, ly);
    ctx.textAlign = 'left';
    ly += rowHeight;
  });

  y = cy + R_LABEL + 56;
  ctx.fillStyle = MUTED;
  ctx.font = `400 20px ${FONT}`;
  y = paragraph(ctx, card.source, PAD, y, W - PAD * 2, 28) + 8;
  ctx.font = `600 20px ${FONT}`;
  ctx.fillStyle = GREEN;
  ctx.fillText(window.location.host, PAD, y);
  return y + 28 + PAD;
}

export async function renderMythImage(card: MythCard): Promise<Blob> {
  // A canvas doesn't trigger web-font downloads, so fetch every weight the
  // card uses first or the first copy renders in the fallback font.
  await Promise.all(['400', '600', '800', '900'].map(w => document.fonts.load(`${w} 32px Inter`)));

  // Draw onto a tall scratch canvas, then crop to the height actually used.
  const scratch = document.createElement('canvas');
  scratch.width = W;
  scratch.height = 2000;
  const sctx = scratch.getContext('2d')!;
  sctx.fillStyle = '#ffffff';
  sctx.fillRect(0, 0, W, scratch.height);
  const height = draw(sctx, card);

  const out = document.createElement('canvas');
  out.width = W;
  out.height = height;
  out.getContext('2d')!.drawImage(scratch, 0, 0);

  return new Promise((resolve, reject) =>
    out.toBlob(b => (b ? resolve(b) : reject(new Error('Canvas export failed'))), 'image/png'));
}
