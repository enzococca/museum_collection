from flask import Blueprint

annotations_bp = Blueprint('annotations', __name__)

from . import routes
