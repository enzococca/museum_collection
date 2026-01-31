import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useArtifacts, useArtifactFilters } from '../hooks/useArtifacts';
import { artifactsApi } from '../api/artifacts';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Grid, List, ChevronLeft, ChevronRight, Image as ImageIcon, Building2 } from 'lucide-react';

type ViewMode = 'grid' | 'list';

export function CollectionPage() {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<{
    collection?: string;
    object_type?: string;
    material?: string;
    on_display?: boolean;
  }>({});

  const { data: collectionsData } = useQuery({
    queryKey: ['collections'],
    queryFn: artifactsApi.getCollections,
  });

  const { data, isLoading } = useArtifacts({ page, per_page: 20, ...filters });
  const { data: filterOptions } = useArtifactFilters();

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Collection</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Collection Tabs */}
      {collectionsData && collectionsData.collections.length > 0 && (
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => { setFilters({ ...filters, collection: undefined }); setPage(1); }}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm flex items-center gap-2 transition-colors ${
              !filters.collection
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            All Collections
          </button>
          {collectionsData.collections.map((col) => (
            <button
              key={col.id}
              onClick={() => { setFilters({ ...filters, collection: col.id }); setPage(1); }}
              className={`px-4 py-2 rounded-t-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                filters.collection === col.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              {col.name} ({col.count})
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.object_type || ''}
            onChange={(e) => setFilters({ ...filters, object_type: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Object Types</option>
            {filterOptions?.object_types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.material || ''}
            onChange={(e) => setFilters({ ...filters, material: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Materials</option>
            {filterOptions?.materials.map((mat) => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>

          <select
            value={filters.on_display === undefined ? '' : String(filters.on_display)}
            onChange={(e) => setFilters({
              ...filters,
              on_display: e.target.value === '' ? undefined : e.target.value === 'true'
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Display Status</option>
            <option value="true">On Display</option>
            <option value="false">In Storage</option>
          </select>

          {(filters.object_type || filters.material || filters.on_display !== undefined) && (
            <Button variant="ghost" onClick={() => setFilters({})}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-500">
        Showing {data?.artifacts.length || 0} of {data?.total || 0} artifacts
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {data?.artifacts.map((artifact) => (
            <Link
              key={artifact.id}
              to={`/artifact/${artifact.id}`}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {artifact.primary_media ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/media/${artifact.primary_media.id}/thumbnail`}
                    alt={artifact.object_type || 'Artifact'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-900 truncate">{artifact.sequence_number}</p>
                <p className="text-sm text-gray-500 truncate">{artifact.object_type || 'Unknown type'}</p>
                <div className="flex items-center gap-1 mt-1">
                  {artifact.on_display && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      On Display
                    </span>
                  )}
                  {artifact.media_count > 0 && (
                    <span className="text-xs text-gray-400">
                      {artifact.media_count} image{artifact.media_count > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.artifacts.map((artifact) => (
                <tr key={artifact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/artifact/${artifact.id}`} className="text-primary-600 hover:underline font-medium">
                      {artifact.sequence_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{artifact.object_type || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{artifact.material || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      artifact.on_display ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {artifact.on_display ? 'On Display' : 'Storage'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{artifact.media_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
