import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { searchApi } from '../api/search';
import { exportApi, downloadBlob } from '../api/export';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Artifact } from '../types';
import {
  FileDown, FileText, FileArchive, FileSpreadsheet,
  Check, X, Filter, Search
} from 'lucide-react';

export function ExportPage() {
  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    object_type?: string;
    material?: string;
    on_display?: boolean;
  }>({});

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Export options
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  // Get filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['search-filters'],
    queryFn: () => searchApi.getFilters(),
  });

  // Search artifacts
  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ['export-search', searchQuery, filters],
    queryFn: () => searchApi.search({
      q: searchQuery || undefined,
      ...filters,
      per_page: 500, // Get more for export
    }),
    enabled: true,
  });

  const artifacts = searchResults?.artifacts || [];

  // Export mutations
  const exportPdf = useMutation({
    mutationFn: () => exportApi.exportPdf({
      artifact_ids: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
      query: searchQuery || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      include_images: includeImages,
    }),
    onSuccess: (blob) => {
      downloadBlob(blob, `museum_export_${new Date().toISOString().split('T')[0]}.pdf`);
    },
  });

  const exportZip = useMutation({
    mutationFn: () => exportApi.exportZip({
      artifact_ids: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
      query: searchQuery || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      include_metadata: includeMetadata,
    }),
    onSuccess: (blob) => {
      downloadBlob(blob, `museum_export_${new Date().toISOString().split('T')[0]}.zip`);
    },
  });

  const exportCsv = useMutation({
    mutationFn: () => exportApi.exportCsv({
      artifact_ids: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
      query: searchQuery || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    }),
    onSuccess: (blob) => {
      downloadBlob(blob, `museum_export_${new Date().toISOString().split('T')[0]}.csv`);
    },
  });

  // Handle selection
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === artifacts.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(artifacts.map(a => a.id)));
    }
    setSelectAll(!selectAll);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({});
    setSelectedIds(new Set());
    setSelectAll(false);
  };

  const isExporting = exportPdf.isPending || exportZip.isPending || exportCsv.isPending;
  const exportCount = selectedIds.size > 0 ? selectedIds.size : artifacts.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Collection</h1>
        <p className="text-gray-500">Export artifacts as PDF, ZIP, or CSV</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Filters and Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filter Artifacts
            </h3>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artifacts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Filter dropdowns */}
              <div className="grid sm:grid-cols-3 gap-3">
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
                  <option value="">Any Status</option>
                  <option value="true">On Display</option>
                  <option value="false">In Storage</option>
                </select>
              </div>

              {(searchQuery || Object.keys(filters).some(k => filters[k as keyof typeof filters] !== undefined)) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Artifact Selection List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">Select all</span>
                </label>
                <span className="text-sm text-gray-500">
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${artifacts.length} artifacts`}
                </span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {searching ? (
                <div className="p-8">
                  <LoadingSpinner />
                </div>
              ) : artifacts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No artifacts found
                </div>
              ) : (
                <table className="w-full">
                  <tbody className="divide-y divide-gray-100">
                    {artifacts.map((artifact) => (
                      <tr
                        key={artifact.id}
                        onClick={() => toggleSelect(artifact.id)}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedIds.has(artifact.id) ? 'bg-primary-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(artifact.id)}
                            onChange={() => toggleSelect(artifact.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{artifact.sequence_number}</p>
                          <p className="text-sm text-gray-500">{artifact.object_type || 'Unknown type'}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {artifact.material || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {artifact.media_count} images
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right: Export Options */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-900 mb-4">Export Options</h3>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Include images (PDF/ZIP)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Include metadata.json (ZIP)</span>
              </label>
            </div>

            <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded">
              <strong>{exportCount}</strong> artifact{exportCount !== 1 ? 's' : ''} will be exported
              {selectedIds.size === 0 && artifacts.length > 0 && (
                <span className="block text-xs mt-1">
                  (all matching current filters)
                </span>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => exportPdf.mutate()}
                disabled={isExporting || artifacts.length === 0}
                isLoading={exportPdf.isPending}
                className="w-full justify-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                Export as PDF
              </Button>

              <Button
                onClick={() => exportZip.mutate()}
                disabled={isExporting || artifacts.length === 0}
                isLoading={exportZip.isPending}
                variant="secondary"
                className="w-full justify-center"
              >
                <FileArchive className="w-5 h-5 mr-2" />
                Export as ZIP
              </Button>

              <Button
                onClick={() => exportCsv.mutate()}
                disabled={isExporting || artifacts.length === 0}
                isLoading={exportCsv.isPending}
                variant="secondary"
                className="w-full justify-center"
              >
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Export as CSV
              </Button>
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <h4 className="font-medium mb-2">Export Formats:</h4>
            <ul className="space-y-1 text-blue-700">
              <li><strong>PDF:</strong> Professional layout with images and metadata</li>
              <li><strong>ZIP:</strong> All images + metadata.json per artifact</li>
              <li><strong>CSV:</strong> Spreadsheet with all metadata fields</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
