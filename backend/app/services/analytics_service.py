"""
Advanced Analytics Service for Museum Collection
Provides correlation analysis, statistical insights, and dynamic narratives.
"""
import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Any, Optional, Tuple
from collections import Counter
from datetime import datetime


class AnalyticsService:
    """Service for advanced statistical analysis of museum collections."""

    def __init__(self, artifacts_data: List[Dict]):
        """Initialize with artifact data."""
        self.df = pd.DataFrame(artifacts_data)
        self._prepare_data()

    def _prepare_data(self):
        """Prepare and clean data for analysis."""
        # Fill NaN values for categorical columns
        categorical_cols = ['collection', 'object_type', 'material', 'chronology', 'findspot', 'production_place']
        for col in categorical_cols:
            if col in self.df.columns:
                self.df[col] = self.df[col].fillna('Unknown')

    def get_cross_tabulation(self, row_var: str, col_var: str) -> Dict:
        """
        Create cross-tabulation between two categorical variables.
        Returns counts and percentages.
        """
        if row_var not in self.df.columns or col_var not in self.df.columns:
            return {'error': f'Variable not found: {row_var} or {col_var}'}

        # Create cross-tabulation
        crosstab = pd.crosstab(self.df[row_var], self.df[col_var], margins=True, margins_name='Total')

        # Calculate percentages
        crosstab_pct = pd.crosstab(self.df[row_var], self.df[col_var], normalize='all', margins=True, margins_name='Total') * 100

        # Convert to serializable format
        result = {
            'rows': crosstab.index.tolist(),
            'columns': crosstab.columns.tolist(),
            'counts': crosstab.values.tolist(),
            'percentages': crosstab_pct.round(2).values.tolist(),
            'row_variable': row_var,
            'col_variable': col_var
        }

        return result

    def chi_square_test(self, var1: str, var2: str) -> Dict:
        """
        Perform Chi-square test of independence between two categorical variables.
        """
        if var1 not in self.df.columns or var2 not in self.df.columns:
            return {'error': f'Variable not found'}

        # Create contingency table
        contingency = pd.crosstab(self.df[var1], self.df[var2])

        # Perform chi-square test
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

        # Interpret results
        significance = 'significant' if p_value < 0.05 else 'not significant'
        strength = self._interpret_chi_square(chi2, len(self.df))

        return {
            'chi_square': round(chi2, 4),
            'p_value': round(p_value, 6),
            'degrees_of_freedom': dof,
            'significance': significance,
            'strength': strength,
            'interpretation': self._generate_chi_square_narrative(var1, var2, chi2, p_value, strength)
        }

    def _interpret_chi_square(self, chi2: float, n: int) -> str:
        """Interpret chi-square effect size using Cramer's V."""
        cramers_v = np.sqrt(chi2 / n) if n > 0 else 0
        if cramers_v < 0.1:
            return 'negligible'
        elif cramers_v < 0.3:
            return 'weak'
        elif cramers_v < 0.5:
            return 'moderate'
        else:
            return 'strong'

    def _generate_chi_square_narrative(self, var1: str, var2: str, chi2: float, p_value: float, strength: str) -> str:
        """Generate narrative interpretation of chi-square test."""
        if p_value < 0.05:
            return f"There is a statistically significant relationship between {var1} and {var2} (χ² = {chi2:.2f}, p < 0.05). The association strength is {strength}."
        else:
            return f"No statistically significant relationship was found between {var1} and {var2} (χ² = {chi2:.2f}, p = {p_value:.3f})."

    def get_distribution_analysis(self, variable: str) -> Dict:
        """Analyze the distribution of a categorical variable."""
        if variable not in self.df.columns:
            return {'error': f'Variable not found: {variable}'}

        counts = self.df[variable].value_counts()
        total = len(self.df)

        # Calculate statistics
        distribution = []
        for value, count in counts.items():
            distribution.append({
                'value': str(value),
                'count': int(count),
                'percentage': round(count / total * 100, 2)
            })

        # Calculate concentration (Herfindahl-Hirschman Index)
        shares = counts / total
        hhi = (shares ** 2).sum()
        concentration = 'high' if hhi > 0.25 else 'moderate' if hhi > 0.15 else 'low'

        return {
            'variable': variable,
            'total': total,
            'unique_values': len(counts),
            'distribution': distribution,
            'concentration_index': round(hhi, 4),
            'concentration_level': concentration,
            'mode': str(counts.index[0]) if len(counts) > 0 else None,
            'mode_count': int(counts.iloc[0]) if len(counts) > 0 else 0
        }

    def compare_collections(self) -> Dict:
        """Compare artifact characteristics between collections."""
        if 'collection' not in self.df.columns:
            return {'error': 'No collection data available'}

        collections = self.df['collection'].unique()
        comparison = {}

        for col in collections:
            subset = self.df[self.df['collection'] == col]
            comparison[col] = {
                'total': len(subset),
                'object_types': subset['object_type'].value_counts().head(5).to_dict() if 'object_type' in subset.columns else {},
                'materials': subset['material'].value_counts().head(5).to_dict() if 'material' in subset.columns else {},
                'chronologies': subset['chronology'].value_counts().head(5).to_dict() if 'chronology' in subset.columns else {},
                'on_display_pct': round(subset['on_display'].mean() * 100, 1) if 'on_display' in subset.columns else 0
            }

        # Find commonalities and differences
        commonalities = self._find_commonalities(comparison)
        differences = self._find_differences(comparison)

        return {
            'collections': comparison,
            'commonalities': commonalities,
            'differences': differences,
            'narrative': self._generate_collection_comparison_narrative(comparison, commonalities, differences)
        }

    def _find_commonalities(self, comparison: Dict) -> List[str]:
        """Find common characteristics across collections."""
        commonalities = []

        # Find common object types
        if len(comparison) >= 2:
            all_types = [set(c.get('object_types', {}).keys()) for c in comparison.values()]
            if all_types:
                common_types = set.intersection(*all_types)
                if common_types:
                    commonalities.append(f"Common object types: {', '.join(list(common_types)[:5])}")

            # Find common materials
            all_materials = [set(c.get('materials', {}).keys()) for c in comparison.values()]
            if all_materials:
                common_materials = set.intersection(*all_materials)
                if common_materials:
                    commonalities.append(f"Common materials: {', '.join(list(common_materials)[:5])}")

        return commonalities

    def _find_differences(self, comparison: Dict) -> List[str]:
        """Find key differences between collections."""
        differences = []

        if len(comparison) >= 2:
            collections = list(comparison.keys())
            for i, col1 in enumerate(collections):
                for col2 in collections[i+1:]:
                    # Compare sizes
                    size_diff = abs(comparison[col1]['total'] - comparison[col2]['total'])
                    differences.append(f"Size difference between {col1} and {col2}: {size_diff} artifacts")

                    # Compare display rates
                    if comparison[col1].get('on_display_pct') and comparison[col2].get('on_display_pct'):
                        display_diff = abs(comparison[col1]['on_display_pct'] - comparison[col2]['on_display_pct'])
                        if display_diff > 10:
                            differences.append(f"Display rate differs by {display_diff:.1f}% between {col1} and {col2}")

        return differences

    def _generate_collection_comparison_narrative(self, comparison: Dict, commonalities: List, differences: List) -> str:
        """Generate narrative comparing collections."""
        narratives = []

        # Overview
        total = sum(c['total'] for c in comparison.values())
        narratives.append(f"The combined collection comprises {total} artifacts across {len(comparison)} collections.")

        # Per-collection summary
        for name, data in comparison.items():
            pct = round(data['total'] / total * 100, 1) if total > 0 else 0
            top_type = list(data.get('object_types', {}).keys())[0] if data.get('object_types') else 'various objects'
            top_material = list(data.get('materials', {}).keys())[0] if data.get('materials') else 'various materials'
            narratives.append(f"The {name.replace('_', ' ').title()} collection ({data['total']} artifacts, {pct}%) is characterized primarily by {top_type} made of {top_material}.")

        # Commonalities
        if commonalities:
            narratives.append("**Shared characteristics:** " + "; ".join(commonalities[:3]))

        # Differences
        if differences:
            narratives.append("**Key differences:** " + "; ".join(differences[:3]))

        return "\n\n".join(narratives)

    def get_material_analysis(self) -> Dict:
        """Detailed analysis of materials across the collection."""
        if 'material' not in self.df.columns:
            return {'error': 'No material data available'}

        material_data = self.df.groupby('material').agg({
            'id': 'count',
            'on_display': 'mean' if 'on_display' in self.df.columns else lambda x: 0,
            'collection': lambda x: x.value_counts().to_dict() if 'collection' in self.df.columns else {}
        }).reset_index()

        materials = []
        for _, row in material_data.iterrows():
            materials.append({
                'material': row['material'],
                'count': int(row['id']),
                'percentage': round(row['id'] / len(self.df) * 100, 2),
                'on_display_pct': round(row['on_display'] * 100, 1) if isinstance(row['on_display'], float) else 0,
                'by_collection': row['collection'] if isinstance(row['collection'], dict) else {}
            })

        # Sort by count
        materials = sorted(materials, key=lambda x: x['count'], reverse=True)

        return {
            'materials': materials,
            'total_types': len(materials),
            'narrative': self._generate_material_narrative(materials)
        }

    def _generate_material_narrative(self, materials: List[Dict]) -> str:
        """Generate narrative about material distribution."""
        if not materials:
            return "No material data available for analysis."

        top_3 = materials[:3]
        total_pct = sum(m['percentage'] for m in top_3)

        narrative = f"The collection features {len(materials)} distinct material types. "
        narrative += f"The three most common materials ({', '.join(m['material'] for m in top_3)}) account for {total_pct:.1f}% of all artifacts. "

        # Check for material concentration
        if materials[0]['percentage'] > 50:
            narrative += f"{materials[0]['material']} dominates the collection with {materials[0]['percentage']:.1f}% of artifacts."

        return narrative

    def get_chronological_analysis(self) -> Dict:
        """Analyze temporal distribution of artifacts."""
        if 'chronology' not in self.df.columns:
            return {'error': 'No chronology data available'}

        chrono_data = self.df.groupby('chronology').agg({
            'id': 'count',
            'material': lambda x: x.value_counts().head(3).to_dict() if 'material' in self.df.columns else {},
            'object_type': lambda x: x.value_counts().head(3).to_dict() if 'object_type' in self.df.columns else {}
        }).reset_index()

        periods = []
        for _, row in chrono_data.iterrows():
            periods.append({
                'period': row['chronology'],
                'count': int(row['id']),
                'percentage': round(row['id'] / len(self.df) * 100, 2),
                'top_materials': row['material'] if isinstance(row['material'], dict) else {},
                'top_types': row['object_type'] if isinstance(row['object_type'], dict) else {}
            })

        periods = sorted(periods, key=lambda x: x['count'], reverse=True)

        return {
            'periods': periods,
            'total_periods': len(periods),
            'narrative': self._generate_chronology_narrative(periods)
        }

    def _generate_chronology_narrative(self, periods: List[Dict]) -> str:
        """Generate narrative about chronological distribution."""
        if not periods:
            return "No chronological data available for analysis."

        narrative = f"The collection spans {len(periods)} chronological periods. "

        if periods:
            top = periods[0]
            narrative += f"The majority of artifacts ({top['count']}, {top['percentage']:.1f}%) date to {top['period']}. "

            if top.get('top_materials'):
                materials = list(top['top_materials'].keys())[:2]
                narrative += f"Artifacts from this period are predominantly made of {' and '.join(materials)}."

        return narrative

    def generate_comprehensive_report(self) -> Dict:
        """Generate a comprehensive statistical report."""
        report = {
            'generated_at': datetime.utcnow().isoformat(),
            'total_artifacts': len(self.df),
            'summary': {},
            'distributions': {},
            'correlations': {},
            'narratives': []
        }

        # Summary statistics
        report['summary'] = {
            'total': len(self.df),
            'collections': self.df['collection'].nunique() if 'collection' in self.df.columns else 1,
            'object_types': self.df['object_type'].nunique() if 'object_type' in self.df.columns else 0,
            'materials': self.df['material'].nunique() if 'material' in self.df.columns else 0,
            'chronologies': self.df['chronology'].nunique() if 'chronology' in self.df.columns else 0,
            'on_display': int(self.df['on_display'].sum()) if 'on_display' in self.df.columns else 0
        }

        # Distribution analyses
        for var in ['collection', 'object_type', 'material', 'chronology', 'findspot']:
            if var in self.df.columns:
                report['distributions'][var] = self.get_distribution_analysis(var)

        # Collection comparison
        if 'collection' in self.df.columns and self.df['collection'].nunique() > 1:
            report['collection_comparison'] = self.compare_collections()

        # Key correlations
        correlation_pairs = [
            ('collection', 'material'),
            ('collection', 'object_type'),
            ('material', 'object_type'),
            ('chronology', 'material'),
            ('chronology', 'object_type')
        ]

        for var1, var2 in correlation_pairs:
            if var1 in self.df.columns and var2 in self.df.columns:
                key = f"{var1}_vs_{var2}"
                report['correlations'][key] = {
                    'crosstab': self.get_cross_tabulation(var1, var2),
                    'chi_square': self.chi_square_test(var1, var2)
                }

        # Generate main narrative
        report['main_narrative'] = self._generate_main_narrative(report)

        return report

    def _generate_main_narrative(self, report: Dict) -> str:
        """Generate the main comprehensive narrative."""
        sections = []

        # Introduction
        summary = report['summary']
        sections.append(f"""## Collection Overview

The analyzed dataset comprises **{summary['total']} archaeological artifacts** spanning {summary['collections']} collection(s), {summary['object_types']} object types, and {summary['materials']} distinct materials. Currently, {summary['on_display']} artifacts ({round(summary['on_display']/summary['total']*100, 1) if summary['total'] > 0 else 0}%) are on public display.""")

        # Collection comparison narrative
        if 'collection_comparison' in report:
            sections.append(f"""## Cross-Collection Analysis

{report['collection_comparison'].get('narrative', '')}""")

        # Material insights
        if 'material' in report['distributions']:
            mat_dist = report['distributions']['material']
            if mat_dist.get('distribution'):
                top_materials = mat_dist['distribution'][:5]
                mat_list = ", ".join([f"{m['value']} ({m['percentage']}%)" for m in top_materials])
                sections.append(f"""## Material Composition

The collection features {mat_dist['unique_values']} different materials. The concentration level is **{mat_dist['concentration_level']}** (HHI: {mat_dist['concentration_index']}).

Top materials: {mat_list}""")

        # Significant correlations
        significant_correlations = []
        for key, corr in report.get('correlations', {}).items():
            chi = corr.get('chi_square', {})
            if chi.get('significance') == 'significant' and chi.get('strength') in ['moderate', 'strong']:
                significant_correlations.append(chi.get('interpretation', ''))

        if significant_correlations:
            sections.append(f"""## Statistical Correlations

{chr(10).join(['- ' + c for c in significant_correlations[:5]])}""")

        return "\n\n".join(sections)

    def export_to_dataframe(self) -> pd.DataFrame:
        """Export analysis data as DataFrame for Excel export."""
        return self.df.copy()
