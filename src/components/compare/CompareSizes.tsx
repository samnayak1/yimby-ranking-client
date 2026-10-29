import { type ReactNode, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Button, InputNumber, Input, Select, Tooltip } from 'antd';
import {
  EditOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, AimOutlined,
} from '@ant-design/icons';
import { LA_CITIES } from './laCities';

// A shape is stored as metre offsets from its centre rather than as lat/lngs.
// Moving it only changes the centre, and the offsets are re-projected at the
// new latitude — so a shape dragged from Barcelona to LA keeps its true
// ground size instead of stretching with the Mercator projection.
//
// A place can have several parts (islands), and each part can have holes
// (enclaves), so every shape is a list of parts, each an outer ring followed
// by its holes.
type Ring<T> = T[];
type Parts<T> = Ring<T>[][];

interface Shape {
  id:          string;
  name:        string;
  color:       string;
  population:  number | null;
  center:      L.LatLng;
  home:        L.LatLng;
  offsets:     Parts<[number, number]>;
  outlineOnly: boolean;
}

export interface PresetShape {
  name:        string;
  population:  number;
  outline:     Parts<[number, number]>;
  // Where to put this shape, as [east, north] metres from the first shape's
  // centre. Without it, the shape is stacked on that centre.
  offset?:     [number, number];
  // Drawn as a dashed outline with almost no fill, for a container shape the
  // others are laid inside.
  outlineOnly?: boolean;
}

interface Preset {
  key:    string;
  label:  string;
  shapes: PresetShape[];
  story?: ReactNode;
}

const R = 6378137;
const DEG = Math.PI / 180;
const COLORS = [
  '#2da066', '#2563eb', '#d97706', '#db2777', '#7c3aed', '#0891b2', '#dc2626',
  '#65a30d', '#c026d3', '#0d9488', '#ea580c', '#4f46e5', '#a16207', '#be185d',
];

