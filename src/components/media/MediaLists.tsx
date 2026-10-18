import { useState, type ReactNode } from 'react';
import { Button, Popconfirm, Skeleton, message } from 'antd';
import {
  DeleteOutlined, EditOutlined, GlobalOutlined, InstagramOutlined, PlusOutlined,
  XOutlined, YoutubeOutlined,
} from '@ant-design/icons';
import type { Creator, Resource, ResourceCategory } from '../../types';
import { useCreators, useDeleteCreator, useDeleteResource, useResources } from '../../hooks/media.hook';
import { hostOf, safeHref } from '../../utils/safeUrl';
import { CreatorModal, ResourceModal } from './MediaModals';

// Bluesky butterfly (Simple Icons, CC0). antd ships no Bluesky icon.
function BlueskyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
    </svg>
  );
}

const SOCIALS: { key: keyof Creator; label: string; icon: ReactNode }[] = [
  { key: 'instagramUrl', label: 'Instagram', icon: <InstagramOutlined /> },
  { key: 'youtubeUrl',   label: 'YouTube',   icon: <YoutubeOutlined /> },
  { key: 'twitterUrl',   label: 'X',         icon: <XOutlined /> },
  { key: 'blueskyUrl',   label: 'Bluesky',   icon: <BlueskyIcon /> },
  { key: 'websiteUrl',   label: 'Website',   icon: <GlobalOutlined /> },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2024" → "2024", "2024-03" → "Mar 2024", "2024-03-15" → "Mar 15, 2024". */
function formatPublished(value: string | null): string | null {
  if (!value) return null;
  const [y, m, d] = value.split('-');
  if (!m) return y;
  const month = MONTHS[Number(m) - 1] ?? m;
  return d ? `${month} ${Number(d)}, ${y}` : `${month} ${y}`;
}

function SectionHeader({ title, intro, onAdd }: { title: string; intro?: string; onAdd?: () => void }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
        {intro && <p className="mt-1 text-sm text-gray-500 max-w-2xl">{intro}</p>}
      </div>
      {onAdd && (
        <Button size="small" icon={<PlusOutlined />} onClick={onAdd}>Add</Button>
      )}
    </div>
  );
}

function AdminActions({ onEdit, onDelete, label }: { onEdit: () => void; onDelete: () => void; label: string }) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button size="small" type="text" icon={<EditOutlined />} onClick={onEdit} aria-label={`Edit ${label}`} />
      <Popconfirm title={`Delete "${label}"?`} okText="Delete" okButtonProps={{ danger: true }} onConfirm={onDelete}>
        <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label={`Delete ${label}`} />
      </Popconfirm>
    </div>
  );
}

export function CreatorsSection({ isAdmin }: { isAdmin: boolean }) {
  const { data = [], isLoading } = useCreators();
  const remove = useDeleteCreator();
  const [modal, setModal] = useState<{ open: boolean; editing: Creator | null }>({ open: false, editing: null });

  // Visitors don't see an empty heading; admins do, so they can add the first one.
  if (!isLoading && data.length === 0 && !isAdmin) return null;

  const onDelete = async (c: Creator) => {
    try {
      await remove.mutateAsync(c.id);
      message.success('Creator removed');
    } catch (err) {
      message.error((err as Error).message || 'Failed to remove creator');
    }
  };

  return (
    <section>
      <SectionHeader
        title="Pro-housing creators you may enjoy"
        onAdd={isAdmin ? () => setModal({ open: true, editing: null }) : undefined}
      />

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-400">No creators yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(c => (
            <li key={c.id} className="flex gap-3 rounded-lg border border-gray-200 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{c.name}</p>
                {c.description && <p className="mt-1 text-sm text-gray-600">{c.description}</p>}
                <div className="mt-3 flex flex-wrap gap-3 text-lg">
                  {SOCIALS.map(s => {
                    const href = safeHref(c[s.key] as string | null);
                    return href ? (
                      <a
                        key={s.key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${c.name} on ${s.label}`}
                        title={s.label}
                        className="text-gray-500 hover:text-yimby-700"
                      >
                        {s.icon}
                      </a>
                    ) : null;
                  })}
                </div>
              </div>
              {isAdmin && (
                <AdminActions label={c.name} onEdit={() => setModal({ open: true, editing: c })} onDelete={() => onDelete(c)} />
              )}
            </li>
          ))}
        </ul>
      )}

      {isAdmin && (
        <CreatorModal open={modal.open} editing={modal.editing} onClose={() => setModal({ open: false, editing: null })} />
      )}
    </section>
  );
}

interface ResourcesSectionProps {
  isAdmin: boolean;
  category: ResourceCategory;
  title: string;
  intro?: string;
}

export function ResourcesSection({ isAdmin, category, title, intro }: ResourcesSectionProps) {
  const { data: all = [], isLoading } = useResources();
  const remove = useDeleteResource();
  const [modal, setModal] = useState<{ open: boolean; editing: Resource | null }>({ open: false, editing: null });

  const items = all.filter(r => r.category === category);

  if (!isLoading && items.length === 0 && !isAdmin) return null;

  const onDelete = async (r: Resource) => {
    try {
      await remove.mutateAsync(r.id);
      message.success('Link removed');
    } catch (err) {
      message.error((err as Error).message || 'Failed to remove link');
    }
  };

  return (
    <section>
      <SectionHeader
        title={title}
        intro={intro}
        onAdd={isAdmin ? () => setModal({ open: true, editing: null }) : undefined}
      />

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
          {items.map(r => {
            const href = safeHref(r.url);
            const meta = [r.source, formatPublished(r.publishedOn), hostOf(r.url)].filter(Boolean).join(' · ');
            return (
              <li key={r.id} className="flex gap-3 p-4">
                <div className="min-w-0 flex-1">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 underline-offset-2 hover:text-yimby-700 hover:underline"
                    >
                      {r.title}
                    </a>
                  ) : (
                    <span className="font-medium text-gray-900">{r.title}</span>
                  )}
                  {meta && <p className="mt-0.5 text-xs text-gray-500">{meta}</p>}
                  {r.description && <p className="mt-1.5 text-sm text-gray-600">{r.description}</p>}
                </div>
                {isAdmin && (
                  <AdminActions label={r.title} onEdit={() => setModal({ open: true, editing: r })} onDelete={() => onDelete(r)} />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isAdmin && (
        <ResourceModal
          open={modal.open}
          editing={modal.editing}
          defaultCategory={category}
          onClose={() => setModal({ open: false, editing: null })}
        />
      )}
    </section>
  );
}
