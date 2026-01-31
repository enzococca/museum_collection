import pandas as pd
from flask import current_app
from ..models import Artifact, Media, User
from ..extensions import db


class ImportService:
    """Service for importing data from Excel files"""

    # Column mapping from Excel to database fields
    # Based on: CHENNAI_MUSEUM_artefact-documentation L_D_U.xlsx
    COLUMN_MAPPING = {
        'Sequence number (our own)': 'sequence_number',
        'Accession No. Chennai Museum': 'accession_number',
        'Other accession number (if any) or which group in Chennai record': 'other_accession_number',
        'On display (Y/N)': 'on_display',
        'Acquisition name': 'acquisition_details',
        'Object type': 'object_type',
        ' Materials': 'material',  # Note: has leading space in Excel
        'Comments': 'remarks',
        'Dimensions\na) max overall dimension (height x width x lenght)\nb) other meaningful': 'size_dimensions',
        'Weight': 'weight',
        'Technique': 'technique',
        'Description from museum catalogue (if any)': 'description_catalogue',
        'Description': 'description_observation',
        'Inscription': 'inscription',
        'Findspot (if known)': 'findspot',
        'Production place': 'production_place',
        'Cultures/Periods': 'chronology',
        'Bibliography': 'bibliography',
        'PHOTO NUMBER': 'photo_number'
    }

    # Columns to exclude from public catalog (internal documentation notes)
    INTERNAL_ONLY_COLUMNS = ['PHOTO NUMBER']

    def import_from_excel(self, file_path: str, user_id: str = None) -> dict:
        """Import artifacts from Excel file"""
        current_app.logger.info(f'Starting import from {file_path}')

        try:
            df = pd.read_excel(file_path)
        except Exception as e:
            current_app.logger.error(f'Failed to read Excel: {str(e)}')
            return {'success': False, 'error': str(e)}

        imported = 0
        skipped = 0
        errors = []

        for idx, row in df.iterrows():
            try:
                # Get sequence number
                seq_num = row.get('Sequence number (our own)')
                if pd.isna(seq_num) or not seq_num:
                    skipped += 1
                    continue

                seq_num = str(seq_num).strip()

                # Check if already exists
                if Artifact.query.filter_by(sequence_number=seq_num).first():
                    skipped += 1
                    continue

                # Create artifact with column mapping from Excel
                artifact = Artifact(
                    sequence_number=seq_num,
                    accession_number=self._clean_value(row.get('Accession No. Chennai Museum')),
                    other_accession_number=self._clean_value(row.get(
                        'Other accession number (if any) or which group in Chennai record'
                    )),
                    on_display=self._parse_boolean(row.get('On display (Y/N)')),
                    acquisition_details=self._clean_value(row.get('Acquisition name')),
                    object_type=self._clean_value(row.get('Object type')),
                    material=self._clean_value(row.get(' Materials')),  # Leading space in Excel
                    remarks=self._clean_value(row.get('Comments')),
                    size_dimensions=self._clean_value(row.get(
                        'Dimensions\na) max overall dimension (height x width x lenght)\nb) other meaningful'
                    )),
                    weight=self._clean_value(row.get('Weight')),
                    technique=self._clean_value(row.get('Technique')),
                    description_catalogue=self._clean_value(row.get(
                        'Description from museum catalogue (if any)'
                    )),
                    description_observation=self._clean_value(row.get('Description')),
                    inscription=self._clean_value(row.get('Inscription')),
                    findspot=self._clean_value(row.get('Findspot (if known)')),
                    production_place=self._clean_value(row.get('Production place')),
                    chronology=self._clean_value(row.get('Cultures/Periods')),
                    bibliography=self._clean_value(row.get('Bibliography')),
                    photo_number=self._clean_value(row.get('PHOTO NUMBER')),
                    created_by=user_id
                )

                db.session.add(artifact)
                imported += 1

            except Exception as e:
                errors.append(f'Row {idx + 2}: {str(e)}')
                current_app.logger.error(f'Error importing row {idx + 2}: {str(e)}')

        db.session.commit()

        result = {
            'success': True,
            'imported': imported,
            'skipped': skipped,
            'errors': errors
        }

        current_app.logger.info(f'Import complete: {imported} imported, {skipped} skipped')
        return result

    def link_existing_images(self, images_base_path: str, dropbox_base_path: str, user_id: str = None) -> dict:
        """Link existing Dropbox images to artifacts based on folder names"""
        from .dropbox_service import DropboxService

        linked = 0
        errors = []

        try:
            dropbox = DropboxService()

            # List folders in the images directory
            entries = dropbox.list_folder(dropbox_base_path)

            for entry in entries:
                if not hasattr(entry, 'name'):
                    continue

                folder_name = entry.name

                # Try to match folder name to artifact
                # Folders are named like: CM_1, CM_2, "CM_1, CM_2", etc.
                artifact_codes = self._extract_artifact_codes(folder_name)

                for code in artifact_codes:
                    artifact = Artifact.query.filter_by(sequence_number=code).first()
                    if not artifact:
                        continue

                    # List images in this folder
                    folder_path = f"{dropbox_base_path}/{folder_name}"
                    try:
                        images = dropbox.list_folder(folder_path)

                        for img in images:
                            if not hasattr(img, 'name'):
                                continue

                            # Only process image files
                            ext = img.name.rsplit('.', 1)[-1].lower() if '.' in img.name else ''
                            if ext not in {'jpg', 'jpeg', 'png', 'gif', 'tiff', 'tif'}:
                                continue

                            # Check if already linked
                            img_path = f"{folder_path}/{img.name}"
                            existing = Media.query.filter_by(dropbox_path=img_path).first()
                            if existing:
                                continue

                            # Create media record
                            media = Media(
                                artifact_id=artifact.id,
                                filename=img.name,
                                original_filename=img.name,
                                dropbox_path=img_path,
                                is_primary=(artifact.media_count == 0),
                                uploaded_by=user_id
                            )
                            db.session.add(media)
                            linked += 1

                    except Exception as e:
                        errors.append(f'Folder {folder_name}: {str(e)}')

            db.session.commit()

        except Exception as e:
            errors.append(f'General error: {str(e)}')

        return {
            'success': True,
            'linked': linked,
            'errors': errors
        }

    def _clean_value(self, value):
        """Clean and return value, or None if empty/NaN"""
        if pd.isna(value):
            return None
        if isinstance(value, str):
            value = value.strip()
            return value if value else None
        return str(value) if value else None

    def _parse_boolean(self, value) -> bool:
        """Parse Yes/No/Y/N to boolean"""
        if pd.isna(value):
            return False
        value = str(value).strip().upper()
        return value in ('YES', 'Y', 'TRUE', '1')

    def _extract_artifact_codes(self, folder_name: str) -> list:
        """Extract artifact codes from folder name like 'CM_1, CM_2' or 'CM_1'"""
        import re
        codes = re.findall(r'CM_\d+', folder_name, re.IGNORECASE)
        return [c.upper().replace('C_M', 'CM_') for c in codes]
