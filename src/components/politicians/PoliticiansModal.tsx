import { useEffect } from 'react';
import { Modal, Form, Input, Select, message, Tag, InputNumber } from 'antd';
import { useCreatePolitician, useUpdatePolitician } from '../../hooks/politicians.hook';
import { countryOptions } from '../../utils/countries.utils';
import { Divider, Table, Button } from "antd";
import { useState } from "react";
import { PoliticianStatus, type Politician, type Rating } from "../../types";
import PoliticianMetricsModal from './PoliticiantMetricsModal';
import { useIsMobile } from '../../hooks/useIsMobile';
import { responsiveModalProps } from '../../utils/responsive.utils';


interface Props {
  visible: boolean;
  onClose: () => void;
  editingPolitician?: Politician | null;
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
  const isMobile = useIsMobile();
  const [form] = Form.useForm();
  const createMutation = useCreatePolitician();
  const updateMutation = useUpdatePolitician();
  const isEditing = !!editingPolitician;

  const [ratingsModalOpen, setRatingsModalOpen] = useState(false);

  const [editingRating, setEditingRating] =
    useState<Rating | undefined>();

  useEffect(() => {
    if (visible && editingPolitician) {
      form.setFieldsValue({
        name: editingPolitician.name,
        designation: editingPolitician.designation,
        politicalLeaning: editingPolitician.politicalLeaning,
        nationalityCode: editingPolitician.nationalityCode,

        status: editingPolitician.status,
        rating: editingPolitician.rating,
        notes: editingPolitician.notes,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingPolitician]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values
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
      {...responsiveModalProps(isMobile, 600)}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: PoliticianStatus.INOFFICE }}
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

        <Form.Item
          name="rating"
          label="Current Rating"
          rules={[
            {
              required: true,
              message: "Please enter a rating",
            },
          ]}
        >
          <InputNumber
            min={1}
            max={10}
            step={0.1}
            precision={1}
            className="w-full"
            placeholder="1.0 - 10.0"
          />
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
          <Input.TextArea rows={4} maxLength={1000} showCount placeholder="Additional notes about this politician." />
        </Form.Item>
      </Form>



      {isEditing && (
        <>
          <Divider>Yearly Ratings</Divider>

          <Table
            size="small"
            rowKey="year"
            pagination={false}
            scroll={{ x: 'max-content' }}
            dataSource={editingPolitician?.ratings ?? []}
            columns={[
              {
                title: "Year",
                dataIndex: "year",
                sorter: (a, b) => b.year - a.year,
                defaultSortOrder: "descend",
                width: 120,
              },
              {
                title: "Rating",
                dataIndex: "rating",
                width: 120,
                render: (rating: number) => (
                  <Tag
                    color={
                      rating >= 8
                        ? "success"
                        : rating <= 4
                          ? "error"
                          : "warning"
                    }
                  >
                    <span className="text-lg font-bold">{rating}</span>
                    <span className="text-[10px] ml-0.5 opacity-70">
                      /10
                    </span>
                  </Tag>
                ),
              },
              {
                title: "",
                width: 100,
                render: (_, record) => (
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingRating(record);
                      setRatingsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                ),
              },
            ]}
          />

          <div className="flex justify-end mt-4">
            <Button
              type="primary"
              className="w-full sm:w-auto"
              onClick={() => {
                setEditingRating(undefined);
                setRatingsModalOpen(true);
              }}
            >
              Add Year
            </Button>
          </div>
        </>
      )}

      <PoliticianMetricsModal
        open={ratingsModalOpen}
        politicianId={editingPolitician?.id}
        rating={editingRating}
        onClose={() => setRatingsModalOpen(false)}
      />
    </Modal>
  );
}