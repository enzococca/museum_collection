import os
from flask import request, jsonify, current_app, send_file, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import media_bp
from ...models import Media, Artifact
from ...extensions import db
from ...services.dropbox_service import DropboxService
from ..auth.decorators import editor_required


@media_bp.route('/upload', methods=['POST'])
@editor_required
def upload_media():
    """Upload media file to Dropbox"""
    user_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    artifact_id = request.form.get('artifact_id')

    if not artifact_id:
        return jsonify({'error': 'Artifact ID required'}), 400

    artifact = Artifact.query.get(artifact_id)
    if not artifact:
        return jsonify({'error': 'Artifact not found'}), 404

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Check file type
    allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'tif'}
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed_extensions:
        return jsonify({'error': f'File type not allowed. Allowed: {", ".join(allowed_extensions)}'}), 400

    try:
        # Upload to Dropbox
        dropbox_service = DropboxService()
        file_data = file.read()

        result = dropbox_service.upload_file(
            file_data=file_data,
            filename=file.filename,
            artifact_code=artifact.sequence_number
        )

        # Create media record
        media = Media(
            artifact_id=artifact_id,
            filename=result['filename'],
            original_filename=file.filename,
            mime_type=file.content_type,
            file_size=len(file_data),
            width=result.get('width'),
            height=result.get('height'),
            dropbox_path=result['dropbox_path'],
            thumbnail_path=result.get('thumbnail_path'),
            folder=request.form.get('folder'),  # Optional folder/group
            caption=request.form.get('caption'),  # Optional caption
            is_primary=(artifact.media_count == 0),  # First image is primary
            uploaded_by=user_id
        )

        db.session.add(media)
        db.session.commit()

        return jsonify(media.to_dict()), 201

    except Exception as e:
        current_app.logger.error(f'Upload error: {str(e)}')
        return jsonify({'error': 'Upload failed'}), 500


@media_bp.route('/<media_id>', methods=['GET'])
@jwt_required()
def get_media(media_id):
    """Get media details"""
    media = Media.query.get(media_id)

    if not media:
        return jsonify({'error': 'Media not found'}), 404

    return jsonify(media.to_dict(include_annotations=True))


@media_bp.route('/<media_id>/url', methods=['GET'])
@jwt_required()
def get_media_url(media_id):
    """Get temporary Dropbox URL for media"""
    media = Media.query.get(media_id)

    if not media:
        return jsonify({'error': 'Media not found'}), 404

    try:
        dropbox_service = DropboxService()
        url = dropbox_service.get_temporary_link(media.dropbox_path)

        thumbnail_url = None
        if media.thumbnail_path:
            thumbnail_url = dropbox_service.get_temporary_link(media.thumbnail_path)

        return jsonify({
            'url': url,
            'thumbnail_url': thumbnail_url
        })
    except Exception as e:
        current_app.logger.error(f'Get URL error: {str(e)}')
        return jsonify({'error': 'Failed to get URL'}), 500


@media_bp.route('/<media_id>/image', methods=['GET'])
@jwt_required(optional=True)
def get_media_image(media_id):
    """Serve media image directly (proxy for Dropbox or local files)"""
    media = Media.query.get(media_id)

    if not media:
        return jsonify({'error': 'Media not found'}), 404

    try:
        # Check if using local media storage
        if current_app.config.get('USE_LOCAL_MEDIA'):
            local_path = current_app.config.get('LOCAL_MEDIA_PATH')
            if local_path and media.dropbox_path:
                # Convert dropbox path to local path
                # /NILGIRI 2025/.../file.jpg -> local_path/file.jpg
                filename = os.path.basename(media.dropbox_path)
                # Try to preserve folder structure
                relative_path = media.dropbox_path.split('PHOTOGRAPHS_CHENNAI-MUSEUM/')[-1] if 'PHOTOGRAPHS_CHENNAI-MUSEUM/' in media.dropbox_path else filename
                file_path = os.path.join(local_path, relative_path)

                if os.path.exists(file_path):
                    return send_file(file_path)

        # Fall back to Dropbox
        dropbox_service = DropboxService()
        file_data = dropbox_service.download_file(media.dropbox_path)

        # Determine mime type
        ext = media.dropbox_path.rsplit('.', 1)[-1].lower() if '.' in media.dropbox_path else 'jpg'
        mime_types = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'png': 'image/png', 'gif': 'image/gif',
            'webp': 'image/webp', 'tiff': 'image/tiff', 'tif': 'image/tiff'
        }
        mime_type = mime_types.get(ext, 'image/jpeg')

        return Response(file_data, mimetype=mime_type)

    except Exception as e:
        current_app.logger.error(f'Get image error: {str(e)}')
        return jsonify({'error': 'Failed to load image'}), 500


