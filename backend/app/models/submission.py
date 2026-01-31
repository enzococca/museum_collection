import uuid
from datetime import datetime
from ..extensions import db


class Submission(db.Model):
    """External researcher submissions"""
    __tablename__ = 'submissions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Status
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected

    # Researcher info
    researcher_name = db.Column(db.String(255), nullable=False)
    researcher_institution = db.Column(db.String(255))
    researcher_address = db.Column(db.Text)
    researcher_email = db.Column(db.String(255), nullable=False)

    # Artifact info (as submitted)
    storage_location = db.Column(db.String(255))  # "Cab 65 shelf 5"
    object_name = db.Column(db.String(255))  # "Porcine head"
    dimensions = db.Column(db.Text)  # "Maximum length 10.7 cm"
    description = db.Column(db.Text)
    notes = db.Column(db.Text)

    # Linked artifact (after approval)
    artifact_id = db.Column(db.String(36), db.ForeignKey('artifacts.id'))

    # Review info
    reviewed_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    reviewed_at = db.Column(db.DateTime)
    review_notes = db.Column(db.Text)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    images = db.relationship('SubmissionImage', backref='submission', lazy='dynamic', cascade='all, delete-orphan')
    artifact = db.relationship('Artifact', backref='submission')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])

    @property
    def image_count(self):
        return self.images.count()

    def to_dict(self, include_images=False):
        data = {
            'id': self.id,
            'status': self.status,
            'researcher_name': self.researcher_name,
            'researcher_institution': self.researcher_institution,
            'researcher_address': self.researcher_address,
            'researcher_email': self.researcher_email,
            'storage_location': self.storage_location,
            'object_name': self.object_name,
            'dimensions': self.dimensions,
            'description': self.description,
            'notes': self.notes,
            'artifact_id': self.artifact_id,
            'reviewed_by': self.reviewed_by,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'review_notes': self.review_notes,
            'image_count': self.image_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        if include_images:
            data['images'] = [img.to_dict() for img in self.images.all()]

        return data

    def __repr__(self):
        return f'<Submission {self.id} from {self.researcher_name}>'


class SubmissionImage(db.Model):
    """Images attached to submissions"""
    __tablename__ = 'submission_images'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = db.Column(db.String(36), db.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False, index=True)

    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255))
    dropbox_path = db.Column(db.String(500), nullable=False)
    thumbnail_path = db.Column(db.String(500))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'dropbox_path': self.dropbox_path,
            'thumbnail_path': self.thumbnail_path,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<SubmissionImage {self.filename}>'