// Outlines are hand-traced approximations, good for comparing footprints,
// not for surveying.
const PRESETS: Preset[] = [
  {
    key:   'la-cities',
    label: '13 cities inside the City of Los Angeles',
    story: (
      <>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-yimby-600">
          How big is LA?
        </p>
        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-snug">
          Queens, Brooklyn, Manhattan, Amsterdam, Barcelona, Copenhagen, Zurich,
          Nice, Hong Kong Island, Athens, Brussels, Geneva and Monaco together
          cover about as much land as the City of Los Angeles.
        </p>
        <p className="mt-3 text-base text-gray-600 leading-relaxed">
          Those thirteen places are home to about{' '}
          <strong className="text-gray-900">13 million people</strong>. The City
          of Los Angeles, on the same amount of land, has about 3.9 million.
          Real city shapes don't tile perfectly, so some edges hang over LA's
          border. Drag any city to try your own fit.
        </p>
      </>
    ),
    shapes: LA_CITIES,
  },
  {
    key:   'highfive-bkh',
    label: 'High Five Interchange vs Brooklyn Heights + DUMBO',
    story: (
      <>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-yimby-600">
          Same land, different choices
        </p>
        <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-snug">
          One Dallas highway interchange takes up as much ground as two of
          Brooklyn's most loved neighbourhoods.
        </p>
        <p className="mt-3 text-base text-gray-600 leading-relaxed">
          The High Five, where I-635 meets US-75, covers roughly the same area
          as Brooklyn Heights and DUMBO combined. In New York that land holds
          around <strong className="text-gray-900">25,000 people</strong>, with
          brownstones, shops, parks and a waterfront promenade. In Dallas it holds
          five levels of ramps and a few hundred residents on its edges.
        </p>
      </>
    ),
    shapes: [
      {
        name:       'High Five Interchange, Dallas',
        // The outline clips a few streets of single-family homes on its
        // north-west and south-west edges — roughly 100 houses.
        population: 250,
        outline: [[[
          [32.931, -96.765], [32.927, -96.756], [32.924, -96.755], [32.919, -96.760],
          [32.918, -96.766], [32.924, -96.774], [32.929, -96.771],
        ]]],
      },
      {
        name:       'Brooklyn Heights + DUMBO',
        population: 25_000,
        outline: [[[
          [40.7037, -73.9944], [40.7040, -73.9840], [40.7010, -73.9840],
          [40.6990, -73.9880], [40.6930, -73.9900], [40.6906, -73.9935],
          [40.6930, -74.0015], [40.7000, -73.9965],
        ]]],
      },
    ],
  },
  {
    key:   'la-bcn-manhattan',
    label: 'Barcelona metro and Manhattan inside the City of Los Angeles',
    shapes: [
      {
        name:       'City of Los Angeles',
        population: 3_800_000,
        outline: [[[
          [34.33, -118.50], [34.30, -118.40], [34.28, -118.28], [34.23, -118.23],
          [34.17, -118.36], [34.14, -118.36], [34.14, -118.27], [34.15, -118.20],
          [34.12, -118.18], [34.08, -118.16], [34.03, -118.19], [34.00, -118.24],
          [33.93, -118.24], [33.87, -118.29], [33.72, -118.29], [33.71, -118.31],
          [33.74, -118.31], [33.88, -118.31], [33.92, -118.33], [33.94, -118.42],
          [33.96, -118.45], [33.99, -118.48], [34.04, -118.56], [34.10, -118.60],
          [34.20, -118.67], [34.27, -118.65], [34.30, -118.56],
        ]]],
      },
      // Both offsets were found by search over this LA outline: Barcelona where
      // the most of it lands inside LA (~98%, over the San Fernando Valley), and
      // Manhattan fully inside central LA with the most clearance (~2.6 km) from
      // both LA's edge and Barcelona. Re-run the search if either outline changes.
      {
        name:       'Barcelona metropolitan area (AMB)',
        population: 3_300_000,
        offset:     [-8000, 14000],
        outline: [[[
          [41.27, 1.95], [41.30, 2.05], [41.35, 2.14], [41.39, 2.20], [41.43, 2.24],
          [41.47, 2.28], [41.50, 2.22], [41.53, 2.10], [41.50, 2.00], [41.45, 1.95],
          [41.40, 1.90], [41.33, 1.88], [41.29, 1.92],
        ]]],
      },
      {
        name:       'Manhattan',
        // 2020 Census: 1,694,251.
        population: 1_690_000,
        offset:     [8000, -3250],
        // Clockwise from the Battery: up the Hudson, round Inwood, down the
        // Harlem and East rivers. Traces to ~58 km² against a real 59 km².
        outline: [[[
          [40.7006, -74.0154], [40.7110, -74.0170], [40.7270, -74.0120], [40.7420, -74.0100],
          [40.7570, -74.0050], [40.7720, -73.9940], [40.7890, -73.9820], [40.8050, -73.9700],
          [40.8230, -73.9590], [40.8410, -73.9480], [40.8600, -73.9350], [40.8730, -73.9250],
          [40.8780, -73.9200], [40.8740, -73.9056], [40.8660, -73.9146], [40.8500, -73.9266],
          [40.8340, -73.9306], [40.8180, -73.9286], [40.8030, -73.9256], [40.7950, -73.9296],
          [40.7800, -73.9386], [40.7640, -73.9516], [40.7480, -73.9646], [40.7330, -73.9686],
          [40.7180, -73.9726], [40.7110, -73.9756], [40.7070, -73.9956], [40.7030, -74.0090],
        ]]],
      },
    ],
  },
];

const mapParts = <A, B>(parts: Parts<A>, f: (p: A) => B): Parts<B> =>
  parts.map(rings => rings.map(ring => ring.map(f)));

// The mean of every vertex: cheap, and only used as the point a shape moves by.
function centroid(parts: Parts<L.LatLng>): L.LatLng {
  const pts = parts.flat(2);
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  return L.latLng(lat, lng);
}

