import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { City } from '../../types';


interface Props {
  cities: City[];
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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    cities
      .filter(c => c.lat != null && c.lng != null)
      .forEach(c => {
        const latest = c.rankings[0];
        const price  = c.medianHousePrice != null
          ? new Intl.NumberFormat('en-US', {
              style:    'currency',
              currency: c.currency ?? 'USD',
              maximumFractionDigits: 0,
            }).format(c.medianHousePrice)
          : '—';

        L.marker([c.lat!, c.lng!], { icon: makeIcon(latest?.ranking) })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:160px">
              <div style="font-weight:700;color:#1a6641;margin-bottom:4px">${c.name}</div>
              <div style="color:#6b7280;font-size:12px">${c.country}${c.region ? `, ${c.region}` : ''}</div>
              <div style="margin-top:8px;font-size:12px">
                <span style="color:#9ca3af">Median price:</span> ${price}
              </div>
              <div style="font-size:12px">
                <span style="color:#9ca3af">YIMBY score:</span>
                <span style="color:${scoreColor(latest?.ranking)};font-weight:700">
                  ${latest?.ranking ?? '—'}/10
                </span>
              </div>
              ${c.notes ? `<div style="margin-top:6px;font-size:11px;color:#9ca3af;font-style:italic">${c.notes.slice(0, 80)}${c.notes.length > 80 ? '…' : ''}</div>` : ''}
            </div>
          `);
      });
  }, [cities]);

  return (
    <div
      ref={containerRef}
      className="w-full h-80 rounded-xl border border-yimby-100 shadow-sm overflow-hidden"
    />
  );
}