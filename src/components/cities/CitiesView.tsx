import { useState } from 'react';
import { Table, Button, Dropdown, Popconfirm, message, Tooltip } from 'antd';
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { City, CityFilters as Filters } from '../../types';
import { useCities, useDeleteCity } from '../../hooks/cities.hook';
import ScoreBadge from '../ScoreBadge';
import CityMap from './CityMap';
import CityFilters from './CityFilters';
import CityModal from './CityModal';
import CityDetailModal from './CityDetails';

interface Props {
  isAdmin: boolean;
}

export default function CitiesView({ isAdmin }: Props) {
  const [filters,        setFilters]        = useState<Filters>({ page: 1, limit: 20 });
  const [modalVisible,   setModalVisible]   = useState(false);
  const [editingCity,    setEditingCity]     = useState<any | null>(null);
  const [detailVisible,  setDetailVisible]  = useState(false);
  const [selectedCity,   setSelectedCity]   = useState<any | null>(null);

  const { data, isLoading } = useCities(filters);
  const deleteMutation      = useDeleteCity();
  const cities              = data?.data ?? [];

  const handleEdit  = (city: any) => { setEditingCity(city); setModalVisible(true); };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('City deleted');
    } catch {
      message.error('Failed to delete city');
    }
  };

  const handleModalClose = () => { setModalVisible(false); setEditingCity(null); };
  const handleRowClick   = (record: any) => { setSelectedCity(record); setDetailVisible(true); };

  const columns: ColumnsType<City> = [
    {
      title:     'City',
      dataIndex: 'name',
      key:       'name',
      sorter:    (a, b) => a.name.localeCompare(b.name),
      render:    name => <span className="font-semibold text-gray-800">{name}</span>,
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
          <Tooltip title={r.notes} overlayStyle={{ maxWidth: 400 }} placement="topLeft">
            <div className="text-gray-500 text-sm cursor-help line-clamp-2 max-w-75">
              {r.notes}
            </div>
          </Tooltip>
        )
        : <span className="text-gray-400">—</span>,
    },
    ...(isAdmin ? [{
      title:  'Actions',
      key:    'actions',
      width:  80,
      render: (_: any, record: any) => (
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            menu={{
              items: [
                {
                  key:     'edit',
                  label:   'Edit',
                  icon:    <EditOutlined />,
                  onClick: () => handleEdit(record),
                },
                {
                  key:   'delete',
                  label: (
                    <Popconfirm
                      title="Delete City"
                      description={`Delete "${record.name}"? This cannot be undone.`}
                      onConfirm={() => handleDelete(record.id)}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <span>Delete</span>
                    </Popconfirm>
                  ),
                  icon:   <DeleteOutlined className="text-red-500" />,
                  danger: true,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </div>
      ),
    }] : []),
  ];

  return (
    <>
      <div className="space-y-6">
        <CityMap cities={cities} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-700">Cities</h3>
            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => { setEditingCity(null); setModalVisible(true); }}
              >
                Add City
              </Button>
            )}
          </div>

          {/* Filters are server-side — no onFilter on columns */}
          <CityFilters filters={filters} onFilterChange={setFilters} />

          <Table
            columns={columns}
            dataSource={cities}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current:  filters.page  || 1,
              pageSize: filters.limit || 20,
              total:    data?.pagination?.total ?? 0,
              showSizeChanger: true,
              showTotal: total => `${total} cities`,
              onChange: (page, limit) => setFilters({ ...filters, page, limit }),
              onShowSizeChange: (_c, size) => setFilters({ ...filters, page: 1, limit: size }),
            }}
            className="rounded-xl overflow-hidden shadow-sm"
            rowClassName="hover:bg-yimby-50 transition-colors cursor-pointer"
            size="middle"
            onRow={record => ({ onClick: () => handleRowClick(record) })}
          />
        </div>
      </div>

      <CityModal
        visible={modalVisible}
        onClose={handleModalClose}
        editingCity={editingCity}
      />

      <CityDetailModal
        visible={detailVisible}
        onClose={() => { setDetailVisible(false); setSelectedCity(null); }}
        city={selectedCity}
      />
    </>
  );
}