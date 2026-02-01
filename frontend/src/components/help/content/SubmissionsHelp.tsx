import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function SubmissionsHelp() {
  const steps = [
    {
      title: 'View pending submissions',
      description: 'The submissions list shows all researcher submissions. Pending ones are highlighted and appear at the top by default.',
      tip: 'The badge in the sidebar shows how many submissions need review.',
    },
    {
      title: 'Open submission details',
      description: 'Click on any submission to see full details: researcher information, artifact details, uploaded images, and notes.',
    },
    {
      title: 'Review the information',
      description: 'Carefully review the researcher\'s description, dimensions, images, and any notes they provided.',
    },
    {
      title: 'Check for existing artifacts',
      description: 'Before approving, search the collection to ensure this isn\'t a duplicate of an existing artifact.',
      tip: 'Use sequence numbers or descriptions to search for potential duplicates.',
    },
    {
      title: 'Approve or reject',
      description: 'Click "Approve" to accept the submission and create/link an artifact, or "Reject" to decline with feedback.',
    },
    {
      title: 'Add review notes',
      description: 'When approving or rejecting, add notes explaining your decision. These are visible in the submission history.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is the Submissions Page?</h3>
        <p className="text-bronze-600">
          The Submissions page is where editors review artifact suggestions submitted by external researchers.
          Researchers can submit photos and information about potential museum pieces through the public
          submission form, and editors review, approve, or reject these submissions.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Submission Workflow</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">Pending</span>
          <span className="text-bronze-400">→</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Approved</span>
          <span className="text-bronze-400">or</span>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Rejected</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Key Features</h3>
        <ul className="list-disc list-inside text-bronze-600 space-y-1">
          <li><strong>Submission List</strong> - View all submissions with status indicators</li>
          <li><strong>Status Filter</strong> - Filter by pending, approved, or rejected</li>
          <li><strong>Researcher Info</strong> - See who submitted and their institution</li>
          <li><strong>Image Gallery</strong> - View all images submitted by the researcher</li>
          <li><strong>Approve/Reject Actions</strong> - Quick action buttons with notes</li>
          <li><strong>Review History</strong> - See who reviewed and when</li>
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
            <strong className="text-bronze-800">Status Badge:</strong>
            <span className="text-bronze-600 ml-2">Colored indicator (amber=pending, green=approved, red=rejected).</span>
          </div>
          <div>
            <strong className="text-bronze-800">Status Filter:</strong>
            <span className="text-bronze-600 ml-2">Dropdown to show All, Pending, Approved, or Rejected submissions.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Submission Card:</strong>
            <span className="text-bronze-600 ml-2">Shows researcher name, institution, object name, and status. Click to expand.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Approve Button:</strong>
            <span className="text-bronze-600 ml-2">Green button. Opens dialog to add notes and confirm approval.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Reject Button:</strong>
            <span className="text-bronze-600 ml-2">Red button. Opens dialog to add rejection reason (required).</span>
          </div>
          <div>
            <strong className="text-bronze-800">Link to Artifact:</strong>
            <span className="text-bronze-600 ml-2">After approval, option to link submission to an existing artifact or create new.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Contact Info:</strong>
            <span className="text-bronze-600 ml-2">Researcher's email and institution for follow-up questions.</span>
          </div>
        </div>
      </div>

      <HelpTip type="tip" title="Review Best Practices">
        <ul className="space-y-1">
          <li>Always check for duplicates before approving a new submission</li>
          <li>Provide clear, helpful feedback when rejecting submissions</li>
          <li>If unsure, consult with other editors or admins before deciding</li>
          <li>Respond to submissions promptly - researchers appreciate quick feedback</li>
        </ul>
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>Images not loading:</strong> Submission images are stored separately. Check internet connection and wait for loading.</li>
          <li><strong>Can't approve submission:</strong> Review notes may be required. Fill in the notes field before approving.</li>
          <li><strong>Can't reject without reason:</strong> Rejection requires a note explaining why, to help the researcher understand.</li>
          <li><strong>Submission disappeared:</strong> It may have been reviewed by another editor. Check the Approved or Rejected filter.</li>
          <li><strong>Accidentally approved/rejected:</strong> Contact an admin to potentially reverse the decision.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
