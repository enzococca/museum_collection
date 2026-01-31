import { useState, useEffect } from 'react';
import { Annotation } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Plus, X } from 'lucide-react';

interface AnnotationFormProps {
  annotation: Annotation | null;
  onSave: (data: { label?: string; description?: string; metadata?: Record<string, string> }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AnnotationForm({
  annotation,
  onSave,
  onCancel,
  isLoading = false,
}: AnnotationFormProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (annotation) {
      setLabel(annotation.label || '');
      setDescription(annotation.description || '');
      setMetadata(
        annotation.metadata
          ? Object.entries(annotation.metadata).map(([key, value]) => ({
              key,
              value: String(value),
            }))
          : []
      );
    } else {
      setLabel('');
      setDescription('');
      setMetadata([]);
    }
  }, [annotation]);

  const handleAddMetadata = () => {
    if (newKey.trim() && newValue.trim()) {
      setMetadata([...metadata, { key: newKey.trim(), value: newValue.trim() }]);
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemoveMetadata = (index: number) => {
    setMetadata(metadata.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const metadataObj: Record<string, string> = {};
    metadata.forEach(({ key, value }) => {
      metadataObj[key] = value;
    });

    onSave({
      label: label.trim() || undefined,
      description: description.trim() || undefined,
      metadata: Object.keys(metadataObj).length > 0 ? metadataObj : undefined,
    });
  };

  if (!annotation) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Select an annotation to edit its details</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Inscription area, Detail view..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this annotation highlights..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Metadata
        </label>

        {/* Existing metadata */}
        {metadata.length > 0 && (
          <div className="space-y-2 mb-3">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[100px]">
                  {item.key}:
                </span>
                <span className="text-sm text-gray-800 flex-1">{item.value}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMetadata(index)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new metadata */}
        <div className="flex gap-2">
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key (e.g., Material)"
            className="flex-1"
          />
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMetadata())}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddMetadata}
            disabled={!newKey.trim() || !newValue.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Save Annotation
        </Button>
      </div>
    </form>
  );
}
