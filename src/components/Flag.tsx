import 'flag-icons/css/flag-icons.min.css';
import { getCountryName } from '../utils/countries.utils';

/**
 * A small SVG flag from a two-letter ISO code. SVG rather than emoji: Windows
 * renders flag emoji as plain letters ("US"). The images ship with the site, so
 * no third party sees the request, and each is only downloaded when shown.
 */
export default function Flag({ code, className = '' }: { code: string | null | undefined; className?: string }) {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return null;
  const name = getCountryName(code.toUpperCase());
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={`fi fi-${code.toLowerCase()} shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] ${className}`}
    />
  );
}
