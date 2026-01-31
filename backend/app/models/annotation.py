import uuid
from datetime import datetime
from ..extensions import db


class Annotation(db.Model):
    __tablename__ = 'annotations'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Link to media
    media_id = db.Column(db.String(36), db.ForeignKey('media.id', ondelete='CASCADE'), nullable=False, index=True)

    # Type: rectangle or freehand
    annotation_type = db.Column(db.String(20), nullable=False)  # rectangle, freehand

    # Geometry (JSON)
    # Rectangle: {"x": 100, "y": 150, "width": 200, "height": 150}
    # Freehand: {"points": [[x1,y1], [x2,y2], ...]}
    geometry = db.Column(db.JSON, nullable=False)

    # Styling
    stroke_color = db.Column(db.String(20), default='#ff0000')
    stroke_width = db.Column(db.Integer, default=2)
    stroke_style = db.Column(db.String(20), default='solid')  # solid, dashed
    fill_color = db.Column(db.String(20))
    fill_opacity = db.Column(db.Float, default=0.2)

    # Annotation content
    label = db.Column(db.String(255))
    description = db.Column(db.Text)

    # Sub-metadata for annotated area (JSON)
    extra_data = db.Column(db.JSON)

    # Tracking
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'media_id': self.media_id,
            'annotation_type': self.annotation_type,
            'geometry': self.geometry,
            'stroke_color': self.stroke_color,
            'stroke_width': self.stroke_width,
            'stroke_style': self.stroke_style,
            'fill_color': self.fill_color,
            'fill_opacity': self.fill_opacity,
            'label': self.label,
            'description': self.description,
            'metadata': self.extra_data,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Annotation {self.id} ({self.annotation_type})>'
