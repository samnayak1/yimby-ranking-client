import { Modal, Descriptions, Tag, Space, Typography, Divider } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, DollarOutlined, GlobalOutlined } from '@ant-design/icons';
import ScoreBadge from '../ScoreBadge';
import Paragraph from 'antd/es/typography/Paragraph';
import type { City } from '../../types';
import { getCountryName } from '../../utils/countries.utils';
import { useIsMobile } from '../../hooks/useIsMobile';
import { responsiveModalProps } from '../../utils/responsive.utils';
import TrendIcon from '../TrendIcon';

const { Text } = Typography;

interface CityDetailModalProps {
  visible: boolean;
  onClose: () => void;
  city: City | null;
}

export default function CityDetailModal({ visible, onClose, city }: CityDetailModalProps) {
  const isMobile = useIsMobile();

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
        <Space wrap size={[8, 4]} className="pr-6">
          <span className="text-base sm:text-xl font-semibold">{city.name}</span>
          <Tag color="blue" className="rounded-full">
            <GlobalOutlined className="mr-1" />
            {getCountryName(city.countryCode)}
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
          <Descriptions.Item label="Country" span={2}>
            <Text strong>{getCountryName(city.countryCode)}</Text>
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
            <Space wrap size={[8, 4]}>
              <DollarOutlined className="text-green-600" />
              <Text strong className="text-lg">
                {city.medianHousePrice && city.currency ? formatPrice(city.medianHousePrice, city.currency) : '—'}
              </Text>
              {city.currency && (
                <Text type="secondary">({city.currency})</Text>
              )}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="YIMBY Score" span={2}>
            <ScoreBadge rating={city.rating??0} />
          </Descriptions.Item>

          {city.notes && (
            <Descriptions.Item label="Notes" span={2}>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                <Paragraph className="whitespace-pre-wrap break-words text-gray-700 m-0">
                  {city.notes}
                </Paragraph>
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>

        {city.ratings && city.ratings.length > 0 && (
          <>
            <Divider orientation="horizontal" className="text-sm">
              <Space>
                <CalendarOutlined />
                Rating History
              </Space>
            </Divider>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <Space direction="vertical" className="w-full">
                {city.ratings.map((rating, i) => {
                  const prev = city.ratings[i + 1];
                  return (
                  <div
                    key={rating.year}
                    className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Text strong className="text-base">
                        {rating.year}
                      </Text>

                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              rating.rating >= 8
                                ? "#22c55e"
                                : rating.rating >= 5
                                  ? "#eab308"
                                  : "#ef4444",
                          }}
                        />
                        <Text strong>{rating.rating}/10</Text>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <Text type="secondary">Permits Issued</Text>
                        <Text>
                          {rating.permitsIssued ?? "—"}
                          <TrendIcon
                            label="Permits issued"
                            current={rating.permitsIssued}
                            previous={prev?.permitsIssued}
                          />
                        </Text>
                      </div>

                      <div className="flex justify-between">
                        <Text type="secondary">Permits / 1k</Text>
                        <Text>
                          {rating.permitsPer1000Residents?.toFixed(2) ?? "—"}
                        </Text>
                      </div>

                      <div className="flex justify-between">
                        <Text type="secondary">Housing Starts</Text>
                        <Text>{rating.housingStarts ?? "—"}</Text>
                      </div>

                      <div className="flex justify-between">
                        <Text type="secondary">Homes Completed</Text>
                        <Text>{rating.homesCompleted ?? "—"}</Text>
                      </div>

                      <div className="flex justify-between">
                        <Text type="secondary">Avg Permit Time</Text>
                        <Text>
                          {rating.averagePermitDays != null
                            ? `${rating.averagePermitDays} days`
                            : "—"}
                        </Text>
                      </div>

                      <div className="flex justify-between">
                        <Text type="secondary">Population</Text>
                        <Text>
                          {rating.population != null
                            ? new Intl.NumberFormat('en-US').format(rating.population)
                            : "—"}
                          <TrendIcon
                            label="Population"
                            current={rating.population}
                            previous={prev?.population}
                          />
                        </Text>
                      </div>

                      <div className="flex justify-between">
                        <Text type="secondary">Median Dwelling Price</Text>
                        <Text>
                          {rating.medianHousingPrice != null
                            ? formatPrice(
                                rating.medianHousingPrice,
                                city.currency ?? "USD",
                              )
                            : "—"}
                          {/* Cheaper housing is the good outcome here, so the
                              colour mapping is inverted against the others. */}
                          <TrendIcon
                            label="Median dwelling price"
                            current={rating.medianHousingPrice}
                            previous={prev?.medianHousingPrice}
                            invert
                          />
                        </Text>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </Space>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}