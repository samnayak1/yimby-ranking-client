import { useEffect } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  Button,
  message,
  Divider,
} from 'antd';

import type { CityRating } from '../../types';
import { useUpsertCityRatings } from '../../hooks/cities.hook';
import { useIsMobile } from '../../hooks/useIsMobile';
import { responsiveModalProps } from '../../utils/responsive.utils';

interface Props {
  open: boolean;
  cityId?: number;
  rating?: CityRating;
  onClose: () => void;
}

export default function CityMetricsModal({
  open,
  cityId,
  rating,
  onClose,
}: Props) {
  const isMobile = useIsMobile();
  const [form] = Form.useForm();

  const mutation = useUpsertCityRatings();

  useEffect(() => {
    if (!open) return;

    if (rating) {
      form.setFieldsValue(rating);
    } else {
      form.resetFields();

      form.setFieldsValue({
        year: new Date().getFullYear(),
      });
    }
  }, [open, rating, form]);

  const handleSubmit = async () => {
    if (!cityId) return;

    try {
      const values = await form.validateFields();

      await mutation.mutateAsync({
        id: cityId,
        ...values,
      });

      message.success('Ranking saved successfully');

      onClose();
    } catch {
      message.error('Failed to save ranking');
    }
  };

  return (
    <Modal
      open={open}
      {...responsiveModalProps(isMobile, 700)}
      title={
        rating
          ? `Edit ${rating.year} Metrics`
          : 'Add Yearly Metrics'
      }
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={mutation.isPending}
          onClick={handleSubmit}
        >
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
          <Form.Item
            name="year"
            label="Year"
            rules={[
              {
                required: true,
                message: 'Year is required',
              },
            ]}
          >
            <InputNumber
              className="w-full"
              min={2000}
              max={new Date().getFullYear() + 1}
            />
          </Form.Item>

          <Form.Item
            name="rating"
            label="Rating(out of 10)"
            rules={[
              {
                required: true,
                message: 'Score is required',
              },
            ]}
          >
            <InputNumber
              className="w-full"
              min={1}
              max={10}
              step={0.1}
            />
          </Form.Item>

        
        </div>

        <Divider />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Form.Item
            name="permitsIssued"
            label="Permits Issued"
          >
            <InputNumber
              className="w-full"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="permitsPer1000Residents"
            label="Permits / 1,000 Residents"
          >
            <InputNumber
              className="w-full"
              min={0}
              step={0.1}
            />
          </Form.Item>

          <Form.Item
            name="housingStarts"
            label="Housing Starts"
          >
            <InputNumber
              className="w-full"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="homesCompleted"
            label="Homes Completed"
          >
            <InputNumber
              className="w-full"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="averagePermitDays"
            label="Average Permit Days"
          >
            <InputNumber
              className="w-full"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="population"
            label="Population"
          >
            <InputNumber
              className="w-full"
              min={0}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}