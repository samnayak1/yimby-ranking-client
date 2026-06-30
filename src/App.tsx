import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import LoginPage from './pages/LoginPage';
import HomePage  from './pages/HomePage';
import { useAuth } from './hooks/auth.hook';

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

  console.log("isAdmin",isAdmin)

  if (loading) {
    return (
      <div className="min-h-screen bg-yimby-50 flex items-center justify-center">
        <div className="text-yimby-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <ConfigProvider theme={antTheme}>
      <BrowserRouter>
        <Routes>
          {/* Public homepage — visible to everyone, no login required */}
          <Route
            path="/"
            element={<HomePage user={user} isAdmin={isAdmin} onLogout={reload} />}
          />

          {/* Admin login — separate route, redirects home if already signed in */}
          <Route
            path="/admin/login"
            element={
              user
                ? <Navigate to="/" replace />
                : <LoginPage onSuccess={reload} />
            }
          />

          {/* Anything else → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
