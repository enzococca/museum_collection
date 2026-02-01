import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function CollectionHelp() {
  const steps = [
    {
      title: 'Select a collection',
      description: 'Use the collection tabs at the top to filter by "All Collections", "Chennai Museum", or "British Museum".',
    },
    {
      title: 'Choose your view mode',
      description: 'Click the grid icon for visual card view or the list icon for a detailed table view. The toggle is in the top-right corner.',
      tip: 'Grid view is better for browsing images, list view is better for comparing details.',
    },
    {
      title: 'Apply filters',
      description: 'Use the filter dropdowns to narrow results by Object Type, Material, or Display Status (On Display / In Storage).',
    },
    {
      title: 'Browse artifacts',
      description: 'Scroll through the results and click any artifact card to view its full details.',
    },
    {
      title: 'Navigate pages',
      description: 'Use the pagination controls at the bottom to move between pages of results.',
      tip: 'You can also change how many items appear per page.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is the Collection Page?</h3>
        <p className="text-bronze-600">
          The Collection page lets you browse all artifacts in the museum's digital archive. You can view items
          in a visual grid or detailed list, filter by various criteria, and click any artifact to see its
          complete information.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Key Features</h3>
        <ul className="list-disc list-inside text-bronze-600 space-y-1">
          <li><strong>Collection Tabs</strong> - Switch between different museum collections</li>
          <li><strong>Grid View</strong> - Visual cards showing artifact images and basic info</li>
          <li><strong>List View</strong> - Detailed table with more metadata columns</li>
          <li><strong>Filters</strong> - Narrow results by object type, material, or display status</li>
          <li><strong>Pagination</strong> - Navigate through large collections</li>
          <li><strong>Primary Image</strong> - Each artifact shows its designated primary image</li>
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
            <strong className="text-bronze-800">Collection Tabs:</strong>
            <span className="text-bronze-600 ml-2">"All Collections" shows everything, or select a specific museum to filter.</span>
          </div>
          <div>
            <strong className="text-bronze-800">View Toggle (Grid/List icons):</strong>
            <span className="text-bronze-600 ml-2">Located top-right. Grid shows image cards, List shows a detailed table.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Filter Dropdowns:</strong>
            <span className="text-bronze-600 ml-2">Object Type, Material, and Display Status. Select "All" to clear a filter.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Clear Filters Button:</strong>
            <span className="text-bronze-600 ml-2">Appears when filters are active. Click to reset all filters at once.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Artifact Card:</strong>
            <span className="text-bronze-600 ml-2">Shows primary image, sequence number, object type, and material. Click to open details.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Pagination:</strong>
            <span className="text-bronze-600 ml-2">Previous/Next buttons and page numbers at the bottom. Adjust items per page with the dropdown.</span>
          </div>
        </div>
      </div>

      <HelpTip type="tip">
        Use keyboard shortcuts: Press <kbd className="px-1.5 py-0.5 bg-white rounded border">Enter</kbd> after typing in filter dropdowns
        to quickly apply them.
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Images not loading:</strong> Thumbnails are stored in Dropbox. Check your internet connection. Some images may still be processing.</li>
          <li><strong>No results found:</strong> Your filters may be too restrictive. Try clearing filters or selecting "All" in dropdowns.</li>
          <li><strong>Slow loading:</strong> Large collections take time to load. Try applying filters to reduce the number of results.</li>
          <li><strong>Missing artifact:</strong> It may be in a different collection tab. Check "All Collections" to see everything.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
