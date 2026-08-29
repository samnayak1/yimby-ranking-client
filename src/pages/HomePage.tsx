import { Tabs } from 'antd';
import { TeamOutlined, GlobalOutlined, PictureOutlined } from '@ant-design/icons';
import PoliticiansTable from '../components/politicians/PoliticiansTable';
import CitiesView from '../components/cities/CitiesView';
import BeforeAfterSlider from '../components/cities/BeforeAfterSlider';
import PermitsPriceChart from '../components/cities/PermitsPriceChart';
import type { AuthUser } from '../types';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import { useIsMobile } from '../hooks/useIsMobile';
import StreetscapeBackdrop from '../components/StreetscapeBackdrop';

interface Props {
  user:     AuthUser | null;
  isAdmin:  boolean;
  onLogout: () => void;
}

export default function HomePage({ user, isAdmin, onLogout }: Props) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white">
      <StreetscapeBackdrop />

      <Navbar user={user} onLogout={onLogout} />

      {/* One continuous column: masthead, standfirst and the panels below all
          sit on the same surface, so nothing reads as a separate card. Body
          copy is held to a readable measure while media runs the full width. */}
      <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-10 lg:px-16 bg-white">

        <header className="pt-10 sm:pt-16 pb-6 sm:pb-8">
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
        </header>


        <section className="pb-16">
          <Tabs
            defaultActiveKey="media"
            size={isMobile ? 'middle' : 'large'}
            tabBarGutter={isMobile ? 8 : 32}
            className="yimby-editorial-tabs"
            items={[
              {
                key:   'media',
                label: (
                  <span className="flex items-center gap-2">
                    <PictureOutlined />
                    Media
                  </span>
                ),
                children: (
                  <>
                    <PermitsPriceChart />
                    <BeforeAfterSlider />
                  </>
                ),
              },
              {
                key:   'politicians',
                label: (
                  <span className="flex items-center gap-2">
                    <TeamOutlined />
                    Politicians
                  </span>
                ),
                children: <PoliticiansTable isAdmin={isAdmin} />,
              },
              {
                key:   'cities',
                label: (
                  <span className="flex items-center gap-2">
                    <GlobalOutlined />
                    Cities
                  </span>
                ),
                children: <CitiesView isAdmin={isAdmin} />,
              },
            ]}
          />
        </section>
      </main>

      <footer className="relative z-10"><Footer /></footer>
    </div>
  );
}