function toOffset(p: L.LatLng, c: L.LatLng): [number, number] {
  return [(p.lng - c.lng) * DEG * R * Math.cos(p.lat * DEG), (p.lat - c.lat) * DEG * R];
}

function fromOffset([dx, dy]: [number, number], c: L.LatLng): L.LatLng {
  const lat = c.lat + dy / R / DEG;
  return L.latLng(lat, c.lng + dx / (R * Math.cos(lat * DEG)) / DEG);
}

const project = (offsets: Parts<[number, number]>, c: L.LatLng) =>
  mapParts(offsets, o => fromOffset(o, c));

function ringArea(ring: Ring<[number, number]>): number {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

// Each part's outer ring minus its holes.
function areaKm2(offsets: Parts<[number, number]>): number {
  return offsets.reduce(
    (sum, [outer, ...holes]) => sum + ringArea(outer) - holes.reduce((h, r) => h + ringArea(r), 0),
    0,
  ) / 1e6;
}

let nextId = 0;
function makeShape(
  name: string, population: number | null, parts: Parts<L.LatLng>, index: number, outlineOnly = false,
): Shape {
  const c = centroid(parts);
  return {
    id:      `shape-${nextId++}`,
    name,
    population,
    color:   COLORS[index % COLORS.length],
    center:  c,
    home:    c,
    offsets: mapParts(parts, p => toOffset(p, c)),
    outlineOnly,
  };
}

// Every shape in a preset is laid over the first one, so the comparison is
// visible straight away: at the first shape's centre, or at its own offset
// from that centre when the preset gives one.
function loadPreset(preset: Preset): Shape[] {
  const shapes = preset.shapes.map((s, i) =>
    makeShape(s.name, s.population, mapParts(s.outline, ([lat, lng]) => L.latLng(lat, lng)), i, s.outlineOnly));
  const base = shapes[0].home;
  return shapes.map((s, i) => {
    const offset = preset.shapes[i].offset;
    return { ...s, center: offset ? fromOffset(offset, base) : base };
  });
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
    const bounds = L.latLngBounds(list.flatMap(s => project(s.offsets, s.center).flat(2)));
    map.fitBounds(bounds, { padding: [30, 30] });
  };

  // Initialize map once, framed on the default comparison
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const initial = loadPreset(PRESETS[0]);
    const layers  = layersRef.current;

    // Quarter-step zoom so a preset's outlines fill the frame snugly.
    const map = L.map(containerRef.current, { doubleClickZoom: false, zoomSnap: 0.25 });
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
      const poly = L.polygon(project(s.offsets, s.center), {
        color:       s.outlineOnly ? '#374151' : s.color,
        weight:      s.outlineOnly ? 2.5 : 2,
        dashArray:   s.outlineOnly ? '6 5' : undefined,
        fillOpacity: s.outlineOnly ? 0.04 : 0.25,
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
          poly.setLatLngs(project(s.offsets, center));
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
        makeShape(`Shape ${prev.length + 1}`, null, [[draft]], prev.length),
      ]);
    }
    setDraft([]);
    setDrawing(false);
  };

  const cancelDrawing = () => {
    setDraft([]);
    setDrawing(false);
  };

  const story = PRESETS.find(p => p.key === presetKey)?.story;

  const update = (id: string, patch: Partial<Shape>) =>
    setShapes(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-4">
      <p className="text-gray-600 max-w-2xl">
        Drag any outline across the map to lay it over another place and it
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

      {story && (
        <div className="max-w-2xl border-l-4 border-yimby-500 pl-4 sm:pl-5 py-1">
          {story}
        </div>
      )}

      <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
        {shapes.map(s => {
          const area = areaKm2(s.offsets);
          const density = s.population != null && area > 0 ? s.population / area : null;
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
              <span
                className="w-4 h-4 rounded-sm shrink-0"
                style={s.outlineOnly ? { border: '2px dashed #374151' } : { background: s.color }}
              />
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
                        L.latLngBounds(project(s.offsets, s.home).flat(2)), { padding: [30, 30] });
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
