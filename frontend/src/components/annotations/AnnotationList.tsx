import { Annotation } from '../../types';
import { Square, Pencil, Trash2, Edit2 } from 'lucide-react';

interface AnnotationListProps {
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onSelect: (annotation: Annotation) => void;
  onEdit: (annotation: Annotation) => void;
  onDelete: (annotation: Annotation) => void;
  canEdit: boolean;
}

export function AnnotationList({
  annotations,
  selectedAnnotation,
  onSelect,
  onEdit,
  onDelete,
  canEdit,
}: AnnotationListProps) {
  if (annotations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No annotations yet</p>
        {canEdit && (
          <p className="text-sm mt-1">Select a tool and draw on the image</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {annotations.map((annotation, index) => (
        <div
          key={annotation.id}
          onClick={() => onSelect(annotation)}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedAnnotation?.id === annotation.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: annotation.stroke_color + '20' }}
              >
                {annotation.annotation_type === 'rectangle' ? (
                  <Square
                    className="w-4 h-4"
                    style={{ color: annotation.stroke_color }}
                  />
                ) : (
                  <Pencil
                    className="w-4 h-4"
                    style={{ color: annotation.stroke_color }}
                  />
                )}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {annotation.label || `Annotation ${index + 1}`}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {annotation.annotation_type}
                  {annotation.stroke_style === 'dashed' && ' (dashed)'}
                </p>
              </div>
            </div>

            {canEdit && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(annotation);
                  }}
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                  title="Edit annotation"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(annotation);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete annotation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {annotation.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {annotation.description}
            </p>
          )}

          {annotation.metadata && Object.keys(annotation.metadata).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(annotation.metadata).slice(0, 3).map(([key, value]) => (
                <span
                  key={key}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                >
                  {key}: {String(value)}
                </span>
              ))}
              {Object.keys(annotation.metadata).length > 3 && (
                <span className="text-xs text-gray-400">
                  +{Object.keys(annotation.metadata).length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
