"""Thesaurus API routes for controlled vocabulary management."""

from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import bp
from ...models import Thesaurus, User
from ...extensions import db
from ..auth.decorators import admin_required, editor_required


@bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get list of all thesaurus categories."""
    categories = db.session.query(Thesaurus.category).distinct().order_by(Thesaurus.category).all()
    return jsonify([c[0] for c in categories])


@bp.route('/', methods=['GET'])
@jwt_required()
def get_terms():
    """
    Get thesaurus terms with optional filtering.

    Query params:
    - category: filter by category (e.g., 'material', 'object_type')
    - active_only: if 'true', only return active terms (default: true)
    - include_hierarchy: if 'true', include parent/children info
    """
    category = request.args.get('category')
    active_only = request.args.get('active_only', 'true').lower() == 'true'

    query = Thesaurus.query

    if category:
        query = query.filter(Thesaurus.category == category)

    if active_only:
        query = query.filter(Thesaurus.is_active == True)

    query = query.order_by(Thesaurus.category, Thesaurus.sort_order, Thesaurus.term)

    terms = query.all()
    return jsonify([t.to_dict() for t in terms])


@bp.route('/by-category/<category>', methods=['GET'])
@jwt_required()
def get_terms_by_category(category):
    """Get all active terms for a specific category (for dropdowns)."""
    active_only = request.args.get('active_only', 'true').lower() == 'true'

    query = Thesaurus.query.filter(Thesaurus.category == category)

    if active_only:
        query = query.filter(Thesaurus.is_active == True)

    terms = query.order_by(Thesaurus.sort_order, Thesaurus.term).all()

    # Return simplified format for dropdowns
    return jsonify([{
        'value': t.term,
        'label': t.term,
        'description': t.description
    } for t in terms])


@bp.route('/<term_id>', methods=['GET'])
@jwt_required()
def get_term(term_id):
    """Get a specific thesaurus term by ID."""
    term = Thesaurus.query.get_or_404(term_id)
    return jsonify(term.to_dict())


@bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_term():
    """Create a new thesaurus term (admin only)."""
    data = request.get_json()

    if not data.get('category') or not data.get('term'):
        return jsonify({'error': 'Category and term are required'}), 400

    # Check for duplicates
    existing = Thesaurus.query.filter_by(
        category=data['category'],
        term=data['term']
    ).first()

    if existing:
        return jsonify({'error': f"Term '{data['term']}' already exists in category '{data['category']}'"}), 400

    term = Thesaurus(
        category=data['category'],
        term=data['term'],
        description=data.get('description'),
        alt_terms=','.join(data.get('alt_terms', [])) if isinstance(data.get('alt_terms'), list) else data.get('alt_terms'),
        parent_id=data.get('parent_id'),
        sort_order=data.get('sort_order', 0),
        is_active=data.get('is_active', True)
    )

    db.session.add(term)
    db.session.commit()

    return jsonify(term.to_dict()), 201


@bp.route('/<term_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_term(term_id):
    """Update a thesaurus term (admin only)."""
    term = Thesaurus.query.get_or_404(term_id)
    data = request.get_json()

    if 'term' in data:
        # Check for duplicates if changing the term
        if data['term'] != term.term:
            existing = Thesaurus.query.filter_by(
                category=term.category,
                term=data['term']
            ).first()
            if existing:
                return jsonify({'error': f"Term '{data['term']}' already exists in this category"}), 400
        term.term = data['term']

    if 'description' in data:
        term.description = data['description']

    if 'alt_terms' in data:
        term.alt_terms = ','.join(data['alt_terms']) if isinstance(data['alt_terms'], list) else data['alt_terms']

    if 'parent_id' in data:
        term.parent_id = data['parent_id']

    if 'sort_order' in data:
        term.sort_order = data['sort_order']

    if 'is_active' in data:
        term.is_active = data['is_active']

    db.session.commit()

    return jsonify(term.to_dict())


@bp.route('/<term_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_term(term_id):
    """Delete a thesaurus term (admin only)."""
    term = Thesaurus.query.get_or_404(term_id)

    # Check if term has children
    if term.children.count() > 0:
        return jsonify({'error': 'Cannot delete term with child terms. Delete children first.'}), 400

    db.session.delete(term)
    db.session.commit()

    return jsonify({'message': 'Term deleted successfully'})


@bp.route('/bulk', methods=['POST'])
@jwt_required()
@admin_required
def bulk_create_terms():
    """Bulk create thesaurus terms (admin only)."""
    data = request.get_json()

    if not isinstance(data, list):
        return jsonify({'error': 'Expected a list of terms'}), 400

    created = []
    errors = []

    for item in data:
        if not item.get('category') or not item.get('term'):
            errors.append(f"Missing category or term: {item}")
            continue

        existing = Thesaurus.query.filter_by(
            category=item['category'],
            term=item['term']
        ).first()

        if existing:
            errors.append(f"Duplicate: {item['category']}/{item['term']}")
            continue

        term = Thesaurus(
            category=item['category'],
            term=item['term'],
            description=item.get('description'),
            alt_terms=','.join(item.get('alt_terms', [])) if isinstance(item.get('alt_terms'), list) else item.get('alt_terms'),
            sort_order=item.get('sort_order', 0),
            is_active=item.get('is_active', True)
        )
        db.session.add(term)
        created.append(term)

    db.session.commit()

    return jsonify({
        'created': len(created),
        'errors': errors,
        'terms': [t.to_dict() for t in created]
    })


@bp.route('/sync-from-data', methods=['POST'])
@jwt_required()
@admin_required
def sync_from_existing_data():
    """
    Sync thesaurus with existing data in artifacts table.
    Extracts unique values from specified fields and adds them to the thesaurus.
    """
    from ...models import Artifact

    # Define which artifact fields map to which thesaurus categories
    field_mappings = {
        'material': 'material',
        'object_type': 'object_type',
        'technique': 'technique',
        'chronology': 'chronology',
    }

    results = {}

    for field, category in field_mappings.items():
        # Get distinct values from artifacts
        values = db.session.query(getattr(Artifact, field)).distinct().filter(
            getattr(Artifact, field).isnot(None),
            getattr(Artifact, field) != ''
        ).all()

        added = 0
        for (value,) in values:
            if not value or not value.strip():
                continue

            # Check if already exists
            existing = Thesaurus.query.filter_by(
                category=category,
                term=value.strip()
            ).first()

            if not existing:
                term = Thesaurus(
                    category=category,
                    term=value.strip(),
                    is_active=True
                )
                db.session.add(term)
                added += 1

        results[category] = added

    db.session.commit()

    return jsonify({
        'message': 'Sync complete',
        'added': results
    })
