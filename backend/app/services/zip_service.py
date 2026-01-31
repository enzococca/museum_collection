import zipfile
import io
import json
from flask import current_app
from .dropbox_service import DropboxService


class ZipService:
    def __init__(self):
        self.dropbox = DropboxService()

    def create_zip(self, artifacts: list, include_metadata: bool = True) -> bytes:
        """Create a ZIP file with images and optional metadata"""
        buffer = io.BytesIO()

        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for artifact in artifacts:
                folder_name = f"{artifact.sequence_number}"

                # Add images
                for media in artifact.media_files.all():
                    try:
                        img_data = self.dropbox.download_file(media.dropbox_path)
                        zf.writestr(
                            f"{folder_name}/{media.original_filename}",
                            img_data
                        )
                    except Exception as e:
                        current_app.logger.error(
                            f'Error downloading {media.dropbox_path}: {str(e)}'
                        )

                # Add metadata JSON
                if include_metadata:
                    metadata = {
                        'id': artifact.id,
                        'sequence_number': artifact.sequence_number,
                        'accession_number': artifact.accession_number,
                        'other_accession_number': artifact.other_accession_number,
                        'on_display': artifact.on_display,
                        'object_type': artifact.object_type,
                        'material': artifact.material,
                        'size_dimensions': artifact.size_dimensions,
                        'weight': artifact.weight,
                        'technique': artifact.technique,
                        'description_catalogue': artifact.description_catalogue,
                        'description_observation': artifact.description_observation,
                        'inscription': artifact.inscription,
                        'findspot': artifact.findspot,
                        'production_place': artifact.production_place,
                        'chronology': artifact.chronology,
                        'bibliography': artifact.bibliography,
                        'remarks': artifact.remarks,
                        'images': [
                            {
                                'filename': m.original_filename,
                                'caption': m.caption,
                                'is_primary': m.is_primary
                            }
                            for m in artifact.media_files.all()
                        ]
                    }
                    zf.writestr(
                        f"{folder_name}/metadata.json",
                        json.dumps(metadata, indent=2, ensure_ascii=False)
                    )

        buffer.seek(0)
        return buffer.read()
