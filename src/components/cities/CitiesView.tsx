import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Input, Button, Tooltip, Alert } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { City } from '../../types';
import ScoreBadge from '../ScoreBadge';
import CityMap from './CityMap';
import { citiesApi } from '../../services/api.service';


interface Props {
  isAdmin: boolean;
}

export default function CitiesView({ isAdmin }: Props) {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cities'],
    queryFn:  () => citiesApi.getAll().then(res => res.data),
  });

  const cities = data ?? [];

  const filtered = cities.filter(c =>
    [c.name, c.country, c.region]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: ColumnsType<City> = [
    {
      title:     'City',
      dataIndex: 'name',
      key:       'name',
      sorter:    (a, b) => a.name.localeCompare(b.name),
      render:    (name) => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title:  'Country / Region',
      key:    'geography',
      render: (_, r) => (
        <span className="text-gray-600">
          {r.country}
          {r.region && <span className="text-gray-400"> / {r.region}</span>}
        </span>
      ),
      filters:  [...new Set(cities.map(c => c.country))].map(v => ({ text: v, value: v })),
      onFilter: (value, record) => record.country === value,
    },
    {
      title:  'Median Price',
      key:    'price',
      sorter: (a, b) => (a.medianHousePrice ?? 0) - (b.medianHousePrice ?? 0),
      render: (_, r) => r.medianHousePrice != null
        ? new Intl.NumberFormat('en-US', {
            style:               'currency',
            currency:            r.currency ?? 'USD',
            maximumFractionDigits: 0,
          }).format(r.medianHousePrice)
        : <span className="text-gray-400">—</span>,
    },
    {
      title:  'Currency',
      key:    'currency',
      render: (_, r) => r.currency ?? <span className="text-gray-400">—</span>,
    },
    {
      title:  'YIMBY Score',
      key:    'ranking',
      render: (_, r) => <ScoreBadge rankings={r.rankings} />,
      sorter: (a, b) => (a.rankings[0]?.ranking ?? 0) - (b.rankings[0]?.ranking ?? 0),
    },
    {
      title:  'Notes',
      key:    'notes',
      render: (_, r) => r.notes
        ? (
          <Tooltip title={r.notes} overlayStyle={{ maxWidth: 320 }}>
            <span className="text-gray-500 text-sm cursor-help line-clamp-1 max-w-[200px] block">
              {r.notes}
            </span>
          </Tooltip>
        )
        : <span className="text-gray-400">—</span>,
    },
  ];

  if (isError) return <Alert type="error" message="Failed to load cities" showIcon />;

  return (
    <div className="space-y-6">
      <CityMap cities={cities} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search cities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs rounded-lg"
            allowClear
          />
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} className="rounded-lg">
              Add City
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} cities` }}
          className="rounded-xl overflow-hidden shadow-sm"
          rowClassName="hover:bg-yimby-50 transition-colors"
          size="middle"
        />
      </div>
    </div>
  );
}