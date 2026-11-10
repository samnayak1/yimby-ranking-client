import { useEffect } from 'react';
import { Modal, Form, Input, Select, message, Radio, Button, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCreatePolitician, useUpdatePolitician } from '../../hooks/politicians.hook';
import { countryOptions } from '../../utils/countries.utils';
import { PoliticianStatus, type Politician, type PoliticianItem } from "../../types";
import { useIsMobile } from '../../hooks/useIsMobile';
import { responsiveModalProps } from '../../utils/responsive.utils';
import { COLOR_META, COLOR_ORDER } from './colorCodes';


interface Props {
  visible: boolean;
  onClose: () => void;
  editingPolitician?: Politician | null;
}

// Must stay in sync with the backend's config/options.json — PoliticianService
// rejects any designation not in that list.
const DESIGNATIONS = [
  'President', 'Vice President', 'Prime Minister', 'Governor', 'Mayor',
  'Senator', 'Comptroller', 'Chief Minister', 'Minister', 'MP', 'Councillor',
  'Representative', 'Assemblyman', 'Alderman', 'Councilmember',
  'Board Of Supervisors', 'Other',
];

const LEANINGS = [
  'Liberal', 'Conservative', 'Democratic Socialist',
  'Libertarian', 'Nationalist', 'Green', 'Independent',
];

const LISTS = [
  { name: 'quotes', label: 'Quotes',   placeholder: 'What they said',            add: 'Add quote' },
  { name: 'good',   label: 'The good', placeholder: 'e.g. Passed transit upzoning', add: 'Add good' },
  { name: 'bad',    label: 'The bad',  placeholder: 'e.g. Blocked a 300-home project', add: 'Add bad' },
] as const;

// Same rule as the backend: a link has to be a full http(s) address, since
// it's shown to every visitor as a clickable link.
const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

// Drop rows left empty, and send a blank link as no link.
const cleanList = (items: Partial<PoliticianItem>[] | undefined): PoliticianItem[] =>
  (items ?? [])
    .filter(i => i?.text?.trim())
    .map(i => ({ text: i.text!.trim(), url: i.url?.trim() || null }));

export default function PoliticianModal({ visible, onClose, editingPolitician }: Props) {
  const isMobile = useIsMobile();
  const [form] = Form.useForm();
  const createMutation = useCreatePolitician();
  const updateMutation = useUpdatePolitician();
  const isEditing = !!editingPolitician;

  useEffect(() => {
    if (visible && editingPolitician) {
      form.setFieldsValue({
        name: editingPolitician.name,
        designation: editingPolitician.designation,
        politicalLeaning: editingPolitician.politicalLeaning,
        nationalityCode: editingPolitician.nationalityCode,

        status: editingPolitician.status,
        colorCode: editingPolitician.colorCode,
        notes: editingPolitician.notes,
        quotes: editingPolitician.quotes,
        good: editingPolitician.good,
        bad: editingPolitician.bad,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingPolitician]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        colorCode: values.colorCode ?? null,
        quotes: cleanList(values.quotes),
        good: cleanList(values.good),
        bad: cleanList(values.bad),
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: editingPolitician!.id,
          ...payload,
        });

        message.success("Politician updated successfully");
      } else {
        await createMutation.mutateAsync(payload);

        message.success("Politician created successfully");
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
      {...responsiveModalProps(isMobile, 640)}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: PoliticianStatus.INOFFICE, quotes: [], good: [], bad: [] }}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input placeholder="Enter politician name" />
        </Form.Item>

        <Form.Item name="designation" label="Designation / Running For" rules={[{ required: true, message: 'Designation is required' }]}>
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

        <Form.Item name="colorCode" label="Colour">
          <Radio.Group className="flex flex-wrap gap-2">
            {COLOR_ORDER.map(code => (
              <Radio.Button key={code} value={code} className="!rounded-md">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm" style={{ background: COLOR_META[code].swatch }} aria-hidden="true" />
                  {COLOR_META[code].name}
                </span>
              </Radio.Button>
            ))}
            <Radio.Button value={null} className="!rounded-md">None</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="nationalityCode"
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

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select a status" }]}
        >
          <Select placeholder="Select status">
            <Select.Option value="RUNNING">Running</Select.Option>
            <Select.Option value="INOFFICE">In Office</Select.Option>
            <Select.Option value="RETIRED">Retired</Select.Option>
            <Select.Option value="OUT">Out of Office</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} maxLength={1000} showCount placeholder="Additional notes about this politician." />
        </Form.Item>

        {LISTS.map(list => (
          <div key={list.name}>
            <Divider titlePlacement="start" className="!text-sm">{list.label}</Divider>
            <Form.List name={list.name}>
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  {fields.map(field => (
                    <div key={field.key} className="flex items-start gap-2">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Form.Item
                          name={[field.name, 'text']}
                          className="!mb-0"
                          rules={[{ required: true, whitespace: true, message: 'Enter the text, or remove this row' }]}
                        >
                          <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} maxLength={2000} placeholder={list.placeholder} />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'url']}
                          className="!mb-0"
                          rules={[{
                            validator: (_, v) =>
                              !v?.trim() || isHttpUrl(v.trim())
                                ? Promise.resolve()
                                : Promise.reject(new Error('Must be a full http(s) link, e.g. https://example.com')),
                          }]}
                        >
                          <Input size="small" placeholder="Source link (optional)" />
                        </Form.Item>
                      </div>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} aria-label="Remove" />
                    </div>
                  ))}
                  <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({ text: '', url: '' })}>
                    {list.add}
                  </Button>
                </div>
              )}
            </Form.List>
          </div>
        ))}
      </Form>
    </Modal>
  );
}
