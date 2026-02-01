import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function AnnotationsHelp() {
  const steps = [
    {
      title: 'Open an artifact detail page',
      description: 'Navigate to any artifact that has images. Annotations are added directly on the images.',
    },
    {
      title: 'Click on an image',
      description: 'Select the image you want to annotate. It will open in annotation mode (or click "Add Annotation" button).',
    },
    {
      title: 'Select annotation type',
      description: 'Choose between "Rectangle" for selecting a box area, or "Freehand" for drawing custom shapes.',
      tip: 'Rectangles are best for defined areas like inscriptions. Freehand is better for irregular shapes.',
    },
    {
      title: 'Draw on the image',
      description: 'Rectangle: Click and drag to create a box. Freehand: Click and draw freely, release to complete.',
    },
    {
      title: 'Add annotation details',
      description: 'A form appears after drawing. Enter a label (required), description, and any additional metadata.',
    },
    {
      title: 'Customize styling (optional)',
      description: 'Change the stroke color, line width, and fill opacity to make annotations more visible or distinguishable.',
    },
    {
      title: 'Save the annotation',
      description: 'Click "Save Annotation" to store it. The annotation now appears on the image for all users.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What are Annotations?</h3>
        <p className="text-bronze-600">
          Annotations allow you to mark specific areas on artifact images and add descriptive information.
          This is useful for highlighting details like inscriptions, damage, unique features, or areas
          of scholarly interest. Annotations are visible to all users viewing the artifact.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Annotation Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Rectangle</h4>
            <p className="text-sm text-blue-700">
              Click and drag to create a rectangular selection. Best for defined areas like text inscriptions,
              signatures, or specific features that fit in a box.
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-2">Freehand</h4>
            <p className="text-sm text-purple-700">
              Draw freely to outline irregular shapes. Best for highlighting damage patterns, decorative
              elements, or features that don't fit in a rectangle.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Annotation Data Fields</h3>
        <ul className="list-disc list-inside text-bronze-600 space-y-1">
          <li><strong>Label</strong> (required) - Short title for the annotation (e.g., "Inscription", "Damage")</li>
          <li><strong>Description</strong> - Detailed explanation of what the annotation highlights</li>
          <li><strong>Stroke Color</strong> - Color of the annotation outline</li>
          <li><strong>Stroke Width</strong> - Thickness of the outline (1-10 pixels)</li>
          <li><strong>Fill Opacity</strong> - How transparent the fill color is (0-100%)</li>
          <li><strong>Extra Metadata</strong> - Additional structured data fields if needed</li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-4">How to Use</h3>
        <HelpStepper steps={steps} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">UI Elements Explained</h3>
        <div className="bg-museum-50 rounded-lg p-4 space-y-3">
          <div>
            <strong className="text-bronze-800">Annotation Mode Toggle:</strong>
            <span className="text-bronze-600 ml-2">Button to enter/exit drawing mode. Icon changes when active.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Type Selector:</strong>
            <span className="text-bronze-600 ml-2">Toggle between Rectangle and Freehand drawing modes.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Drawing Canvas:</strong>
            <span className="text-bronze-600 ml-2">The image becomes interactive. Your cursor changes to crosshair.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Color Picker:</strong>
            <span className="text-bronze-600 ml-2">Click to select stroke color. Common colors have quick-select buttons.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Opacity Slider:</strong>
            <span className="text-bronze-600 ml-2">Drag to adjust fill transparency. Preview updates in real-time.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Annotation List:</strong>
            <span className="text-bronze-600 ml-2">Shows all annotations on current image. Click to highlight, buttons to edit/delete.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Edit Button:</strong>
            <span className="text-bronze-600 ml-2">Modify an existing annotation's label, description, or styling.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Delete Button:</strong>
            <span className="text-bronze-600 ml-2">Remove an annotation permanently. Requires confirmation.</span>
          </div>
        </div>
      </div>

      <HelpTip type="tip" title="Annotation Best Practices">
        <ul className="space-y-1">
          <li>Use consistent colors: red for damage, blue for inscriptions, green for features</li>
          <li>Keep labels short but descriptive</li>
          <li>Add detailed explanations in the description field</li>
          <li>Lower fill opacity (20-30%) makes text beneath still readable</li>
          <li>Create separate annotations for distinct features rather than one large one</li>
        </ul>
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Can't draw on image:</strong> Make sure annotation mode is enabled (button should be highlighted/active).</li>
          <li><strong>Drawing not appearing:</strong> Check stroke color isn't white on white background. Try a darker color.</li>
          <li><strong>Annotation too small:</strong> Zoom in on the image before drawing for more precision.</li>
          <li><strong>Save button disabled:</strong> Label field is required. Make sure to enter a label before saving.</li>
          <li><strong>Freehand shape not closing:</strong> Make sure to release the mouse button to complete the drawing.</li>
          <li><strong>Annotation position wrong:</strong> If image was resized, annotation may shift. Delete and redraw at correct position.</li>
          <li><strong>Can't delete annotation:</strong> You can only delete annotations you created, unless you're an admin.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
