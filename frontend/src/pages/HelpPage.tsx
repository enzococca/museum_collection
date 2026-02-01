import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HelpSection } from '../components/help/HelpSection';
import {
  LayoutDashboard,
  Archive,
  Search,
  Eye,
  BarChart3,
  GitCompare,
  Upload,
  Inbox,
  Edit,
  PenTool,
  Download,
  Users,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';

// Import help content components
import {
  DashboardHelp,
  CollectionHelp,
  SearchHelp,
  ArtifactDetailHelp,
  StatisticsHelp,
  AnalyticsHelp,
  UploadHelp,
  SubmissionsHelp,
  ArtifactEditHelp,
  AnnotationsHelp,
  ExportHelp,
  UserManagementHelp,
} from '../components/help/content';

type RoleFilter = 'all' | 'viewer' | 'editor' | 'admin';

interface HelpSectionConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  role: 'viewer' | 'editor' | 'admin';
  component: React.ComponentType;
}

const helpSections: HelpSectionConfig[] = [
  // Viewer features (all users)
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, role: 'viewer', component: DashboardHelp },
  { id: 'collection', title: 'Collection Browsing', icon: Archive, role: 'viewer', component: CollectionHelp },
  { id: 'search', title: 'Search', icon: Search, role: 'viewer', component: SearchHelp },
  { id: 'artifact-detail', title: 'Artifact Details', icon: Eye, role: 'viewer', component: ArtifactDetailHelp },
  { id: 'statistics', title: 'Statistics', icon: BarChart3, role: 'viewer', component: StatisticsHelp },
  { id: 'analytics', title: 'Analytics', icon: GitCompare, role: 'viewer', component: AnalyticsHelp },

  // Editor features (admin + editor)
  { id: 'upload', title: 'Upload Media', icon: Upload, role: 'editor', component: UploadHelp },
  { id: 'submissions', title: 'Review Submissions', icon: Inbox, role: 'editor', component: SubmissionsHelp },
  { id: 'artifact-edit', title: 'Edit Artifacts', icon: Edit, role: 'editor', component: ArtifactEditHelp },
  { id: 'annotations', title: 'Annotations', icon: PenTool, role: 'editor', component: AnnotationsHelp },

  // Admin features (admin only)
  { id: 'export', title: 'Export Data', icon: Download, role: 'admin', component: ExportHelp },
  { id: 'users', title: 'User Management', icon: Users, role: 'admin', component: UserManagementHelp },
];

export function HelpPage() {
  const { isAdmin, isEditor } = useAuth();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  // Filter sections based on user's actual role and selected filter
  const visibleSections = helpSections.filter(section => {
    // First filter by user's actual role
    if (section.role === 'admin' && !isAdmin()) return false;
    if (section.role === 'editor' && !isEditor()) return false;

    // Then filter by selected tab
    if (roleFilter === 'all') return true;
    if (roleFilter === 'viewer') return section.role === 'viewer';
    if (roleFilter === 'editor') return section.role === 'editor';
    if (roleFilter === 'admin') return section.role === 'admin';

    return true;
  });

  const filterTabs = [
    { id: 'all' as RoleFilter, label: 'All Features' },
    { id: 'viewer' as RoleFilter, label: 'Viewing' },
    ...(isEditor() ? [{ id: 'editor' as RoleFilter, label: 'Editing' }] : []),
    ...(isAdmin() ? [{ id: 'admin' as RoleFilter, label: 'Administration' }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-bronze-800 to-bronze-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/10 rounded-lg">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-display font-bold">Help & Tutorials</h1>
        </div>
        <p className="text-bronze-200">
          Learn how to use the Museum Collection Management System. Select a topic below to see
          detailed instructions, tips, and troubleshooting guides.
        </p>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-museum-200 pb-3">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setRoleFilter(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              roleFilter === tab.id
                ? 'bg-primary-100 text-primary-700'
                : 'text-bronze-600 hover:bg-museum-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Table of Contents - Desktop */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-xl shadow-museum border border-museum-100 p-4 sticky top-20">
            <h3 className="font-semibold text-bronze-800 mb-3 text-sm uppercase tracking-wide">
              Contents
            </h3>
            <nav className="space-y-1">
              {visibleSections.map(section => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 py-1.5 px-2 text-sm text-bronze-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                >
                  <section.icon className="w-4 h-4" />
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Help Sections */}
        <div className="lg:col-span-3 space-y-4">
          {visibleSections.length === 0 ? (
            <div className="bg-white rounded-xl shadow-museum border border-museum-100 p-8 text-center">
              <HelpCircle className="w-12 h-12 text-bronze-300 mx-auto mb-4" />
              <p className="text-bronze-500">
                No help topics available for the selected filter.
              </p>
            </div>
          ) : (
            visibleSections.map(section => (
              <HelpSection
                key={section.id}
                id={section.id}
                title={section.title}
                icon={section.icon}
                roleLabel={section.role}
                defaultExpanded={section.id === 'dashboard'}
              >
                <section.component />
              </HelpSection>
            ))
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-museum-50 rounded-xl p-6 border border-museum-200">
        <h3 className="font-semibold text-bronze-800 mb-4">Quick Reference: User Roles</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-museum-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Viewer</span>
            </div>
            <p className="text-sm text-bronze-600">
              Can browse, search, and view all artifacts and statistics. Read-only access.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-museum-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Editor</span>
            </div>
            <p className="text-sm text-bronze-600">
              All Viewer abilities plus: upload media, edit artifacts, create annotations, review submissions.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-museum-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">Admin</span>
            </div>
            <p className="text-sm text-bronze-600">
              Full access: all Editor abilities plus manage users, export data, delete artifacts.
            </p>
          </div>
        </div>
      </div>

      {/* Support Footer */}
      <div className="text-center text-sm text-bronze-500 pb-4">
        <p>
          Need more help? Contact your system administrator or refer to the project documentation.
        </p>
      </div>
    </div>
  );
}
