import { Modal, Descriptions, Tag, Space, Typography, Divider } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, DollarOutlined, GlobalOutlined } from '@ant-design/icons';
import ScoreBadge from '../ScoreBadge';
import Paragraph from 'antd/es/typography/Paragraph';

const { Text } = Typography;

interface CityDetailModalProps {
  visible: boolean;
  onClose: () => void;
  city: any | null;
}

export default function CityDetailModal({ visible, onClose, city }: CityDetailModalProps) {
  if (!city) return null;

  const formatPrice = (price: number, currency: string) => {
    if (price == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Modal
      title={
        <Space>
          <span className="text-xl font-semibold">{city.name}</span>
          <Tag color="blue" className="rounded-full">
            <GlobalOutlined className="mr-1" />
            {city.country}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="py-2">
        <Descriptions column={2} bordered size="middle">
          <Descriptions.Item label="Country" span={2}>
            <Text strong>{city.country}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="Region">
            {city.region || '—'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Coordinates">
            {city.lat != null && city.lng != null ? (
              <Space>
                <EnvironmentOutlined className="text-yimby-500" />
                <Text>{city.lat.toFixed(4)}, {city.lng.toFixed(4)}</Text>
              </Space>
            ) : '—'}
          </Descriptions.Item>

          <Descriptions.Item label="Median House Price" span={2}>
            <Space>
              <DollarOutlined className="text-green-600" />
              <Text strong className="text-lg">
                {formatPrice(city.medianHousePrice, city.currency)}
              </Text>
              {city.currency && (
                <Text type="secondary">({city.currency})</Text>
              )}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="YIMBY Score" span={2}>
            <ScoreBadge rankings={city.rankings} />
          </Descriptions.Item>

              {city.notes && (
            <Descriptions.Item label="Notes" span={2}>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <Paragraph className="whitespace-pre-wrap text-gray-700 m-0">
                  {city.notes}
                </Paragraph>
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>

        {city.rankings && city.rankings.length > 0 && (
          <>
            <Divider orientation="horizontal" className="text-sm">
              <Space>
                <CalendarOutlined />
                Ranking History
              </Space>
            </Divider>
            <div className="bg-gray-50 rounded-lg p-4">
              <Space direction="vertical" className="w-full">
                {city.rankings.map((ranking: any) => (
                  <div key={ranking.year} className="flex items-center justify-between">
                    <Text strong>{ranking.year}</Text>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: ranking.ranking >= 8 ? '#22c55e' : 
                                           ranking.ranking >= 5 ? '#eab308' : '#ef4444' 
                        }}
                      />
                      <Text className="font-semibold">{ranking.ranking}/10</Text>
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