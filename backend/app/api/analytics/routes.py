"""
Analytics API routes for advanced statistical analysis.
"""
from flask import request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required
from . import analytics_bp
from ...models import Artifact
from ...services.analytics_service import AnalyticsService
from ...services.export_service import generate_excel_report, generate_docx_report
from datetime import datetime


def get_artifacts_data(collection: str = None):
    """Get artifact data as list of dictionaries."""
    query = Artifact.query
    if collection:
        query = query.filter(Artifact.collection == collection)

    artifacts = query.all()
    return [a.to_dict() for a in artifacts]


@analytics_bp.route('/report', methods=['GET'])
@jwt_required()
def get_comprehensive_report():
    """Get comprehensive analytics report."""
    collection = request.args.get('collection')

    artifacts_data = get_artifacts_data(collection)
    if not artifacts_data:
        return jsonify({'error': 'No artifacts found'}), 404

    service = AnalyticsService(artifacts_data)
    report = service.generate_comprehensive_report()

    return jsonify(report)


@analytics_bp.route('/distribution/<variable>', methods=['GET'])
@jwt_required()
def get_distribution(variable):
    """Get distribution analysis for a specific variable."""
    collection = request.args.get('collection')

    artifacts_data = get_artifacts_data(collection)
    if not artifacts_data:
        return jsonify({'error': 'No artifacts found'}), 404

    service = AnalyticsService(artifacts_data)
    result = service.get_distribution_analysis(variable)

    return jsonify(result)


@analytics_bp.route('/crosstab', methods=['GET'])
@jwt_required()
def get_cross_tabulation():
    """Get cross-tabulation between two variables."""
    row_var = request.args.get('row')
    col_var = request.args.get('col')
    collection = request.args.get('collection')

    if not row_var or not col_var:
        return jsonify({'error': 'Both row and col parameters required'}), 400

    artifacts_data = get_artifacts_data(collection)
    if not artifacts_data:
        return jsonify({'error': 'No artifacts found'}), 404

    service = AnalyticsService(artifacts_data)
    crosstab = service.get_cross_tabulation(row_var, col_var)
    chi_square = service.chi_square_test(row_var, col_var)

    return jsonify({
        'crosstab': crosstab,
        'chi_square': chi_square
    })


@analytics_bp.route('/correlation', methods=['POST'])
@jwt_required()
def analyze_correlation():
    """Analyze correlation between multiple variables."""
    data = request.get_json()
    variables = data.get('variables', [])
    collection = data.get('collection')

    if len(variables) < 2:
        return jsonify({'error': 'At least 2 variables required'}), 400

    artifacts_data = get_artifacts_data(collection)
    if not artifacts_data:
        return jsonify({'error': 'No artifacts found'}), 404

    service = AnalyticsService(artifacts_data)

    results = {
        'variables': variables,
        'analyses': []
    }

    # Analyze all pairs
    for i, var1 in enumerate(variables):
        for var2 in variables[i+1:]:
            analysis = {
                'pair': [var1, var2],
                'crosstab': service.get_cross_tabulation(var1, var2),
                'chi_square': service.chi_square_test(var1, var2)
            }
            results['analyses'].append(analysis)

    # Generate summary narrative
    significant_pairs = [
        a for a in results['analyses']
        if a['chi_square'].get('significance') == 'significant'
    ]

    if significant_pairs:
        results['narrative'] = f"Found {len(significant_pairs)} significant correlations among the {len(variables)} analyzed variables. "
        for pair in significant_pairs[:3]:
            results['narrative'] += pair['chi_square'].get('interpretation', '') + " "
    else:
        results['narrative'] = "No statistically significant correlations were found among the analyzed variables."

    return jsonify(results)


@analytics_bp.route('/compare-collections', methods=['GET'])
@jwt_required()
def compare_collections():
    """Compare characteristics between collections."""
    artifacts_data = get_artifacts_data()
    if not artifacts_data:
        return jsonify({'error': 'No artifacts found'}), 404

    service = AnalyticsService(artifacts_data)
    comparison = service.compare_collections()

    return jsonify(comparison)


@analytics_bp.route('/materials', methods=['GET'])
@jwt_required()
def analyze_materials():
    """Get detailed material analysis."""
    collection = request.args.get('collection')

    artifacts_data = get_artifacts_data(collection)
    if not artifacts_data:
        return jsonify({'error': 'No artifacts found'}), 404

    service = AnalyticsService(artifacts_data)
    analysis = service.get_material_analysis()

    return jsonify(analysis)


@analytics_bp.route('/chronology', methods=['GET'])
@jwt_required()
def analyze_chronology():
    """Get chronological analysis."""
    collection = request.args.get('collection')

    artifacts_data = get_artifacts_data(collection)
    if not artifacts_data:
        return jsonify({'error': 'No artifacts found'}), 404

    service = AnalyticsService(artifacts_data)
    analysis = service.get_chronological_analysis()

    return jsonify(analysis)


@analytics_bp.route('/export/excel', methods=['GET'])
@jwt_required()
def export_excel():
    """Export analytics report to Excel format."""
    collection = request.args.get('collection')

    artifacts_data = get_artifacts_data(collection)
    if not artifacts_data:
        return jsonify({'error': 'No artifacts found'}), 404

    service = AnalyticsService(artifacts_data)
    report = service.generate_comprehensive_report()

    excel_file = generate_excel_report(report)

    filename = f"museum_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    if collection:
        filename = f"{collection}_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return send_file(
        excel_file,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=filename
    )


@analytics_bp.route('/export/docx', methods=['GET'])
@jwt_required()
def export_docx():
    """Export analytics report to Word document format."""
    collection = request.args.get('collection')

    artifacts_data = get_artifacts_data(collection)
    if not artifacts_data:
        return jsonify({'error': 'No artifacts found'}), 404

    service = AnalyticsService(artifacts_data)
    report = service.generate_comprehensive_report()

    docx_file = generate_docx_report(report)

    filename = f"museum_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
    if collection:
        filename = f"{collection}_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"

    return send_file(
        docx_file,
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        as_attachment=True,
        download_name=filename
    )


@analytics_bp.route('/variables', methods=['GET'])
@jwt_required()
def get_available_variables():
    """Get list of available variables for analysis."""
    return jsonify({
        'categorical': [
            {'id': 'collection', 'name': 'Collection', 'description': 'Museum collection (Chennai/British)'},
            {'id': 'object_type', 'name': 'Object Type', 'description': 'Type of artifact'},
            {'id': 'material', 'name': 'Material', 'description': 'Primary material'},
            {'id': 'chronology', 'name': 'Chronology', 'description': 'Time period'},
            {'id': 'findspot', 'name': 'Findspot', 'description': 'Discovery location'},
            {'id': 'production_place', 'name': 'Production Place', 'description': 'Place of manufacture'},
            {'id': 'on_display', 'name': 'Display Status', 'description': 'Currently on display'}
        ],
        'suggested_correlations': [
            {'var1': 'collection', 'var2': 'material', 'description': 'Compare materials across collections'},
            {'var1': 'collection', 'var2': 'object_type', 'description': 'Compare object types across collections'},
            {'var1': 'material', 'var2': 'chronology', 'description': 'Material use over time'},
            {'var1': 'object_type', 'var2': 'chronology', 'description': 'Object types over time'},
            {'var1': 'material', 'var2': 'object_type', 'description': 'Material-type relationships'}
        ]
    })
