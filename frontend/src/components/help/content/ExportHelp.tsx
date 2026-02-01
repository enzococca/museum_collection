import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function ExportHelp() {
  const steps = [
    {
      title: 'Choose export format',
      description: 'Select between PDF (formatted document) or ZIP (archive with images and data files).',
      tip: 'PDF is best for printing and sharing. ZIP is best for backup or importing into other systems.',
    },
    {
      title: 'Select artifacts to export',
      description: 'Choose "All Artifacts" for a complete export, or select specific artifacts using filters or checkboxes.',
    },
    {
      title: 'Configure export options',
      description: 'Choose what to include: metadata only, metadata + images, or metadata + images + annotations.',
    },
    {
      title: 'Set image quality (ZIP only)',
      description: 'For ZIP exports, choose image quality: Original (full size), High (optimized), or Thumbnail only.',
    },
    {
      title: 'Start the export',
      description: 'Click "Export" to begin. Progress bar shows the export status.',
      tip: 'Large exports may take several minutes. Keep the tab open.',
    },
    {
      title: 'Download the file',
      description: 'When complete, a download link appears. Click to save the file to your computer.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is the Export Page?</h3>
        <p className="text-bronze-600">
          The Export page allows administrators to export collection data for backup, sharing, or offline use.
          Export as formatted PDF documents for reports and publications, or as ZIP archives containing
          data files and images for comprehensive backups.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Export Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">PDF Export</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Formatted document with cover page</li>
              <li>• Artifact cards with images</li>
              <li>• All metadata in readable format</li>
              <li>• Ready for printing or sharing</li>
              <li>• Includes table of contents</li>
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">ZIP Export</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Data files (JSON/CSV)</li>
              <li>• All images in folders</li>
              <li>• Annotation data included</li>
              <li>• Complete backup solution</li>
              <li>• Importable to other systems</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-4">How to Use</h3>
        <HelpStepper steps={steps} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Export Options Explained</h3>
        <div className="bg-museum-50 rounded-lg p-4 space-y-3">
          <div>
            <strong className="text-bronze-800">Artifact Selection:</strong>
            <ul className="text-bronze-600 text-sm ml-4 mt-1 list-disc">
              <li>All Artifacts - Export everything in the database</li>
              <li>By Collection - Export only Chennai or British Museum items</li>
              <li>By Filter - Export items matching search criteria</li>
              <li>Selected - Export only checked items from a list</li>
            </ul>
          </div>
          <div>
            <strong className="text-bronze-800">Include Options:</strong>
            <ul className="text-bronze-600 text-sm ml-4 mt-1 list-disc">
              <li>Metadata Only - Just artifact information, no images</li>
              <li>With Primary Image - Include main image only</li>
              <li>With All Images - Include all associated images</li>
              <li>With Annotations - Include annotation data and drawings</li>
            </ul>
          </div>
          <div>
            <strong className="text-bronze-800">Image Quality (ZIP):</strong>
            <ul className="text-bronze-600 text-sm ml-4 mt-1 list-disc">
              <li>Original - Full resolution (largest file size)</li>
              <li>High - Optimized quality (good balance)</li>
              <li>Thumbnails - Small preview images only</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">UI Elements Explained</h3>
        <div className="bg-museum-50 rounded-lg p-4 space-y-3">
          <div>
            <strong className="text-bronze-800">Format Selector:</strong>
            <span className="text-bronze-600 ml-2">Toggle between PDF and ZIP format options.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Artifact Filter Panel:</strong>
            <span className="text-bronze-600 ml-2">Same filters as Collection page to select what to export.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Options Checkboxes:</strong>
            <span className="text-bronze-600 ml-2">Select what content to include in the export.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Export Button:</strong>
            <span className="text-bronze-600 ml-2">Starts the export process. Disabled during active export.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Progress Bar:</strong>
            <span className="text-bronze-600 ml-2">Shows export progress (processing artifacts, generating files).</span>
          </div>
          <div>
            <strong className="text-bronze-800">Download Link:</strong>
            <span className="text-bronze-600 ml-2">Appears when export completes. Click to download the file.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Estimated Size:</strong>
            <span className="text-bronze-600 ml-2">Approximate file size based on selected options.</span>
          </div>
        </div>
      </div>

      <HelpTip type="warning">
        Large exports (many artifacts with high-resolution images) may take considerable time and produce
        large files. For very large exports, consider exporting in smaller batches by collection or filter.
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Export takes too long:</strong> Large datasets require time. Reduce the number of artifacts or image quality.</li>
          <li><strong>Export fails midway:</strong> May be a server timeout. Try exporting fewer items at once.</li>
          <li><strong>Download doesn't start:</strong> Check browser pop-up settings. The download may be blocked.</li>
          <li><strong>PDF is too large:</strong> Reduce the number of artifacts or choose "With Primary Image" instead of all images.</li>
          <li><strong>ZIP file corrupted:</strong> Download may have been interrupted. Try exporting and downloading again.</li>
          <li><strong>Missing images in export:</strong> Some images may not be accessible from Dropbox. Check Dropbox connection.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
