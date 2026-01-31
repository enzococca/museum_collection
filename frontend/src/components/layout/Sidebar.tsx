import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Archive,
  Search,
  Upload,
  Download,
  Users,
  BarChart3,
  GitCompare,
  Inbox,
  X,
  Landmark,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAdmin, isEditor } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/collection', icon: Archive, label: 'Collection' },
    { to: '/search', icon: Search, label: 'Search' },
    ...(isEditor() ? [{ to: '/upload', icon: Upload, label: 'Upload' }] : []),
    ...(isAdmin() ? [{ to: '/export', icon: Download, label: 'Export' }] : []),
    ...(isEditor() ? [{ to: '/submissions', icon: Inbox, label: 'Submissions' }] : []),
    { to: '/statistics', icon: BarChart3, label: 'Statistics' },
    { to: '/analytics', icon: GitCompare, label: 'Analytics' },
    ...(isAdmin() ? [{ to: '/users', icon: Users, label: 'Users' }] : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-bronze-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-gradient-to-b from-bronze-900 via-bronze-800 to-bronze-900 z-40 transform transition-transform duration-300 lg:translate-x-0 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo section */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-bronze-700/50">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-lg">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-white text-lg leading-tight">Museum</h1>
            <p className="text-bronze-400 text-xs">Collection Manager</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg hover:bg-bronze-700/50 lg:hidden transition-colors"
          >
            <X className="w-5 h-5 text-bronze-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-900/30'
                    : 'text-bronze-300 hover:bg-bronze-700/50 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-bronze-700/50">
          <div className="text-center">
            <p className="text-bronze-500 text-xs">Chennai & British Museum</p>
            <p className="text-bronze-600 text-xs mt-1">Collection System v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
