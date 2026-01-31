from datetime import datetime
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import submissions_bp
from ...models import Submission, SubmissionImage, Artifact
from ...extensions import db, mail
from ...services.dropbox_service import DropboxService
from ...services.email_service import send_submission_notification
from ..auth.decorators import editor_required


# =====================
# PUBLIC ENDPOINTS
# =====================

@submissions_bp.route('', methods=['POST'])
def create_submission():
    """Create a new submission (public - no auth required)"""
    data = request.get_json()

    # Validate required fields
    researcher_name = data.get('researcher_name')
    researcher_email = data.get('researcher_email')

    if not researcher_name or not researcher_email:
        return jsonify({'error': 'Researcher name and email required'}), 400

    submission = Submission(
        researcher_name=researcher_name,
        researcher_institution=data.get('researcher_institution'),
        researcher_address=data.get('researcher_address'),
        researcher_email=researcher_email,
        storage_location=data.get('storage_location'),
        object_name=data.get('object_name'),
        dimensions=data.get('dimensions'),
        description=data.get('description'),
        notes=data.get('notes')
    )

    db.session.add(submission)
    db.session.commit()

    return jsonify({
        'id': submission.id,
        'message': 'Submission created successfully',
        'tracking_id': submission.id
    }), 201


@submissions_bp.route('/<submission_id>/images', methods=['POST'])
def upload_submission_image(submission_id):
    """Upload image to submission (public - no auth required)"""
    submission = Submission.query.get(submission_id)

    if not submission:
        return jsonify({'error': 'Submission not found'}), 404

    if submission.status != 'pending':
        return jsonify({'error': 'Cannot add images to processed submission'}), 400

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Check file type
    allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'tif'}
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed_extensions:
        return jsonify({'error': 'File type not allowed'}), 400

    try:
        dropbox_service = DropboxService()
        file_data = file.read()

        result = dropbox_service.upload_submission_file(
            file_data=file_data,
            filename=file.filename,
            submission_id=submission_id
        )

        # Create image record
        image = SubmissionImage(
            submission_id=submission_id,
            filename=result['filename'],
            original_filename=file.filename,
            dropbox_path=result['dropbox_path'],
            thumbnail_path=result.get('thumbnail_path')
        )

        db.session.add(image)
        db.session.commit()

        return jsonify(image.to_dict()), 201

    except Exception as e:
        current_app.logger.error(f'Upload error: {str(e)}')
        return jsonify({'error': 'Upload failed'}), 500


@submissions_bp.route('/<submission_id>/status', methods=['GET'])
def get_submission_status(submission_id):
    """Check submission status (public - no auth required)"""
    submission = Submission.query.get(submission_id)

    if not submission:
        return jsonify({'error': 'Submission not found'}), 404

    return jsonify({
        'id': submission.id,
        'status': submission.status,
        'created_at': submission.created_at.isoformat(),
        'reviewed_at': submission.reviewed_at.isoformat() if submission.reviewed_at else None
    })


# =====================
# AUTHENTICATED ENDPOINTS (Editor+)
# =====================

@submissions_bp.route('', methods=['GET'])
@editor_required
def list_submissions():
    """List all submissions (editor+ only)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Submission.query.order_by(Submission.created_at.desc())

    # Filter by status
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'submissions': [s.to_dict(include_images=True) for s in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page
    })


@submissions_bp.route('/<submission_id>', methods=['GET'])
@editor_required
def get_submission(submission_id):
    """Get submission details (editor+ only)"""
    submission = Submission.query.get(submission_id)

    if not submission:
        return jsonify({'error': 'Submission not found'}), 404

    return jsonify(submission.to_dict(include_images=True))


@submissions_bp.route('/<submission_id>/approve', methods=['POST'])
@editor_required
def approve_submission(submission_id):
    """Approve submission and create artifact (editor+ only)"""
    user_id = get_jwt_identity()
    submission = Submission.query.get(submission_id)

    if not submission:
        return jsonify({'error': 'Submission not found'}), 404

    if submission.status != 'pending':
        return jsonify({'error': 'Submission already processed'}), 400

    data = request.get_json() or {}

    # Generate sequence number
    last_artifact = Artifact.query.order_by(Artifact.sequence_number.desc()).first()
    if last_artifact:
        # Extract number from CM_XX format
        try:
            last_num = int(last_artifact.sequence_number.split('_')[1])
            new_sequence = f"CM_{last_num + 1}"
        except:
            new_sequence = f"CM_{Artifact.query.count() + 1}"
    else:
        new_sequence = "CM_1"

    # Create artifact from submission
    artifact = Artifact(
        sequence_number=data.get('sequence_number', new_sequence),
        object_type=submission.object_name,
        size_dimensions=submission.dimensions,
        description_observation=submission.description,
        remarks=f"Submitted by: {submission.researcher_name}\nStorage: {submission.storage_location}\n{submission.notes or ''}",
        created_by=user_id
    )

    db.session.add(artifact)
    db.session.flush()  # Get artifact ID

    # Move submission images to artifact
    dropbox_service = DropboxService()
    for sub_image in submission.images.all():
        try:
            # Download and re-upload to artifact folder
            image_data = dropbox_service.download_file(sub_image.dropbox_path)
            result = dropbox_service.upload_file(
                file_data=image_data,
                filename=sub_image.original_filename,
                artifact_code=artifact.sequence_number
            )

            from ...models import Media
            media = Media(
                artifact_id=artifact.id,
                filename=result['filename'],
                original_filename=sub_image.original_filename,
                dropbox_path=result['dropbox_path'],
                thumbnail_path=result.get('thumbnail_path'),
                is_primary=(artifact.media_count == 0),
                uploaded_by=user_id
            )
            db.session.add(media)
        except Exception as e:
            current_app.logger.error(f'Error moving image: {str(e)}')

    # Update submission
    submission.status = 'approved'
    submission.artifact_id = artifact.id
    submission.reviewed_by = user_id
    submission.reviewed_at = datetime.utcnow()
    submission.review_notes = data.get('review_notes')

    db.session.commit()

    # Send email notification
    try:
        send_submission_notification(
            email=submission.researcher_email,
            researcher_name=submission.researcher_name,
            status='approved',
            artifact_id=artifact.id
        )
    except Exception as e:
        current_app.logger.error(f'Email notification error: {str(e)}')

    return jsonify({
        'message': 'Submission approved',
        'artifact': artifact.to_dict()
    })


@submissions_bp.route('/<submission_id>/reject', methods=['POST'])
@editor_required
def reject_submission(submission_id):
    """Reject submission (editor+ only)"""
    user_id = get_jwt_identity()
    submission = Submission.query.get(submission_id)

    if not submission:
        return jsonify({'error': 'Submission not found'}), 404

    if submission.status != 'pending':
        return jsonify({'error': 'Submission already processed'}), 400

    data = request.get_json() or {}

    submission.status = 'rejected'
    submission.reviewed_by = user_id
    submission.reviewed_at = datetime.utcnow()
    submission.review_notes = data.get('review_notes', 'Submission rejected')

    db.session.commit()

    # Send email notification
    try:
        send_submission_notification(
            email=submission.researcher_email,
            researcher_name=submission.researcher_name,
            status='rejected',
            reason=submission.review_notes
        )
    except Exception as e:
        current_app.logger.error(f'Email notification error: {str(e)}')

    return jsonify({'message': 'Submission rejected'})
