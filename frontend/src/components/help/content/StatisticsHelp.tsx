import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function StatisticsHelp() {
  const steps = [
    {
      title: 'View overview statistics',
      description: 'The top section shows key metrics: total artifacts, on display count, in storage count, and other summary numbers.',
    },
    {
      title: 'Explore the object types chart',
      description: 'The bar chart shows how many artifacts exist for each object type. Hover over bars for exact counts.',
      tip: 'Click on a bar to filter the collection by that object type.',
    },
    {
      title: 'Analyze material distribution',
      description: 'The pie chart displays the percentage breakdown of materials used across all artifacts.',
    },
    {
      title: 'Review chronology data',
      description: 'See how artifacts are distributed across different time periods and chronological categories.',
    },
    {
      title: 'Check display status breakdown',
      description: 'View how many artifacts are currently on display versus in storage.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is the Statistics Page?</h3>
        <p className="text-bronze-600">
          The Statistics page provides comprehensive data visualization about the museum collection.
          View charts, graphs, and breakdowns to understand the composition and distribution of artifacts
          across different categories.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Available Statistics</h3>
        <ul className="list-disc list-inside text-bronze-600 space-y-1">
          <li><strong>Summary Cards</strong> - Quick overview numbers (total, on display, in storage)</li>
          <li><strong>Object Types Distribution</strong> - Bar chart of artifact categories</li>
          <li><strong>Material Distribution</strong> - Pie chart of materials used</li>
          <li><strong>Chronology Distribution</strong> - Timeline or chart of historical periods</li>
          <li><strong>Display Status</strong> - On display vs. in storage breakdown</li>
          <li><strong>Media Statistics</strong> - Image counts and coverage</li>
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
            <strong className="text-bronze-800">Summary Cards:</strong>
            <span className="text-bronze-600 ml-2">Top row showing key numbers. Some are clickable to navigate to related pages.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Bar Charts:</strong>
            <span className="text-bronze-600 ml-2">Horizontal or vertical bars. Hover for tooltips with exact values.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Pie Charts:</strong>
            <span className="text-bronze-600 ml-2">Circular charts showing proportions. Hover segments to see percentages.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Legend:</strong>
            <span className="text-bronze-600 ml-2">Color key explaining what each chart segment represents.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Refresh Button:</strong>
            <span className="text-bronze-600 ml-2">Click to reload statistics with the latest data from the database.</span>
          </div>
        </div>
      </div>

      <HelpTip type="note">
        Statistics are calculated from the current database state. If you or another user recently added
        or modified artifacts, refresh the page to see updated numbers.
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Charts not displaying:</strong> JavaScript may be blocked or there's a loading error. Try refreshing the page.</li>
          <li><strong>Numbers seem wrong:</strong> Data may be cached. Click the refresh button or reload the page.</li>
          <li><strong>Chart shows empty:</strong> There may be no data for that category in the collection.</li>
          <li><strong>Page loads slowly:</strong> Large collections take time to calculate statistics. Please wait for loading to complete.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
