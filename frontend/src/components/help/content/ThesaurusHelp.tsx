import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function ThesaurusHelp() {
  const steps = [
    {
      title: 'View existing vocabulary',
      description: 'The thesaurus is organized by categories: Materials, Object Types, Techniques, Chronology, and Collections. Click on a category card to see its terms.',
    },
    {
      title: 'Expand a category',
      description: 'Click on the category header to expand/collapse and see all terms within that category.',
    },
    {
      title: 'Add a new term',
      description: 'Use the "Add New Term" panel on the right. Select a category, enter the term name, optional description, and alternative spellings.',
      tip: 'Alternative terms help when importing data with variant spellings.',
    },
    {
      title: 'Edit an existing term',
      description: 'Click the pencil icon next to any term to edit its name, description, or active status.',
    },
    {
      title: 'Toggle term visibility',
      description: 'Click the colored circle in the "Active" column to enable/disable a term in dropdowns.',
      tip: 'Inactive terms are hidden from dropdowns but preserved in the database.',
    },
    {
      title: 'Sync from data',
      description: 'Click "Sync from Data" to automatically extract unique values from existing artifacts and add them to the thesaurus.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is the Thesaurus?</h3>
        <p className="text-bronze-600">
          The Thesaurus is a controlled vocabulary system that standardizes terms used throughout the collection.
          It ensures consistency in data entry by providing predefined dropdown options for fields like
          Material, Object Type, Technique, and Chronology. Only administrators can manage the thesaurus.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Categories</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-museum-50 p-3 rounded-lg">
            <strong className="text-bronze-800">Materials</strong>
            <p className="text-sm text-bronze-600">Bronze, Terracotta, Stone, etc.</p>
          </div>
          <div className="bg-museum-50 p-3 rounded-lg">
            <strong className="text-bronze-800">Object Types</strong>
            <p className="text-sm text-bronze-600">Bowl, Figure, Bead, etc.</p>
          </div>
          <div className="bg-museum-50 p-3 rounded-lg">
            <strong className="text-bronze-800">Techniques</strong>
            <p className="text-sm text-bronze-600">Hammering, Casting, etc.</p>
          </div>
          <div className="bg-museum-50 p-3 rounded-lg">
            <strong className="text-bronze-800">Chronology</strong>
            <p className="text-sm text-bronze-600">Time periods and dates</p>
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
            <strong className="text-bronze-800">Category Cards:</strong>
            <span className="text-bronze-600 ml-2">Show term count per category. Click to select and expand.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Term Table:</strong>
            <span className="text-bronze-600 ml-2">Lists all terms with name, description, active status, and actions.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Active Toggle:</strong>
            <span className="text-bronze-600 ml-2">Green = active (shown in dropdowns), Gray = inactive (hidden).</span>
          </div>
          <div>
            <strong className="text-bronze-800">Edit Button (pencil):</strong>
            <span className="text-bronze-600 ml-2">Edit term inline. Click save (checkmark) to confirm.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Delete Button (trash):</strong>
            <span className="text-bronze-600 ml-2">Remove term permanently. Requires confirmation.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Sync from Data:</strong>
            <span className="text-bronze-600 ml-2">Scans artifacts table and adds any missing terms.</span>
          </div>
        </div>
      </div>

      <HelpTip type="tip" title="Best Practices">
        <ul className="space-y-1">
          <li>Use title case for consistency (e.g., "Terracotta" not "terracotta" or "TERRACOTTA")</li>
          <li>Add alternative spellings to help with data imports and searches</li>
          <li>Disable terms instead of deleting them to preserve historical data</li>
          <li>Run "Sync from Data" after bulk imports to capture new terms</li>
        </ul>
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Can't add duplicate term:</strong> Each term must be unique within its category.</li>
          <li><strong>Term not showing in dropdowns:</strong> Check if the term is marked as active.</li>
          <li><strong>Can't delete term:</strong> It may have child terms. Delete children first.</li>
          <li><strong>Sync not adding terms:</strong> Terms may already exist. Check the existing list.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
