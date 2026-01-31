from flask import jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func, case, and_
from . import stats_bp
from ...models import Artifact, Media, Annotation, User, Submission
from ...extensions import db


@stats_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics"""
    # Collection stats
    total_artifacts = Artifact.query.count()
    on_display = Artifact.query.filter_by(on_display=True).count()
    total_media = Media.query.count()
    total_annotations = Annotation.query.count()

    # User stats
    total_users = User.query.filter_by(is_active=True).count()

    # Submission stats
    pending_submissions = Submission.query.filter_by(status='pending').count()

    # Object type distribution
    object_type_stats = db.session.query(
        Artifact.object_type,
        func.count(Artifact.id)
    ).group_by(Artifact.object_type).filter(
        Artifact.object_type.isnot(None)
    ).order_by(func.count(Artifact.id).desc()).limit(10).all()

    # Material distribution
    material_stats = db.session.query(
        Artifact.material,
        func.count(Artifact.id)
    ).group_by(Artifact.material).filter(
        Artifact.material.isnot(None)
    ).order_by(func.count(Artifact.id).desc()).limit(10).all()

    return jsonify({
        'totals': {
            'artifacts': total_artifacts,
            'on_display': on_display,
            'not_on_display': total_artifacts - on_display,
            'media': total_media,
            'annotations': total_annotations,
            'users': total_users,
            'pending_submissions': pending_submissions
        },
        'object_types': [
            {'name': t[0] or 'Unknown', 'count': t[1]}
            for t in object_type_stats
        ],
        'materials': [
            {'name': m[0] or 'Unknown', 'count': m[1]}
            for m in material_stats
        ]
    })


@stats_bp.route('/collection', methods=['GET'])
@jwt_required()
def get_collection_stats():
    """Get detailed collection statistics"""
    # Artifacts with images
    artifacts_with_images = db.session.query(
        func.count(func.distinct(Media.artifact_id))
    ).scalar()

    # Artifacts with annotations
    artifacts_with_annotations = db.session.query(
        func.count(func.distinct(Media.artifact_id))
    ).join(Annotation).scalar()

    # Average images per artifact
    avg_images = db.session.query(
        func.avg(
            db.session.query(func.count(Media.id))
            .filter(Media.artifact_id == Artifact.id)
            .correlate(Artifact)
            .scalar_subquery()
        )
    ).scalar() or 0

    # Chronology distribution
    chronology_stats = db.session.query(
        Artifact.chronology,
        func.count(Artifact.id)
    ).group_by(Artifact.chronology).filter(
        Artifact.chronology.isnot(None)
    ).order_by(func.count(Artifact.id).desc()).all()

    # Findspot distribution
    findspot_stats = db.session.query(
        Artifact.findspot,
        func.count(Artifact.id)
    ).group_by(Artifact.findspot).filter(
        Artifact.findspot.isnot(None)
    ).order_by(func.count(Artifact.id).desc()).limit(10).all()

    return jsonify({
        'coverage': {
            'with_images': artifacts_with_images,
            'with_annotations': artifacts_with_annotations,
            'avg_images_per_artifact': round(float(avg_images), 2)
        },
        'chronologies': [
            {'name': c[0] or 'Unknown', 'count': c[1]}
            for c in chronology_stats
        ],
        'findspots': [
            {'name': f[0] or 'Unknown', 'count': f[1]}
            for f in findspot_stats
        ]
    })


@stats_bp.route('/catalog', methods=['GET'])
@jwt_required()
def get_catalog_stats():
    """Get comprehensive statistics for catalog/publication"""
    from flask import request

    # Collection filter
    collection = request.args.get('collection')

    # Base queries
    artifact_query = Artifact.query
    if collection:
        artifact_query = artifact_query.filter(Artifact.collection == collection)

    # === TOTALS ===
    total_artifacts = artifact_query.count()

    # Get artifact IDs for this collection to filter media
    if collection:
        artifact_ids = [a.id for a in artifact_query.with_entities(Artifact.id).all()]
        media_query = Media.query.filter(Media.artifact_id.in_(artifact_ids)) if artifact_ids else Media.query.filter(False)
    else:
        media_query = Media.query

    total_media = media_query.count()

    # Annotations for this collection's media
    if collection and artifact_ids:
        annotation_query = Annotation.query.join(Media).filter(Media.artifact_id.in_(artifact_ids))
    else:
        annotation_query = Annotation.query
    total_annotations = annotation_query.count()

    # === DISPLAY STATUS ===
    on_display = artifact_query.filter(Artifact.on_display == True).count()
    in_storage = total_artifacts - on_display

    # === PHOTO COVERAGE ===
    if collection:
        artifacts_with_images = db.session.query(
            func.count(func.distinct(Media.artifact_id))
        ).filter(Media.artifact_id.in_(artifact_ids)).scalar() or 0 if artifact_ids else 0
    else:
        artifacts_with_images = db.session.query(
            func.count(func.distinct(Media.artifact_id))
        ).scalar() or 0
    artifacts_without_images = total_artifacts - artifacts_with_images

    # Artifacts needing photos (no images)
    missing_photos_query = artifact_query.outerjoin(Media).filter(
        Media.id.is_(None)
    ).order_by(Artifact.sequence_number).limit(20)
    missing_photos = missing_photos_query.all()

    # === DOCUMENTATION COMPLETENESS ===
    # Count how many key fields are filled per artifact
    completeness_fields = [
        'accession_number', 'object_type', 'material', 'size_dimensions',
        'description_observation', 'chronology', 'findspot'
    ]

    # Calculate average completeness
    artifacts_all = artifact_query.all()
    total_completeness = 0
    completeness_distribution = {'complete': 0, 'partial': 0, 'minimal': 0}

    for artifact in artifacts_all:
        filled = sum(1 for f in completeness_fields if getattr(artifact, f))
        pct = (filled / len(completeness_fields)) * 100
        total_completeness += pct

        if pct >= 80:
            completeness_distribution['complete'] += 1
        elif pct >= 40:
            completeness_distribution['partial'] += 1
        else:
            completeness_distribution['minimal'] += 1

    avg_completeness = total_completeness / total_artifacts if total_artifacts > 0 else 0

    # === MATERIALS BREAKDOWN ===
    material_query = db.session.query(
        Artifact.material,
        func.count(Artifact.id)
    ).filter(Artifact.material.isnot(None))
    if collection:
        material_query = material_query.filter(Artifact.collection == collection)
    material_stats = material_query.group_by(Artifact.material).order_by(func.count(Artifact.id).desc()).all()

    # === OBJECT TYPES ===
    object_type_query = db.session.query(
        Artifact.object_type,
        func.count(Artifact.id)
    ).filter(Artifact.object_type.isnot(None))
    if collection:
        object_type_query = object_type_query.filter(Artifact.collection == collection)
    object_type_stats = object_type_query.group_by(Artifact.object_type).order_by(func.count(Artifact.id).desc()).all()

    # === CHRONOLOGY ===
    chronology_query = db.session.query(
        Artifact.chronology,
        func.count(Artifact.id)
    ).filter(Artifact.chronology.isnot(None))
    if collection:
        chronology_query = chronology_query.filter(Artifact.collection == collection)
    chronology_stats = chronology_query.group_by(Artifact.chronology).order_by(func.count(Artifact.id).desc()).all()

    # === FINDSPOTS ===
    findspot_query = db.session.query(
        Artifact.findspot,
        func.count(Artifact.id)
    ).filter(Artifact.findspot.isnot(None))
    if collection:
        findspot_query = findspot_query.filter(Artifact.collection == collection)
    findspot_stats = findspot_query.group_by(Artifact.findspot).order_by(func.count(Artifact.id).desc()).all()

    # === COLLECTION HIGHLIGHTS ===
    # Artifacts with most images
    highlights_query = db.session.query(
        Artifact,
        func.count(Media.id).label('image_count')
    ).outerjoin(Media)
    if collection:
        highlights_query = highlights_query.filter(Artifact.collection == collection)
    highlights_by_images = highlights_query.group_by(Artifact.id).order_by(
        func.count(Media.id).desc()
    ).limit(5).all()

    # Artifacts with annotations
    annotations_query = db.session.query(
        Artifact,
        func.count(Annotation.id).label('annotation_count')
    ).select_from(Artifact).join(
        Media, Artifact.id == Media.artifact_id
    ).join(
        Annotation, Media.id == Annotation.media_id
    )
    if collection:
        annotations_query = annotations_query.filter(Artifact.collection == collection)
    highlights_with_annotations = annotations_query.group_by(Artifact.id).order_by(
        func.count(Annotation.id).desc()
    ).limit(5).all()

    # === BRITISH MUSEUM CROSS-REFERENCES ===
    bm_link_query = artifact_query.filter(Artifact.british_museum_url.isnot(None))
    with_bm_link = bm_link_query.count()

    # === GENERATE NARRATIVE SUMMARY ===
    # Get top material and type
    top_material = material_stats[0][0] if material_stats else "various materials"
    top_material_pct = round((material_stats[0][1] / total_artifacts * 100), 0) if material_stats else 0

    top_type = object_type_stats[0][0] if object_type_stats else "various objects"
    top_type_count = object_type_stats[0][1] if object_type_stats else 0

    # Chronology range
    chronologies = [c[0] for c in chronology_stats if c[0]]
    chrono_text = ", ".join(chronologies[:3]) if chronologies else "unspecified period"

    # Collection name for narrative
    collection_names = {
        'chennai': 'Chennai Museum',
        'british': 'British Museum Nilgiri'
    }
    collection_name = collection_names.get(collection, 'Museum') if collection else 'Combined Museums'

    narrative = f"""The {collection_name} collection comprises {total_artifacts} archaeological artifacts from megalithic burials in the Nilgiri Mountains, Tamil Nadu, South India.

