import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Tag, Input, Button, Tooltip, Alert } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Politician } from '../../types';
import { politiciansApi } from '../../services/api.service';
import ScoreBadge from '../ScoreBadge';


const LEANING_COLORS: Record<string, string> = {
  'Liberal':             'blue',
  'Conservative':        'orange',
  'Democratic Socialist':'purple',
  'Libertarian':         'cyan',
  'Nationalist':         'red',
  'Green':               'green',
};

interface Props {
  isAdmin: boolean;
}

export default function PoliticiansTable({ isAdmin }: Props) {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['politicians'],
    queryFn:  () => politiciansApi.getAll().then(res => res.data),
  });

  const politicians = data ?? [];

  const filtered = politicians.filter(p =>
    [p.name, p.designation, p.nationality, p.politicalLeaning]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: ColumnsType<Politician> = [
    {
      title:     'Name',
      dataIndex: 'name',
      key:       'name',
      sorter:    (a, b) => a.name.localeCompare(b.name),
      render:    (name) => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title:     'Designation',
      dataIndex: 'designation',
      key:       'designation',
      render:    (v) => v ?? <span className="text-gray-400">—</span>,
      filters:   [...new Set(politicians.map(p => p.designation).filter(Boolean))].map(v => ({ text: v!, value: v! })),
      onFilter:  (value, record) => record.designation === value,
    },
    {
      title:     'Status',
      dataIndex: 'isInOffice',
      key:       'isInOffice',
      render:    (v) => v
        ? <Tag color="green"   className="rounded-full">In Office</Tag>
        : <Tag color="default" className="rounded-full">Former</Tag>,
      filters:  [{ text: 'In Office', value: 1 }, { text: 'Former', value: 0 }],
      onFilter: (value, record) => record.isInOffice === value,
    },
    {
      title:     'Nationality',
      dataIndex: 'nationality',
      key:       'nationality',
      render:    (v) => v ?? <span className="text-gray-400">—</span>,
    },
    {
      title:     'Political Leaning',
      dataIndex: 'politicalLeaning',
      key:       'politicalLeaning',
      render:    (v) => v
        ? <Tag color={LEANING_COLORS[v] ?? 'default'} className="rounded-full">{v}</Tag>
        : <span className="text-gray-400">—</span>,
      filters:  Object.keys(LEANING_COLORS).map(l => ({ text: l, value: l })),
      onFilter: (value, record) => record.politicalLeaning === value,
    },
    {
      title:  'YIMBY Score',
      key:    'ranking',
      render: (_, record) => <ScoreBadge rankings={record.rankings} />,
      sorter: (a, b) => (a.rankings[0]?.ranking ?? 0) - (b.rankings[0]?.ranking ?? 0),
    },
    {
      title:  'Notes',
      key:    'notes',
      render: (_, record) => record.notes
        ? (
          <Tooltip title={record.notes} overlayStyle={{ maxWidth: 320 }}>
            <span className="text-gray-500 text-sm cursor-help line-clamp-1 max-w-[200px] block">
              {record.notes}
            </span>
          </Tooltip>
        )
        : <span className="text-gray-400">—</span>,
    },
  ];

  if (isError) return <Alert type="error" message="Failed to load politicians" showIcon />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Search politicians..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs rounded-lg"
          allowClear
        />
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} className="rounded-lg">
            Add Politician
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} politicians` }}
        className="rounded-xl overflow-hidden shadow-sm"
        rowClassName="hover:bg-yimby-50 transition-colors"
        size="middle"
      />
    </div>
  );
}