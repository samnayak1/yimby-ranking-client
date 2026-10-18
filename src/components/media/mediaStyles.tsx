import type { ReactNode } from 'react';
import { GlobalOutlined, InstagramOutlined, XOutlined, YoutubeOutlined } from '@ant-design/icons';
import type { CreatorPlatform, CreatorTag, ResourceCategory } from '../../types';
import BlueskyIcon from './BlueskyIcon';

/*
 * The single source for Media-tab colours, so a card's border and its tag can't
 * drift apart. Border colours are all at least 3:1 against white, the minimum
 * for a non-text graphic. Every card also names its platform or type in words,
 * so colour is never the only cue.
 */

export const PLATFORMS: Record<CreatorPlatform, {
  label: string;
  border: string;
  icon: ReactNode;
  placeholder: string;
  hosts: string[];          // empty = any domain
}> = {
  youtube:   { label: 'YouTube',   border: '#ff0000', icon: <YoutubeOutlined />,   placeholder: 'https://youtube.com/@…',        hosts: ['youtube.com', 'youtu.be'] },
  x:         { label: 'X',         border: '#000000', icon: <XOutlined />,         placeholder: 'https://x.com/…',               hosts: ['x.com', 'twitter.com'] },
  instagram: { label: 'Instagram', border: '#e1306c', icon: <InstagramOutlined />, placeholder: 'https://instagram.com/…',       hosts: ['instagram.com'] },
  bluesky:   { label: 'Bluesky',   border: '#0085ff', icon: <BlueskyIcon />,       placeholder: 'https://bsky.app/profile/…',    hosts: ['bsky.app'] },
  website:   { label: 'Website',   border: '#1f8051', icon: <GlobalOutlined />,    placeholder: 'https://…',                     hosts: [] },
};

/** Mirrors the backend check, so the form can flag a mismatch before saving. */
export function urlMatchesPlatform(platform: CreatorPlatform, url: string): boolean {
  const { hosts } = PLATFORMS[platform];
  if (hosts.length === 0) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return hosts.some(h => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

// Text sits in antd's own preset tag colours, which are contrast-checked.
export const CREATOR_TAGS: Record<CreatorTag, { label: string; color: string; hint: string }> = {
  transit:  { label: 'Transit',  color: 'blue',    hint: 'Public transportation' },
  urbanism: { label: 'Urbanism', color: 'green',   hint: 'Walkability and city design' },
  econ:     { label: 'Econ',     color: 'orange',  hint: 'Data and economics' },
  policy:   { label: 'Policy',   color: 'magenta', hint: 'Zoning, land use and local politics' },
};

export const RESOURCE_CATEGORIES: Record<ResourceCategory, { label: string; tag: string; border: string }> = {
  article: { label: 'News',    tag: 'gold',   border: '#d97706' },
  study:   { label: 'Study',   tag: 'purple', border: '#9333ea' },
  website: { label: 'Website', tag: 'blue',   border: '#2563eb' },
};
