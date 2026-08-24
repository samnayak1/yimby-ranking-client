import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

interface Props {
  current?:  number;
  previous?: number;
  /**
   * Invert the colour mapping. For permits and population a rise is good, so
   * up is green. For prices a rise is bad, so `invert` makes up red instead.
   */
  invert?:   boolean;
  /** What the numbers mean, used in the tooltip. */
  label:     string;
}

const GOOD = '#16a34a';
const BAD  = '#dc2626';

/**
 * Small arrow comparing a year's figure against the preceding year. Renders
 * nothing when either side is missing or the value is unchanged — an arrow
 * with no real movement behind it would be misleading.
 */
export default function TrendIcon({ current, previous, invert = false, label }: Props) {
  if (current == null || previous == null || current === previous) return null;

  const up    = current > previous;
  const isGood = invert ? !up : up;
  const Icon  = up ? ArrowUpOutlined : ArrowDownOutlined;

  const delta = current - previous;
  const pct   = previous !== 0 ? (delta / Math.abs(previous)) * 100 : null;

  const direction = up ? 'up' : 'down';
  const amount = pct != null ? ` ${Math.abs(pct).toFixed(1)}%` : '';
  const title = `${label} ${direction}${amount} vs previous year`;

  return (
    <Tooltip title={title}>
      <Icon
        aria-label={title}
        style={{ color: isGood ? GOOD : BAD, fontSize: 12 }}
        className="ml-1 align-middle"
      />
    </Tooltip>
  );
}
