from flask import Blueprint

submissions_bp = Blueprint('submissions', __name__)

from . import routes
