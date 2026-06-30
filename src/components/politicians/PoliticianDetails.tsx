
import { Modal, Descriptions, Tag, Space, Typography, Divider } from 'antd';
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import ScoreBadge from '../ScoreBadge';
import Paragraph from 'antd/es/typography/Paragraph';

const { Text } = Typography;

interface PoliticianDetailModalProps {
  visible: boolean;
  onClose: () => void;
  politician: any | null;
}

const LEANING_COLORS: Record<string, string> = {
  'Liberal': 'blue',
  'Conservative': 'orange',
  'Democratic Socialist': 'purple',
  'Libertarian': 'cyan',
  'Nationalist': 'red',
  'Green': 'green',
};

export default function PoliticianDetails({ visible, onClose, politician }: PoliticianDetailModalProps) {
  if (!politician) return null;

  return (
    <Modal
      title={
        <Space>
          <span className="text-xl font-semibold">{politician.name}</span>
          <Tag color={politician.isInOffice ? 'green' : 'default'} className="rounded-full">
            {politician.isInOffice ? 'In Office' : 'Former'}
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
            {politician.nationality || '—'}
          </Descriptions.Item>

          {politician.city && (
            <Descriptions.Item label="Associated City" span={2}>
              <Space>
                <EnvironmentOutlined className="text-yimby-500" />
                <Text>{politician.city.name}</Text>
                {politician.city.country && (
                  <Text type="secondary">({politician.city.country})</Text>
                )}
              </Space>
            </Descriptions.Item>
          )}

          <Descriptions.Item label="YIMBY Score" span={2}>
            <ScoreBadge rankings={politician.rankings} />
          </Descriptions.Item>

        {politician.notes && (
            <Descriptions.Item label="Notes" span={2}>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <Paragraph className="whitespace-pre-wrap text-gray-700 m-0">
                  {politician.notes}
                </Paragraph>
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>

        {politician.rankings && politician.rankings.length > 0 && (
          <>
            <Divider orientation="horizontal" className="text-sm">
              <Space>
                <CalendarOutlined />
                Ranking History
              </Space>
            </Divider>
            <div className="bg-gray-50 rounded-lg p-4">
              <Space direction="vertical" className="w-full">
                {politician.rankings.map((ranking: any) => (
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