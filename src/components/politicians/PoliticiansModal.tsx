
import {  useEffect } from 'react';
import { Modal, Form, Input, Select, Switch,  message } from 'antd';
import { useCreatePolitician, useUpdatePolitician } from '../../hooks/politicians.hook';
import { useCities } from '../../hooks/cities.hook';


interface PoliticianModalProps {
  visible: boolean;
  onClose: () => void;
  editingPolitician?: any | null;
}

export default function PoliticianModal({ visible, onClose, editingPolitician }: PoliticianModalProps) {
  const [form] = Form.useForm();
  const createMutation = useCreatePolitician();
  const updateMutation = useUpdatePolitician(editingPolitician?.id);
  const { data: citiesData } = useCities();
  
  const isEditing = !!editingPolitician;
  const cities = citiesData ?? [];

  useEffect(() => {
    if (visible && editingPolitician) {
      form.setFieldsValue({
        name: editingPolitician.name,
        designation: editingPolitician.designation,
        politicalLeaning: editingPolitician.politicalLeaning,
        nationality: editingPolitician.nationality,
        isInOffice: editingPolitician.isInOffice,
        city_id: editingPolitician.city_id,
        notes: editingPolitician.notes,
      });
    } else {
      form.resetFields();
    }
  }, [visible, editingPolitician, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEditing) {
        await updateMutation.mutateAsync(values);
        message.success('Politician updated successfully');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Politician created successfully');
      }
      onClose();
    } catch (error) {
      message.error(isEditing ? 'Failed to update politician' : 'Failed to create politician');
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Politician' : 'Create New Politician'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter politician name' }]}
        >
          <Input placeholder="Enter politician name" />
        </Form.Item>

        <Form.Item
          name="designation"
          label="Designation"
          rules={[{ required: true, message: 'Please enter designation' }]}
        >
          <Input placeholder="e.g., Mayor, Senator, City Council Member" />
        </Form.Item>

        <Form.Item
          name="politicalLeaning"
          label="Political Leaning"
        >
          <Select placeholder="Select political leaning" allowClear>
            <Select.Option value="Liberal">Liberal</Select.Option>
            <Select.Option value="Conservative">Conservative</Select.Option>
            <Select.Option value="Democratic Socialist">Democratic Socialist</Select.Option>
            <Select.Option value="Libertarian">Libertarian</Select.Option>
            <Select.Option value="Nationalist">Nationalist</Select.Option>
            <Select.Option value="Green">Green</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="nationality"
          label="Nationality"
        >
          <Input placeholder="Enter nationality" />
        </Form.Item>

        <Form.Item
          name="city_id"
          label="Associated City"
        >
          <Select placeholder="Select associated city" allowClear>
            {cities.map(city => (
              <Select.Option key={city.id} value={city.id}>
                {city.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="isInOffice"
          label="Currently In Office"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <Input.TextArea rows={3} placeholder="Additional notes about this politician" />
        </Form.Item>
      </Form>
    </Modal>
  );
}