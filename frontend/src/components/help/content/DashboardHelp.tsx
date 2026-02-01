import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function DashboardHelp() {
  const steps = [
    {
      title: 'View collection statistics',
      description: 'The stat cards at the top show key metrics: total artifacts, items on display, items in storage, media files, annotations, and users.',
      tip: 'Hover over any stat card to see it highlight - click to navigate to related pages.',
    },
    {
      title: 'Explore object type distribution',
      description: 'The bar chart shows how artifacts are distributed across different object types (sculptures, coins, paintings, etc.).',
    },
    {
      title: 'View material breakdown',
      description: 'The pie chart displays the distribution of materials used in the collection (bronze, stone, terracotta, etc.).',
      tip: 'Click on chart segments to filter the collection by that category.',
    },
    {
      title: 'Use Quick Actions',
      description: 'The Quick Actions section provides shortcuts to common tasks like browsing the collection, searching, or viewing statistics.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is the Dashboard?</h3>
        <p className="text-bronze-600">
          The Dashboard is your home page, providing a quick overview of the entire museum collection.
          It displays key statistics, charts showing the distribution of artifacts, and quick action buttons
          for common tasks.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Key Features</h3>
        <ul className="list-disc list-inside text-bronze-600 space-y-1">
          <li><strong>Stat Cards</strong> - Display total counts for artifacts, media, annotations, and users</li>
          <li><strong>Object Types Chart</strong> - Bar chart showing artifact distribution by type</li>
          <li><strong>Materials Chart</strong> - Pie chart showing material distribution</li>
          <li><strong>Quick Actions</strong> - Shortcuts to frequently used pages</li>
          <li><strong>Pending Submissions</strong> - (Editors only) Badge showing submissions awaiting review</li>
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
            <strong className="text-bronze-800">Stat Cards:</strong>
            <span className="text-bronze-600 ml-2">Clickable cards at the top showing collection metrics. Each card links to its related page.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Chart Toggle:</strong>
            <span className="text-bronze-600 ml-2">Some charts have a toggle to switch between different visualization types.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Refresh Button:</strong>
            <span className="text-bronze-600 ml-2">Located in the top-right, click to refresh all dashboard data.</span>
          </div>
        </div>
      </div>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Charts not loading:</strong> Refresh the page or check your internet connection. The charts require data from the server.</li>
          <li><strong>Statistics showing zero:</strong> The database may be empty or still loading. Wait a moment and refresh.</li>
          <li><strong>Missing pending submissions badge:</strong> This only appears for editors and admins when there are pending submissions.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
