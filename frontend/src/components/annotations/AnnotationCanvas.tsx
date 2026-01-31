import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Line, Transformer } from 'react-konva';
import Konva from 'konva';
import { Annotation, AnnotationType, StrokeStyle, RectangleGeometry, FreehandGeometry } from '../../types';

interface AnnotationCanvasProps {
  imageUrl: string;
  annotations: Annotation[];
  selectedTool: AnnotationType | null;
  strokeColor: string;
  strokeStyle: StrokeStyle;
  strokeWidth: number;
  onAnnotationCreate: (annotation: {
    annotation_type: AnnotationType;
    geometry: RectangleGeometry | FreehandGeometry;
    stroke_color: string;
    stroke_style: StrokeStyle;
    stroke_width: number;
  }) => void;
  onAnnotationSelect: (annotation: Annotation | null) => void;
  selectedAnnotation: Annotation | null;
  isEditable: boolean;
}

export function AnnotationCanvas({
  imageUrl,
  annotations,
  selectedTool,
  strokeColor,
  strokeStyle,
  strokeWidth,
  onAnnotationCreate,
  onAnnotationSelect,
  selectedAnnotation,
  isEditable,
}: AnnotationCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState<RectangleGeometry | null>(null);
  const [freehandPoints, setFreehandPoints] = useState<number[]>([]);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);

      // Calculate scale to fit container
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const maxHeight = window.innerHeight * 0.7;

        const scaleX = containerWidth / img.width;
        const scaleY = maxHeight / img.height;
        const newScale = Math.min(scaleX, scaleY, 1);

        setScale(newScale);
        setStageSize({
          width: img.width * newScale,
          height: img.height * newScale,
        });
      }
    };
  }, [imageUrl]);

  // Get pointer position relative to image (unscaled)
  const getPointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;

    const pos = stage.getPointerPosition();
    if (!pos) return null;

    return {
      x: pos.x / scale,
      y: pos.y / scale,
    };
  }, [scale]);

  const handleMouseDown = useCallback(() => {
    if (!isEditable || !selectedTool) return;

    const pos = getPointerPosition();
    if (!pos) return;

    setIsDrawing(true);
    onAnnotationSelect(null);

    if (selectedTool === 'rectangle') {
      setCurrentRect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      });
    } else if (selectedTool === 'freehand') {
      setFreehandPoints([pos.x, pos.y]);
    }
  }, [isEditable, selectedTool, getPointerPosition, onAnnotationSelect]);

  const handleMouseMove = useCallback(() => {
    if (!isDrawing || !selectedTool) return;

    const pos = getPointerPosition();
    if (!pos) return;

    if (selectedTool === 'rectangle' && currentRect) {
      setCurrentRect({
        ...currentRect,
        width: pos.x - currentRect.x,
        height: pos.y - currentRect.y,
      });
    } else if (selectedTool === 'freehand') {
      setFreehandPoints((prev) => [...prev, pos.x, pos.y]);
    }
  }, [isDrawing, selectedTool, currentRect, getPointerPosition]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !selectedTool) return;

    setIsDrawing(false);

    if (selectedTool === 'rectangle' && currentRect) {
      // Normalize rectangle (handle negative width/height)
      const normalizedRect: RectangleGeometry = {
        x: currentRect.width < 0 ? currentRect.x + currentRect.width : currentRect.x,
        y: currentRect.height < 0 ? currentRect.y + currentRect.height : currentRect.y,
        width: Math.abs(currentRect.width),
        height: Math.abs(currentRect.height),
      };

      // Only create if rectangle has meaningful size
      if (normalizedRect.width > 5 && normalizedRect.height > 5) {
        onAnnotationCreate({
          annotation_type: 'rectangle',
          geometry: normalizedRect,
          stroke_color: strokeColor,
          stroke_style: strokeStyle,
          stroke_width: strokeWidth,
        });
      }
    } else if (selectedTool === 'freehand' && freehandPoints.length > 4) {
      onAnnotationCreate({
        annotation_type: 'freehand',
        geometry: { points: freehandPoints },
        stroke_color: strokeColor,
        stroke_style: strokeStyle,
        stroke_width: strokeWidth,
      });
    }

    setCurrentRect(null);
    setFreehandPoints([]);
  }, [isDrawing, selectedTool, currentRect, freehandPoints, strokeColor, strokeStyle, strokeWidth, onAnnotationCreate]);

  const getDashArray = (style: StrokeStyle): number[] => {
    return style === 'dashed' ? [10, 5] : [];
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    if (selectedTool) return; // Don't select when drawing
    onAnnotationSelect(annotation);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty area
    if (e.target === e.target.getStage()) {
      onAnnotationSelect(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full overflow-auto bg-gray-100 rounded-lg">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleStageClick}
        style={{ cursor: selectedTool ? 'crosshair' : 'default' }}
      >
        <Layer>
          {/* Background image */}
          {image && (
            <KonvaImage
              image={image}
              width={image.width}
              height={image.height}
              scaleX={scale}
              scaleY={scale}
            />
          )}
        </Layer>

        <Layer scaleX={scale} scaleY={scale}>
          {/* Existing annotations */}
          {annotations.map((ann) =>
            ann.annotation_type === 'rectangle' ? (
              <Rect
                key={ann.id}
                x={(ann.geometry as RectangleGeometry).x}
                y={(ann.geometry as RectangleGeometry).y}
                width={(ann.geometry as RectangleGeometry).width}
                height={(ann.geometry as RectangleGeometry).height}
                stroke={ann.stroke_color}
                strokeWidth={ann.stroke_width / scale}
                dash={getDashArray(ann.stroke_style)}
                fill={ann.fill_color || 'transparent'}
                opacity={selectedAnnotation?.id === ann.id ? 1 : 0.8}
                onClick={() => handleAnnotationClick(ann)}
                onTap={() => handleAnnotationClick(ann)}
                shadowColor={selectedAnnotation?.id === ann.id ? '#000' : undefined}
                shadowBlur={selectedAnnotation?.id === ann.id ? 10 : 0}
                shadowOpacity={0.3}
              />
            ) : (
              <Line
                key={ann.id}
                points={(ann.geometry as FreehandGeometry).points}
                stroke={ann.stroke_color}
                strokeWidth={ann.stroke_width / scale}
                dash={getDashArray(ann.stroke_style)}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                opacity={selectedAnnotation?.id === ann.id ? 1 : 0.8}
                onClick={() => handleAnnotationClick(ann)}
                onTap={() => handleAnnotationClick(ann)}
                shadowColor={selectedAnnotation?.id === ann.id ? '#000' : undefined}
                shadowBlur={selectedAnnotation?.id === ann.id ? 10 : 0}
                shadowOpacity={0.3}
              />
            )
          )}

          {/* Current drawing shape */}
          {currentRect && (
            <Rect
              x={currentRect.x}
              y={currentRect.y}
              width={currentRect.width}
              height={currentRect.height}
              stroke={strokeColor}
              strokeWidth={strokeWidth / scale}
              dash={getDashArray(strokeStyle)}
              fill="rgba(59, 130, 246, 0.1)"
            />
          )}

          {freehandPoints.length > 0 && (
            <Line
              points={freehandPoints}
              stroke={strokeColor}
              strokeWidth={strokeWidth / scale}
              dash={getDashArray(strokeStyle)}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
