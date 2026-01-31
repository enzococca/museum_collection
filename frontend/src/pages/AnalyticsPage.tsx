import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { analyticsApi, AnalyticsVariable, CrossTab, ChiSquareResult } from '../api/analytics';
import { artifactsApi } from '../api/artifacts';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Treemap
} from 'recharts';
import {
  Building2, FileSpreadsheet, FileText, Download, TrendingUp, GitCompare,
  BarChart3, PieChartIcon, Layers, Clock, MapPin, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

export function AnalyticsPage() {
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedVariables, setSelectedVariables] = useState<string[]>(['collection', 'material']);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'correlations' | 'comparison'>('overview');

  // Fetch collections
  const { data: collectionsData } = useQuery({
    queryKey: ['collections'],
    queryFn: artifactsApi.getCollections,
  });

  // Fetch available variables
  const { data: variablesData } = useQuery({
    queryKey: ['analytics-variables'],
    queryFn: analyticsApi.getVariables,
  });

  // Fetch comprehensive report
  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['analytics-report', selectedCollection],
    queryFn: () => analyticsApi.getReport(selectedCollection || undefined),
  });

  // Fetch collection comparison
  const { data: comparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ['collection-comparison'],
    queryFn: analyticsApi.compareCollections,
    enabled: !selectedCollection, // Only when viewing all collections
  });

  // Custom correlation analysis
  const correlationMutation = useMutation({
    mutationFn: (variables: string[]) => analyticsApi.analyzeCorrelation(variables, selectedCollection || undefined),
  });

  // Export handlers
  const handleExportExcel = async () => {
    try {
      const blob = await analyticsApi.exportExcel(selectedCollection || undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${selectedCollection || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportDocx = async () => {
    try {
      const blob = await analyticsApi.exportDocx(selectedCollection || undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${selectedCollection || 'all'}_${new Date().toISOString().split('T')[0]}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleAnalyzeCorrelation = () => {
    if (selectedVariables.length >= 2) {
      correlationMutation.mutate(selectedVariables);
    }
  };

  const toggleVariable = (varId: string) => {
    setSelectedVariables(prev =>
      prev.includes(varId)
        ? prev.filter(v => v !== varId)
        : [...prev, varId]
    );
  };

  if (reportLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-500">Statistical analysis and correlation insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="secondary" onClick={handleExportDocx}>
            <FileText className="w-4 h-4 mr-2" />
            Export Word
          </Button>
        </div>
      </div>

      {/* Collection Selector */}
      {collectionsData && collectionsData.collections.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <Building2 className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Analyze:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCollection('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCollection === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Collections
              </button>
              {collectionsData.collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollection(col.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCollection === col.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {col.name} ({col.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'correlations', label: 'Correlations', icon: GitCompare },
            { id: 'comparison', label: 'Collection Comparison', icon: Layers }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && report && (
        <div className="space-y-6">
          {/* Main Narrative */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Analysis Summary
            </h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{report.main_narrative}</ReactMarkdown>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Artifacts', value: report.summary.total, icon: Layers },
              { label: 'Collections', value: report.summary.collections, icon: Building2 },
              { label: 'Object Types', value: report.summary.object_types, icon: BarChart3 },
              { label: 'Materials', value: report.summary.materials, icon: PieChartIcon },
              { label: 'Periods', value: report.summary.chronologies, icon: Clock },
              { label: 'On Display', value: report.summary.on_display, icon: CheckCircle }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{item.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Distribution Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Materials Distribution */}
            {report.distributions.material && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.distributions.material.distribution.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        nameKey="value"
                        label={({ name, percent }: { name: string; percent: number }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {report.distributions.material.distribution.slice(0, 8).map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Concentration: <span className="font-medium">{report.distributions.material.concentration_level}</span>
                </p>
              </div>
            )}

            {/* Object Types Distribution */}
            {report.distributions.object_type && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Object Types Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.distributions.object_type.distribution.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="value" type="category" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => [value, 'Count']} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Correlations Tab */}
      {activeTab === 'correlations' && (
        <div className="space-y-6">
          {/* Variable Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Variables to Correlate</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {variablesData?.categorical.map((variable) => (
                <button
                  key={variable.id}
                  onClick={() => toggleVariable(variable.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedVariables.includes(variable.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={variable.description}
                >
                  {variable.name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleAnalyzeCorrelation}
                disabled={selectedVariables.length < 2 || correlationMutation.isPending}
                isLoading={correlationMutation.isPending}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Analyze Correlations
              </Button>
              {selectedVariables.length < 2 && (
                <span className="text-sm text-amber-600">Select at least 2 variables</span>
              )}
            </div>
          </div>

          {/* Suggested Correlations */}
          {!correlationMutation.data && variablesData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Analyses</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {variablesData.suggested_correlations.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedVariables([suggestion.var1, suggestion.var2]);
                      correlationMutation.mutate([suggestion.var1, suggestion.var2]);
                    }}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                        {suggestion.var1}
                      </span>
                      <span className="text-gray-400">×</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {suggestion.var2}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Correlation Results */}
          {correlationMutation.data && (
            <div className="space-y-6">
              {/* Narrative Summary */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Analysis Summary</h3>
                <p className="text-blue-800">{correlationMutation.data.narrative}</p>
              </div>

              {/* Individual Correlation Results */}
              {correlationMutation.data.analyses.map((analysis, idx) => (
                <CorrelationCard key={idx} analysis={analysis} />
              ))}
            </div>
          )}

          {/* Pre-computed Correlations from Report */}
          {!correlationMutation.data && report && Object.keys(report.correlations).length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pre-computed Correlations</h3>
              {Object.entries(report.correlations).map(([key, data]) => (
                <CorrelationCard
                  key={key}
                  analysis={{
                    pair: key.split('_vs_') as [string, string],
                    crosstab: data.crosstab,
                    chi_square: data.chi_square
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collection Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {comparisonLoading ? (
            <LoadingSpinner />
          ) : comparison ? (
            <>
              {/* Narrative */}
              <div className="bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl p-8 text-white">
                <h2 className="text-xl font-semibold mb-4">Cross-Collection Analysis</h2>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{comparison.narrative}</ReactMarkdown>
                </div>
              </div>

              {/* Collection Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(comparison.collections).map(([name, data]) => (
                  <div key={name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary-600" />
                      {name.replace('_', ' ').toUpperCase()}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Total Artifacts</span>
                        <span className="text-2xl font-bold text-gray-900">{data.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">On Display</span>
                        <span className="font-medium text-gray-900">{data.on_display_pct}%</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Top Materials</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(data.materials).slice(0, 5).map(([mat, count]) => (
                            <span key={mat} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {mat}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Top Object Types</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(data.object_types).slice(0, 5).map(([type, count]) => (
                            <span key={type} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              {type}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Commonalities & Differences */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Commonalities
                  </h3>
                  <ul className="space-y-2">
                    {comparison.commonalities.map((item, idx) => (
                      <li key={idx} className="text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                    {comparison.commonalities.length === 0 && (
                      <li className="text-gray-400">No significant commonalities found</li>
                    )}
                  </ul>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-amber-700 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Key Differences
                  </h3>
                  <ul className="space-y-2">
                    {comparison.differences.map((item, idx) => (
                      <li key={idx} className="text-gray-600 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Select "All Collections" to view cross-collection comparison</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Correlation Card Component
function CorrelationCard({ analysis }: { analysis: { pair: [string, string]; crosstab: CrossTab; chi_square: ChiSquareResult } }) {
  const [expanded, setExpanded] = useState(false);
  const { chi_square, crosstab } = analysis;

  const isSignificant = chi_square.significance === 'significant';
  const strengthColors = {
    negligible: 'bg-gray-100 text-gray-600',
    weak: 'bg-yellow-100 text-yellow-700',
    moderate: 'bg-orange-100 text-orange-700',
    strong: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {analysis.pair[0]}
            </span>
            <span className="text-gray-400">×</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {analysis.pair[1]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isSignificant ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className={`px-2 py-1 rounded text-xs font-medium ${strengthColors[chi_square.strength]}`}>
              {chi_square.strength}
            </span>
            {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{chi_square.interpretation}</p>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {/* Chi-square details */}
          <div className="grid grid-cols-4 gap-4 mb-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Chi-square</p>
              <p className="font-semibold">{chi_square.chi_square}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">P-value</p>
              <p className="font-semibold">{chi_square.p_value < 0.001 ? '< 0.001' : chi_square.p_value.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">DoF</p>
              <p className="font-semibold">{chi_square.degrees_of_freedom}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Significance</p>
              <p className={`font-semibold ${isSignificant ? 'text-green-600' : 'text-gray-500'}`}>
                {chi_square.significance}
              </p>
            </div>
          </div>

          {/* Cross-tabulation table */}
          {crosstab.rows && crosstab.columns && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-2 py-1 text-left">{crosstab.row_variable} / {crosstab.col_variable}</th>
                    {crosstab.columns.map((col, idx) => (
                      <th key={idx} className="px-2 py-1 text-center">{String(col).substring(0, 15)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {crosstab.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1 font-medium">{String(row).substring(0, 20)}</td>
                      {crosstab.counts[rowIdx]?.map((count, colIdx) => (
                        <td key={colIdx} className="px-2 py-1 text-center">{count}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
