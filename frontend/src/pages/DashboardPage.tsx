import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/stats';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Archive, Image, MessageSquare, Users, Inbox, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const COLORS = ['#ed7426', '#b37d5e', '#a9896d', '#de5a1c', '#8a5544', '#71473c', '#93371c', '#5d3c33'];

export function DashboardPage() {
  const { user, isEditor } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsApi.getDashboard,
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  const statCards = [
    { label: 'Total Artifacts', value: stats?.totals.artifacts || 0, icon: Archive, gradient: 'from-primary-500 to-primary-700' },
    { label: 'On Display', value: stats?.totals.on_display || 0, icon: Eye, gradient: 'from-green-500 to-green-700' },
    { label: 'In Storage', value: stats?.totals.not_on_display || 0, icon: EyeOff, gradient: 'from-bronze-500 to-bronze-700' },
    { label: 'Media Files', value: stats?.totals.media || 0, icon: Image, gradient: 'from-purple-500 to-purple-700' },
    { label: 'Annotations', value: stats?.totals.annotations || 0, icon: MessageSquare, gradient: 'from-amber-500 to-amber-700' },
    { label: 'Active Users', value: stats?.totals.users || 0, icon: Users, gradient: 'from-cyan-500 to-cyan-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-bronze-900">Dashboard</h1>
          <p className="text-bronze-500 mt-1">
            Welcome back, <span className="font-medium text-bronze-700">{user?.first_name || user?.email?.split('@')[0]}</span>
          </p>
        </div>
        {isEditor() && (stats?.totals?.pending_submissions ?? 0) > 0 && (
          <Link
            to="/submissions"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
          >
            <Inbox className="w-5 h-5" />
            <span className="font-medium">{stats?.totals?.pending_submissions} pending submissions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-museum border border-museum-100 p-5 hover:shadow-museum-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-bronze-900 group-hover:text-primary-600 transition-colors">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-bronze-500 mt-1">{stat.label}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Object Types Chart */}
        <div className="bg-white rounded-xl shadow-museum border border-museum-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-semibold text-bronze-900">Object Types</h3>
            <span className="text-xs text-bronze-400 bg-museum-100 px-2 py-1 rounded-full">
              Top 8 categories
            </span>
          </div>
          <div className="h-72">
            {stats?.object_types && stats.object_types.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.object_types.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6d5c6" />
                  <XAxis type="number" tick={{ fill: '#5d3c33', fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: '#5d3c33', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e6d5c6',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px -2px rgba(119, 47, 26, 0.15)',
                    }}
                  />
                  <Bar dataKey="count" fill="#ed7426" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-bronze-400">
                <Archive className="w-12 h-12 mb-3 opacity-30" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Materials Chart */}
        <div className="bg-white rounded-xl shadow-museum border border-museum-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-semibold text-bronze-900">Materials</h3>
            <span className="text-xs text-bronze-400 bg-museum-100 px-2 py-1 rounded-full">
              Distribution
            </span>
          </div>
          <div className="h-72">
            {stats?.materials && stats.materials.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.materials.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    outerRadius={90}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    paddingAngle={2}
                  >
                    {stats.materials.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e6d5c6',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px -2px rgba(119, 47, 26, 0.15)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-bronze-400">
                <Sparkles className="w-12 h-12 mb-3 opacity-30" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-museum border border-museum-100 p-6">
        <h3 className="text-xl font-display font-semibold text-bronze-900 mb-5">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-museum-100 text-bronze-700 rounded-xl hover:bg-museum-200 transition-colors font-medium"
          >
            <Archive className="w-4 h-4" />
            Browse Collection
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-museum-100 text-bronze-700 rounded-xl hover:bg-museum-200 transition-colors font-medium"
          >
            <MessageSquare className="w-4 h-4" />
            Search Artifacts
          </Link>
          {isEditor() && (
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md shadow-green-500/20 font-medium"
            >
              <Image className="w-4 h-4" />
              Upload Media
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