**Collection Composition:** The most represented category is "{top_type}" with {top_type_count} specimens. The predominant material is {top_material} ({int(top_material_pct)}% of the collection), followed by {material_stats[1][0] if len(material_stats) > 1 else 'other materials'}.

**Chronology:** The artifacts span a temporal range including {chrono_text}. Dating approximately from the 1st to 16th century AD.

**Documentation Status:** {artifacts_with_images} artifacts ({round(artifacts_with_images/total_artifacts*100) if total_artifacts > 0 else 0}%) are photographically documented with a total of {total_media} images. Average metadata completeness is {round(avg_completeness)}%.

**Display Status:** {on_display} artifacts are currently on display, while {in_storage} are in museum storage.

**External Links:** {with_bm_link} artifacts have cross-references with the British Museum Nilgiri collection."""

    return jsonify({
        'collection': collection,
        'collection_name': collection_name,
        'narrative': narrative,
        'totals': {
            'artifacts': total_artifacts,
            'media': total_media,
            'annotations': total_annotations,
            'on_display': on_display,
            'in_storage': in_storage
        },
        'photo_coverage': {
            'with_images': artifacts_with_images,
            'without_images': artifacts_without_images,
            'percentage': round(artifacts_with_images / total_artifacts * 100, 1) if total_artifacts > 0 else 0,
            'total_images': total_media,
            'avg_per_artifact': round(total_media / artifacts_with_images, 1) if artifacts_with_images > 0 else 0
        },
        'missing_photos': [
            {'id': a.id, 'sequence_number': a.sequence_number, 'object_type': a.object_type}
            for a in missing_photos
        ],
        'documentation': {
            'avg_completeness': round(avg_completeness, 1),
            'distribution': completeness_distribution,
            'fields_tracked': completeness_fields
        },
        'materials': [
            {'name': m[0] or 'Not specified', 'count': m[1], 'percentage': round(m[1]/total_artifacts*100, 1)}
            for m in material_stats
        ],
        'object_types': [
            {'name': t[0] or 'Not specified', 'count': t[1], 'percentage': round(t[1]/total_artifacts*100, 1)}
            for t in object_type_stats
        ],
        'chronologies': [
            {'name': c[0] or 'Not specified', 'count': c[1]}
            for c in chronology_stats
        ],
        'findspots': [
            {'name': f[0] or 'Not specified', 'count': f[1]}
            for f in findspot_stats
        ],
        'highlights': {
            'most_photographed': [
                {
                    'id': a.id,
                    'sequence_number': a.sequence_number,
                    'object_type': a.object_type,
                    'image_count': count
                }
                for a, count in highlights_by_images if count > 0
            ],
            'most_annotated': [
                {
                    'id': a.id,
                    'sequence_number': a.sequence_number,
                    'object_type': a.object_type,
                    'annotation_count': count
                }
                for a, count in highlights_with_annotations
            ]
        },
        'cross_references': {
            'british_museum': with_bm_link
        }
    })
