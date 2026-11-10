import { Modal, Descriptions, Tag, Space, Typography } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, LinkOutlined } from '@ant-design/icons';
import Paragraph from 'antd/es/typography/Paragraph';
import { statusColors, statusLabels, type Politician, type PoliticianItem } from '../../types';
import { getCountryName } from '../../utils/countries.utils';
import { useIsMobile } from '../../hooks/useIsMobile';
import { responsiveModalProps } from '../../utils/responsive.utils';
import { COLOR_META } from './colorCodes';

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

function SourceLink({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="ml-1.5 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-yimby-700 whitespace-nowrap"
    >
      <LinkOutlined /> Source
    </a>
  );
}

function ItemList({ title, items, good }: { title: string; items: PoliticianItem[]; good: boolean }) {
  if (items.length === 0) return null;
  const Icon = good ? CheckCircleFilled : CloseCircleFilled;
  return (
    <section>
      <h4 className={`text-sm font-semibold uppercase tracking-wide ${good ? 'text-yimby-700' : 'text-red-700'}`}>
        {title}
      </h4>
      <ul className="mt-2 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-gray-700 leading-relaxed">
            {/* Inline colour: antd's icon styles outrank Tailwind's text colours. */}
            <Icon className="mt-1 shrink-0" style={{ color: good ? '#2da066' : '#dc2626' }} aria-hidden="true" />
            <span>
              {item.text}
              <SourceLink url={item.url} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function PoliticianDetails({ visible, onClose, politician }: Props) {
  const isMobile = useIsMobile();

  if (!politician) return null;

  const color = politician.colorCode ? COLOR_META[politician.colorCode] : null;

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
      <div className="py-2 space-y-6">
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

          <Descriptions.Item label="On housing" span={2}>
            {color ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm" style={{ background: color.swatch }} aria-hidden="true" />
                {color.meaning}
              </span>
            ) : '—'}
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

        {politician.quotes.length > 0 && (
          <section className="space-y-4">
            {politician.quotes.map((q, i) => (
              <figure key={i} className="relative pl-9 sm:pl-11">
                {/* Decorative marks; the text itself is the quote. */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 -top-2 font-serif text-5xl sm:text-6xl leading-none text-yimby-500"
                >
                  “
                </span>
                <blockquote className="text-base sm:text-lg italic leading-relaxed text-gray-800">
                  {q.text}
                  <span aria-hidden="true" className="ml-1 align-[-0.35em] font-serif text-4xl sm:text-5xl leading-none text-yimby-500">
                    ”
                  </span>
                </blockquote>
                {q.url && (
                  <figcaption className="mt-1">
                    <SourceLink url={q.url} />
                  </figcaption>
                )}
              </figure>
            ))}
          </section>
        )}

        <ItemList title="The good" items={politician.good} good />
        <ItemList title="The bad" items={politician.bad} good={false} />
      </div>
    </Modal>
  );
}
