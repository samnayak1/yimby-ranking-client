import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { CityMapPoint } from '../../types';
import { getCountryName } from '../../utils/countries.utils';
import { formatPermits } from '../../utils/cityMetrics.utils';

interface Props {
  cities: CityMapPoint[];
}

// Contiguous US. Fitting to bounds rather than a fixed centre and zoom picks
// whatever zoom fits the whole country into the container, phone or desktop.
const US_BOUNDS = L.latLngBounds([24.4, -125.0], [49.4, -66.9]);

// Each marker shows the city's median house price, in one neutral colour: the
// number is the comparison, not a judgement. Lighter grey when missing.
const INK = '#374151';
const MISSING = '#9ca3af';

// Compact enough to fit on a marker: $450K, $1.2M.
function formatPrice(price: number, currency: string | null): string {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              currency ?? 'USD',
    notation:              'compact',
    maximumFractionDigits: 1,
  }).format(price);
}

// A pill rather than a circle: prices are wider than the old permit figures.
function makeIcon(label: string | null) {
  return L.divIcon({
    className: '',
    html: `<div style="
      position:absolute;
      left:50%;
      top:50%;
      transform:translate(-50%,-50%);
      background:${label ? INK : MISSING};
      color:white;
      font-weight:700;
      font-size:11px;
      line-height:1;
      white-space:nowrap;
      padding:6px 8px;
      border-radius:999px;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">${label ?? '?'}</div>`,
    // Zero-size anchor at the city; the pill centres itself on it, whatever
    // its width. The popup opens just above the pill.
    iconSize:    [0, 0],
    iconAnchor:  [0, 0],
    popupAnchor: [0, -14],
  });
}

export default function CityMap({ cities }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markersRef   = useRef<L.Marker[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, { preferCanvas: true })
      .fitBounds(US_BOUNDS);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // The container may not have its final size on the first frame, which makes
    // the first fit choose the wrong zoom. Re-fit once Leaflet knows the size.
    setTimeout(() => {
      mapRef.current?.invalidateSize();
      mapRef.current?.fitBounds(US_BOUNDS);
    }, 100);

    // The container height changes at the sm breakpoint and on rotation —
    // Leaflet needs to be told, or tiles render into the old box.
    const onResize = () => mapRef.current?.invalidateSize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);

      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when cities change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers via ref (safer than eachLayer)
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    cities
      .filter(c => c.lat != null && c.lng != null)
      .forEach(c => {
        const permits = c.permitsPer1000Residents != null ? Number(c.permitsPer1000Residents) : undefined;

        const price = c.medianHousePrice != null
          ? new Intl.NumberFormat('en-US', {
              style:               'currency',
              currency:            c.currency ?? 'USD',
              maximumFractionDigits: 0,
            }).format(c.medianHousePrice)
          : '—';

        const label = c.medianHousePrice != null ? formatPrice(c.medianHousePrice, c.currency) : null;

        const marker = L.marker([c.lat!, c.lng!], { icon: makeIcon(label) })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:160px">
              <div style="font-weight:700;color:#111827;margin-bottom:4px">${c.name}</div>
              <div style="color:#6b7280;font-size:12px">
                ${getCountryName(c.country ?? '')}${c.region ? `, ${c.region}` : ''}
              </div>
              <div style="margin-top:8px;font-size:12px">
                <span style="color:#9ca3af">Median price:</span>
                <span style="color:${INK};font-weight:700">${price}</span>
              </div>
              <div style="font-size:12px">
                <span style="color:#9ca3af">Permits / 1,000 residents:</span>
                <span style="color:${INK};font-weight:700">
                  ${permits != null ? formatPermits(permits) : '—'}
                </span>
              </div>
              ${c.notes
                ? `<div style="margin-top:6px;font-size:11px;color:#9ca3af;font-style:italic">
                     ${c.notes.slice(0, 80)}${c.notes.length > 80 ? '…' : ''}
                   </div>`
                : ''}
            </div>
          `);

        markersRef.current.push(marker);
      });

    setTimeout(() => map.invalidateSize(), 50);
  }, [cities]);

  return (
    <div
      ref={containerRef}
      className="w-full h-64 sm:h-80 rounded-xl border border-yimby-100 shadow-sm overflow-hidden"
    />
  );
}