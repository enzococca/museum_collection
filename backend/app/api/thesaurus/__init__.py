from flask import Blueprint

bp = Blueprint('thesaurus', __name__)

from . import routes
