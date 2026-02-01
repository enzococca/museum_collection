import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function ArtifactDetailHelp() {
  const steps = [
    {
      title: 'View the primary image',
      description: 'The main image is displayed prominently. Click on it to open a larger view in a lightbox.',
    },
    {
      title: 'Browse additional images',
      description: 'If the artifact has multiple images, thumbnails appear below the main image. Click any thumbnail to switch the main view.',
      tip: 'The primary image has a star badge in the corner.',
    },
    {
      title: 'Read the metadata',
      description: 'Scroll down to see all artifact information: object type, material, descriptions, chronology, findspot, and more.',
    },
    {
      title: 'View annotations',
      description: 'Click on an image to see annotations (marked areas with notes). Annotations appear as colored shapes with labels.',
    },
    {
      title: 'Check external links',
      description: 'If available, links to external resources like the British Museum database appear at the bottom.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is the Artifact Detail Page?</h3>
        <p className="text-bronze-600">
          The Artifact Detail page shows complete information about a single artifact, including all images,
          metadata fields, annotations, and external links. This is where you explore an artifact in depth.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Key Features</h3>
        <ul className="list-disc list-inside text-bronze-600 space-y-1">
          <li><strong>Image Gallery</strong> - View primary and additional images in high resolution</li>
          <li><strong>Image Lightbox</strong> - Click any image to open full-screen view</li>
          <li><strong>Annotations</strong> - See marked areas on images with descriptions</li>
          <li><strong>Complete Metadata</strong> - All artifact fields in organized sections</li>
          <li><strong>External Links</strong> - Links to British Museum or other databases</li>
          <li><strong>Edit Button</strong> - (Editors only) Quick access to edit mode</li>
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
            <strong className="text-bronze-800">Main Image Area:</strong>
            <span className="text-bronze-600 ml-2">Large display of the selected image. Click to open lightbox.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Image Thumbnails:</strong>
            <span className="text-bronze-600 ml-2">Row of smaller images below main view. Click to select, star indicates primary image.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Annotation Overlays:</strong>
            <span className="text-bronze-600 ml-2">Colored shapes (rectangles or freehand) on images. Hover or click to see annotation details.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Metadata Sections:</strong>
            <span className="text-bronze-600 ml-2">Organized groups of information: Identification, Description, Historical, etc.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Back Button:</strong>
            <span className="text-bronze-600 ml-2">Returns to the previous page (usually Collection or Search results).</span>
          </div>
          <div>
            <strong className="text-bronze-800">Edit Button:</strong>
            <span className="text-bronze-600 ml-2">(Editors/Admins only) Opens the artifact edit page to modify metadata.</span>
          </div>
          <div>
            <strong className="text-bronze-800">External Link Icons:</strong>
            <span className="text-bronze-600 ml-2">Links to external databases open in a new tab.</span>
          </div>
        </div>
      </div>

      <HelpTip type="tip">
        Use the browser's back button or the "Back to Collection" link to return to your previous view
        with your filters and pagination preserved.
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Images not loading:</strong> The image may still be processing or there's a connection issue with Dropbox. Try refreshing.</li>
          <li><strong>No images shown:</strong> This artifact may not have any uploaded images yet.</li>
          <li><strong>Annotations not visible:</strong> Zoom out or scroll to see all annotated areas. Some annotations may be on other images.</li>
          <li><strong>Edit button not visible:</strong> Only editors and admins can edit artifacts. Check your user role.</li>
          <li><strong>External link broken:</strong> The linked resource may have moved or been removed from the external database.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
