import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function UserManagementHelp() {
  const createSteps = [
    {
      title: 'Click "Add User" button',
      description: 'Located in the top-right corner of the Users page.',
    },
    {
      title: 'Enter user details',
      description: 'Fill in email (required), first name, last name, and password.',
      tip: 'The email address will be the user\'s login credential.',
    },
    {
      title: 'Select a role',
      description: 'Choose Viewer (read-only), Editor (can modify), or Admin (full access).',
    },
    {
      title: 'Set account status',
      description: 'Toggle "Active" on to allow immediate login, or off to create a disabled account.',
    },
    {
      title: 'Save the user',
      description: 'Click "Create User" to save. The user can now log in with their credentials.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is User Management?</h3>
        <p className="text-bronze-600">
          The User Management page allows administrators to create, edit, and manage user accounts.
          Control who can access the system, assign appropriate roles, and maintain security by
          deactivating accounts when needed.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">User Roles Explained</h3>
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm font-medium">Viewer</span>
              <span className="text-green-800 font-medium">Read-Only Access</span>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Browse collection and search artifacts</li>
              <li>• View artifact details and annotations</li>
              <li>• View statistics and analytics</li>
              <li>• Cannot modify any data</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-sm font-medium">Editor</span>
              <span className="text-blue-800 font-medium">Content Management</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All Viewer permissions, plus:</li>
              <li>• Upload media files to artifacts</li>
              <li>• Edit artifact metadata</li>
              <li>• Create and edit annotations</li>
              <li>• Review and process submissions</li>
            </ul>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-sm font-medium">Admin</span>
              <span className="text-purple-800 font-medium">Full Access</span>
            </div>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• All Editor permissions, plus:</li>
              <li>• Create, edit, delete users</li>
              <li>• Export collection data</li>
              <li>• Delete artifacts</li>
              <li>• Access all system features</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-4">Creating a New User</h3>
        <HelpStepper steps={createSteps} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">Managing Existing Users</h3>
        <div className="bg-museum-50 rounded-lg p-4 space-y-3">
          <div>
            <strong className="text-bronze-800">Edit User:</strong>
            <span className="text-bronze-600 ml-2">Click the edit (pencil) icon on any user row to modify their details, role, or status.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Reset Password:</strong>
            <span className="text-bronze-600 ml-2">Click "Reset Password" to set a new temporary password for the user.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Deactivate User:</strong>
            <span className="text-bronze-600 ml-2">Toggle the "Active" switch off. User cannot log in but account is preserved.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Delete User:</strong>
            <span className="text-bronze-600 ml-2">Permanently remove the account. Requires confirmation. Cannot be undone.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Change Role:</strong>
            <span className="text-bronze-600 ml-2">Use the role dropdown to promote or demote a user's access level.</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">UI Elements Explained</h3>
        <div className="bg-museum-50 rounded-lg p-4 space-y-3">
          <div>
            <strong className="text-bronze-800">User List Table:</strong>
            <span className="text-bronze-600 ml-2">Shows all users with email, name, role, status, and last login.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Add User Button:</strong>
            <span className="text-bronze-600 ml-2">Opens form to create a new user account.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Search/Filter:</strong>
            <span className="text-bronze-600 ml-2">Find users by name or email. Filter by role or status.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Role Badge:</strong>
            <span className="text-bronze-600 ml-2">Colored label showing user's role (green=Viewer, blue=Editor, purple=Admin).</span>
          </div>
          <div>
            <strong className="text-bronze-800">Status Indicator:</strong>
            <span className="text-bronze-600 ml-2">Green dot = Active, Red dot = Inactive.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Last Login:</strong>
            <span className="text-bronze-600 ml-2">Shows when the user last accessed the system. "Never" if no login recorded.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Action Buttons:</strong>
            <span className="text-bronze-600 ml-2">Edit (pencil), Reset Password (key), Delete (trash) icons on each row.</span>
          </div>
        </div>
      </div>

      <HelpTip type="tip" title="Security Best Practices">
        <ul className="space-y-1">
          <li>Use strong, unique passwords for each user</li>
          <li>Assign the minimum role needed for each user's tasks</li>
          <li>Deactivate accounts immediately when employees leave</li>
          <li>Regularly review the user list for inactive accounts</li>
          <li>Limit the number of admin accounts to essential personnel only</li>
        </ul>
      </HelpTip>

      <HelpTip type="warning">
        Be careful when deleting users. This action cannot be undone. If you're unsure, deactivate
        the account instead - this prevents login but preserves the account for potential reactivation.
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>User can't log in:</strong> Check if the account is active (green dot). Verify the email is correct.</li>
          <li><strong>Password reset not working:</strong> The user may need to clear browser cache or try an incognito window.</li>
          <li><strong>Can't delete own account:</strong> You cannot delete the account you're currently logged in with.</li>
          <li><strong>Can't demote last admin:</strong> The system requires at least one active admin account.</li>
          <li><strong>Duplicate email error:</strong> That email is already registered. Each email can only have one account.</li>
          <li><strong>User sees wrong features:</strong> Their role may be incorrect. Check and update their role if needed.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
