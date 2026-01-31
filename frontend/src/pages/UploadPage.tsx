import { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { mediaApi } from '../api/media';
import { artifactsApi } from '../api/artifacts';
import { useArtifacts } from '../hooks/useArtifacts';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Upload, X, Check, Image as ImageIcon, Search, FolderPlus, Folder } from 'lucide-react';

interface UploadFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function UploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedArtifactId, setSelectedArtifactId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const { data: artifactsData, isLoading: loadingArtifacts } = useArtifacts({
    per_page: 100,
  });

  // Get all existing folders
  const { data: existingFolders } = useQuery({
    queryKey: ['all-folders'],
    queryFn: () => mediaApi.getFolders(),
  });

  const artifacts = artifactsData?.artifacts || [];
  const filteredArtifacts = artifacts.filter(a =>
    a.sequence_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.object_type?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const uploadMutation = useMutation({
    mutationFn: async ({ artifactId, file, folder }: { artifactId: string; file: File; folder?: string }) => {
      return mediaApi.upload(artifactId, file, folder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      queryClient.invalidateQueries({ queryKey: ['artifact', selectedArtifactId] });
      queryClient.invalidateQueries({ queryKey: ['all-folders'] });
    },
  });

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const imageFiles = fileArray.filter(f => f.type.startsWith('image/'));

    const uploadFiles: UploadFile[] = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setSelectedFolder(newFolderName.trim());
      setShowNewFolderInput(false);
      setNewFolderName('');
    }
  };

  const uploadAll = async () => {
    if (!selectedArtifactId || files.length === 0) return;

    const folderToUse = selectedFolder || undefined;

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;

      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[i] = { ...newFiles[i], status: 'uploading' };
        return newFiles;
      });

      try {
        await uploadMutation.mutateAsync({
          artifactId: selectedArtifactId,
          file: files[i].file,
          folder: folderToUse,
        });

        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'success' };
          return newFiles;
        });
      } catch (error: any) {
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = {
            ...newFiles[i],
            status: 'error',
            error: error.response?.data?.error || 'Upload failed',
          };
          return newFiles;
        });
      }
    }
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const successCount = files.filter(f => f.status === 'success').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Media</h1>
        <p className="text-gray-500">Upload images for artifacts</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Select Artifact */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-gray-900 mb-4">1. Select Artifact</h3>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artifacts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {loadingArtifacts ? (
            <LoadingSpinner />
          ) : (
            <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
              {filteredArtifacts.map((artifact) => (
                <button
                  key={artifact.id}
                  onClick={() => setSelectedArtifactId(artifact.id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                    selectedArtifactId === artifact.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{artifact.sequence_number}</p>
                    <p className="text-sm text-gray-500">{artifact.object_type || 'Unknown type'}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {artifact.media_count} images
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Upload Area */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-gray-900 mb-4">2. Select Folder (Optional)</h3>

          {/* Folder Selection */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setSelectedFolder('')}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                  selectedFolder === ''
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Folder className="w-4 h-4" />
                No folder
              </button>
              {existingFolders?.map((folder) => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    selectedFolder === folder
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  {folder}
                </button>
              ))}
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-1"
              >
                <FolderPlus className="w-4 h-4" />
                New folder
              </button>
            </div>

            {showNewFolderInput && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
                <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                  Create
                </Button>
                <Button variant="secondary" onClick={() => { setShowNewFolderInput(false); setNewFolderName(''); }}>
                  Cancel
                </Button>
              </div>
            )}

            {selectedFolder && (
              <p className="text-sm text-primary-600 mt-2">
                Images will be added to folder: <strong>{selectedFolder}</strong>
              </p>
            )}
          </div>

          <h3 className="font-medium text-gray-900 mb-4">3. Upload Images</h3>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop images here, or{' '}
              <label className="text-primary-600 hover:underline cursor-pointer">
                browse
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-sm text-gray-400">
              Supports JPG, PNG, GIF, WebP, TIFF
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{files.length} file(s) selected</span>
                {successCount > 0 && (
                  <span className="text-green-600">{successCount} uploaded</span>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                  >
                    <img
                      src={file.preview}
                      alt=""
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {file.status === 'pending' && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {file.status === 'uploading' && (
                      <LoadingSpinner size="sm" />
                    )}
                    {file.status === 'success' && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <span className="text-xs text-red-500">{file.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={uploadAll}
              disabled={!selectedArtifactId || pendingCount === 0}
              isLoading={uploadMutation.isPending}
              className="flex-1"
            >
              Upload {pendingCount > 0 ? `${pendingCount} file(s)` : ''}
            </Button>

            {selectedArtifactId && successCount > 0 && (
              <Button
                variant="secondary"
                onClick={() => navigate(`/artifact/${selectedArtifactId}`)}
              >
                View Artifact
              </Button>
            )}
          </div>

          {!selectedArtifactId && files.length > 0 && (
            <p className="mt-2 text-sm text-amber-600">
              Please select an artifact first
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
