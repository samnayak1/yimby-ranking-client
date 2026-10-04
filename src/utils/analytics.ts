/**
 * GoatCounter pageviews, production builds only — dev and preview traffic would
 * otherwise land in the real stats.
 *
 * count.js counts the page it loads on. Admin pages are skipped so your own
 * logins don't inflate the numbers.
 */
const STATS_URL: string =
  import.meta.env.VITE_GOATCOUNTER_URL ?? 'https://stats.yimby-tracker.fyi';

export function initAnalytics(): void {
  if (!import.meta.env.PROD) return;
  if (window.location.pathname.startsWith('/admin')) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `${STATS_URL}/count.js`;
  script.dataset.goatcounter = `${STATS_URL}/count`;
  document.head.appendChild(script);
}
