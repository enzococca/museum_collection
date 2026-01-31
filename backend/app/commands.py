"""Flask CLI commands for data management"""

import click
from flask import current_app
from flask.cli import with_appcontext
from .extensions import db
from .models import User, Artifact, Media


@click.command('init-db')
@with_appcontext
def init_db_command():
    """Initialize the database tables."""
    db.create_all()
    click.echo('Database tables created.')


@click.command('create-admin')
@click.option('--email', default='admin@museum.org', help='Admin email')
@click.option('--password', default='admin123', help='Admin password')
@with_appcontext
def create_admin_command(email, password):
    """Create an admin user."""
    from .models import User

    existing = User.query.filter_by(email=email).first()
    if existing:
        click.echo(f'User {email} already exists.')
        return

    user = User(
        email=email,
        first_name='Admin',
        last_name='User',
        role='admin',
        is_active=True
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    click.echo(f'Admin user created: {email}')


@click.command('import-excel')
@click.argument('file_path')
@with_appcontext
def import_excel_command(file_path):
    """Import artifacts from Excel file."""
    from .services.import_service import ImportService

    admin = User.query.filter_by(role='admin').first()
    if not admin:
        click.echo('Error: No admin user found. Run create-admin first.')
        return

    service = ImportService()
    result = service.import_from_excel(file_path, user_id=str(admin.id))

    click.echo(f"Import complete:")
    click.echo(f"  - Imported: {result.get('imported', 0)}")
    click.echo(f"  - Skipped: {result.get('skipped', 0)}")

    if result.get('errors'):
        click.echo(f"  - Errors: {len(result['errors'])}")
        for err in result['errors'][:5]:
            click.echo(f"    - {err}")


@click.command('link-images')
@click.argument('dropbox_path')
@with_appcontext
def link_images_command(dropbox_path):
    """Link existing Dropbox images to artifacts."""
    from .services.import_service import ImportService

    admin = User.query.filter_by(role='admin').first()
    if not admin:
        click.echo('Error: No admin user found. Run create-admin first.')
        return

    service = ImportService()
    result = service.link_existing_images(
        images_base_path=dropbox_path,
        dropbox_base_path=dropbox_path,
        user_id=str(admin.id)
    )

    click.echo(f"Link complete:")
    click.echo(f"  - Linked: {result.get('linked', 0)} images")

    if result.get('errors'):
        click.echo(f"  - Errors: {len(result['errors'])}")


@click.command('db-stats')
@with_appcontext
def db_stats_command():
    """Show database statistics."""
    artifacts = Artifact.query.count()
    media = Media.query.count()
    users = User.query.count()

    click.echo(f"\nDatabase Statistics:")
    click.echo(f"  - Artifacts: {artifacts}")
    click.echo(f"  - Media files: {media}")
    click.echo(f"  - Users: {users}")

    if artifacts > 0:
        click.echo(f"\nRecent artifacts:")
        for a in Artifact.query.order_by(Artifact.created_at.desc()).limit(5).all():
            click.echo(f"  - {a.sequence_number}: {a.object_type or 'Unknown'}")


def register_commands(app):
    """Register CLI commands with the app."""
    app.cli.add_command(init_db_command)
    app.cli.add_command(create_admin_command)
    app.cli.add_command(import_excel_command)
    app.cli.add_command(link_images_command)
    app.cli.add_command(db_stats_command)
