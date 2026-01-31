#!/usr/bin/env python3
"""
Import British Museum Nilgiri collection data into the database.
"""
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import Artifact


def import_british_museum_data(json_file: str, dry_run: bool = False):
    """Import British Museum scraped data into database."""

    app = create_app()

    with app.app_context():
        # Load JSON data
        with open(json_file, 'r') as f:
            objects = json.load(f)

        print(f"Found {len(objects)} objects in {json_file}")

        imported = 0
        skipped = 0
        errors = []

        for i, obj in enumerate(objects):
            # Skip objects without museum number
            museum_number = obj.get('museum_number')
            if not museum_number:
                skipped += 1
                continue

            # Create sequence number (BM_1, BM_2, etc. based on museum number)
            sequence_number = f"BM_{museum_number.replace(',', '_').replace('.', '_')}"

            # Check if already exists
            existing = Artifact.query.filter_by(sequence_number=sequence_number).first()
            if existing:
                print(f"  Skipping {sequence_number} - already exists")
                skipped += 1
                continue

            try:
                # Create artifact
                artifact = Artifact(
                    collection='british',
                    sequence_number=sequence_number,
                    accession_number=museum_number,
                    object_type=obj.get('object_type', obj.get('title', '')),
                    material=obj.get('materials'),
                    size_dimensions=obj.get('dimensions'),
                    description_observation=obj.get('description'),
                    chronology=obj.get('date'),
                    findspot='Nilgiri Hills',
                    production_place='Nilgiri Hills, Tamil Nadu, India',
                    british_museum_url=obj.get('url'),
                    external_links={
                        'british_museum_image': obj.get('image_url')
                    } if obj.get('image_url') else None
                )

                if not dry_run:
                    db.session.add(artifact)
                    db.session.flush()  # Get ID

                imported += 1
                print(f"  [{imported}] Imported: {sequence_number} - {obj.get('title', 'Unknown')}")

            except Exception as e:
                errors.append(f"{sequence_number}: {str(e)}")
                print(f"  Error importing {museum_number}: {e}")

        if not dry_run:
            db.session.commit()
            print(f"\nCommitted {imported} artifacts to database")
        else:
            print(f"\n[DRY RUN] Would import {imported} artifacts")

        print(f"\nSummary:")
        print(f"  Imported: {imported}")
        print(f"  Skipped: {skipped}")
        print(f"  Errors: {len(errors)}")

        if errors:
            print("\nErrors:")
            for err in errors[:10]:  # Show first 10 errors
                print(f"  - {err}")

        return imported


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Import British Museum Nilgiri collection')
    parser.add_argument('--file', '-f',
                       default='british_museum_nilgiri.json',
                       help='JSON file with scraped data')
    parser.add_argument('--dry-run', '-n', action='store_true',
                       help='Show what would be imported without making changes')

    args = parser.parse_args()

    # Find JSON file
    json_file = args.file
    if not os.path.exists(json_file):
        json_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), args.file)

    if not os.path.exists(json_file):
        print(f"Error: Cannot find {args.file}")
        sys.exit(1)

    import_british_museum_data(json_file, dry_run=args.dry_run)
