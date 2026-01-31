import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useArtifact, useDeleteArtifact } from '../hooks/useArtifacts';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { AnnotationEditor } from '../components/annotations/AnnotationEditor';
import { useAuth } from '../context/AuthContext';
import { Media } from '../types';
import {
  ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight,
  Eye, EyeOff, MapPin, Calendar, Scale, Ruler, PenTool, MessageSquare,
  ExternalLink, Building2
} from 'lucide-react';

export function ArtifactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isEditor, isAdmin } = useAuth();
  const { data: artifact, isLoading } = useArtifact(id!);
  const deleteArtifact = useDeleteArtifact();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [annotatingMedia, setAnnotatingMedia] = useState<Media | null>(null);

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

  const media = artifact.media || [];
  const currentMedia = media[currentImageIndex];

  const handleDelete = async () => {
    try {
      await deleteArtifact.mutateAsync(artifact.id);
      navigate('/collection');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/collection"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{artifact.sequence_number}</h1>
            <p className="text-gray-500">{artifact.object_type || 'Unknown type'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditor() && (
            <Button variant="secondary" onClick={() => navigate(`/artifact/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
          {isAdmin() && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="aspect-square bg-gray-100 relative">
            {currentMedia ? (
              <>
                <img
                  src={`${import.meta.env.VITE_API_URL}/media/${currentMedia.id}/image`}
                  alt={artifact.object_type || 'Artifact'}
                  className="w-full h-full object-contain"
                />
                {media.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => Math.max(0, i - 1))}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full disabled:opacity-30"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => Math.min(media.length - 1, i + 1))}
                      disabled={currentImageIndex === media.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full disabled:opacity-30"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                      {currentImageIndex + 1} / {media.length}
                    </div>
                  </>
                )}

                {/* Annotate button */}
                <button
                  onClick={() => setAnnotatingMedia(currentMedia)}
                  className="absolute top-2 right-2 p-2 bg-white/90 text-gray-700 rounded-lg shadow hover:bg-white flex items-center gap-2"
                  title="Annotate image"
                >
                  <PenTool className="w-5 h-5" />
                  {currentMedia.annotation_count > 0 && (
                    <span className="text-sm font-medium">{currentMedia.annotation_count}</span>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No images available
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {media.length > 1 && (
            <div className="p-2 flex gap-2 overflow-x-auto">
              {media.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden relative ${
                    idx === currentImageIndex ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL}/media/${m.id}/thumbnail`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {m.annotation_count > 0 && (
                    <div className="absolute bottom-0.5 right-0.5 bg-primary-600 text-white text-xs px-1 rounded">
                      <MessageSquare className="w-3 h-3 inline" /> {m.annotation_count}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              artifact.on_display
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {artifact.on_display ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {artifact.on_display ? 'On Display' : 'In Storage'}
            </span>
            {artifact.material && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {artifact.material}
              </span>
            )}
          </div>

          {/* Identification */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Identification</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500">Sequence Number</dt>
                <dd className="font-medium">{artifact.sequence_number}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Accession Number</dt>
                <dd className="font-medium">{artifact.accession_number || '-'}</dd>
              </div>
              {artifact.other_accession_number && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Other Accession Number</dt>
                  <dd className="font-medium">{artifact.other_accession_number}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Physical Properties */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Physical Properties</h3>
            <dl className="space-y-2 text-sm">
              {artifact.size_dimensions && (
                <div className="flex items-start gap-2">
                  <Ruler className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-gray-500">Dimensions</dt>
                    <dd>{artifact.size_dimensions}</dd>
                  </div>
                </div>
              )}
              {artifact.weight && (
                <div className="flex items-start gap-2">
                  <Scale className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-gray-500">Weight</dt>
                    <dd>{artifact.weight}</dd>
                  </div>
                </div>
              )}
              {artifact.technique && (
                <div>
                  <dt className="text-gray-500">Technique</dt>
                  <dd>{artifact.technique}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Description */}
          {(artifact.description_catalogue || artifact.description_observation) && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              {artifact.description_catalogue && (
                <div className="mb-3">
                  <dt className="text-xs text-gray-500 uppercase mb-1">From Catalogue</dt>
                  <dd className="text-sm">{artifact.description_catalogue}</dd>
                </div>
              )}
              {artifact.description_observation && (
                <div>
                  <dt className="text-xs text-gray-500 uppercase mb-1">Direct Observation</dt>
                  <dd className="text-sm">{artifact.description_observation}</dd>
                </div>
              )}
            </div>
          )}

          {/* Historical Data */}
          {(artifact.findspot || artifact.production_place || artifact.chronology) && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Historical Data</h3>
              <dl className="space-y-2 text-sm">
                {artifact.findspot && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <dt className="text-gray-500">Findspot</dt>
                      <dd>{artifact.findspot}</dd>
                    </div>
                  </div>
                )}
                {artifact.production_place && (
                  <div>
                    <dt className="text-gray-500">Production Place</dt>
                    <dd>{artifact.production_place}</dd>
                  </div>
                )}
                {artifact.chronology && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <dt className="text-gray-500">Chronology</dt>
                      <dd>{artifact.chronology}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Remarks */}
          {artifact.remarks && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Remarks</h3>
              <p className="text-sm text-gray-600">{artifact.remarks}</p>
            </div>
          )}

          {/* External Links */}
          {(artifact.british_museum_url || artifact.external_links) && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                External References
              </h3>
              <div className="space-y-3">
                {artifact.british_museum_url && (
                  <a
                    href={artifact.british_museum_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-700">British Museum</p>
                      <p className="text-sm text-blue-600 truncate">{artifact.british_museum_url}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-500" />
                  </a>
                )}
                {artifact.external_links?.british_museum_image && (
                  <a
                    href={artifact.external_links.british_museum_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                      <img
                        src={artifact.external_links.british_museum_image}
                        alt="British Museum image"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">British Museum Image</p>
                      <p className="text-sm text-gray-500">View high-resolution image</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Collection Badge */}
          {artifact.collection && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Collection</h3>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                artifact.collection === 'british'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                <Building2 className="w-4 h-4" />
                {artifact.collection === 'british' ? 'British Museum' : 'Chennai Museum'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Artifact"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{artifact.sequence_number}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteArtifact.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Annotation Editor */}
      {annotatingMedia && (
        <AnnotationEditor
          media={annotatingMedia}
          isEditable={isEditor()}
          onClose={() => setAnnotatingMedia(null)}
        />
      )}
    </div>
  );
}
