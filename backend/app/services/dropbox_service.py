import dropbox
from dropbox.files import WriteMode
from flask import current_app
import uuid
import os
from PIL import Image
import io


class DropboxService:
    def __init__(self):
        self.use_local = current_app.config.get('USE_LOCAL_MEDIA', False)
        self.local_path = current_app.config.get('LOCAL_MEDIA_PATH')

        # Only initialize Dropbox if we have a token and not using local
        token = current_app.config.get('DROPBOX_ACCESS_TOKEN')
        if token and not self.use_local:
            self.dbx = dropbox.Dropbox(token)
        else:
            self.dbx = None

        self.base_path = current_app.config.get(
            'DROPBOX_BASE_PATH',
            '/NILGIRI 2025/MUSEUM COLLECTIONS/CHENNAI MUSEUM'
        )

    def upload_file(self, file_data: bytes, filename: str, artifact_code: str) -> dict:
        """Upload a file to Dropbox and return file info"""
        # Generate unique filename
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'jpg'
        unique_name = f"{uuid.uuid4().hex}.{ext}"

        # Full path in Dropbox
        dropbox_path = f"{self.base_path}/PHOTOGRAPHS_CHENNAI-MUSEUM/{artifact_code}/{unique_name}"

        # Upload file
        result = self.dbx.files_upload(
            file_data,
            dropbox_path,
            mode=WriteMode.overwrite
        )

        # Get image dimensions
        width, height = None, None
        thumbnail_path = None

        if self._is_image(filename):
            try:
                img = Image.open(io.BytesIO(file_data))
                width, height = img.size
                thumbnail_path = self._create_thumbnail(
                    file_data, artifact_code, unique_name
                )
            except Exception as e:
                current_app.logger.error(f'Image processing error: {str(e)}')

        return {
            'filename': unique_name,
            'dropbox_path': result.path_display,
            'dropbox_file_id': result.id,
            'thumbnail_path': thumbnail_path,
            'size': result.size,
            'width': width,
            'height': height
        }

    def upload_submission_file(self, file_data: bytes, filename: str, submission_id: str) -> dict:
        """Upload a submission file to Dropbox"""
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'jpg'
        unique_name = f"{uuid.uuid4().hex}.{ext}"

        # Submissions go to a separate folder
        dropbox_path = f"{self.base_path}/SUBMISSIONS/{submission_id}/{unique_name}"

        result = self.dbx.files_upload(
            file_data,
            dropbox_path,
            mode=WriteMode.overwrite
        )

        thumbnail_path = None
        if self._is_image(filename):
            try:
                thumbnail_path = self._create_thumbnail(
                    file_data, f"submissions/{submission_id}", unique_name
                )
            except Exception:
                pass

        return {
            'filename': unique_name,
            'dropbox_path': result.path_display,
            'thumbnail_path': thumbnail_path
        }

    def _create_thumbnail(self, file_data: bytes, folder: str, filename: str) -> str:
        """Create and upload a thumbnail"""
        try:
            img = Image.open(io.BytesIO(file_data))

            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')

            img.thumbnail((300, 300), Image.Resampling.LANCZOS)

            thumb_buffer = io.BytesIO()
            img.save(thumb_buffer, format='JPEG', quality=85)
            thumb_buffer.seek(0)

            # Thumbnail path
            thumb_name = f"thumb_{filename.rsplit('.', 1)[0]}.jpg"
            thumb_path = f"{self.base_path}/thumbnails/{folder}/{thumb_name}"

            self.dbx.files_upload(
                thumb_buffer.read(),
                thumb_path,
                mode=WriteMode.overwrite
            )

            return thumb_path
        except Exception as e:
            current_app.logger.error(f'Thumbnail creation error: {str(e)}')
            return None

    def get_temporary_link(self, dropbox_path: str) -> str:
        """Get a temporary download link (valid for 4 hours)"""
        # For local storage, we can't provide a direct link
        # The frontend should use the /image endpoint instead
        if self.use_local:
            raise Exception('Use direct image endpoint for local storage')

        if not self.dbx:
            raise Exception('Dropbox not configured')

        result = self.dbx.files_get_temporary_link(dropbox_path)
        return result.link

    def delete_file(self, dropbox_path: str):
        """Delete a file from Dropbox"""
        try:
            self.dbx.files_delete_v2(dropbox_path)
        except dropbox.exceptions.ApiError:
            pass  # File might already be deleted

    def download_file(self, dropbox_path: str) -> bytes:
        """Download a file from Dropbox or local storage"""
        # Try local storage first if configured
        if self.use_local and self.local_path:
            local_file = self._get_local_path(dropbox_path)
            if local_file and os.path.exists(local_file):
                with open(local_file, 'rb') as f:
                    return f.read()

        # Fall back to Dropbox
        if self.dbx:
            _, response = self.dbx.files_download(dropbox_path)
            return response.content

        raise Exception('No storage backend available (configure Dropbox or local media path)')

    def _get_local_path(self, dropbox_path: str) -> str:
        """Convert Dropbox path to local file path"""
        if not self.local_path:
            return None

        # Extract relative path after PHOTOGRAPHS_CHENNAI-MUSEUM/
        if 'PHOTOGRAPHS_CHENNAI-MUSEUM/' in dropbox_path:
            relative_path = dropbox_path.split('PHOTOGRAPHS_CHENNAI-MUSEUM/')[-1]
        else:
            relative_path = os.path.basename(dropbox_path)

        return os.path.join(self.local_path, relative_path)

    def list_folder(self, path: str) -> list:
        """List files in a Dropbox folder or local directory"""
        # Try local storage first
        if self.use_local and self.local_path:
            local_dir = self._get_local_path(path)
            if local_dir and os.path.isdir(local_dir):
                entries = []
                for name in os.listdir(local_dir):
                    # Create a simple object with name attribute like Dropbox entries
                    class LocalEntry:
                        def __init__(self, n):
                            self.name = n
                    entries.append(LocalEntry(name))
                return entries

        # Fall back to Dropbox
        if not self.dbx:
            return []

        try:
            result = self.dbx.files_list_folder(path)
            return result.entries
        except dropbox.exceptions.ApiError:
            return []

    def _is_image(self, filename: str) -> bool:
        """Check if file is an image based on extension"""
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        return ext in {'jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'tif'}
