from flask import Blueprint

artifacts_bp = Blueprint('artifacts', __name__)

from . import routes
