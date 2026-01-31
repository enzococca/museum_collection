import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { annotationsApi } from '../../api/annotations';
import { Media, Annotation, AnnotationType, StrokeStyle } from '../../types';
import { AnnotationCanvas } from './AnnotationCanvas';
import { AnnotationToolbar } from './AnnotationToolbar';
import { AnnotationList } from './AnnotationList';
import { AnnotationForm } from './AnnotationForm';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { AlertCircle, X } from 'lucide-react';

interface AnnotationEditorProps {
  media: Media;
  isEditable: boolean;
  onClose: () => void;
}

export function AnnotationEditor({ media, isEditable, onClose }: AnnotationEditorProps) {
  const queryClient = useQueryClient();

  // State
  const [selectedTool, setSelectedTool] = useState<AnnotationType | null>(null);
  const [strokeColor, setStrokeColor] = useState('#ef4444');
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>('solid');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get image URL - use direct image endpoint instead of Dropbox URL
  const imageUrl = `${import.meta.env.VITE_API_URL}/media/${media.id}/image`;
  const loadingUrl = false;

  // Get annotations
  const { data: annotationsData, isLoading: loadingAnnotations } = useQuery({
    queryKey: ['annotations', media.id],
    queryFn: () => annotationsApi.getForMedia(media.id),
  });

  const annotations = annotationsData?.annotations || [];

  // Create annotation mutation
  const createAnnotation = useMutation({
    mutationFn: (data: Parameters<typeof annotationsApi.create>[0]) =>
      annotationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', media.id] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create annotation');
    },
  });

  // Update annotation mutation
  const updateAnnotation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof annotationsApi.update>[1] }) =>
      annotationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', media.id] });
      setShowEditForm(false);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to update annotation');
    },
  });

  // Delete annotation mutation
  const deleteAnnotation = useMutation({
    mutationFn: (id: string) => annotationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', media.id] });
      setSelectedAnnotation(null);
      setShowDeleteConfirm(false);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to delete annotation');
    },
  });

  // Handle creating new annotation from canvas
  const handleAnnotationCreate = (annotationData: {
    annotation_type: AnnotationType;
    geometry: any;
    stroke_color: string;
    stroke_style: StrokeStyle;
    stroke_width: number;
  }) => {
    createAnnotation.mutate({
      media_id: media.id,
      ...annotationData,
    });
  };

  // Handle saving annotation metadata
  const handleSaveAnnotation = (data: {
    label?: string;
    description?: string;
    metadata?: Record<string, string>;
  }) => {
    if (selectedAnnotation) {
      updateAnnotation.mutate({
        id: selectedAnnotation.id,
        data,
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteAnnotation = () => {
    if (selectedAnnotation) {
      deleteAnnotation.mutate(selectedAnnotation.id);
    }
  };

  if (loadingUrl || loadingAnnotations) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Note: Image loading errors will be handled by the canvas component

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Annotate Image</h2>
          <p className="text-sm text-gray-500">{media.original_filename}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      {isEditable && (
        <div className="p-4 bg-gray-50 border-b">
          <AnnotationToolbar
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            strokeColor={strokeColor}
            onColorChange={setStrokeColor}
            strokeStyle={strokeStyle}
            onStyleChange={setStrokeStyle}
            strokeWidth={strokeWidth}
            onWidthChange={setStrokeWidth}
            disabled={createAnnotation.isPending}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
          <AnnotationCanvas
            imageUrl={imageUrl}
            annotations={annotations}
            selectedTool={selectedTool}
            strokeColor={strokeColor}
            strokeStyle={strokeStyle}
            strokeWidth={strokeWidth}
            onAnnotationCreate={handleAnnotationCreate}
            onAnnotationSelect={setSelectedAnnotation}
            selectedAnnotation={selectedAnnotation}
            isEditable={isEditable}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900">
              Annotations ({annotations.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <AnnotationList
              annotations={annotations}
              selectedAnnotation={selectedAnnotation}
              onSelect={setSelectedAnnotation}
              onEdit={(ann) => {
                setSelectedAnnotation(ann);
                setShowEditForm(true);
              }}
              onDelete={(ann) => {
                setSelectedAnnotation(ann);
                setShowDeleteConfirm(true);
              }}
              canEdit={isEditable}
            />
          </div>

          {/* Instructions */}
          {isEditable && (
            <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
              <p className="font-medium mb-1">How to annotate:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Select Rectangle or Freehand tool</li>
                <li>Choose color and style</li>
                <li>Click and drag on the image</li>
                <li>Click an annotation to edit details</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      <Modal
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        title="Edit Annotation"
        size="md"
      >
        <AnnotationForm
          annotation={selectedAnnotation}
          onSave={handleSaveAnnotation}
          onCancel={() => setShowEditForm(false)}
          isLoading={updateAnnotation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Annotation"
        size="sm"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this annotation? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAnnotation}
            isLoading={deleteAnnotation.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
