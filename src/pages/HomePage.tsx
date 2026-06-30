import { Tabs } from 'antd';
import { TeamOutlined, GlobalOutlined } from '@ant-design/icons';
import PoliticiansTable from '../components/politicians/PoliticiansTable';
import CitiesView from '../components/cities/CitiesView';
import type { AuthUser } from '../types';
import Navbar from '../components/NavBar';


interface Props {
  user:    AuthUser|null;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function HomePage({ user, isAdmin, onLogout }: Props) {
  return (
    <div className="min-h-screen bg-yimby-50">
      <Navbar user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-6 py-8">

  
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-yimby-800 tracking-tight">
            Housing Policy Tracker
          </h1>
          <p className="text-sm text-yimby-500 mt-1">
            Track politicians and cities on zoning reform and housing affordability
          </p>
        </div>


        <div className="bg-white rounded-2xl shadow-sm border border-yimby-100 p-6">
          <Tabs
            defaultActiveKey="politicians"
            size="large"
            items={[
              {
                key:      'politicians',
                label: (
                  <span className="flex items-center gap-2 px-1">
                    <TeamOutlined />
                    Politicians
                  </span>
                ),
                children: <PoliticiansTable isAdmin={isAdmin} />,
              },
              {
                key:   'cities',
                label: (
                  <span className="flex items-center gap-2 px-1">
                    <GlobalOutlined />
                    Cities
                  </span>
                ),
                children: <CitiesView isAdmin={isAdmin} />,
              },
            ]}
          />
        </div>
      </main>
    </div>
  );
}