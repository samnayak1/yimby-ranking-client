import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Divider,
  Space,
  Table,
} from 'antd';
import { countryOptions } from '../../utils/countries.utils';
import { useCreateCity, useUpdateCity } from '../../hooks/cities.hook';
import LocationPickerModal from './LocationPickerModal';
import type { City, CityRating } from '../../types';
import CityMetricsModal from './CityMetricsModal';

interface CityModalProps {
  visible: boolean;
  onClose: () => void;
  editingCity?: City | null;
}

const CURRENCIES = [
  'USD'
];

export default function CityModal({
  visible,
  onClose,
  editingCity,
}: CityModalProps) {
  const [form] = Form.useForm();

  const createMutation = useCreateCity();
  const updateMutation = useUpdateCity();

  const [metricsModalOpen, setMetricsModalOpen] = useState(false);

  const [editingMetrics, setEditingMetrics] =
    useState<CityRating | undefined>();

  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const isEditing = !!editingCity;

  useEffect(() => {
    if (visible && editingCity) {
      form.setFieldsValue({
        name: editingCity.name,
        countryCode: editingCity.countryCode,
        region: editingCity.region,
        lat: editingCity.lat,
        lng: editingCity.lng,
        medianHousePrice: editingCity.medianHousePrice,
        currency: editingCity.currency,
        notes: editingCity.notes,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingCity, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: editingCity!.id,
          ...values,
        });

        message.success('City updated successfully');
      } else {
        await createMutation.mutateAsync(values);

        message.success('City created successfully');
      }

      onClose();
    } catch {
      message.error(
        isEditing
          ? 'Failed to update city'
          : 'Failed to create city'
      );
    }
  };

  return (
    <>
      <Modal
        title={isEditing ? 'Edit City' : 'Create New City'}
        open={visible}
        onCancel={onClose}
        onOk={handleSubmit}
        confirmLoading={
          createMutation.isPending || updateMutation.isPending
        }
        width={650}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            currency: 'USD',
          }}
        >
          <Form.Item
            name="name"
            label="City Name"
            rules={[
              {
                required: true,
                message: 'Please enter city name',
              },
            ]}
          >
            <Input placeholder="Enter city name" />
          </Form.Item>

          <Form.Item
            name="countryCode"
            label="Country"
            rules={[
              {
                required: true,
                message: 'Please select a country',
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Select a country"
              options={countryOptions}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item name="region" label="Region / State">
            <Input placeholder="Enter region or state" />
          </Form.Item>

          <div className="flex justify-end mb-4">
            <Button
              type="default"
              onClick={() => setLocationPickerOpen(true)}
            >
              📍 Pick on Map
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="lat"
              label="Latitude"
              rules={[
                {
                  required: true,
                  message: 'Please enter latitude',
                },
              ]}
            >
              <InputNumber
                className="w-full"
                step={0.000001}
              />
            </Form.Item>

            <Form.Item
              name="lng"
              label="Longitude"
              rules={[
                {
                  required: true,
                  message: 'Please enter longitude',
                },
              ]}
            >
              <InputNumber
                className="w-full"
                step={0.000001}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="medianHousePrice"
              label="Median House Price"
            >
              <InputNumber
                className="w-full"
                step={1000}
                precision={0}
              />
            </Form.Item>

            <Form.Item
              name="currency"
              label="Currency"
            >
              <Select placeholder="Select currency">
                {CURRENCIES.map((currency) => (
                  <Select.Option
                    key={currency}
                    value={currency}
                  >
                    {currency}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={3} />
          </Form.Item>


        </Form>

        {isEditing && (
          <>
            <Divider>Yearly Metrics</Divider>

            <Table
              size="small"
              rowKey="year"
              pagination={false}
              scroll={{ x: 1200 }}
              dataSource={editingCity?.ratings ?? []}
              columns={[
                {
                  title: "Year",
                  dataIndex: "year",
                  width: 80,
                  sorter: (a, b) => b.year - a.year,
                  defaultSortOrder: "descend",
                },
                {
                  title: "Score",
                  dataIndex: "rating",
                  width: 110,
                  render: (value) => (
                    <strong>{value}/10</strong>
                  ),
                },
                {
                  title: "Permits",
                  dataIndex: "permitsIssued",
                  width: 110,
                  render: (v) => v ?? "—",
                },
                {
                  title: "Permits / 1k",
                  dataIndex: "permitsPer1000Residents",
                  width: 130,
                  render: (v) => v?.toFixed(2) ?? "—",
                },
                {
                  title: "Housing Starts",
                  dataIndex: "housingStarts",
                  width: 130,
                  render: (v) => v ?? "—",
                },
                {
                  title: "Homes Completed",
                  dataIndex: "homesCompleted",
                  width: 150,
                  render: (v) => v ?? "—",
                },
                {
                  title: "Avg Permit Days",
                  dataIndex: "averagePermitDays",
                  width: 140,
                  render: (v) => (v ? `${v} days` : "—"),
                },
                {
                  title: "Population",
                  dataIndex: "population",
                  width: 140,
                  render: (v) =>
                    v != null
                      ? new Intl.NumberFormat().format(v)
                      : "—",
                },
                {
                  title: "Actions",
                  key: "actions",
                  fixed: "right",
                  width: 100,
                  render: (_, record) => (
                    <Space>
                      <Button
                        size="small"
                        onClick={() => {
                          setEditingMetrics(record);
                          setMetricsModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </Space>
                  ),
                },
              ]}
            />

            <div className="flex justify-end mt-4">
              <Button
                type="primary"
                onClick={() => {
                  setEditingMetrics(undefined);
                  setMetricsModalOpen(true);
                }}
              >
                Add Year
              </Button>
            </div>
          </>
        )}


      </Modal>

      <LocationPickerModal
        open={locationPickerOpen}
        initialLat={form.getFieldValue('lat')}
        initialLng={form.getFieldValue('lng')}
        onCancel={() => setLocationPickerOpen(false)}
        onSelect={(location) => {

          form.setFieldsValue({
            name: location.city || form.getFieldValue('name'),
            countryCode: location.countryCode, region: location.region, lat: location.lat, lng: location.lng,
          });

          setLocationPickerOpen(false);

        }}
      />

     {isEditing && (
  <CityMetricsModal
    open={metricsModalOpen}
    cityId={editingCity.id}
    rating={editingMetrics}
    onClose={() => setMetricsModalOpen(false)}
  />
)}
    </>
  );
}

