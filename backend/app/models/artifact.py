import uuid
from datetime import datetime
from ..extensions import db


class Artifact(db.Model):
    __tablename__ = 'artifacts'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Museum/Collection identifier
    collection = db.Column(db.String(50), nullable=False, default='chennai', index=True)  # 'chennai' or 'british'

    # Core identifiers (from Excel)
    sequence_number = db.Column(db.String(50), unique=True, nullable=False, index=True)  # CM_1, CM_2...
    accession_number = db.Column(db.String(100), index=True)  # Chennai Museum number
    other_accession_number = db.Column(db.String(255))

    # Display status
    on_display = db.Column(db.Boolean, default=False)

    # Acquisition
    acquisition_details = db.Column(db.Text)

    # Classification
    object_type = db.Column(db.String(255), index=True)
    material = db.Column(db.String(100), index=True)

    # Notes
    remarks = db.Column(db.Text)

    # Physical properties
    size_dimensions = db.Column(db.Text)
    weight = db.Column(db.String(100))
    technique = db.Column(db.String(255))

    # Descriptions
    description_catalogue = db.Column(db.Text)
    description_observation = db.Column(db.Text)

    # Historical data
    inscription = db.Column(db.Text)
    findspot = db.Column(db.String(255))
    production_place = db.Column(db.String(255))
    chronology = db.Column(db.String(255))
    bibliography = db.Column(db.Text)

    # Photo reference
    photo_number = db.Column(db.String(255))

    # External links
    british_museum_url = db.Column(db.String(500))  # Link to British Museum object
    external_links = db.Column(db.JSON)  # Other external references as JSON

    # Tracking
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    updated_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    media_files = db.relationship('Media', backref='artifact', lazy='dynamic', cascade='all, delete-orphan')

    @property
    def primary_media(self):
        """Get primary image or first available"""
        primary = self.media_files.filter_by(is_primary=True).first()
        if primary:
            return primary
        return self.media_files.first()

    @property
    def media_count(self):
        return self.media_files.count()

    def to_dict(self, include_media=False, include_internal=False):
        """
        Convert artifact to dictionary.

        Args:
            include_media: Include media files in response
            include_internal: Include internal documentation fields (photo_number)
                            Set to True for admin/editor views, False for public catalog
        """
        data = {
            'id': self.id,
            'collection': self.collection,
            'sequence_number': self.sequence_number,
            'accession_number': self.accession_number,
            'other_accession_number': self.other_accession_number,
            'on_display': self.on_display,
            'acquisition_details': self.acquisition_details,
            'object_type': self.object_type,
            'material': self.material,
            'remarks': self.remarks,
            'size_dimensions': self.size_dimensions,
            'weight': self.weight,
            'technique': self.technique,
            'description_catalogue': self.description_catalogue,
            'description_observation': self.description_observation,
            'inscription': self.inscription,
            'findspot': self.findspot,
            'production_place': self.production_place,
            'chronology': self.chronology,
            'bibliography': self.bibliography,
            'british_museum_url': self.british_museum_url,
            'external_links': self.external_links,
            'media_count': self.media_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        # Include internal documentation fields only when requested
        if include_internal:
            data['photo_number'] = self.photo_number

        if include_media:
            data['media'] = [m.to_dict() for m in self.media_files.all()]
            primary = self.primary_media
            data['primary_media'] = primary.to_dict() if primary else None

        return data

    def __repr__(self):
        return f'<Artifact {self.sequence_number}>'
