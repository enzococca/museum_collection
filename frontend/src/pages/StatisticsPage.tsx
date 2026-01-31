import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { statsApi } from '../api/stats';
import { artifactsApi } from '../api/artifacts';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Archive, Image, Eye, EyeOff, FileText, CheckCircle, AlertCircle,
  Camera, BookOpen, ExternalLink, TrendingUp, Layers, Building2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const COMPLETENESS_COLORS = { complete: '#10b981', partial: '#f59e0b', minimal: '#ef4444' };

export function StatisticsPage() {
  const [selectedCollection, setSelectedCollection] = useState<string>('');

  const { data: collectionsData } = useQuery({
    queryKey: ['collections'],
    queryFn: artifactsApi.getCollections,
  });

  const { data: catalogStats, isLoading } = useQuery({
    queryKey: ['catalog-stats', selectedCollection],
    queryFn: () => statsApi.getCatalog(selectedCollection || undefined),
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  if (!catalogStats) {
    return <div className="text-center py-12 text-gray-500">Failed to load statistics</div>;
  }

  const completenessData = [
    { name: 'Complete (>80%)', value: catalogStats.documentation.distribution.complete, color: COMPLETENESS_COLORS.complete },
    { name: 'Partial (40-80%)', value: catalogStats.documentation.distribution.partial, color: COMPLETENESS_COLORS.partial },
    { name: 'Minimal (<40%)', value: catalogStats.documentation.distribution.minimal, color: COMPLETENESS_COLORS.minimal },
  ];

  const displayData = [
    { name: 'On Display', value: catalogStats.totals.on_display, color: '#10b981' },
    { name: 'In Storage', value: catalogStats.totals.in_storage, color: '#6b7280' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Collection Statistics</h1>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Collection Selector */}
      {collectionsData && collectionsData.collections.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <Building2 className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Select Collection:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCollection('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCollection === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Collections
              </button>
              {collectionsData.collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollection(col.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCollection === col.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {col.name} ({col.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Narrative Summary */}
      <div className="bg-gradient-to-br from-bronze-800 to-bronze-900 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Collection Summary
        </h2>
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{catalogStats.narrative}</ReactMarkdown>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Archive className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-sm text-gray-500">Total Artifacts</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{catalogStats.totals.artifacts}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Image className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Total Images</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{catalogStats.totals.media}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">On Display</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{catalogStats.totals.on_display}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Avg. Completeness</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{catalogStats.documentation.avg_completeness}%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExternalLink className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">British Museum Links</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{catalogStats.cross_references.british_museum}</p>
        </div>
      </div>

      {/* Documentation & Display Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Documentation Completeness */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            Documentation Completeness
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completenessData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {completenessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Fields tracked: {catalogStats.documentation.fields_tracked.length}
          </p>
        </div>

        {/* Display Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-400" />
            Display Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Photo Coverage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-gray-400" />
            Photo Coverage
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Documented artifacts</span>
                <span className="font-medium">{catalogStats.photo_coverage.percentage}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${catalogStats.photo_coverage.percentage}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{catalogStats.photo_coverage.with_images}</p>
                <p className="text-xs text-gray-500">With photos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{catalogStats.photo_coverage.without_images}</p>
                <p className="text-xs text-gray-500">Without photos</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Average: <span className="font-semibold">{catalogStats.photo_coverage.avg_per_artifact}</span> photos/artifact
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Material & Object Type Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Materials */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-400" />
            Materials Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catalogStats.materials} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, _name, props) =>
                    [`${value} (${(props as any).payload?.percentage || 0}%)`, 'Count']
                  }
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Object Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Archive className="w-5 h-5 text-gray-400" />
            Object Types
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catalogStats.object_types.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }: { name: string; percent: number }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {catalogStats.object_types.slice(0, 8).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chronology & Findspots */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chronology */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chronological Distribution</h3>
          <div className="h-64">
            {catalogStats.chronologies.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catalogStats.chronologies}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Chronological data not available
              </div>
            )}
          </div>
        </div>

        {/* Findspots */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Findspots</h3>
          <div className="h-64">
            {catalogStats.findspots.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catalogStats.findspots} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Findspot data not available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Most Photographed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            Most Documented Artifacts
          </h3>
          <div className="space-y-3">
            {catalogStats.highlights.most_photographed.map((item, index) => (
              <Link
                key={item.id}
                to={`/artifact/${item.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.sequence_number}</p>
                    <p className="text-sm text-gray-500">{item.object_type}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary-600">{item.image_count} photos</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Missing Photos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Artifacts Without Photos
          </h3>
          {catalogStats.missing_photos.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {catalogStats.missing_photos.map((item) => (
                <Link
                  key={item.id}
                  to={`/artifact/${item.id}/edit`}
                  className="flex items-center justify-between p-2 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-sm"
                >
                  <span className="font-medium text-gray-900">{item.sequence_number}</span>
                  <span className="text-gray-500">{item.object_type || 'Type not specified'}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-green-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              All artifacts have photos
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
