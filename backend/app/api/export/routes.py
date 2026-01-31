from flask import request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
import io
from . import export_bp
from ...models import Artifact
from ...services.pdf_service import PDFService
from ...services.zip_service import ZipService
from ..auth.decorators import admin_required


@export_bp.route('/pdf', methods=['POST'])
@admin_required
def export_pdf():
    """Export artifacts as PDF (admin only)"""
    data = request.get_json()

    # Get artifacts to export
    artifact_ids = data.get('artifact_ids', [])
    query = data.get('query')
    filters = data.get('filters', {})

    artifacts = _get_artifacts_for_export(artifact_ids, query, filters)

    if not artifacts:
        return jsonify({'error': 'No artifacts to export'}), 400

    try:
        pdf_service = PDFService()
        pdf_bytes = pdf_service.generate_artifact_pdf(
            artifacts,
            include_images=data.get('include_images', True)
        )

        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name='museum_collection_export.pdf'
        )
    except Exception as e:
        current_app.logger.error(f'PDF export error: {str(e)}')
        return jsonify({'error': 'Export failed'}), 500


@export_bp.route('/zip', methods=['POST'])
@admin_required
def export_zip():
    """Export artifacts as ZIP with images (admin only)"""
    data = request.get_json()

    # Get artifacts to export
    artifact_ids = data.get('artifact_ids', [])
    query = data.get('query')
    filters = data.get('filters', {})

    artifacts = _get_artifacts_for_export(artifact_ids, query, filters)

    if not artifacts:
        return jsonify({'error': 'No artifacts to export'}), 400

    try:
        zip_service = ZipService()
        zip_bytes = zip_service.create_zip(
            artifacts,
            include_metadata=data.get('include_metadata', True)
        )

        return send_file(
            io.BytesIO(zip_bytes),
            mimetype='application/zip',
            as_attachment=True,
            download_name='museum_collection_export.zip'
        )
    except Exception as e:
        current_app.logger.error(f'ZIP export error: {str(e)}')
        return jsonify({'error': 'Export failed'}), 500


@export_bp.route('/csv', methods=['POST'])
@admin_required
def export_csv():
    """Export artifacts as CSV (admin only)"""
    data = request.get_json()

    # Get artifacts to export
    artifact_ids = data.get('artifact_ids', [])
    query = data.get('query')
    filters = data.get('filters', {})

    artifacts = _get_artifacts_for_export(artifact_ids, query, filters)

    if not artifacts:
        return jsonify({'error': 'No artifacts to export'}), 400

    try:
        import csv
        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        headers = [
            'Sequence Number', 'Accession Number', 'Other Accession Number',
            'On Display', 'Object Type', 'Material', 'Size/Dimensions',
            'Weight', 'Technique', 'Description (Catalogue)',
            'Description (Observation)', 'Inscription', 'Findspot',
            'Production Place', 'Chronology', 'Bibliography', 'Remarks'
        ]
        writer.writerow(headers)

        # Data
        for artifact in artifacts:
            writer.writerow([
                artifact.sequence_number,
                artifact.accession_number,
                artifact.other_accession_number,
                'Yes' if artifact.on_display else 'No',
                artifact.object_type,
                artifact.material,
                artifact.size_dimensions,
                artifact.weight,
                artifact.technique,
                artifact.description_catalogue,
                artifact.description_observation,
                artifact.inscription,
                artifact.findspot,
                artifact.production_place,
                artifact.chronology,
                artifact.bibliography,
                artifact.remarks
            ])

        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name='museum_collection_export.csv'
        )
    except Exception as e:
        current_app.logger.error(f'CSV export error: {str(e)}')
        return jsonify({'error': 'Export failed'}), 500


def _get_artifacts_for_export(artifact_ids, query, filters):
    """Helper to get artifacts based on IDs, query, or filters"""
    if artifact_ids:
        return Artifact.query.filter(Artifact.id.in_(artifact_ids)).all()

    q = Artifact.query

    if query:
        search_term = f'%{query}%'
        q = q.filter(or_(
            Artifact.sequence_number.ilike(search_term),
            Artifact.object_type.ilike(search_term),
            Artifact.material.ilike(search_term),
            Artifact.description_catalogue.ilike(search_term),
            Artifact.description_observation.ilike(search_term)
        ))

    if filters.get('object_type'):
        q = q.filter(Artifact.object_type.ilike(f"%{filters['object_type']}%"))
    if filters.get('material'):
        q = q.filter(Artifact.material.ilike(f"%{filters['material']}%"))
    if filters.get('on_display') is not None:
        q = q.filter_by(on_display=filters['on_display'])

    return q.order_by(Artifact.sequence_number).all()
