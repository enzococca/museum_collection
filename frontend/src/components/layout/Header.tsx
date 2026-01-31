import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu, Bell } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'editor':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-bronze-100 text-bronze-700 border-bronze-200';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-museum-200 fixed top-0 left-0 lg:left-64 right-0 z-30 h-16">
      <div className="px-4 lg:px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-museum-100 text-bronze-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-lg font-display font-semibold text-bronze-800">
              Collection Management
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications placeholder */}
          <button className="p-2 rounded-lg hover:bg-museum-100 text-bronze-600 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-museum-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-medium text-sm shadow-md">
                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-bronze-800">
                  {user?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-bronze-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-museum-lg border border-museum-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-museum-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shadow-md">
                        {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-bronze-900">{user?.full_name}</p>
                        <p className="text-xs text-bronze-500">{user?.email}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${getRoleBadgeClass(
                        user?.role || ''
                      )}`}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-bronze-700 hover:bg-museum-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
