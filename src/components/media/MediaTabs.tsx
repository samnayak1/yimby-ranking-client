import { Tabs } from 'antd';
import PermitsPriceChart from '../cities/PermitsPriceChart';
import BeforeAfterSlider from '../cities/BeforeAfterSlider';
import HousingSign from './HousingSign';
import { useIsMobile } from '../../hooks/useIsMobile';

// Creators and articles have their own top-level tabs; what's left here is the
// visual material under the masthead.
export default function MediaTabs() {
  const isMobile = useIsMobile();

  return (
    <Tabs
      className="yimby-subtabs"
      defaultActiveKey="chart"
      size="small"
      tabBarGutter={isMobile ? 6 : 8}
      // Panels mount on first open, so the before/after photos and the chart
      // library only download when someone actually opens those tabs.
      items={[
        {
          key: 'chart',
          label: 'Permits vs. price',
          // Side by side from lg up. Below that there isn't room for both, so
          // the sign drops under the chart and its arrow points up instead.
          children: (
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-4">
              <div className="min-w-0 lg:flex-1">
                <PermitsPriceChart />
              </div>
              <HousingSign className="mx-auto shrink-0 lg:mx-0" />
            </div>
          ),
        },
        { key: 'compare', label: 'Before & after', children: <BeforeAfterSlider /> },
      ]}
    />
  );
}
