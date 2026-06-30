import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Input, Button, Tooltip, Alert, Dropdown, Popconfirm, message } from 'antd';
import { SearchOutlined, PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { City } from '../../types';
import ScoreBadge from '../ScoreBadge';
import CityMap from './CityMap';
import CityModal from './CityModal';
import { citiesApi } from '../../services/api.service';
import { useDeleteCity } from '../../hooks/cities.hook';
import CityDetails from './CityDetails';


interface Props {
  isAdmin: boolean;
}

export default function CitiesView({ isAdmin }: Props) {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCity, setEditingCity] = useState<any | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesApi.getAll().then(res => res.data),
  });

  const deleteMutation = useDeleteCity();

  const cities = data ?? [];

  const filtered = cities.filter(c =>
    [c.name, c.country, c.region]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = (city: any) => {
    setEditingCity(city);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('City deleted successfully');
      refetch();
    } catch (error) {
      message.error('Failed to delete city');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingCity(null);
    refetch();
  };

  const handleRowClick = (record: any) => {
    setSelectedCity(record);
    setDetailVisible(true);
  };

  const handleDetailClose = () => {
    setDetailVisible(false);
    setSelectedCity(null);
  };

  const columns: ColumnsType<City> = [
    {
      title: 'City',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title: 'Country / Region',
      key: 'geography',
      render: (_, r) => (
        <span className="text-gray-600">
          {r.country}
          {r.region && <span className="text-gray-400"> / {r.region}</span>}
        </span>
      ),
      filters: [...new Set(cities.map(c => c.country))].map(v => ({ text: v, value: v })),
      onFilter: (value, record) => record.country === value,
    },
    {
      title: 'Median Price',
      key: 'price',
      sorter: (a, b) => (a.medianHousePrice ?? 0) - (b.medianHousePrice ?? 0),
      render: (_, r) => r.medianHousePrice != null
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: r.currency ?? 'USD',
            maximumFractionDigits: 0,
          }).format(r.medianHousePrice)
        : <span className="text-gray-400">—</span>,
    },
    {
      title: 'Currency',
      key: 'currency',
      render: (_, r) => r.currency ?? <span className="text-gray-400">—</span>,
    },
    {
      title: 'YIMBY Score',
      key: 'ranking',
      render: (_, r) => <ScoreBadge rankings={r.rankings} />,
      sorter: (a, b) => (a.rankings[0]?.ranking ?? 0) - (b.rankings[0]?.ranking ?? 0),
    },
   {
  title: 'Notes',
  key: 'notes',
  render: (_, r) => r.notes
    ? (
      <Tooltip 
        title={r.notes} 
        overlayStyle={{ maxWidth: 400 }}
        placement="topLeft"
      >
        <div className="text-gray-500 text-sm cursor-help line-clamp-2 max-w-75">
          {r.notes}
        </div>
      </Tooltip>
    )
    : <span className="text-gray-400">—</span>,
},
    ...(isAdmin ? [{
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Delete City"
                    description={`Are you sure you want to delete "${record.name}"?`}
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <span>Delete</span>
                  </Popconfirm>
                ),
                icon: <DeleteOutlined className="text-red-500" />,
                danger: true,
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    }] : []),
  ];

  if (isError) return <Alert type="error" message="Failed to load cities" showIcon />;

  return (
    <>
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="rounded-lg"
                onClick={() => {
                  setEditingCity(null);
                  setModalVisible(true);
                }}
              >
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
            className="rounded-xl overflow-hidden shadow-sm cursor-pointer"
            rowClassName="hover:bg-yimby-50 transition-colors"
            size="middle"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              className: 'hover:cursor-pointer',
            })}
          />
        </div>
      </div>

      <CityModal
        visible={modalVisible}
        onClose={handleModalClose}
        editingCity={editingCity}
      />

      <CityDetails
        visible={detailVisible}
        onClose={handleDetailClose}
        city={selectedCity}
      />
    </>
  );
}