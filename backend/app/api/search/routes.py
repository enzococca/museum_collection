from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy import or_
from . import search_bp
from ...models import Artifact
from ...extensions import db


def _can_view_internal():
    """Check if current user can view internal documentation fields"""
    try:
        claims = get_jwt()
        return claims.get('role') in ('admin', 'editor')
    except Exception:
        return False


@search_bp.route('', methods=['GET'])
@jwt_required()
def search_artifacts():
    """Search artifacts with full-text and filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Artifact.query

    # Full-text search
    q = request.args.get('q')
    if q:
        search_term = f'%{q}%'
        query = query.filter(or_(
            Artifact.sequence_number.ilike(search_term),
            Artifact.accession_number.ilike(search_term),
            Artifact.object_type.ilike(search_term),
            Artifact.material.ilike(search_term),
            Artifact.description_catalogue.ilike(search_term),
            Artifact.description_observation.ilike(search_term),
            Artifact.inscription.ilike(search_term),
            Artifact.findspot.ilike(search_term),
            Artifact.remarks.ilike(search_term)
        ))

    # Filters
    object_type = request.args.get('object_type')
    if object_type:
        query = query.filter(Artifact.object_type.ilike(f'%{object_type}%'))

    material = request.args.get('material')
    if material:
        query = query.filter(Artifact.material.ilike(f'%{material}%'))

    on_display = request.args.get('on_display')
    if on_display is not None:
        query = query.filter_by(on_display=on_display.lower() == 'true')

    chronology = request.args.get('chronology')
    if chronology:
        query = query.filter(Artifact.chronology.ilike(f'%{chronology}%'))

    # Sorting
    sort_by = request.args.get('sort_by', 'sequence_number')
    sort_order = request.args.get('sort_order', 'asc')

    if hasattr(Artifact, sort_by):
        sort_column = getattr(Artifact, sort_by)
        if sort_order == 'desc':
            sort_column = sort_column.desc()
        query = query.order_by(sort_column)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    include_internal = _can_view_internal()
    return jsonify({
        'artifacts': [a.to_dict(include_media=True, include_internal=include_internal) for a in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page,
        'query': q
    })


@search_bp.route('/suggestions', methods=['GET'])
@jwt_required()
def search_suggestions():
    """Get autocomplete suggestions"""
    q = request.args.get('q', '')
    if len(q) < 2:
        return jsonify({'suggestions': []})

    search_term = f'{q}%'

    # Get matching sequence numbers
    sequences = db.session.query(Artifact.sequence_number).filter(
        Artifact.sequence_number.ilike(search_term)
    ).limit(5).all()

    # Get matching object types
    types = db.session.query(Artifact.object_type).distinct().filter(
        Artifact.object_type.ilike(search_term)
    ).limit(5).all()

    suggestions = []
    suggestions.extend([{'type': 'sequence', 'value': s[0]} for s in sequences if s[0]])
    suggestions.extend([{'type': 'object_type', 'value': t[0]} for t in types if t[0]])

    return jsonify({'suggestions': suggestions[:10]})


@search_bp.route('/filters', methods=['GET'])
@jwt_required()
def get_filter_values():
    """Get available filter values"""
    object_types = db.session.query(Artifact.object_type).distinct().filter(
        Artifact.object_type.isnot(None)
    ).all()

    materials = db.session.query(Artifact.material).distinct().filter(
        Artifact.material.isnot(None)
    ).all()

    chronologies = db.session.query(Artifact.chronology).distinct().filter(
        Artifact.chronology.isnot(None)
    ).all()

    return jsonify({
        'object_types': sorted([t[0] for t in object_types if t[0]]),
        'materials': sorted([m[0] for m in materials if m[0]]),
        'chronologies': sorted([c[0] for c in chronologies if c[0]])
    })
