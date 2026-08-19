import { useState } from 'react';
import { Table, Button, Dropdown, Popconfirm, message, Tooltip } from 'antd';
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { City, CityFilters as Filters } from '../../types';
import { useCities, useCityMapData, useDeleteCity } from '../../hooks/cities.hook';
import ScoreBadge from '../ScoreBadge';
import CityMap from './CityMap';
import CityFilters from './CityFilters';
import CityModal from './CityModal';
import CityDetailModal from './CityDetails';
import { getCountryName } from '../../utils/countries.utils';
import { useIsMobile, useIsNarrow } from '../../hooks/useIsMobile';
import { responsivePagination } from '../../utils/responsive.utils';

interface Props {
  isAdmin: boolean;
}
const SORT_MAP = {
  name: "name",
  geography: "countryCode",
  price: "medianHousePrice",
  rating: "rating",
} as const;

export default function CitiesView({ isAdmin }: Props) {
  const isMobile = useIsMobile();
  const isNarrow = useIsNarrow();
  const [filters, setFilters] = useState<Filters>({ page: 1, limit: 20 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const { data: mapData }              = useCityMapData(); 
  const { data, isLoading } = useCities(filters);
  const deleteMutation = useDeleteCity();
  const cities = data?.data ?? [];

  const handleEdit = (city: City) => { setEditingCity(city); setModalVisible(true); };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('City deleted');
    } catch {
      message.error('Failed to delete city');
    }
  };

  const handleModalClose = () => { setModalVisible(false); setEditingCity(null); };
  const handleRowClick = (record: City) => { setSelectedCity(record); setDetailVisible(true); };

  const formatPrice = (r: City) =>
    r.medianHousePrice != null
      ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: r.currency ?? 'USD',
        maximumFractionDigits: 0,
      }).format(r.medianHousePrice)
      : null;

  const columns: ColumnsType<City> = [
    // Below `sm` the table can't fit six columns without pushing the score
    // off-screen, so identity + geography + price collapse into one cell.
    {
      title: 'City',
      key: 'summary',
      responsive: ['xs'],
      render: (_, r) => (
        <div className="flex flex-col gap-0.5 whitespace-normal">
          <span className="font-semibold text-gray-800">{r.name}</span>
          <span className="text-xs text-gray-500">
            {getCountryName(r.countryCode)}
            {r.region && ` / ${r.region}`}
          </span>
          <span className="text-xs text-gray-600">
            {formatPrice(r) ?? '—'}
          </span>
        </div>
      ),
    },
    {
      title: 'City',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      responsive: ['sm'],
      render: name => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title: 'Country / Region',
      key: 'geography',
      responsive: ['sm'],
      render: (_, r) => (
        <span className="text-gray-600">
          {getCountryName(r.countryCode)}
          {r.region && <span className="text-gray-400"> / {r.region}</span>}
        </span>
      ),
    },
    {
      title: 'Median Price',
      key: 'price',
      sorter: true,
      responsive: ['sm'],
      render: (_, r) => formatPrice(r) ?? <span className="text-gray-400">—</span>,
    },
    {
      title: 'Currency',
      key: 'currency',
      responsive: ['lg'],
      render: (_, r) => r.currency ?? <span className="text-gray-400">—</span>,
    },
    {
      title: 'Score',
      key: 'rating',
      dataIndex: 'rating',
      sorter: true,
      render: (_, r) => <ScoreBadge rating={r.rating??0} />,
    },
    {
      title: 'Notes',
      key: 'notes',
      width: 320,
      responsive: ['lg'],
      render: (_, r) =>
        r.notes ? (
          <Tooltip
            title={r.notes}
            overlayStyle={{ maxWidth: 500 }}
            placement="topLeft"
          >
            <div className="text-gray-500 text-sm cursor-help line-clamp-2 max-w-md whitespace-normal">
              {r.notes}
            </div>
          </Tooltip>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    ...(isAdmin ? [{
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: City) => (
        <div onClick={e => e.stopPropagation()}>
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
                      description={`Delete "${record.name}"? This cannot be undone.`}
                      onConfirm={() => handleDelete(record.id)}
                      okText="Delete"
                      cancelText="Cancel"
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
        </div>
      ),
    }] : []),
  ];

  return (
    <>
      <div className="space-y-6">
        <CityMap cities={mapData ?? []} />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="text-base font-semibold text-gray-700">Cities</h3>
            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="w-full sm:w-auto"
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
            onChange={(pagination, _tableFilters, sorter) => {
              const s = Array.isArray(sorter) ? sorter[0] : sorter;
              const sortBy =
                SORT_MAP[(s?.columnKey as keyof typeof SORT_MAP) ?? "name"] ?? "name";

              setFilters({
                ...filters,
                page: pagination.current ?? 1,
                limit: pagination.pageSize ?? 20,
                sortBy,
                sortOrder:
                  s?.order === "descend"
                    ? "desc"
                    : s?.order === "ascend"
                      ? "asc"
                      : "asc",
              });
            }}

            // Only below `lg`: at wider sizes the columns fit and `max-content`
            // would size the table past its container.
            scroll={isNarrow ? { x: 'max-content' } : undefined}
            pagination={{
              current: filters.page || 1,
              pageSize: filters.limit || 20,
              total: data?.pagination?.total ?? 0,
              ...responsivePagination(isMobile),
              showTotal: isMobile ? undefined : total => `${total} cities`,
            }}
            className="rounded-xl overflow-hidden shadow-sm"
            rowClassName="hover:bg-yimby-50 transition-colors cursor-pointer"
            size={isMobile ? 'small' : 'middle'}
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