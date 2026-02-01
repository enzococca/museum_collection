"""Thesaurus model for controlled vocabulary management."""

import uuid
from datetime import datetime
from ..extensions import db


class Thesaurus(db.Model):
    """
    Thesaurus table for controlled vocabulary.
    Stores standardized terms for fields like material, object_type, technique, etc.
    """
    __tablename__ = 'thesaurus'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Category: 'material', 'object_type', 'technique', 'chronology', 'collection', etc.
    category = db.Column(db.String(50), nullable=False, index=True)

    # The preferred/canonical term
    term = db.Column(db.String(255), nullable=False)

    # Optional description or scope note
    description = db.Column(db.Text)

    # Alternative terms (synonyms) stored as comma-separated values
    # e.g., "terracota,terra cotta,terra-cotta" for "Terracotta"
    alt_terms = db.Column(db.Text)

    # Parent term ID for hierarchical relationships (optional)
    parent_id = db.Column(db.String(36), db.ForeignKey('thesaurus.id'), nullable=True)

    # Sort order within category
    sort_order = db.Column(db.Integer, default=0)

    # Whether this term is active/visible in dropdowns
    is_active = db.Column(db.Boolean, default=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Self-referential relationship for hierarchy
    children = db.relationship('Thesaurus', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')

    # Unique constraint on category + term
    __table_args__ = (
        db.UniqueConstraint('category', 'term', name='uq_thesaurus_category_term'),
    )

    def to_dict(self):
        """Convert to dictionary."""
        return {
            'id': self.id,
            'category': self.category,
            'term': self.term,
            'description': self.description,
            'alt_terms': self.alt_terms.split(',') if self.alt_terms else [],
            'parent_id': self.parent_id,
            'sort_order': self.sort_order,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<Thesaurus {self.category}: {self.term}>'
