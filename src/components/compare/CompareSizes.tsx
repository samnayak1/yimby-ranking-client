import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Button, InputNumber, Input, Select, Tooltip } from 'antd';
import {
  EditOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, AimOutlined,
} from '@ant-design/icons';

// A shape is stored as metre offsets from its centre rather than as lat/lngs.
// Moving it only changes the centre, and the offsets are re-projected at the
// new latitude — so a shape dragged from Barcelona to LA keeps its true
// ground size instead of stretching with the Mercator projection.
interface Shape {
  id:         string;
  name:       string;
  color:      string;
  population: number | null;
  center:     L.LatLng;
  home:       L.LatLng;
  offsets:    [number, number][];
}

interface Preset {
  key:    string;
  label:  string;
  shapes: { name: string; population: number; outline: [number, number][] }[];
}

const R = 6378137;
const DEG = Math.PI / 180;
const COLORS = ['#2da066', '#2563eb', '#d97706', '#db2777', '#7c3aed', '#0891b2'];

// Outlines are hand-traced approximations, good for comparing footprints,
// not for surveying.
const PRESETS: Preset[] = [
  {
    key:   'bcn-la',
    label: 'Barcelona metro vs City of Los Angeles',
    shapes: [
      {
        name:       'Barcelona metropolitan area (AMB)',
        population: 3_300_000,
        outline: [
          [41.27, 1.95], [41.30, 2.05], [41.35, 2.14], [41.39, 2.20], [41.43, 2.24],
          [41.47, 2.28], [41.50, 2.22], [41.53, 2.10], [41.50, 2.00], [41.45, 1.95],
          [41.40, 1.90], [41.33, 1.88], [41.29, 1.92],
        ],
      },
      {
        name:       'City of Los Angeles',
        population: 3_800_000,
        outline: [
          [34.33, -118.50], [34.30, -118.40], [34.28, -118.28], [34.23, -118.23],
          [34.17, -118.36], [34.14, -118.36], [34.14, -118.27], [34.15, -118.20],
          [34.12, -118.18], [34.08, -118.16], [34.03, -118.19], [34.00, -118.24],
          [33.93, -118.24], [33.87, -118.29], [33.72, -118.29], [33.71, -118.31],
          [33.74, -118.31], [33.88, -118.31], [33.92, -118.33], [33.94, -118.42],
          [33.96, -118.45], [33.99, -118.48], [34.04, -118.56], [34.10, -118.60],
          [34.20, -118.67], [34.27, -118.65], [34.30, -118.56],
        ],
      },
    ],
  },
  {
    key:   'highfive-bkh',
    label: 'High Five Interchange vs Brooklyn Heights + DUMBO',
    shapes: [
      {
        name:       'High Five Interchange, Dallas',
        population: 0,
        outline: [
          [32.931, -96.765], [32.927, -96.756], [32.924, -96.755], [32.919, -96.760],
          [32.918, -96.766], [32.924, -96.774], [32.929, -96.771],
        ],
      },
      {
        name:       'Brooklyn Heights + DUMBO',
        population: 25_000,
        outline: [
          [40.7037, -73.9944], [40.7040, -73.9840], [40.7010, -73.9840],
          [40.6990, -73.9880], [40.6930, -73.9900], [40.6906, -73.9935],
          [40.6930, -74.0015], [40.7000, -73.9965],
        ],
      },
    ],
  },
];

function centroid(pts: L.LatLng[]): L.LatLng {
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  return L.latLng(lat, lng);
}

function toOffsets(pts: L.LatLng[], c: L.LatLng): [number, number][] {
  return pts.map(p => [
    (p.lng - c.lng) * DEG * R * Math.cos(p.lat * DEG),
    (p.lat - c.lat) * DEG * R,
  ]);
}

function fromOffsets(offsets: [number, number][], c: L.LatLng): L.LatLng[] {
  return offsets.map(([dx, dy]) => {
    const lat = c.lat + dy / R / DEG;
    return L.latLng(lat, c.lng + dx / (R * Math.cos(lat * DEG)) / DEG);
  });
}

