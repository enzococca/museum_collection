import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function ArtifactEditHelp() {
  const steps = [
    {
      title: 'Navigate to the edit page',
      description: 'From an artifact detail page, click the "Edit" button in the top-right corner. Or navigate directly via the URL /artifact/:id/edit.',
    },
    {
      title: 'Review current values',
      description: 'All existing metadata is pre-filled in the form. Scroll through to see what information already exists.',
    },
    {
      title: 'Edit the fields you need to change',
      description: 'Click on any field to modify it. Fields are organized into sections: Identification, Classification, Description, Historical Context, etc.',
      tip: 'Required fields are marked with an asterisk (*). The form won\'t save if required fields are empty.',
    },
    {
      title: 'Update display status',
      description: 'Use the toggle to indicate whether the artifact is currently on display or in storage.',
    },
    {
      title: 'Add external links',
      description: 'Enter URLs to related resources like British Museum records or academic papers.',
    },
    {
      title: 'Save your changes',
      description: 'Click the "Save Changes" button at the bottom. A success message confirms the save.',
      tip: 'Changes are saved immediately. There\'s no draft/publish workflow.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is Artifact Editing?</h3>
        <p className="text-bronze-600">
          The Edit page allows editors and admins to modify artifact metadata. You can update descriptions,
          classifications, historical information, display status, and more. Changes are tracked with
          timestamps and user attribution.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Editable Fields</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-museum-50 rounded-lg p-3">
            <h4 className="font-medium text-bronze-800 mb-2">Identification</h4>
            <ul className="text-sm text-bronze-600 space-y-1">
              <li>• Sequence Number</li>
              <li>• Accession Number</li>
              <li>• Collection (Chennai/British)</li>
              <li>• Photo Number</li>
            </ul>
          </div>
          <div className="bg-museum-50 rounded-lg p-3">
            <h4 className="font-medium text-bronze-800 mb-2">Classification</h4>
            <ul className="text-sm text-bronze-600 space-y-1">
              <li>• Object Type</li>
              <li>• Material</li>
              <li>• Technique</li>
              <li>• On Display Status</li>
            </ul>
          </div>
          <div className="bg-museum-50 rounded-lg p-3">
            <h4 className="font-medium text-bronze-800 mb-2">Description</h4>
            <ul className="text-sm text-bronze-600 space-y-1">
              <li>• Catalogue Description</li>
              <li>• Observation Description</li>
              <li>• Inscription</li>
              <li>• Remarks</li>
            </ul>
          </div>
          <div className="bg-museum-50 rounded-lg p-3">
            <h4 className="font-medium text-bronze-800 mb-2">Historical Context</h4>
            <ul className="text-sm text-bronze-600 space-y-1">
              <li>• Findspot</li>
              <li>• Production Place</li>
              <li>• Chronology</li>
              <li>• Bibliography</li>
            </ul>
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
            <strong className="text-bronze-800">Form Sections:</strong>
            <span className="text-bronze-600 ml-2">Collapsible sections organizing related fields together.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Text Inputs:</strong>
            <span className="text-bronze-600 ml-2">Single-line fields for short text like numbers and names.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Text Areas:</strong>
            <span className="text-bronze-600 ml-2">Multi-line fields for longer descriptions. Drag corner to resize.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Dropdowns:</strong>
            <span className="text-bronze-600 ml-2">Select from predefined options (e.g., Collection, Object Type).</span>
          </div>
          <div>
            <strong className="text-bronze-800">Toggle Switch:</strong>
            <span className="text-bronze-600 ml-2">On/off control for "On Display" status.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Save Button:</strong>
            <span className="text-bronze-600 ml-2">Green button at bottom. Saves all changes immediately.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Cancel Button:</strong>
            <span className="text-bronze-600 ml-2">Returns to artifact detail page without saving changes.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Delete Button:</strong>
            <span className="text-bronze-600 ml-2">(Admins only) Red button to permanently delete the artifact.</span>
          </div>
        </div>
      </div>

      <HelpTip type="warning">
        Changes are saved immediately and cannot be automatically undone. Double-check your edits before
        saving. If you make a mistake, you'll need to edit again to correct it.
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Save button disabled:</strong> A required field may be empty or invalid. Check for error messages on fields.</li>
          <li><strong>Sequence number error:</strong> Sequence numbers must be unique. This number may already exist.</li>
          <li><strong>Changes not showing:</strong> The page may be cached. Refresh to see your saved changes.</li>
          <li><strong>Form lost on navigation:</strong> Changes are only saved when you click "Save". Navigating away loses unsaved edits.</li>
          <li><strong>Delete button missing:</strong> Only admins can delete artifacts. Editors can only edit metadata.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
