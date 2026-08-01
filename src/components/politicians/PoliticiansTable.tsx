import { useState } from 'react';
import { Table, Button, Dropdown, Popconfirm, message, Tag, Tooltip } from 'antd';
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PoliticianFilters as Filters, Politician } from '../../types';
import { useDeletePolitician, usePoliticians } from '../../hooks/politicians.hook';
import ScoreBadge from '../ScoreBadge';
import PoliticianFilters from './PoliticianFilters';
import PoliticianModal from './PoliticiansModal';
import PoliticianDetails from './PoliticianDetails';
import { getCountryName } from '../../utils/countries.utils';

const LEANING_COLORS: Record<string, string> = {
  'Liberal': 'blue',
  'Conservative': 'orange',
  'Democratic Socialist': 'purple',
  'Libertarian': 'cyan',
  'Nationalist': 'red',
  'Green': 'green',
  'Independent': 'default',
};

interface Props {
  isAdmin: boolean;
}

const SORT_MAP = {
  name: "name",
  designation: "designation",
  politicalLeaning: "politicalLeaning",
  nationality: "nationalityCode",
  rating: "rating",
} as const;

export default function PoliticiansTable({ isAdmin }: Props) {
  const [filters, setFilters] = useState<Filters>({ page: 1, limit: 20 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPolitician, setEditingPolitician] = useState<Politician | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);

  const { data, isLoading } = usePoliticians(filters);
  const deleteMutation = useDeletePolitician();
  const politicians = data?.data ?? [];

  const handleEdit = (p: Politician) => { setEditingPolitician(p); setModalVisible(true); };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Politician deleted');
    } catch {
      message.error('Failed to delete politician');
    }
  };

  const handleModalClose = () => { setModalVisible(false); setEditingPolitician(null); };

  const handleRowClick = (record: Politician) => { setSelectedPolitician(record); setDetailVisible(true); };

  const columns: ColumnsType<Politician> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: name => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title: "Designation / Running For",
      dataIndex: "designation",
      key: "designation",
      sorter: true,
      render: v => v ?? <span className="text-gray-400">—</span>,
    },
    {
      title: "Status",
      dataIndex: "isInOffice",
      key: "isInOffice",
      render: v =>
        v ? (
          <Tag color="green" className="rounded-full">
            In Office
          </Tag>
        ) : (
          <Tag color="default" className="rounded-full">
            Former
          </Tag>
        ),
    },
    {
      title: "Nationality",
      dataIndex: "nationalityCode",
      key: "nationalityCode",
      sorter: true,
      render: v => getCountryName(v) ?? <span className="text-gray-400">—</span>,
    },
    {
      title: "Political Leaning",
      dataIndex: "politicalLeaning",
      key: "politicalLeaning",
      sorter: true,
      render: v =>
        v ? (
          <Tag color={LEANING_COLORS[v] ?? "default"} className="rounded-full">
            {v}
          </Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
  title: 'Rating',
  key: 'rating',
  dataIndex: 'rating',
  sorter: true,
  render: (_, r) => <ScoreBadge rating={r.rating??0} />,
}, {
      title: 'Notes',
      key: 'notes',
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
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => (

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
                      title="Delete Politician"
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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-700">Politicians</h3>
        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditingPolitician(null); setModalVisible(true); }}
          >
            Add Politician
          </Button>
        )}
      </div>

      {/* Filters are server-side — no onFilter on columns */}
      <PoliticianFilters filters={filters} onFilterChange={setFilters} />

     <Table
  columns={columns}
  dataSource={politicians}
  rowKey="id"
  loading={isLoading}
  onChange={(pagination, _tableFilters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;

    setFilters(prev => ({
      ...prev,
      page: pagination.current ?? 1,
      limit: pagination.pageSize ?? 20,
      sortBy:
        SORT_MAP[(s?.columnKey as keyof typeof SORT_MAP) ?? "name"] ?? "name",
      sortOrder:
        s?.order === "descend"
          ? "desc"
          : s?.order === "ascend"
          ? "asc"
          : "asc",
    }));
  }}
  pagination={{
    current: filters.page,
    pageSize: filters.limit,
    total: data?.pagination?.total ?? 0,
    showSizeChanger: true,
    showTotal: total => `${total} politicians`,
  }}
  className="rounded-xl overflow-hidden shadow-sm"
  rowClassName="hover:bg-yimby-50 transition-colors cursor-pointer"
  size="middle"
  onRow={record => ({
    onClick: () => handleRowClick(record),
  })}
/>

      <PoliticianModal
        visible={modalVisible}
        onClose={handleModalClose}
        editingPolitician={editingPolitician}
      />

      <PoliticianDetails
        visible={detailVisible}
        onClose={() => { setDetailVisible(false); setSelectedPolitician(null); }}
        politician={selectedPolitician}
      />
    </>
  );
}