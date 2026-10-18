import { useState } from 'react';
import { Button, Popconfirm, Skeleton, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { Creator, CreatorPlatform, Resource } from '../../types';
import { useCreators, useDeleteCreator, useDeleteResource, useResources } from '../../hooks/media.hook';
import { hostOf, safeHref } from '../../utils/safeUrl';
import { CreatorModal, ResourceModal } from './MediaModals';
import { CREATOR_TAGS, PLATFORMS, RESOURCE_CATEGORIES } from './mediaStyles';
import Flag from '../Flag';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2024" → "2024", "2024-03" → "Mar 2024", "2024-03-15" → "Mar 15, 2024". */
function formatPublished(value: string | null): string | null {
  if (!value) return null;
  const [y, m, d] = value.split('-');
  if (!m) return y;
  const month = MONTHS[Number(m) - 1] ?? m;
  return d ? `${month} ${Number(d)}, ${y}` : `${month} ${y}`;
}

/**
 * The account name as people know it: youtube.com/@OhTheUrbanity → @OhTheUrbanity,
 * x.com/sam_d_1995 → @sam_d_1995. Websites show their domain.
 */
function handleOf(platform: CreatorPlatform, url: string): string {
  let path: string[];
  try {
    path = new URL(url).pathname.split('/').filter(Boolean);
  } catch {
    return '';
  }
  if (platform === 'website') return hostOf(url);
  if (platform === 'bluesky') return path[0] === 'profile' && path[1] ? `@${path[1]}` : '';
  const first = path[0] ?? '';
  if (!first) return '';
  return first.startsWith('@') ? first : `@${first}`;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? '').slice(0, 2);
  return letters.toUpperCase();
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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(c => {
            const platform = PLATFORMS[c.platform];
            const href = safeHref(c.url);
            const handle = handleOf(c.platform, c.url);
            return (
              <li
                key={c.id}
                className="flex gap-3 rounded-lg border-2 border-dotted bg-white p-4"
                style={{ borderColor: platform.border }}
              >
                <div
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700"
                >
                  {initialsOf(c.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 truncate font-semibold text-gray-900 underline-offset-2 hover:text-yimby-700 hover:underline"
                      >
                        {c.name}
                      </a>
                    ) : (
                      <span className="min-w-0 truncate font-semibold text-gray-900">{c.name}</span>
                    )}
                    <Flag code={c.nationalityCode} className="text-[0.85em]" />
                  </div>

                  {/* Icon in the platform colour, text in ink: brand red on white
                      is too low-contrast for small text. */}
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                    <span style={{ color: platform.border }} className="text-sm leading-none">{platform.icon}</span>
                    <span>{platform.label}</span>
                    {handle && <span className="truncate">· {handle}</span>}
                  </p>

                  {c.description && <p className="mt-2 text-sm text-gray-600">{c.description}</p>}

                  {c.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {c.tags.map(t => (
                        <Tag key={t} color={CREATOR_TAGS[t]?.color} bordered={false} className="m-0" title={CREATOR_TAGS[t]?.hint}>
                          {CREATOR_TAGS[t]?.label ?? t}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <AdminActions label={c.name} onEdit={() => setModal({ open: true, editing: c })} onDelete={() => onDelete(c)} />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isAdmin && (
        <CreatorModal open={modal.open} editing={modal.editing} onClose={() => setModal({ open: false, editing: null })} />
      )}
    </section>
  );
}

/**
 * News, studies and websites in one list. The backend already orders it:
 * pinned (negative sort order) first, then newest, with undated links such as
 * websites after dated ones.
 */
export function ResourcesSection({ isAdmin }: { isAdmin: boolean }) {
  const { data: items = [], isLoading } = useResources();
  const remove = useDeleteResource();
  const [modal, setModal] = useState<{ open: boolean; editing: Resource | null }>({ open: false, editing: null });

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
        title="Articles, studies and websites"
        intro="News coverage, research, and games, maps and tools about housing and cities."
        onAdd={isAdmin ? () => setModal({ open: true, editing: null }) : undefined}
      />

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">Nothing here yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map(r => {
            const href = safeHref(r.url);
            const meta = [r.source, formatPublished(r.publishedOn), hostOf(r.url)].filter(Boolean).join(' · ');
            const category = RESOURCE_CATEGORIES[r.category];
            return (
              <li
                key={r.id}
                className="flex gap-3 rounded-lg border-2 border-dotted bg-white p-4"
                style={{ borderColor: category.border }}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5">
                    <Tag color={category.tag} bordered={false} className="m-0">{category.label}</Tag>
                  </div>
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
          defaultCategory="article"
          onClose={() => setModal({ open: false, editing: null })}
        />
      )}
    </section>
  );
}
