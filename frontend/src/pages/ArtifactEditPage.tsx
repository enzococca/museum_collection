import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useArtifact, useUpdateArtifact } from '../hooks/useArtifacts';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { ThesaurusSelect } from '../components/common/ThesaurusSelect';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Folder, FolderPlus, Check } from 'lucide-react';
import { mediaApi } from '../api/media';

export function ArtifactEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: artifact, isLoading } = useArtifact(id!);
  const updateArtifact = useUpdateArtifact();

  const [formData, setFormData] = useState({
    accession_number: '',
    other_accession_number: '',
    on_display: false,
    acquisition_details: '',
    object_type: '',
    material: '',
    remarks: '',
    size_dimensions: '',
    weight: '',
    technique: '',
    description_catalogue: '',
    description_observation: '',
    inscription: '',
    findspot: '',
    production_place: '',
    chronology: '',
    bibliography: '',
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<string>('');

  // Group media by folder
  const mediaByFolder = useMemo(() => {
    if (!artifact?.media) return {};
    const grouped: Record<string, any[]> = {};
    artifact.media.forEach((m: any) => {
      const folder = m.folder || 'Unfiled';
      if (!grouped[folder]) grouped[folder] = [];
      grouped[folder].push(m);
    });
    return grouped;
  }, [artifact?.media]);

  const folders = useMemo(() => Object.keys(mediaByFolder).sort(), [mediaByFolder]);

  useEffect(() => {
    if (artifact) {
      setFormData({
        accession_number: artifact.accession_number || '',
        other_accession_number: artifact.other_accession_number || '',
        on_display: artifact.on_display || false,
        acquisition_details: artifact.acquisition_details || '',
        object_type: artifact.object_type || '',
        material: artifact.material || '',
        remarks: artifact.remarks || '',
        size_dimensions: artifact.size_dimensions || '',
        weight: artifact.weight || '',
        technique: artifact.technique || '',
        description_catalogue: artifact.description_catalogue || '',
        description_observation: artifact.description_observation || '',
        inscription: artifact.inscription || '',
        findspot: artifact.findspot || '',
        production_place: artifact.production_place || '',
        chronology: artifact.chronology || '',
        bibliography: artifact.bibliography || '',
      });
    }
  }, [artifact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateArtifact.mutateAsync({ id: id!, data: formData });
      navigate(`/artifact/${id}`);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      for (const file of Array.from(files)) {
        await mediaApi.upload(id!, file, uploadFolder || undefined);
      }
      // Refresh artifact data to show new images
      window.location.reload();
    } catch (error: any) {
      setUploadError(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setUploadFolder(newFolderName.trim());
      setShowNewFolderInput(false);
      setNewFolderName('');
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  if (!artifact) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Artifact not found</p>
        <Link to="/collection" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/artifact/${id}`}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit {artifact.sequence_number}</h1>
            <p className="text-gray-500">{artifact.object_type || 'Unknown type'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Images ({artifact.media_count || 0})
          </h2>

          {/* Folder tabs */}
          {folders.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                  selectedFolder === null
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Folder className="w-4 h-4" />
                All ({artifact.media?.length || 0})
              </button>
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                    selectedFolder === folder
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  {folder} ({mediaByFolder[folder]?.length || 0})
                </button>
              ))}
            </div>
          )}

          {/* Current images */}
          {artifact.media && artifact.media.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {(selectedFolder ? mediaByFolder[selectedFolder] : artifact.media)?.map((m: any) => (
                <div key={m.id} className="relative group">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/media/${m.id}/thumbnail`}
                    alt={m.original_filename}
                    className="w-full aspect-square object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                    <span className="text-white text-xs text-center">{m.original_filename}</span>
                    {m.folder && <span className="text-white/70 text-xs mt-1">{m.folder}</span>}
                  </div>
                  {m.is_primary && (
                    <span className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {/* Folder selection for upload */}
            <div className="flex items-center gap-4 mb-4 justify-center">
              <span className="text-sm text-gray-600">Upload to folder:</span>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">No folder</option>
                {folders.filter(f => f !== 'Unfiled').map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>
              {!showNewFolderInput ? (
                <button
                  onClick={() => setShowNewFolderInput(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <FolderPlus className="w-4 h-4" />
                  New folder
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="px-2 py-1 border border-gray-300 rounded text-sm w-32"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setShowNewFolderInput(false); setNewFolderName(''); }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="text-center">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <Upload className="w-5 h-5" />
                {uploading ? 'Uploading...' : 'Upload images'}
              </label>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG, GIF, TIFF up to 50MB each</p>
              {uploadError && (
                <p className="text-sm text-red-600 mt-2">{uploadError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Identification */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Identification</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sequence Number
              </label>
              <input
                type="text"
                value={artifact.sequence_number}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accession Number
              </label>
              <input
                type="text"
                name="accession_number"
                value={formData.accession_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Accession Number
              </label>
              <input
                type="text"
                name="other_accession_number"
                value={formData.other_accession_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="on_display"
                  checked={formData.on_display}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">On Display</span>
              </label>
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Classification</h2>
          <div className="grid grid-cols-2 gap-4">
            <ThesaurusSelect
              category="object_type"
              name="object_type"
              value={formData.object_type}
              onChange={handleChange}
              label="Object Type"
              placeholder="Select object type..."
            />
            <ThesaurusSelect
              category="material"
              name="material"
              value={formData.material}
              onChange={handleChange}
              label="Material"
              placeholder="Select material..."
            />
            <ThesaurusSelect
              category="technique"
              name="technique"
              value={formData.technique}
              onChange={handleChange}
              label="Technique"
              placeholder="Select technique..."
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acquisition Details
              </label>
              <input
                type="text"
                name="acquisition_details"
                value={formData.acquisition_details}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Physical Properties */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Physical Properties</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size/Dimensions
              </label>
              <textarea
                name="size_dimensions"
                value={formData.size_dimensions}
                onChange={handleChange}
                rows={2}
                placeholder="H: x cm x W: x cm x D: x cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description from Catalogue
              </label>
              <textarea
                name="description_catalogue"
                value={formData.description_catalogue}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direct Observation
              </label>
              <textarea
                name="description_observation"
                value={formData.description_observation}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inscription
              </label>
              <textarea
                name="inscription"
                value={formData.inscription}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Historical Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Historical Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Findspot
              </label>
              <input
                type="text"
                name="findspot"
                value={formData.findspot}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Production Place
              </label>
              <input
                type="text"
                name="production_place"
                value={formData.production_place}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <ThesaurusSelect
              category="chronology"
              name="chronology"
              value={formData.chronology}
              onChange={handleChange}
              label="Chronology"
              placeholder="Select chronology..."
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bibliography
              </label>
              <textarea
                name="bibliography"
                value={formData.bibliography}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/artifact/${id}`)}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={updateArtifact.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
