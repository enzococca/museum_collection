from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from . import artifacts_bp
from ...models import Artifact
from ...extensions import db
from ..auth.decorators import editor_required, admin_required


def _can_view_internal():
    """Check if current user can view internal documentation fields"""
    try:
        claims = get_jwt()
        return claims.get('role') in ('admin', 'editor')
    except Exception:
        return False


@artifacts_bp.route('/collections', methods=['GET'])
@jwt_required()
def get_collections():
    """Get all available collections"""
    collections = db.session.query(
        Artifact.collection,
        db.func.count(Artifact.id)
    ).group_by(Artifact.collection).all()

    return jsonify({
        'collections': [
            {'id': c[0], 'name': c[0].replace('_', ' ').title(), 'count': c[1]}
            for c in collections if c[0]
        ]
    })


@artifacts_bp.route('', methods=['GET'])
@jwt_required()
def list_artifacts():
    """List all artifacts with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Artifact.query.order_by(Artifact.sequence_number)

    # Collection filter
    collection = request.args.get('collection')
    if collection:
        query = query.filter(Artifact.collection == collection)

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

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    include_internal = _can_view_internal()
    return jsonify({
        'artifacts': [a.to_dict(include_media=True, include_internal=include_internal) for a in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page
    })


@artifacts_bp.route('', methods=['POST'])
@editor_required
def create_artifact():
    """Create a new artifact"""
    data = request.get_json()
    user_id = get_jwt_identity()

    # Validate required fields
    sequence_number = data.get('sequence_number')
    if not sequence_number:
        return jsonify({'error': 'Sequence number required'}), 400

    # Check if sequence number exists
    if Artifact.query.filter_by(sequence_number=sequence_number).first():
        return jsonify({'error': 'Sequence number already exists'}), 409

    artifact = Artifact(
        sequence_number=sequence_number,
        collection=data.get('collection', 'chennai'),
        accession_number=data.get('accession_number'),
        other_accession_number=data.get('other_accession_number'),
        on_display=data.get('on_display', False),
        acquisition_details=data.get('acquisition_details'),
        object_type=data.get('object_type'),
        material=data.get('material'),
        remarks=data.get('remarks'),
        size_dimensions=data.get('size_dimensions'),
        weight=data.get('weight'),
        technique=data.get('technique'),
        description_catalogue=data.get('description_catalogue'),
        description_observation=data.get('description_observation'),
        inscription=data.get('inscription'),
        findspot=data.get('findspot'),
        production_place=data.get('production_place'),
        chronology=data.get('chronology'),
        bibliography=data.get('bibliography'),
        photo_number=data.get('photo_number'),
        british_museum_url=data.get('british_museum_url'),
        external_links=data.get('external_links'),
        created_by=user_id
    )

    db.session.add(artifact)
    db.session.commit()

    return jsonify(artifact.to_dict(include_media=True, include_internal=True)), 201


@artifacts_bp.route('/<artifact_id>', methods=['GET'])
@jwt_required()
def get_artifact(artifact_id):
    """Get artifact details"""
    artifact = Artifact.query.get(artifact_id)

    if not artifact:
        return jsonify({'error': 'Artifact not found'}), 404

    return jsonify(artifact.to_dict(include_media=True, include_internal=_can_view_internal()))


@artifacts_bp.route('/<artifact_id>', methods=['PUT'])
@editor_required
def update_artifact(artifact_id):
    """Update artifact"""
    artifact = Artifact.query.get(artifact_id)
    user_id = get_jwt_identity()

    if not artifact:
        return jsonify({'error': 'Artifact not found'}), 404

    data = request.get_json()

    # Update fields
    updateable_fields = [
        'accession_number', 'other_accession_number', 'on_display',
        'acquisition_details', 'object_type', 'material', 'remarks',
        'size_dimensions', 'weight', 'technique', 'description_catalogue',
        'description_observation', 'inscription', 'findspot',
        'production_place', 'chronology', 'bibliography', 'photo_number',
        'british_museum_url', 'external_links'
    ]

    for field in updateable_fields:
        if field in data:
            setattr(artifact, field, data[field])

    artifact.updated_by = user_id
    db.session.commit()

    return jsonify(artifact.to_dict(include_media=True, include_internal=True))


@artifacts_bp.route('/<artifact_id>', methods=['DELETE'])
@admin_required
def delete_artifact(artifact_id):
    """Delete artifact (admin only)"""
    artifact = Artifact.query.get(artifact_id)

    if not artifact:
        return jsonify({'error': 'Artifact not found'}), 404

    db.session.delete(artifact)
    db.session.commit()

    return jsonify({'message': 'Artifact deleted'})


@artifacts_bp.route('/<artifact_id>/media', methods=['GET'])
@jwt_required()
def get_artifact_media(artifact_id):
    """Get all media for an artifact"""
    artifact = Artifact.query.get(artifact_id)

    if not artifact:
        return jsonify({'error': 'Artifact not found'}), 404

    media_list = artifact.media_files.order_by('sort_order').all()

    return jsonify({
        'media': [m.to_dict(include_annotations=True) for m in media_list]
    })


@artifacts_bp.route('/filters', methods=['GET'])
@jwt_required()
def get_filter_options():
    """Get unique values for filter dropdowns"""
    collection = request.args.get('collection')

    object_types_query = db.session.query(Artifact.object_type).distinct().filter(
        Artifact.object_type.isnot(None)
    )
    materials_query = db.session.query(Artifact.material).distinct().filter(
        Artifact.material.isnot(None)
    )

    if collection:
        object_types_query = object_types_query.filter(Artifact.collection == collection)
        materials_query = materials_query.filter(Artifact.collection == collection)

    object_types = object_types_query.all()
    materials = materials_query.all()

    return jsonify({
        'object_types': sorted([t[0] for t in object_types if t[0]]),
        'materials': sorted([m[0] for m in materials if m[0]])
    })
