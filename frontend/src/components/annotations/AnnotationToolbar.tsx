import { Square, Pencil, MousePointer, Minus } from 'lucide-react';
import { AnnotationType, StrokeStyle } from '../../types';

interface AnnotationToolbarProps {
  selectedTool: AnnotationType | null;
  onToolSelect: (tool: AnnotationType | null) => void;
  strokeColor: string;
  onColorChange: (color: string) => void;
  strokeStyle: StrokeStyle;
  onStyleChange: (style: StrokeStyle) => void;
  strokeWidth: number;
  onWidthChange: (width: number) => void;
  disabled?: boolean;
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#000000', // black
  '#ffffff', // white
];

export function AnnotationToolbar({
  selectedTool,
  onToolSelect,
  strokeColor,
  onColorChange,
  strokeStyle,
  onStyleChange,
  strokeWidth,
  onWidthChange,
  disabled = false,
}: AnnotationToolbarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-3 flex flex-wrap items-center gap-4">
      {/* Tool selection */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-2">Tool:</span>
        <button
          onClick={() => onToolSelect(null)}
          disabled={disabled}
          className={`p-2 rounded transition-colors ${
            selectedTool === null
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Select (no drawing)"
        >
          <MousePointer className="w-5 h-5" />
        </button>
        <button
          onClick={() => onToolSelect('rectangle')}
          disabled={disabled}
          className={`p-2 rounded transition-colors ${
            selectedTool === 'rectangle'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Rectangle"
        >
          <Square className="w-5 h-5" />
        </button>
        <button
          onClick={() => onToolSelect('freehand')}
          disabled={disabled}
          className={`p-2 rounded transition-colors ${
            selectedTool === 'freehand'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Freehand"
        >
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-200" />

      {/* Color selection */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-2">Color:</span>
        <div className="flex gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              disabled={disabled}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                strokeColor === color ? 'scale-110 border-gray-800' : 'border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-8 bg-gray-200" />

      {/* Stroke style */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-2">Style:</span>
        <button
          onClick={() => onStyleChange('solid')}
          disabled={disabled}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            strokeStyle === 'solid'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-8 h-0.5 bg-current" />
        </button>
        <button
          onClick={() => onStyleChange('dashed')}
          disabled={disabled}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            strokeStyle === 'dashed'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex gap-1">
            <div className="w-2 h-0.5 bg-current" />
            <div className="w-2 h-0.5 bg-current" />
            <div className="w-2 h-0.5 bg-current" />
          </div>
        </button>
      </div>

      <div className="w-px h-8 bg-gray-200" />

      {/* Stroke width */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Width:</span>
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={(e) => onWidthChange(Number(e.target.value))}
          disabled={disabled}
          className="w-20"
        />
        <span className="text-xs text-gray-600 w-4">{strokeWidth}</span>
      </div>
    </div>
  );
}
