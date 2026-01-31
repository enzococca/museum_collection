import uuid
from datetime import datetime
from ..extensions import db


class Media(db.Model):
    __tablename__ = 'media'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Link to artifact
    artifact_id = db.Column(db.String(36), db.ForeignKey('artifacts.id', ondelete='CASCADE'), nullable=False, index=True)

    # File info
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    mime_type = db.Column(db.String(100))
    file_size = db.Column(db.Integer)  # bytes
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)

    # Dropbox paths
    dropbox_path = db.Column(db.String(500), nullable=False)
    thumbnail_path = db.Column(db.String(500))

    # Organization
    folder = db.Column(db.String(100), index=True)  # Group/folder name for organizing images
    tags = db.Column(db.JSON)  # Additional tags/metadata as JSON

    # Display options
    is_primary = db.Column(db.Boolean, default=False)
    caption = db.Column(db.Text)
    sort_order = db.Column(db.Integer, default=0)

    # Tracking
    uploaded_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    annotations = db.relationship('Annotation', backref='media', lazy='dynamic', cascade='all, delete-orphan')

    @property
    def annotation_count(self):
        return self.annotations.count()

    def to_dict(self, include_annotations=False):
        data = {
            'id': self.id,
            'artifact_id': self.artifact_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'mime_type': self.mime_type,
            'file_size': self.file_size,
            'width': self.width,
            'height': self.height,
            'dropbox_path': self.dropbox_path,
            'thumbnail_path': self.thumbnail_path,
            'folder': self.folder,
            'tags': self.tags,
            'is_primary': self.is_primary,
            'caption': self.caption,
            'sort_order': self.sort_order,
            'annotation_count': self.annotation_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        if include_annotations:
            data['annotations'] = [a.to_dict() for a in self.annotations.all()]

        return data

    def __repr__(self):
        return f'<Media {self.filename}>'
