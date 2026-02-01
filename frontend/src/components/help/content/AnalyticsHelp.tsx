import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function AnalyticsHelp() {
  const steps = [
    {
      title: 'Select an analysis category',
      description: 'Use the tabs at the top to switch between different analytics views: Overview, Trends, Comparisons, etc.',
    },
    {
      title: 'Set your date range',
      description: 'Use the date pickers to filter data by a specific time period.',
      tip: 'Some charts show all-time data by default. Adjust dates to focus on specific periods.',
    },
    {
      title: 'Explore interactive charts',
      description: 'Hover over data points for detailed tooltips. Click and drag to zoom into specific areas.',
    },
    {
      title: 'Compare datasets',
      description: 'Use comparison tools to view side-by-side analysis of different collections, time periods, or categories.',
    },
    {
      title: 'Export or share insights',
      description: 'Use export buttons to download charts or data for reports and presentations.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is the Analytics Page?</h3>
        <p className="text-bronze-600">
          The Analytics page provides advanced data analysis tools for deeper insights into the collection.
          Unlike basic statistics, analytics offers trend analysis, comparisons, custom date ranges, and
          more sophisticated visualizations for research and reporting purposes.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Analytics Features</h3>
        <ul className="list-disc list-inside text-bronze-600 space-y-1">
          <li><strong>Trend Analysis</strong> - See how the collection has grown over time</li>
          <li><strong>Category Comparisons</strong> - Compare different object types, materials, or collections</li>
          <li><strong>Date Range Filtering</strong> - Focus analysis on specific time periods</li>
          <li><strong>Interactive Charts</strong> - Zoom, pan, and drill down into data</li>
          <li><strong>Annotation Coverage</strong> - See which artifacts have been annotated</li>
          <li><strong>Media Coverage</strong> - Track which artifacts have images uploaded</li>
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
            <strong className="text-bronze-800">Analysis Tabs:</strong>
            <span className="text-bronze-600 ml-2">Switch between different analytics views (Overview, Trends, Comparisons, etc.).</span>
          </div>
          <div>
            <strong className="text-bronze-800">Date Range Picker:</strong>
            <span className="text-bronze-600 ml-2">Click to open calendar. Select start and end dates to filter the analysis period.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Interactive Charts:</strong>
            <span className="text-bronze-600 ml-2">Hover for tooltips, click and drag to zoom, double-click to reset view.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Filter Controls:</strong>
            <span className="text-bronze-600 ml-2">Dropdowns and checkboxes to customize what data is displayed.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Export Button:</strong>
            <span className="text-bronze-600 ml-2">Download chart as image or export data as CSV/Excel.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Reset Button:</strong>
            <span className="text-bronze-600 ml-2">Clear all filters and return to default view.</span>
          </div>
        </div>
      </div>

      <HelpTip type="tip" title="Analytics Tips">
        <ul className="space-y-1">
          <li>Use the comparison feature to spot differences between Chennai and British Museum collections</li>
          <li>Export charts directly for use in research papers or presentations</li>
          <li>Combine date filtering with category filters for precise analysis</li>
        </ul>
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Charts loading slowly:</strong> Complex analytics require more processing time. Wait for the loading indicator to complete.</li>
          <li><strong>No data in date range:</strong> The selected period may not have any recorded activity. Try widening the date range.</li>
          <li><strong>Export not working:</strong> Check if pop-ups are blocked in your browser. Allow pop-ups for this site.</li>
          <li><strong>Comparison shows no difference:</strong> The selected categories may have similar data. Try comparing different criteria.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
