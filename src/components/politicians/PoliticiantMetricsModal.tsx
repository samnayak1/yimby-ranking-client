import { useEffect } from "react";
import {
    Modal,
    Form,
    InputNumber,
    message,
} from "antd";

import type { Rating } from "../../types";
import { useUpsertPoliticianRating } from "../../hooks/politicians.hook";
import { useIsMobile } from "../../hooks/useIsMobile";
import { responsiveModalProps } from "../../utils/responsive.utils";


interface Props {
    open: boolean;
    politicianId?: number;
    rating?: Rating;
    onClose: () => void;
}

export default function PoliticianMetricsModal({
    open,
    politicianId,
    rating,
    onClose,
}: Props) {
    const isMobile = useIsMobile();
    const [form] = Form.useForm();

    const upsertMutation = useUpsertPoliticianRating();



    useEffect(() => {
        if (!open) return;

        if (rating) {
            form.setFieldsValue(rating);
        } else {
            form.resetFields();
            form.setFieldsValue({
                year: new Date().getFullYear(),
                rating: 5,
            });
        }
    }, [open, rating, form]);

    const handleSubmit = async () => {
        if (!politicianId) return;

        try {
            const values = await form.validateFields();

            await upsertMutation.mutateAsync({
                id: politicianId,
                year: values.year,
                rating: values.rating,
            });

            message.success(
                rating
                    ? "Rating updated"
                    : "Rating added"
            );

            onClose();
        } catch {
            message.error("Failed to save rating");
        }
    };

    return (
        <Modal
            open={open}
            title={rating ? "Edit Rating" : "Add Rating"}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={upsertMutation.isPending}
            {...responsiveModalProps(isMobile, 520)}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="year"
                    label="Year"
                    rules={[
                        {
                            required: true,
                            message: "Year is required",
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
                    label="Rating"
                    rules={[
                        {
                            required: true,
                            message: "Rating is required",
                        },
                    ]}
                >
                    <InputNumber
                        className="w-full"
                        min={1}
                        max={10}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}