@media_bp.route('/<media_id>/thumbnail', methods=['GET'])
@jwt_required(optional=True)
def get_media_thumbnail(media_id):
    """Serve media thumbnail directly"""
    media = Media.query.get(media_id)

    if not media:
        return jsonify({'error': 'Media not found'}), 404

    try:
        # Check if using local media storage
        if current_app.config.get('USE_LOCAL_MEDIA'):
            local_path = current_app.config.get('LOCAL_MEDIA_PATH')
            if local_path and media.dropbox_path:
                filename = os.path.basename(media.dropbox_path)
                relative_path = media.dropbox_path.split('PHOTOGRAPHS_CHENNAI-MUSEUM/')[-1] if 'PHOTOGRAPHS_CHENNAI-MUSEUM/' in media.dropbox_path else filename
                file_path = os.path.join(local_path, relative_path)

                if os.path.exists(file_path):
                    # For local, serve same file (could add thumbnail generation)
                    return send_file(file_path)

        # Fall back to Dropbox thumbnail or main image
        dropbox_service = DropboxService()

        if media.thumbnail_path:
            file_data = dropbox_service.download_file(media.thumbnail_path)
        else:
            file_data = dropbox_service.download_file(media.dropbox_path)

        return Response(file_data, mimetype='image/jpeg')

    except Exception as e:
        current_app.logger.error(f'Get thumbnail error: {str(e)}')
        return jsonify({'error': 'Failed to load thumbnail'}), 500


@media_bp.route('/<media_id>/primary', methods=['PUT'])
@editor_required
def set_primary(media_id):
    """Set media as primary image for artifact"""
    media = Media.query.get(media_id)

    if not media:
        return jsonify({'error': 'Media not found'}), 404

    # Unset other primary
    Media.query.filter_by(artifact_id=media.artifact_id, is_primary=True).update({'is_primary': False})

    # Set this as primary
    media.is_primary = True
    db.session.commit()

    return jsonify(media.to_dict())


@media_bp.route('/<media_id>', methods=['PUT'])
@editor_required
def update_media(media_id):
    """Update media details"""
    media = Media.query.get(media_id)

    if not media:
        return jsonify({'error': 'Media not found'}), 404

    data = request.get_json()

    if 'caption' in data:
        media.caption = data['caption']
    if 'folder' in data:
        media.folder = data['folder']
    if 'tags' in data:
        media.tags = data['tags']
    if 'sort_order' in data:
        media.sort_order = data['sort_order']

    db.session.commit()

    return jsonify(media.to_dict())


@media_bp.route('/<media_id>', methods=['DELETE'])
@editor_required
def delete_media(media_id):
    """Delete media file"""
    media = Media.query.get(media_id)

    if not media:
        return jsonify({'error': 'Media not found'}), 404

    try:
        # Delete from Dropbox
        dropbox_service = DropboxService()
        dropbox_service.delete_file(media.dropbox_path)
        if media.thumbnail_path:
            dropbox_service.delete_file(media.thumbnail_path)
    except Exception as e:
        current_app.logger.error(f'Dropbox delete error: {str(e)}')

    # Delete from database
    db.session.delete(media)
    db.session.commit()

    return jsonify({'message': 'Media deleted'})


@media_bp.route('/folders', methods=['GET'])
@jwt_required()
def get_all_folders():
    """Get all unique folders across all media"""
    folders = db.session.query(Media.folder).filter(
        Media.folder.isnot(None),
        Media.folder != ''
    ).distinct().order_by(Media.folder).all()

    folder_list = [f[0] for f in folders if f[0]]

    return jsonify({
        'folders': folder_list
    })


@media_bp.route('/folders/<artifact_id>', methods=['GET'])
@jwt_required()
def get_folders(artifact_id):
    """Get all folders for an artifact's media"""
    artifact = Artifact.query.get(artifact_id)
    if not artifact:
        return jsonify({'error': 'Artifact not found'}), 404

    # Get distinct folders
    folders = db.session.query(Media.folder).filter(
        Media.artifact_id == artifact_id,
        Media.folder.isnot(None)
    ).distinct().all()

    folder_list = [f[0] for f in folders if f[0]]

    # Get media count per folder
    folder_stats = []
    for folder_name in folder_list:
        count = Media.query.filter_by(artifact_id=artifact_id, folder=folder_name).count()
        folder_stats.append({'name': folder_name, 'count': count})

    # Also count unfiled media
    unfiled_count = Media.query.filter(
        Media.artifact_id == artifact_id,
        db.or_(Media.folder.is_(None), Media.folder == '')
    ).count()

    return jsonify({
        'folders': folder_stats,
        'unfiled_count': unfiled_count
    })


@media_bp.route('/bulk-update', methods=['PUT'])
@editor_required
def bulk_update_media():
    """Bulk update media (e.g., assign folder to multiple images)"""
    data = request.get_json()

    media_ids = data.get('media_ids', [])
    if not media_ids:
        return jsonify({'error': 'No media IDs provided'}), 400

    updates = {}
    if 'folder' in data:
        updates['folder'] = data['folder']
    if 'tags' in data:
        updates['tags'] = data['tags']

    if not updates:
        return jsonify({'error': 'No updates provided'}), 400

    # Update all matching media
    Media.query.filter(Media.id.in_(media_ids)).update(updates, synchronize_session=False)
    db.session.commit()

    return jsonify({
        'message': f'Updated {len(media_ids)} media items',
        'updated': len(media_ids)
    })
