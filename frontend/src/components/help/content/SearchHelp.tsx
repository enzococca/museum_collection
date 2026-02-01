import { HelpStepper } from '../HelpStepper';
import { HelpTip } from '../HelpTip';

export function SearchHelp() {
  const steps = [
    {
      title: 'Enter your search term',
      description: 'Type at least 2 characters in the search box. The search looks across multiple fields including sequence number, accession number, object type, material, descriptions, inscription, findspot, and remarks.',
      tip: 'Be specific - searching for "bronze statue" will find artifacts with both words.',
    },
    {
      title: 'Review autocomplete suggestions',
      description: 'As you type, suggestions appear below the search box. Click a suggestion to search for that term immediately.',
    },
    {
      title: 'Press Enter or click Search',
      description: 'Submit your search to see all matching results.',
    },
    {
      title: 'Apply additional filters',
      description: 'Use the filter dropdowns to narrow your search results by object type, material, display status, or chronology.',
    },
    {
      title: 'Sort your results',
      description: 'Click column headers or use the sort dropdown to order results by sequence number, object type, material, or date.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What is Search?</h3>
        <p className="text-bronze-600">
          The Search page provides powerful full-text search across the entire collection. Search by keywords,
          artifact numbers, descriptions, materials, or any other text field. Combine with filters and sorting
          to find exactly what you're looking for.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-bronze-900 mb-2">What Fields Are Searched?</h3>
        <p className="text-bronze-600 mb-2">Your search query looks across these 9 fields:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['Sequence Number', 'Accession Number', 'Object Type', 'Material', 'Description (Catalogue)', 'Description (Observation)', 'Inscription', 'Findspot', 'Remarks'].map(field => (
            <div key={field} className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-sm">
              {field}
            </div>
          ))}
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
            <strong className="text-bronze-800">Search Box:</strong>
            <span className="text-bronze-600 ml-2">Main input field. Type your query and press Enter or click the search button.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Autocomplete Dropdown:</strong>
            <span className="text-bronze-600 ml-2">Appears after typing 2+ characters. Shows matching suggestions from the database.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Filter Dropdowns:</strong>
            <span className="text-bronze-600 ml-2">Object Type, Material, On Display, Chronology. Use to refine search results.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Sort Dropdown:</strong>
            <span className="text-bronze-600 ml-2">Order results by different fields in ascending or descending order.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Results Count:</strong>
            <span className="text-bronze-600 ml-2">Shows "X results found" to indicate how many artifacts match your search.</span>
          </div>
          <div>
            <strong className="text-bronze-800">Clear Search Button:</strong>
            <span className="text-bronze-600 ml-2">Reset the search box and all filters to start fresh.</span>
          </div>
        </div>
      </div>

      <HelpTip type="tip" title="Search Tips">
        <ul className="space-y-1">
          <li>Use specific terms: "Shiva bronze" is better than just "statue"</li>
          <li>Search by number: Enter "CM-001" or just "001" to find specific artifacts</li>
          <li>Partial matches work: "terr" will find "terracotta"</li>
          <li>Search is case-insensitive: "BRONZE" finds the same results as "bronze"</li>
        </ul>
      </HelpTip>

      <HelpTip type="troubleshooting" title="Common Issues">
        <ul className="space-y-2">
          <li><strong>No results found:</strong> Try broader terms or check spelling. Remove filters to widen the search.</li>
          <li><strong>Too many results:</strong> Add more specific keywords or apply filters to narrow down.</li>
          <li><strong>Suggestions not appearing:</strong> Type at least 2 characters. Check your internet connection.</li>
          <li><strong>Expected artifact not found:</strong> The artifact may not have that text in the searchable fields. Try searching by its sequence number instead.</li>
        </ul>
      </HelpTip>
    </div>
  );
}
