import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function UploadHelp() {
  const steps = [
    {
      title: 'Select an artifact',
      description: 'Use the dropdown to search and select the artifact you want to upload images for. You can search by sequence number, accession number, or object type.',
      tip: 'Start typing to filter the artifact list quickly.',
    },
    {
      title: 'Choose your files',
      description: 'Click the "Select Files" button or drag and drop images onto the upload area. Supported formats: JPG, PNG, GIF, WEBP.',
    },
    {
      title: 'Preview your uploads',
      description: 'Selected files appear in a preview grid. You can remove unwanted files by clicking the X button on each preview.',
    },
    {
      title: 'Add optional captions',
      description: 'Click on each preview to add a caption or description for that specific image.',
    },
    {
      title: 'Upload the files',
      description: 'Click the "Upload" button to start uploading. A progress bar shows upload status.',
      tip: 'The first image uploaded automatically becomes the primary image for the artifact.',
    },
    {
      title: 'Set primary image (optional)',
      description: 'After upload, you can change which image is the primary one by clicking "Set as Primary" on any image.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is the Upload Page?</h3>
        <p className="text-bronze-600">
          The Upload page allows editors to add new images and media files to artifacts. Images are stored
          in Dropbox and automatically linked to the selected artifact. Thumbnails are generated automatically
          for quick previews throughout the system.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Key Features</h3>
        <ul className="list-disc list-inside text-bronze-600 space-y-1">
          <li><strong>Artifact Selection</strong> - Search and select which artifact to upload to</li>
          <li><strong>Drag & Drop</strong> - Easy file upload by dragging files onto the page</li>
          <li><strong>Bulk Upload</strong> - Upload multiple images at once</li>
          <li><strong>Image Preview</strong> - See thumbnails before uploading</li>
          <li><strong>Caption Support</strong> - Add descriptions to each image</li>
          <li><strong>Auto Thumbnail</strong> - Thumbnails generated automatically</li>
          <li><strong>Primary Image</strong> - First upload becomes primary; can be changed later</li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">File Requirements</h3>
        <div className="bg-museum-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-bronze-800">Supported Formats:</strong>
              <p className="text-bronze-600">JPG, JPEG, PNG, GIF, WEBP</p>
            </div>
            <div>
              <strong className="text-bronze-800">Maximum File Size:</strong>
              <p className="text-bronze-600">50 MB per file</p>
            </div>
            <div>
              <strong className="text-bronze-800">Recommended Resolution:</strong>
              <p className="text-bronze-600">At least 1920x1080 for detail shots</p>
            </div>
            <div>
              <strong className="text-bronze-800">Naming:</strong>
              <p className="text-bronze-600">Original names preserved; system adds UUID</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-4">How to Use</h3>
        <HelpStepper steps={steps} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">UI Elements Explained</h3>
        <div className="bg-museum-50 rounded-lg p-4 space-y-3">
          <div>
            <strong className="text-bronze-800">Artifact Selector:</strong>
            <span className="text-bronze-600 ml-2">Searchable dropdown to select the target artifact. Required before uploading.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Drop Zone:</strong>
            <span className="text-bronze-600 ml-2">Large dashed area. Drag files here or click to open file browser.</span>
          </div>
          <div>
            <strong className="text-bronze-800">File Previews:</strong>
            <span className="text-bronze-600 ml-2">Grid of selected files with thumbnails. X button removes, click to add caption.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Progress Bar:</strong>
            <span className="text-bronze-600 ml-2">Shows upload progress. Blue = uploading, green = complete, red = error.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Upload Button:</strong>
            <span className="text-bronze-600 ml-2">Starts the upload process. Disabled until artifact is selected and files are chosen.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Clear All Button:</strong>
            <span className="text-bronze-600 ml-2">Remove all selected files and start over.</span>
          </div>
        </div>
      </div>

      <HelpTip type="warning">
        Large files (over 10MB) may take longer to upload. Don't close the browser tab during upload
        or the process will be interrupted.
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Upload button disabled:</strong> Make sure you've selected an artifact AND added at least one file.</li>
          <li><strong>File rejected:</strong> Check that the file format is supported and under 50MB.</li>
          <li><strong>Upload fails:</strong> Check your internet connection. Try uploading fewer files at once.</li>
          <li><strong>Upload stuck:</strong> Large files may take time. Check the progress bar. If stuck for over 5 minutes, refresh and try again.</li>
          <li><strong>"Artifact not found" error:</strong> The artifact may have been deleted. Select a different artifact.</li>
          <li><strong>Thumbnail not showing:</strong> Thumbnails are generated asynchronously. Refresh the page after a few moments.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
