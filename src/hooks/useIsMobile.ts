import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tracks a CSS media query and re-renders when it flips.
 *
 * Uses useSyncExternalStore rather than useState + useEffect so the very first
 * render already reflects the real viewport — no flash of the wrong layout.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);

      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** True below Tailwind's `md` / Ant's `md` breakpoint — phones. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * True below Ant's `lg` breakpoint — the widths where a full-column table has
 * to scroll sideways instead of shrinking columns to fit.
 */
export function useIsNarrow(): boolean {
  return useMediaQuery('(max-width: 991px)');
}
