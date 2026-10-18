import { useState, type ReactNode } from 'react';
import { Tabs } from 'antd';
import PermitsPriceChart from '../cities/PermitsPriceChart';
import BeforeAfterSlider from '../cities/BeforeAfterSlider';
import { CreatorsSection, ResourcesSection } from './MediaLists';
import HousingSign from './HousingSign';
import { useCreators, useResources } from '../../hooks/media.hook';
import { useIsMobile } from '../../hooks/useIsMobile';

interface SubTab {
  key: string;
  label: string;
  content: ReactNode;
  /** Admin-managed lists: hidden from visitors until they have an entry. */
  isEmpty?: boolean;
}

export default function MediaTabs({ isAdmin }: { isAdmin: boolean }) {
  const isMobile = useIsMobile();
  const creators = useCreators();
  const resources = useResources();

  const tabs: SubTab[] = [
    {
      key: 'chart',
      label: 'Permits vs. price',
      // Side by side from lg up. Below that there isn't room for both, so the
      // sign drops under the chart and its arrow points up instead.
      content: (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-4">
          <div className="min-w-0 lg:flex-1">
            <PermitsPriceChart />
          </div>
          <HousingSign className="mx-auto shrink-0 lg:mx-0" />
        </div>
      ),
    },
    { key: 'compare', label: 'Before & after',    content: <BeforeAfterSlider /> },
    {
      key: 'creators',
      label: 'Creators',
      content: <CreatorsSection isAdmin={isAdmin} />,
      isEmpty: !creators.isLoading && (creators.data ?? []).length === 0,
    },
    {
      key: 'resources',
      label: 'Articles & resources',
      content: <ResourcesSection isAdmin={isAdmin} />,
      isEmpty: !resources.isLoading && (resources.data ?? []).length === 0,
    },
  ];

  // Admins see every tab so they can add the first entry; visitors don't get a
  // tab that opens onto nothing.
  const visible = tabs.filter(t => isAdmin || !t.isEmpty);

  const [active, setActive] = useState('chart');
  // If the open tab disappears (an admin deletes the last item, or signs out),
  // fall back to the first one rather than showing a blank panel.
  const activeKey = visible.some(t => t.key === active) ? active : visible[0].key;

  return (
    <Tabs
      className="yimby-subtabs"
      activeKey={activeKey}
      onChange={setActive}
      size="small"
      tabBarGutter={isMobile ? 6 : 8}
      // Panels mount on first open, so the before/after photos and the chart
      // library only download when someone actually opens those tabs.
      items={visible.map(t => ({ key: t.key, label: t.label, children: t.content }))}
    />
  );
}
