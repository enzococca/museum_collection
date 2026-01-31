from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def role_required(*allowed_roles):
    """Decorator to require specific roles"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get('role', 'viewer')

            # Admin can do everything
            if user_role == 'admin' or user_role in allowed_roles:
                return fn(*args, **kwargs)

            return jsonify({'error': 'Insufficient permissions'}), 403
        return wrapper
    return decorator


def admin_required(fn):
    """Require admin role"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


def editor_required(fn):
    """Require editor or admin role"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') not in ('admin', 'editor'):
            return jsonify({'error': 'Editor access required'}), 403
        return fn(*args, **kwargs)
    return wrapper
