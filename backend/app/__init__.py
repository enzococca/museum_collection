import os
from flask import Flask, jsonify
from dotenv import load_dotenv

# Load .env file before importing config
load_dotenv()

from .config import config
from .extensions import db, migrate, jwt, ma, mail, cors


def create_app(config_name=None):
    """Application factory"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    mail.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})

    # Register blueprints
    from .api.auth import auth_bp
    from .api.users import users_bp
    from .api.artifacts import artifacts_bp
    from .api.media import media_bp
    from .api.annotations import annotations_bp
    from .api.search import search_bp
    from .api.export import export_bp
    from .api.stats import stats_bp
    from .api.submissions import submissions_bp
    from .api.analytics import analytics_bp
    from .api.thesaurus import bp as thesaurus_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(artifacts_bp, url_prefix='/api/artifacts')
    app.register_blueprint(media_bp, url_prefix='/api/media')
    app.register_blueprint(annotations_bp, url_prefix='/api/annotations')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(export_bp, url_prefix='/api/export')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(submissions_bp, url_prefix='/api/submissions')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(thesaurus_bp, url_prefix='/api/thesaurus')

    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy'}), 200

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authorization required'}), 401

    # Register CLI commands
    from .commands import register_commands
    register_commands(app)

    return app