function areaKm2(offsets: [number, number][]): number {
  let a = 0;
  for (let i = 0; i < offsets.length; i++) {
    const [x1, y1] = offsets[i];
    const [x2, y2] = offsets[(i + 1) % offsets.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2 / 1e6;
}

let nextId = 0;
function makeShape(name: string, population: number | null, pts: L.LatLng[], index: number): Shape {
  const c = centroid(pts);
  return {
    id:      `shape-${nextId++}`,
    name,
    population,
    color:   COLORS[index % COLORS.length],
    center:  c,
    home:    c,
    offsets: toOffsets(pts, c),
  };
}

// Every shape in a preset is stacked on the first one's centre, so the
// comparison is visible straight away.
function loadPreset(preset: Preset): Shape[] {
  const shapes = preset.shapes.map((s, i) =>
    makeShape(s.name, s.population, s.outline.map(([lat, lng]) => L.latLng(lat, lng)), i));
  return shapes.map(s => ({ ...s, center: shapes[0].home }));
}

const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const fmtArea = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export default function CompareSizes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const layersRef    = useRef<Map<string, L.Polygon>>(new Map());
  const draftRef     = useRef<L.Polyline | null>(null);

  const [presetKey, setPresetKey] = useState(PRESETS[0].key);
  const [shapes, setShapes]       = useState<Shape[]>(() => loadPreset(PRESETS[0]));
  const [drawing, setDrawing]     = useState(false);
  const [draft, setDraft]         = useState<L.LatLng[]>([]);

  const fitTo = (list: Shape[]) => {
    const map = mapRef.current;
    if (!map || list.length === 0) return;
    const bounds = L.latLngBounds(list.flatMap(s => fromOffsets(s.offsets, s.center)));
    map.fitBounds(bounds, { padding: [30, 30] });
  };

  // Initialize map once, framed on the default comparison
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const initial = loadPreset(PRESETS[0]);
    const layers  = layersRef.current;

    const map = L.map(containerRef.current, { doubleClickZoom: false });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    fitTo(initial);
    setTimeout(() => {
      map.invalidateSize();
      fitTo(initial);
    }, 100);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      map.remove();
      mapRef.current = null;
      layers.clear();
    };
  }, []);

  // Sync polygons with state and wire up dragging
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current.forEach(l => l.remove());
    layersRef.current.clear();

    shapes.forEach(s => {
      const poly = L.polygon(fromOffsets(s.offsets, s.center), {
        color:       s.color,
        weight:      2,
        fillOpacity: 0.25,
        interactive: !drawing,
      })
        .bindTooltip(s.name, { sticky: true })
        .addTo(map);

      poly.on('mousedown', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stop(e);
        map.dragging.disable();
        const start  = e.latlng;
        const origin = s.center;
        let center   = origin;

        const onMove = (ev: L.LeafletMouseEvent) => {
          center = L.latLng(
            origin.lat + ev.latlng.lat - start.lat,
            origin.lng + ev.latlng.lng - start.lng,
          );
          poly.setLatLngs(fromOffsets(s.offsets, center));
        };
        const onUp = () => {
          map.off('mousemove', onMove);
          map.off('mouseup', onUp);
          map.dragging.enable();
          setShapes(prev => prev.map(p => (p.id === s.id ? { ...p, center } : p)));
        };
        map.on('mousemove', onMove);
        map.on('mouseup', onUp);
      });

      layersRef.current.set(s.id, poly);
    });
  }, [shapes, drawing]);

  // Drawing mode: click to add vertices
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !drawing) return;

    const container = map.getContainer();
    container.style.cursor = 'crosshair';
    const onClick = (e: L.LeafletMouseEvent) => setDraft(d => [...d, e.latlng]);
    map.on('click', onClick);

    return () => {
      map.off('click', onClick);
      container.style.cursor = '';
    };
  }, [drawing]);

  // Preview of the shape being drawn
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    draftRef.current?.remove();
    draftRef.current = null;
    if (draft.length > 0) {
      draftRef.current = L.polyline(draft, { color: '#111827', dashArray: '4 4', weight: 2 })
        .addTo(map);
    }
  }, [draft]);

  const selectPreset = (key: string) => {
    const preset = PRESETS.find(p => p.key === key)!;
    const next = loadPreset(preset);
    setPresetKey(key);
    setShapes(next);
    fitTo(next);
  };

  const finishDrawing = () => {
    if (draft.length >= 3) {
      setShapes(prev => [
        ...prev,
        makeShape(`Shape ${prev.length + 1}`, null, draft, prev.length),
      ]);
    }
    setDraft([]);
    setDrawing(false);
  };

  const cancelDrawing = () => {
    setDraft([]);
    setDrawing(false);
  };

  const update = (id: string, patch: Partial<Shape>) =>
    setShapes(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-4">
      <p className="text-gray-600 max-w-2xl">
        Places with similar populations can occupy wildly different amounts of
        land. Drag any outline across the map to lay it over another place — it
        keeps its true size wherever you move it. Draw your own outline to
        compare anywhere.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={presetKey}
          onChange={selectPreset}
          options={PRESETS.map(p => ({ value: p.key, label: p.label }))}
          className="min-w-0 w-full sm:w-96"
        />
        {drawing ? (
          <>
            <Button type="primary" icon={<CheckOutlined />} onClick={finishDrawing}
              disabled={draft.length < 3}>
              Finish ({draft.length} points)
            </Button>
            <Button icon={<CloseOutlined />} onClick={cancelDrawing}>Cancel</Button>
          </>
        ) : (
          <Button icon={<EditOutlined />} onClick={() => setDrawing(true)}>
            Draw shape
          </Button>
        )}
      </div>

      {drawing && (
        <p className="text-sm text-gray-500">
          Click on the map to add points, then press Finish to close the shape.
        </p>
      )}

      <div
        ref={containerRef}
        className="w-full h-80 sm:h-120 rounded-xl border border-yimby-100 shadow-sm overflow-hidden"
      />

      <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
        {shapes.map(s => {
          const area = areaKm2(s.offsets);
          const density = s.population != null && area > 0 ? s.population / area : null;
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
              <span className="w-4 h-4 rounded-sm shrink-0" style={{ background: s.color }} />
              <Input
                value={s.name}
                onChange={e => update(s.id, { name: e.target.value })}
                variant="borderless"
                className="font-semibold min-w-0 flex-1 basis-48 p-0"
              />
              <span className="text-sm text-gray-600 tabular-nums">
                {fmtArea.format(area)} km²
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-600">
                Pop.
                <InputNumber
                  size="small"
                  min={0}
                  value={s.population}
                  onChange={v => update(s.id, { population: v })}
                  formatter={v => (v == null ? '' : fmt.format(Number(v)))}
                  parser={v => Number((v ?? '').replace(/,/g, ''))}
                  className="w-32"
                />
              </span>
              <span className="text-sm text-gray-600 tabular-nums">
                {density != null ? `${fmt.format(density)} / km²` : '—'}
              </span>
              <span className="flex gap-1 ml-auto">
                <Tooltip title="Move back to its real location">
                  <Button size="small" type="text" icon={<AimOutlined />}
                    onClick={() => {
                      update(s.id, { center: s.home });
                      mapRef.current?.fitBounds(
                        L.latLngBounds(fromOffsets(s.offsets, s.home)), { padding: [30, 30] });
                    }} />
                </Tooltip>
                <Tooltip title="Remove">
                  <Button size="small" type="text" danger icon={<DeleteOutlined />}
                    onClick={() => setShapes(prev => prev.filter(p => p.id !== s.id))} />
                </Tooltip>
              </span>
            </li>
          );
        })}
        {shapes.length === 0 && (
          <li className="p-3 text-sm text-gray-400">No shapes. Pick a comparison or draw one.</li>
        )}
      </ul>
      <p className="text-xs text-gray-400">
        Outlines are approximate and population figures are rounded estimates — edit them as needed.
      </p>
    </div>
  );
}
