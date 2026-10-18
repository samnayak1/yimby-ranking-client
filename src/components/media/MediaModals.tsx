import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select, message } from 'antd';
import type { Rule } from 'antd/es/form';
import type { Creator, CreatorInput, Resource, ResourceCategory, ResourceInput } from '../../types';
import { useSaveCreator, useSaveResource } from '../../hooks/media.hook';
import { useIsMobile } from '../../hooks/useIsMobile';
import { responsiveModalProps } from '../../utils/responsive.utils';

// Mirrors the backend rule: a full http(s) link. The server re-checks.
const urlRule: Rule = {
  pattern: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  message: 'Use a full link starting with https://',
};

const CREATOR_LINKS = [
  { name: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { name: 'youtubeUrl',   label: 'YouTube',   placeholder: 'https://youtube.com/@…' },
  { name: 'twitterUrl',   label: 'X / Twitter', placeholder: 'https://x.com/…' },
  { name: 'blueskyUrl',   label: 'Bluesky',   placeholder: 'https://bsky.app/profile/…' },
  { name: 'websiteUrl',   label: 'Website',   placeholder: 'https://…' },
] as const;

/**
 * An untouched antd field is `undefined`, which JSON drops — on a PATCH that
 * means "unchanged", so clearing a field would silently do nothing. Sending
 * null makes "empty" mean "remove it".
 */
function withNulls<T extends Record<string, unknown>>(values: T, keys: readonly string[]): T {
  const out: Record<string, unknown> = { ...values };
  for (const k of keys) {
    const v = out[k];
    out[k] = typeof v === 'string' && v.trim() === '' ? null : v ?? null;
  }
  return out as T;
}

interface CreatorModalProps {
  open: boolean;
  editing: Creator | null;
  onClose: () => void;
}

export function CreatorModal({ open, editing, onClose }: CreatorModalProps) {
  const isMobile = useIsMobile();
  const [form] = Form.useForm<CreatorInput>();
  const save = useSaveCreator();

  useEffect(() => {
    if (!open) return;
    if (editing) form.setFieldsValue(editing);
    else form.resetFields();
  }, [open, editing, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    if (!CREATOR_LINKS.some(l => (values[l.name] as string | undefined)?.trim())) {
      message.error('Add at least one link');
      return;
    }
    try {
      const body = withNulls(values, ['description', ...CREATOR_LINKS.map(l => l.name)]);
      await save.mutateAsync({ id: editing?.id, body });
      message.success(editing ? 'Creator updated' : 'Creator added');
      onClose();
    } catch (err) {
      message.error((err as Error).message || 'Failed to save creator');
    }
  };

  return (
    <Modal
      title={editing ? 'Edit creator' : 'Add creator'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      confirmLoading={save.isPending}
      {...responsiveModalProps(isMobile, 560)}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={{ sortOrder: 0 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true, message: 'Name is required' }]}>
          <Input maxLength={120} placeholder="e.g. City Nerd" />
        </Form.Item>

        <Form.Item name="description" label="Short description">
          <Input.TextArea maxLength={500} rows={2} showCount placeholder="What they cover, in a sentence" />
        </Form.Item>

        {CREATOR_LINKS.map(l => (
          <Form.Item key={l.name} name={l.name} label={l.label} rules={[urlRule]}>
            <Input maxLength={500} placeholder={l.placeholder} allowClear />
          </Form.Item>
        ))}

        <Form.Item name="sortOrder" label="Sort order" tooltip="Lower numbers appear first. Use a negative number to pin to the top.">
          <InputNumber min={-1000} max={1000} className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  website: 'Website (game, map, tool)',
  article: 'News article',
  study:   'Study',
};

const SOURCE_PLACEHOLDER: Record<ResourceCategory, string> = {
  website: 'Who made it (optional)',
  article: 'Outlet, e.g. The Atlantic',
  study:   'Journal or authors',
};

interface ResourceModalProps {
  open: boolean;
  editing: Resource | null;
  defaultCategory: ResourceCategory;
  onClose: () => void;
}

export function ResourceModal({ open, editing, defaultCategory, onClose }: ResourceModalProps) {
  const isMobile = useIsMobile();
  const [form] = Form.useForm<ResourceInput>();
  const save = useSaveResource();
  const category = Form.useWatch('category', form) ?? defaultCategory;

  useEffect(() => {
    if (!open) return;
    if (editing) form.setFieldsValue(editing);
    else {
      form.resetFields();
      form.setFieldsValue({ category: defaultCategory, sortOrder: 0 });
    }
  }, [open, editing, defaultCategory, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      const body = withNulls(values, ['description', 'source', 'publishedOn']);
      await save.mutateAsync({ id: editing?.id, body });
      message.success(editing ? 'Link updated' : 'Link added');
      onClose();
    } catch (err) {
      message.error((err as Error).message || 'Failed to save link');
    }
  };

  return (
    <Modal
      title={editing ? 'Edit link' : 'Add link'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      confirmLoading={save.isPending}
      {...responsiveModalProps(isMobile, 560)}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="category" label="Type" rules={[{ required: true }]}>
          <Select
            options={(Object.keys(CATEGORY_LABELS) as ResourceCategory[]).map(c => ({ value: c, label: CATEGORY_LABELS[c] }))}
          />
        </Form.Item>

        <Form.Item name="title" label="Title" rules={[{ required: true, whitespace: true, message: 'Title is required' }]}>
          <Input maxLength={200} />
        </Form.Item>

        <Form.Item name="url" label="Link" rules={[{ required: true, message: 'Link is required' }, urlRule]}>
          <Input maxLength={500} placeholder="https://…" />
        </Form.Item>

        <Form.Item name="source" label="Source">
          <Input maxLength={120} placeholder={SOURCE_PLACEHOLDER[category]} allowClear />
        </Form.Item>

        {category !== 'website' && (
          <Form.Item
            name="publishedOn"
            label="Published"
            rules={[{ pattern: /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/, message: 'Use YYYY, YYYY-MM or YYYY-MM-DD' }]}
          >
            <Input maxLength={10} placeholder="YYYY, YYYY-MM or YYYY-MM-DD" allowClear />
          </Form.Item>
        )}

        <Form.Item name="description" label="Short description">
          <Input.TextArea maxLength={500} rows={2} showCount />
        </Form.Item>

        <Form.Item name="sortOrder" label="Sort order" tooltip="Lower numbers appear first. Use a negative number to pin to the top; otherwise newest comes first.">
          <InputNumber min={-1000} max={1000} className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
