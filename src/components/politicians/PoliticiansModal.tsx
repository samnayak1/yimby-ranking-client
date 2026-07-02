import { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { useCreatePolitician, useUpdatePolitician } from '../../hooks/politicians.hook';
import { countryOptions } from '../../utils/countries.utils';

interface Props {
  visible: boolean;
  onClose: () => void;
  editingPolitician?: any | null;
}

const DESIGNATIONS = [
  'President', 'Vice President', 'Prime Minister', 'Governor', 'Mayor',
  'Senator', 'Comptroller', 'Chief Minister', 'Minister', 'MP', 'Councillor', 'Other',
];

const LEANINGS = [
  'Liberal', 'Conservative', 'Democratic Socialist',
  'Libertarian', 'Nationalist', 'Green', 'Independent',
];

export default function PoliticianModal({ visible, onClose, editingPolitician }: Props) {
  const [form] = Form.useForm();
  const createMutation = useCreatePolitician();
  const updateMutation = useUpdatePolitician(editingPolitician?.id);
  const isEditing = !!editingPolitician;

  useEffect(() => {
    if (visible && editingPolitician) {
      form.setFieldsValue({
        name: editingPolitician.name,
        designation: editingPolitician.designation,
        politicalLeaning: editingPolitician.politicalLeaning,
        nationality: editingPolitician.nationality,
        // DB stores 0/1 — Switch needs boolean
        isInOffice: editingPolitician.isInOffice === 1,
        notes: editingPolitician.notes,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingPolitician]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Convert boolean back to 0/1 for the API
      const payload = { ...values, isInOffice: values.isInOffice ? 1 : 0 };

      if (isEditing) {
        await updateMutation.mutateAsync(payload);
        message.success('Politician updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        message.success('Politician created successfully');
      }
      onClose();
    } catch {
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
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ isInOffice: true }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input placeholder="Enter politician name" />
        </Form.Item>

        <Form.Item name="designation" label="Designation" rules={[{ required: true, message: 'Designation is required' }]}>
          <Select placeholder="Select designation" allowClear showSearch>
            {DESIGNATIONS.map(d => (
              <Select.Option key={d} value={d}>{d}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="politicalLeaning" label="Political Leaning">
          <Select placeholder="Select political leaning" allowClear>
            {LEANINGS.map(l => (
              <Select.Option key={l} value={l}>{l}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="country"
          label="Country"
          rules={[
            {
              required: true,
              message: "Please select a country",
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

        <Form.Item name="isInOffice" label="Currently In Office" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={4} maxLength={1000} showCount placeholder="Additional notes about this politician." />
        </Form.Item>
      </Form>
    </Modal>
  );
}