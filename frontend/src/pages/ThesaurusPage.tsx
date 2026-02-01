import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { thesaurusApi, ThesaurusTerm } from '../api/thesaurus';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  material: 'Materials',
  object_type: 'Object Types',
  technique: 'Techniques',
  chronology: 'Chronology',
  collection: 'Collections',
};

export function ThesaurusPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('material');
  const [editingTerm, setEditingTerm] = useState<ThesaurusTerm | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: '', description: '', alt_terms: '' });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['material']));

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['thesaurus-categories'],
    queryFn: thesaurusApi.getCategories,
  });

  // Fetch all terms
  const { data: allTerms = [], isLoading } = useQuery({
    queryKey: ['thesaurus-terms'],
    queryFn: () => thesaurusApi.getTerms(undefined, false),
  });

  // Group terms by category
  const termsByCategory = allTerms.reduce((acc, term) => {
    if (!acc[term.category]) acc[term.category] = [];
    acc[term.category].push(term);
    return acc;
  }, {} as Record<string, ThesaurusTerm[]>);

  // Mutations
  const createMutation = useMutation({
    mutationFn: thesaurusApi.createTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thesaurus-terms'] });
      setIsAddingNew(false);
      setNewTerm({ term: '', description: '', alt_terms: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ThesaurusTerm> }) =>
      thesaurusApi.updateTerm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thesaurus-terms'] });
      setEditingTerm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: thesaurusApi.deleteTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thesaurus-terms'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: thesaurusApi.syncFromData,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['thesaurus-terms'] });
      alert(`Sync complete! Added: ${JSON.stringify(data.added)}`);
    },
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleAddTerm = () => {
    if (!newTerm.term.trim()) return;
    createMutation.mutate({
      category: selectedCategory,
      term: newTerm.term.trim(),
      description: newTerm.description.trim() || undefined,
      alt_terms: newTerm.alt_terms ? newTerm.alt_terms.split(',').map(t => t.trim()) : [],
      is_active: true,
    });
  };

  const handleUpdateTerm = (term: ThesaurusTerm) => {
    updateMutation.mutate({ id: term.id, data: term });
  };

  const handleDeleteTerm = (id: string) => {
    if (confirm('Are you sure you want to delete this term?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (term: ThesaurusTerm) => {
    updateMutation.mutate({
      id: term.id,
      data: { is_active: !term.is_active },
    });
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-bronze-800 to-bronze-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Thesaurus Management</h1>
              <p className="text-bronze-200 text-sm">Manage controlled vocabulary for artifact fields</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync from Data
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div
            key={key}
            onClick={() => {
              setSelectedCategory(key);
              setExpandedCategories(prev => new Set([...prev, key]));
            }}
            className={`bg-white rounded-lg p-4 border cursor-pointer transition-all ${
              selectedCategory === key
                ? 'border-primary-500 shadow-lg'
                : 'border-museum-100 hover:border-primary-300'
            }`}
          >
            <p className="text-sm text-bronze-500">{label}</p>
            <p className="text-2xl font-bold text-bronze-900">
              {termsByCategory[key]?.length || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
            const terms = termsByCategory[category] || [];
            const isExpanded = expandedCategories.has(category);

            return (
              <div
                key={category}
                className="bg-white rounded-xl shadow-museum border border-museum-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-museum-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-bronze-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-bronze-400" />
                    )}
                    <span className="font-semibold text-bronze-900">{label}</span>
                    <span className="px-2 py-0.5 bg-museum-100 text-bronze-600 rounded-full text-sm">
                      {terms.length} terms
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-museum-100">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-museum-50 sticky top-0">
                          <tr>
                            <th className="text-left px-4 py-2 text-sm font-medium text-bronze-600">Term</th>
                            <th className="text-left px-4 py-2 text-sm font-medium text-bronze-600">Description</th>
                            <th className="text-center px-4 py-2 text-sm font-medium text-bronze-600">Active</th>
                            <th className="text-right px-4 py-2 text-sm font-medium text-bronze-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {terms.map(term => (
                            <tr
                              key={term.id}
                              className={`border-t border-museum-100 ${!term.is_active ? 'opacity-50 bg-gray-50' : ''}`}
                            >
                              {editingTerm?.id === term.id ? (
                                <>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      value={editingTerm.term}
                                      onChange={(e) => setEditingTerm({ ...editingTerm, term: e.target.value })}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      value={editingTerm.description || ''}
                                      onChange={(e) => setEditingTerm({ ...editingTerm, description: e.target.value })}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                      placeholder="Description"
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={editingTerm.is_active}
                                      onChange={(e) => setEditingTerm({ ...editingTerm, is_active: e.target.checked })}
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <button
                                      onClick={() => handleUpdateTerm(editingTerm)}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setEditingTerm(null)}
                                      className="p-1 text-gray-600 hover:bg-gray-50 rounded ml-1"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-2 text-sm text-bronze-900">{term.term}</td>
                                  <td className="px-4 py-2 text-sm text-bronze-500">{term.description || '-'}</td>
                                  <td className="px-4 py-2 text-center">
                                    <button
                                      onClick={() => handleToggleActive(term)}
                                      className={`w-4 h-4 rounded ${term.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <button
                                      onClick={() => setEditingTerm(term)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTerm(term.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded ml-1"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Term Panel */}
        <div className="bg-white rounded-xl shadow-museum border border-museum-100 p-6 h-fit sticky top-20">
          <h3 className="font-semibold text-bronze-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Term
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bronze-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-museum-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-bronze-700 mb-1">Term *</label>
              <input
                type="text"
                value={newTerm.term}
                onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                placeholder="e.g., Terracotta"
                className="w-full px-3 py-2 border border-museum-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bronze-700 mb-1">Description</label>
              <input
                type="text"
                value={newTerm.description}
                onChange={(e) => setNewTerm({ ...newTerm, description: e.target.value })}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-museum-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bronze-700 mb-1">
                Alternative Terms
              </label>
              <input
                type="text"
                value={newTerm.alt_terms}
                onChange={(e) => setNewTerm({ ...newTerm, alt_terms: e.target.value })}
                placeholder="Comma-separated: terra cotta, terra-cotta"
                className="w-full px-3 py-2 border border-museum-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-bronze-500 mt-1">Separate multiple terms with commas</p>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleAddTerm}
              disabled={!newTerm.term.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Adding...' : 'Add Term'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
