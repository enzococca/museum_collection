#!/usr/bin/env python3
"""
Script to import existing museum collection data from Excel file and link images.

Usage:
    python scripts/import_data.py --excel /path/to/excel.xlsx
    python scripts/import_data.py --link-images /NILGIRI 2025/MUSEUM COLLECTIONS/CHENNAI MUSEUM/PHOTOGRAPHS_CHENNAI-MUSEUM

Or run both:
    python scripts/import_data.py --all
"""

import os
import sys
import argparse

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import User, Artifact, Media
from app.services.import_service import ImportService


# Default paths
DEFAULT_EXCEL = '/Volumes/Extreme Pro/Dropbox/Dropbox/NILGIRI 2025/MUSEUM COLLECTIONS/CHENNAI MUSEUM/CHENNAI_MUSEUM_artefact-documentation L_D_U.xlsx'
DEFAULT_DROPBOX_IMAGES = '/NILGIRI 2025/MUSEUM COLLECTIONS/CHENNAI MUSEUM/PHOTOGRAPHS_CHENNAI-MUSEUM'


def get_admin_user():
    """Get or create admin user for import"""
    admin = User.query.filter_by(role='admin').first()
    if not admin:
        print("Creating default admin user...")
        admin = User(
            email='admin@museum.org',
            first_name='Admin',
            last_name='User',
            role='admin',
            is_active=True
        )
        admin.set_password('admin123')  # Change this!
        db.session.add(admin)
        db.session.commit()
        print(f"Created admin user: admin@museum.org (password: admin123)")
    return admin


def import_excel(excel_path: str):
    """Import artifacts from Excel file"""
    print(f"\n{'='*60}")
    print("IMPORTING ARTIFACTS FROM EXCEL")
    print(f"{'='*60}")
    print(f"File: {excel_path}")

    if not os.path.exists(excel_path):
        print(f"ERROR: Excel file not found at {excel_path}")
        return False

    admin = get_admin_user()
    service = ImportService()

    result = service.import_from_excel(excel_path, user_id=str(admin.id))

    print(f"\nResults:")
    print(f"  - Imported: {result.get('imported', 0)} artifacts")
    print(f"  - Skipped: {result.get('skipped', 0)} (already exist or empty)")

    if result.get('errors'):
        print(f"  - Errors: {len(result['errors'])}")
        for err in result['errors'][:10]:
            print(f"    - {err}")
        if len(result['errors']) > 10:
            print(f"    ... and {len(result['errors']) - 10} more")

    return result.get('success', False)


def link_images(dropbox_path: str):
    """Link existing Dropbox images to artifacts"""
    print(f"\n{'='*60}")
    print("LINKING EXISTING IMAGES")
    print(f"{'='*60}")
    print(f"Dropbox path: {dropbox_path}")

    admin = get_admin_user()
    service = ImportService()

    result = service.link_existing_images(
        images_base_path=dropbox_path,
        dropbox_base_path=dropbox_path,
        user_id=str(admin.id)
    )

    print(f"\nResults:")
    print(f"  - Linked: {result.get('linked', 0)} images")

    if result.get('errors'):
        print(f"  - Errors: {len(result['errors'])}")
        for err in result['errors'][:10]:
            print(f"    - {err}")

    return result.get('success', False)


def show_stats():
    """Show current database statistics"""
    print(f"\n{'='*60}")
    print("DATABASE STATISTICS")
    print(f"{'='*60}")

    artifacts = Artifact.query.count()
    media = Media.query.count()
    users = User.query.count()

    print(f"  - Artifacts: {artifacts}")
    print(f"  - Media files: {media}")
    print(f"  - Users: {users}")

    # Show some samples
    if artifacts > 0:
        print(f"\nSample artifacts:")
        for a in Artifact.query.limit(5).all():
            print(f"  - {a.sequence_number}: {a.object_type or 'Unknown type'} ({a.media_count} images)")


def main():
    parser = argparse.ArgumentParser(description='Import museum collection data')
    parser.add_argument('--excel', type=str, help='Path to Excel file')
    parser.add_argument('--link-images', type=str, help='Dropbox path to images folder')
    parser.add_argument('--all', action='store_true', help='Run full import with default paths')
    parser.add_argument('--stats', action='store_true', help='Show database statistics')

    args = parser.parse_args()

    # Create Flask app context
    app = create_app()

    with app.app_context():
        if args.stats:
            show_stats()
            return

        if args.all:
            # Run full import
            import_excel(DEFAULT_EXCEL)
            link_images(DEFAULT_DROPBOX_IMAGES)
            show_stats()
            return

        if args.excel:
            import_excel(args.excel)

        if args.link_images:
            link_images(args.link_images)

        if not any([args.excel, args.link_images, args.all, args.stats]):
            parser.print_help()
            print("\n\nQuick start:")
            print(f"  python scripts/import_data.py --all")
            print(f"\nThis will import from:")
            print(f"  Excel: {DEFAULT_EXCEL}")
            print(f"  Images: {DEFAULT_DROPBOX_IMAGES}")


if __name__ == '__main__':
    main()
