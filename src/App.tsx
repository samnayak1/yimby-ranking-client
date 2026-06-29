import { ConfigProvider } from 'antd';
import { useAuth } from './hooks/auth.hook';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';


const antTheme = {
  token: {
    colorPrimary:      '#2da066',
    colorPrimaryHover: '#1f8051',
    borderRadius:      8,
    fontFamily:        'Inter, system-ui, sans-serif',
  },
};

export default function App() {
  const { user, loading, isAdmin, reload } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-yimby-50 flex items-center justify-center">
        <div className="text-yimby-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <ConfigProvider theme={antTheme}>
      {user
        ? <HomePage user={user} isAdmin={isAdmin} onLogout={reload} />
        : <LoginPage onSuccess={reload} />
      }
    </ConfigProvider>
  );
}
