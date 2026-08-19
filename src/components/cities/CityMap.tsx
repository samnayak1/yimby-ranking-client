import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { CityMapPoint } from '../../types';
import { getCountryName } from '../../utils/countries.utils';

interface Props {
  cities: CityMapPoint[];
}

function scoreColor(score?: number): string {
  if (!score) return '#9ca3af';
  if (score >= 8) return '#2da066';
  if (score >= 5) return '#d97706';
  return '#dc2626';
}

function makeIcon(score?: number) {
  const color = scoreColor(score);
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};
      color:white;
      font-weight:700;
      font-size:11px;
      width:30px;
      height:30px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">${score ?? '?'}</div>`,
    iconSize:   [30, 30],
    iconAnchor: [15, 15],
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
      .setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    setTimeout(() => mapRef.current?.invalidateSize(), 100);

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
        const rating = c.rating != null ? Number(c.rating) : undefined;

        const price = c.medianHousePrice != null
          ? new Intl.NumberFormat('en-US', {
              style:               'currency',
              currency:            c.currency ?? 'USD',
              maximumFractionDigits: 0,
            }).format(c.medianHousePrice)
          : '—';

        const marker = L.marker([c.lat!, c.lng!], { icon: makeIcon(rating) })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:160px">
              <div style="font-weight:700;color:#1a6641;margin-bottom:4px">${c.name}</div>
              <div style="color:#6b7280;font-size:12px">
                ${getCountryName(c.country ?? '')}${c.region ? `, ${c.region}` : ''}
              </div>
              <div style="margin-top:8px;font-size:12px">
                <span style="color:#9ca3af">Median price:</span> ${price}
              </div>
              <div style="font-size:12px">
                <span style="color:#9ca3af">YIMBY score:</span>
                <span style="color:${scoreColor(rating)};font-weight:700">
                  ${rating ?? '—'}/10
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