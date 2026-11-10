import { lazy, Suspense, type ReactNode } from 'react';
import { Spin, Tabs } from 'antd';
import {
  TeamOutlined, GlobalOutlined, PictureOutlined, ColumnWidthOutlined, VideoCameraOutlined, ReadOutlined,
} from '@ant-design/icons';
import PoliticiansTable from '../components/politicians/PoliticiansTable';
import CitiesView from '../components/cities/CitiesView';
import MediaTabs from '../components/media/MediaTabs';
import { CreatorsSection, ResourcesSection } from '../components/media/MediaLists';
import { useCreators, useResources } from '../hooks/media.hook';
import type { AuthUser } from '../types';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import HousingMyths from '../components/myths/HousingMyths';
import { useIsMobile } from '../hooks/useIsMobile';
import StreetscapeBackdrop from '../components/StreetscapeBackdrop';

// The compare tab carries a lot of outline data, so it loads when opened.
const CompareSizes = lazy(() => import('../components/compare/CompareSizes'));

interface Props {
  user:     AuthUser | null;
  isAdmin:  boolean;
  onLogout: () => void;
}

function Masthead() {
  return (
    <header className="pt-6 sm:pt-10 pb-6 sm:pb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-yimby-600">
        Housing Policy
      </p>

      <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1] max-w-3xl">
        Housing Policy Tracker
      </h1>

      <p className="mt-4 sm:mt-5 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
        Track politicians and cities on zoning reform and housing
        affordability.
      </p>

      <p className="mt-5 text-base text-gray-500 leading-relaxed max-w-2xl">
        The United States faces a shortage of roughly 4&nbsp;million homes, a
        gap that has built up over more than a decade of underbuilding
        following the 2008 financial crisis. Zoning restrictions, lengthy
        permitting processes, and neighborhood opposition have kept supply
        far below the pace needed to meet growing demand, pushing prices and
        rents to historic highs across the country.
      </p>

      <HousingMyths />
    </header>
  );
}

const tabLabel = (icon: ReactNode, text: string) => (
  <span className="flex items-center gap-2">
    {icon}
    {text}
  </span>
);

export default function HomePage({ user, isAdmin, onLogout }: Props) {
  const isMobile = useIsMobile();
  const creators = useCreators();
  const resources = useResources();

  // Admin-managed lists: visitors don't get a tab that opens onto nothing,
  // admins always see it so they can add the first entry.
  const creatorsEmpty = !creators.isLoading && (creators.data ?? []).length === 0;
  const resourcesEmpty = !resources.isLoading && (resources.data ?? []).length === 0;

  const tabs = [
    {
      key:      'media',
      label:    tabLabel(<PictureOutlined />, 'Media'),
      children: (
        <>
          <Masthead />
          <MediaTabs />
        </>
      ),
    },
    {
      key:      'politicians',
      label:    tabLabel(<TeamOutlined />, 'Politicians'),
      children: <PoliticiansTable isAdmin={isAdmin} />,
    },
    {
      key:      'cities',
      label:    tabLabel(<GlobalOutlined />, 'Cities'),
      children: <CitiesView isAdmin={isAdmin} />,
    },
    ...(isAdmin || !creatorsEmpty ? [{
      key:      'creators',
      label:    tabLabel(<VideoCameraOutlined />, 'Creators'),
      children: <CreatorsSection isAdmin={isAdmin} />,
    }] : []),
    ...(isAdmin || !resourcesEmpty ? [{
      key:      'resources',
      label:    tabLabel(<ReadOutlined />, 'Articles & resources'),
      children: <ResourcesSection isAdmin={isAdmin} />,
    }] : []),
    {
      key:      'compare',
      label:    tabLabel(<ColumnWidthOutlined />, 'Compare outlines'),
      children: (
        <Suspense fallback={<div className="flex justify-center py-20"><Spin /></div>}>
          <CompareSizes />
        </Suspense>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <StreetscapeBackdrop />

      <Navbar user={user} onLogout={onLogout} />

      {/* One continuous column: masthead, standfirst and the panels below all
          sit on the same surface, so nothing reads as a separate card. Body
          copy is held to a readable measure while media runs the full width. */}
      {/* One continuous column: the tab bar sits right under the navbar, and
          the masthead, standfirst and myths open the Media tab, so nothing
          reads as a separate card. Body copy is held to a readable measure
          while media runs the full width. */}
      <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-10 lg:px-16 bg-white">
        <section className="pt-3 sm:pt-5 pb-16">
          <Tabs
            defaultActiveKey="media"
            size={isMobile ? 'middle' : 'large'}
            tabBarGutter={isMobile ? 8 : 32}
            className="yimby-editorial-tabs"
            items={tabs}
          />
        </section>
      </main>

      <footer className="relative z-10"><Footer /></footer>
    </div>
  );
}
