import { COLOR_CODES, type ColorCode } from '../../types';

/**
 * The hand-set colour for each politician, from most to least pro-housing.
 * `name` is what an admin picks; `meaning` is what the public legend says.
 * Row tints are full class strings so Tailwind can see them: the cells get the
 * tint (antd paints cell backgrounds, not rows) and the first cell a solid bar,
 * so the colour reads even on a phone where most columns are hidden.
 */
export const COLOR_META: Record<ColorCode, { name: string; meaning: string; swatch: string; row: string }> = {
  DARK_GREEN: {
    name:    'Dark green',
    meaning: 'Strongly pro-housing',
    swatch:  '#15803d',
    row:     '[&>td]:!bg-green-100 [&>td:first-child]:shadow-[inset_5px_0_0_#15803d]',
  },
  GREEN: {
    name:    'Green',
    meaning: 'Pro-housing',
    swatch:  '#4ade80',
    row:     '[&>td]:!bg-green-50 [&>td:first-child]:shadow-[inset_5px_0_0_#4ade80]',
  },
  LIGHT_RED: {
    name:    'Light red',
    meaning: 'Against new housing',
    swatch:  '#f87171',
    row:     '[&>td]:!bg-red-50 [&>td:first-child]:shadow-[inset_5px_0_0_#f87171]',
  },
  DARK_RED: {
    name:    'Dark red',
    meaning: 'Strongly against new housing',
    swatch:  '#b91c1c',
    row:     '[&>td]:!bg-red-100 [&>td:first-child]:shadow-[inset_5px_0_0_#b91c1c]',
  },
};

export const COLOR_ORDER = COLOR_CODES;
