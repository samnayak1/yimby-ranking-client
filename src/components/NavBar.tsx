import { signOut } from "aws-amplify/auth";
import type { AuthUser } from "../types";
import { Button, Dropdown } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";

interface Props {
  user: AuthUser | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: Props) {
  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  return (
    <header className="bg-white border-b border-yimby-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yimby-500 flex items-center justify-center text-white text-sm">
            🏗
          </div>
          <div>
            <span className="font-bold text-yimby-700 text-sm tracking-tight">YIMBY Tracker</span>
          </div>
        </div>

        {user && (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'email',
                  label: user.email,
                  disabled: true,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'logout',
                  label: 'Sign out',
                  icon: <LogoutOutlined />,
                  onClick: handleLogout,
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<UserOutlined />}
              className="flex items-center gap-1.5 text-gray-600 hover:text-yimby-600"
            >
              <span className="text-sm hidden sm:inline">{user.email}</span>
            </Button>
          </Dropdown>
        )}

      </div>
    </header>
  );
}