import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
} from 'antd';

import { useCreateCity, useUpdateCity } from '../../hooks/cities.hook';
import LocationPickerModal from './LocationPickerModal';

interface CityModalProps {
  visible: boolean;
  onClose: () => void;
  editingCity?: any | null;
}

const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CNY',
  'INR',
  'BRL',
  'MXN',
];

export default function CityModal({
  visible,
  onClose,
  editingCity,
}: CityModalProps) {
  const [form] = Form.useForm();

  const createMutation = useCreateCity();
  const updateMutation = useUpdateCity(editingCity?.id);

  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const isEditing = !!editingCity;

  useEffect(() => {
    if (visible && editingCity) {
      form.setFieldsValue({
        name: editingCity.name,
        country: editingCity.country,
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
        await updateMutation.mutateAsync(values);
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
        <Form form={form} layout="vertical">
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
            name="country"
            label="Country"
            rules={[
              {
                required: true,
                message: 'Please enter country',
              },
            ]}
          >
            <Input placeholder="Enter country" />
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
      </Modal>

      <LocationPickerModal
        open={locationPickerOpen}
        initialLat={form.getFieldValue('lat')}
        initialLng={form.getFieldValue('lng')}
        onCancel={() => setLocationPickerOpen(false)}
        onSelect={(location) => { 
          
          form.setFieldsValue({ name: location.city || form.getFieldValue('name'),
           country: location.country, region: location.region, lat: location.lat, lng: location.lng, });
           
          setLocationPickerOpen(false);
        
      }}
      />
    </>
  );
}

