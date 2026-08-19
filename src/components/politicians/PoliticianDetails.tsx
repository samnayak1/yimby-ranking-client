import { Modal, Descriptions, Tag, Space, Typography, Divider } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import ScoreBadge from '../ScoreBadge';
import Paragraph from 'antd/es/typography/Paragraph';
import { statusColors, statusLabels, type Politician } from '../../types';
import { getCountryName } from '../../utils/countries.utils';
import { useIsMobile } from '../../hooks/useIsMobile';
import { responsiveModalProps } from '../../utils/responsive.utils';

const { Text } = Typography;

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
  visible: boolean;
  onClose: () => void;
  politician: Politician | null;
}

export default function PoliticianDetails({ visible, onClose, politician }: Props) {
  const isMobile = useIsMobile();

  if (!politician) return null;

  return (
    <Modal
      title={
        <Space wrap size={[8, 4]} className="pr-6">
          <span className="text-base sm:text-xl font-semibold">{politician.name}</span>
          <Tag
            color={statusColors[politician.status]}
            className="rounded-full"
          >
            {statusLabels[politician.status]}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      {...responsiveModalProps(isMobile, 700)}
    >
      <div className="py-2">
        <Descriptions
          column={{ xs: 1, sm: 2 }}
          bordered
          size={isMobile ? 'small' : 'middle'}
        >
          <Descriptions.Item label="Designation" span={2}>
            <Text strong>{politician.designation || '—'}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Political Leaning">
            {politician.politicalLeaning ? (
              <Tag color={LEANING_COLORS[politician.politicalLeaning] ?? 'default'} className="rounded-full">
                {politician.politicalLeaning}
              </Tag>
            ) : '—'}
          </Descriptions.Item>

          <Descriptions.Item label="Nationality">
            {politician.nationalityCode ? getCountryName(politician.nationalityCode) : '—'}
          </Descriptions.Item>

          <Descriptions.Item label="YIMBY Score" span={2}>
            <ScoreBadge rating={politician.rating ?? 0} />
          </Descriptions.Item>

          {politician.notes && (
            <Descriptions.Item label="Notes" span={2}>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                <Paragraph className="whitespace-pre-wrap break-words text-gray-700 m-0">
                  {politician.notes}
                </Paragraph>
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>

        {politician.ratings?.length > 0 && (
          <>
            <Divider orientation="horizontal" className="text-sm">
              <Space><CalendarOutlined /> Rating History</Space>
            </Divider>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <Space direction="vertical" className="w-full">
                {politician.ratings.map((r) => (
                  <div key={r.year} className="flex items-center justify-between">
                    <Text strong>{r.year}</Text>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: r.rating >= 8 ? '#22c55e'
                            : r.rating >= 5 ? '#eab308'
                              : '#ef4444',
                        }}
                      />
                      <Text className="font-semibold">{r.rating}/10</Text>
                    </div>
                  </div>
                ))}
              </Space>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}