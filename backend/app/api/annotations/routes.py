from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import annotations_bp
from ...models import Annotation, Media
from ...extensions import db
from ..auth.decorators import editor_required


@annotations_bp.route('/media/<media_id>', methods=['GET'])
@jwt_required()
def get_annotations_for_media(media_id):
    """Get all annotations for a media item"""
    media = Media.query.get(media_id)

    if not media:
        return jsonify({'error': 'Media not found'}), 404

    annotations = media.annotations.all()

    return jsonify({
        'annotations': [a.to_dict() for a in annotations]
    })


@annotations_bp.route('', methods=['POST'])
@editor_required
def create_annotation():
    """Create a new annotation"""
    user_id = get_jwt_identity()
    data = request.get_json()

    media_id = data.get('media_id')
    if not media_id:
        return jsonify({'error': 'Media ID required'}), 400

    media = Media.query.get(media_id)
    if not media:
        return jsonify({'error': 'Media not found'}), 404

    annotation_type = data.get('annotation_type')
    if annotation_type not in ('rectangle', 'freehand'):
        return jsonify({'error': 'Invalid annotation type'}), 400

    geometry = data.get('geometry')
    if not geometry:
        return jsonify({'error': 'Geometry required'}), 400

    annotation = Annotation(
        media_id=media_id,
        annotation_type=annotation_type,
        geometry=geometry,
        stroke_color=data.get('stroke_color', '#ff0000'),
        stroke_width=data.get('stroke_width', 2),
        stroke_style=data.get('stroke_style', 'solid'),
        fill_color=data.get('fill_color'),
        fill_opacity=data.get('fill_opacity', 0.2),
        label=data.get('label'),
        description=data.get('description'),
        extra_data=data.get('metadata'),
        created_by=user_id
    )

    db.session.add(annotation)
    db.session.commit()

    return jsonify(annotation.to_dict()), 201


@annotations_bp.route('/<annotation_id>', methods=['GET'])
@jwt_required()
def get_annotation(annotation_id):
    """Get annotation details"""
    annotation = Annotation.query.get(annotation_id)

    if not annotation:
        return jsonify({'error': 'Annotation not found'}), 404

    return jsonify(annotation.to_dict())


@annotations_bp.route('/<annotation_id>', methods=['PUT'])
@editor_required
def update_annotation(annotation_id):
    """Update annotation"""
    annotation = Annotation.query.get(annotation_id)

    if not annotation:
        return jsonify({'error': 'Annotation not found'}), 404

    data = request.get_json()

    # Update fields
    if 'geometry' in data:
        annotation.geometry = data['geometry']
    if 'stroke_color' in data:
        annotation.stroke_color = data['stroke_color']
    if 'stroke_width' in data:
        annotation.stroke_width = data['stroke_width']
    if 'stroke_style' in data:
        annotation.stroke_style = data['stroke_style']
    if 'fill_color' in data:
        annotation.fill_color = data['fill_color']
    if 'fill_opacity' in data:
        annotation.fill_opacity = data['fill_opacity']
    if 'label' in data:
        annotation.label = data['label']
    if 'description' in data:
        annotation.description = data['description']
    if 'metadata' in data:
        annotation.extra_data = data['metadata']

    db.session.commit()

    return jsonify(annotation.to_dict())


@annotations_bp.route('/<annotation_id>', methods=['DELETE'])
@editor_required
def delete_annotation(annotation_id):
    """Delete annotation"""
    annotation = Annotation.query.get(annotation_id)

    if not annotation:
        return jsonify({'error': 'Annotation not found'}), 404

    db.session.delete(annotation)
    db.session.commit()

    return jsonify({'message': 'Annotation deleted'})
