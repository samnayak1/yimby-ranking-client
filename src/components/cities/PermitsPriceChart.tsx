import { useMemo, lazy, Suspense } from 'react';
import { Empty, Spin } from 'antd';
import type { City } from '../../types';
import { useCities } from '../../hooks/cities.hook';
import type { ScatterConfig } from '@ant-design/plots';
import { useIsMobile } from '../../hooks/useIsMobile';


const Scatter = lazy(() =>
  import('@ant-design/plots').then(m => ({ default: m.Scatter })),
);


const CITY_FETCH_LIMIT = 100;

const SERIES = '#1f8051';

interface Point {
  city:       string;
  year:       number;
  price:      number;
  permits:    number;
  population: number;
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

const usdCompact = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(n);

const permitFmt = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export default function PermitsPriceChart() {
  const isMobile = useIsMobile();
  const { data, isLoading } = useCities({ page: 1, limit: CITY_FETCH_LIMIT, sortBy: 'name' });
  const cities = useMemo<City[]>(() => data?.data ?? [], [data]);

  const points = useMemo(() => {
    const pts: Point[] = [];

    for (const c of cities) {

      if (c.currency && c.currency !== 'USD') continue;

      const rows = [...(c.ratings ?? [])].sort((a, b) => b.year - a.year);

      const row = rows.find(r =>
        r.permitsPer1000Residents != null &&
        r.population != null &&
        (r.medianHousingPrice ?? c.medianHousePrice) != null,
      );
      if (!row) continue;

    
      pts.push({
        city:       c.name,
        year:       row.year,
        price:      row.medianHousingPrice ?? c.medianHousePrice!,
        permits:    row.permitsPer1000Residents!,
        population: row.population!,
      });
    }

    return pts;
  }, [cities]);


  const labelled = useMemo(() => {
    if (points.length < 3) return new Set(points.map(p => p.city));
    const by = (f: (p: Point) => number) => [...points].sort((a, b) => f(b) - f(a));
    return new Set([
      by(p => p.permits)[0].city,
      by(p => -p.permits)[0].city,
      by(p => p.price)[0].city,
      by(p => -p.price)[0].city,
    ]);
  }, [points]);

  // Least-squares fit
  const fit = useMemo(() => {
    if (points.length < 3) return [];

    const n  = points.length;
    const mx = points.reduce((t, p) => t + p.permits, 0) / n;
    const my = points.reduce((t, p) => t + p.price, 0) / n;

    let num = 0, den = 0;
    for (const p of points) {
      num += (p.permits - mx) * (p.price - my);
      den += (p.permits - mx) ** 2;
    }
    if (den === 0) return [];

    const slope     = num / den;
    const intercept = my - slope * mx;

    const xs = points.map(p => p.permits);
    return [Math.min(...xs), Math.max(...xs)].map(permits => ({
      permits,
      price: intercept + slope * permits,
    }));
  }, [points]);

  const config: ScatterConfig = {
    height: isMobile ? 340 : 440,
    children: [
      {
        type: 'point',
        data: points,
        xField: 'permits',
        yField: 'price',
        // points bigger with pop
        sizeField: 'population',
        style: {
          shape: 'point',
          fill: SERIES,
          fillOpacity: 1,
          stroke: '#fff',
          lineWidth: 2,
        },
        labels: [
          {
            text: (d: Point) => (labelled.has(d.city) ? d.city : ''),
            position: 'right',
            dx: 8,
            style: { fill: '#374151', fontSize: 11 },
          },
        ],
        tooltip: {
          title: (d: Point) => `${d.city} (${d.year})`,
          items: [
            { name: 'Median price',    channel: 'y', valueFormatter: usd },
            { name: 'Permits / 1,000', channel: 'x', valueFormatter: permitFmt },
            { name: 'Population', field: 'population',
              valueFormatter: (v: number) => v.toLocaleString('en-US') },
          ],
        },
      },
      {
        type: 'line',
        data: fit,
        xField: 'permits',
        yField: 'price',
        style: {
          stroke: '#9ca3af',
          lineWidth: 2,
          lineDash: [2, 4],
          lineCap: 'round',
        },
        
        tooltip: false,
      },
    ],
    scale: {

      x: { nice: true, domainMin: 0 },
      y: { nice: true, zero: false },
      size: { range: [4, 16] },
    },
    axis: {
      x: {
        title: 'Permits per 1,000 residents',
        labelFormatter: (v: number) => permitFmt(v),
        tickCount: isMobile ? 3 : 5,
      },
      y: {
        title: 'Median housing price (USD)',
        labelFormatter: (v: number) => usdCompact(v),
        tickCount: 5,
      },
    },
    interaction: {

      tooltip: { marker: false },
    },
  };

  return (
    <section className="py-2 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
        Median housing price vs. permits per 1,000 residents
      </h3>

      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-20"><Spin /></div>
        ) : points.length === 0 ? (
          <Empty
            className="py-12"
            description="No city has a permits-per-1,000 figure, a population and a median price yet."
          />
        ) : (
          <Suspense fallback={<div className="flex justify-center py-20"><Spin /></div>}>
            <Scatter {...config} />
          </Suspense>
        )}
      </div>
    </section>
  );
}
