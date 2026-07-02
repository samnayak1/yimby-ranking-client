import { Modal, Descriptions, Tag, Space, Typography, Divider } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import ScoreBadge from '../ScoreBadge';
import Paragraph from 'antd/es/typography/Paragraph';

const { Text } = Typography;

const LEANING_COLORS: Record<string, string> = {
  'Liberal':             'blue',
  'Conservative':        'orange',
  'Democratic Socialist':'purple',
  'Libertarian':         'cyan',
  'Nationalist':         'red',
  'Green':               'green',
  'Independent':         'default',
};

interface Props {
  visible:    boolean;
  onClose:    () => void;
  politician: any | null;
}

export default function PoliticianDetails({ visible, onClose, politician }: Props) {
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

        {politician.rankings?.length > 0 && (
          <>
            <Divider orientation="horizontal" className="text-sm">
              <Space><CalendarOutlined /> Ranking History</Space>
            </Divider>
            <div className="bg-gray-50 rounded-lg p-4">
              <Space direction="vertical" className="w-full">
                {politician.rankings.map((r: any) => (
                  <div key={r.year} className="flex items-center justify-between">
                    <Text strong>{r.year}</Text>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: r.ranking >= 8 ? '#22c55e'
                                         : r.ranking >= 5 ? '#eab308'
                                         : '#ef4444',
                        }}
                      />
                      <Text className="font-semibold">{r.ranking}/10</Text>
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