
import {  useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { useCreateCity, useUpdateCity } from '../../hooks/cities.hook';


interface CityModalProps {
  visible: boolean;
  onClose: () => void;
  editingCity?: any | null;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 'BRL', 'MXN'];

export default function CityModal({ visible, onClose, editingCity }: CityModalProps) {
  const [form] = Form.useForm();
  const createMutation = useCreateCity();
  const updateMutation = useUpdateCity(editingCity?.id);
  
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
    } else {
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
    } catch (error) {
      message.error(isEditing ? 'Failed to update city' : 'Failed to create city');
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit City' : 'Create New City'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="City Name"
          rules={[{ required: true, message: 'Please enter city name' }]}
        >
          <Input placeholder="Enter city name" />
        </Form.Item>

        <Form.Item
          name="country"
          label="Country"
          rules={[{ required: true, message: 'Please enter country' }]}
        >
          <Input placeholder="Enter country" />
        </Form.Item>

        <Form.Item
          name="region"
          label="Region / State"
        >
          <Input placeholder="Enter region or state (optional)" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="lat"
            label="Latitude"
            rules={[{ required: true, message: 'Please enter latitude' }]}
          >
            <InputNumber
              placeholder="e.g., 40.7128"
              className="w-full"
              step={0.0001}
            />
          </Form.Item>

          <Form.Item
            name="lng"
            label="Longitude"
            rules={[{ required: true, message: 'Please enter longitude' }]}
          >
            <InputNumber
              placeholder="e.g., -74.0060"
              className="w-full"
              step={0.0001}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="medianHousePrice"
            label="Median House Price"
          >
            <InputNumber
              placeholder="Enter median price"
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
              {CURRENCIES.map(curr => (
                <Select.Option key={curr} value={curr}>{curr}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <Input.TextArea rows={3} placeholder="Additional notes about this city" />
        </Form.Item>
      </Form>
    </Modal>
  );
}