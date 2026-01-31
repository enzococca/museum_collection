import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearch, useSearchFilters } from '../hooks/useSearch';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Search, Filter, X, Image as ImageIcon } from 'lucide-react';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    object_type?: string;
    material?: string;
    on_display?: boolean;
  }>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching } = useSearch({
    q: searchQuery,
    page,
    per_page: 20,
    ...filters,
  });
  const { data: filterOptions } = useSearchFilters();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
    setPage(1);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchQuery('');
    setFilters({});
    setPage(1);
  };

  const hasActiveSearch = searchQuery || filters.object_type || filters.material || filters.on_display !== undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Search Collection</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, type, material, description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={!query && !hasActiveSearch}>
          Search
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filters</h3>
            {hasActiveSearch && (
              <button
                onClick={clearSearch}
                className="text-sm text-primary-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Object Type</label>
              <select
                value={filters.object_type || ''}
                onChange={(e) => setFilters({ ...filters, object_type: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                {filterOptions?.object_types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Material</label>
              <select
                value={filters.material || ''}
                onChange={(e) => setFilters({ ...filters, material: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Materials</option>
                {filterOptions?.materials.map((mat) => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Display Status</label>
              <select
                value={filters.on_display === undefined ? '' : String(filters.on_display)}
                onChange={(e) => setFilters({
                  ...filters,
                  on_display: e.target.value === '' ? undefined : e.target.value === 'true'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any Status</option>
                <option value="true">On Display</option>
                <option value="false">In Storage</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner size="lg" className="h-64" />
      ) : hasActiveSearch ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {data?.total || 0} results {searchQuery && `for "${searchQuery}"`}
            </p>
            {isFetching && <LoadingSpinner size="sm" />}
          </div>

          {data?.artifacts && data.artifacts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {data.artifacts.map((artifact) => (
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
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-gray-900 truncate">{artifact.sequence_number}</p>
                    <p className="text-sm text-gray-500 truncate">{artifact.object_type || 'Unknown'}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No artifacts found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {data.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page === data.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Enter a search term or apply filters to find artifacts</p>
        </div>
      )}
    </div>
  );
}
