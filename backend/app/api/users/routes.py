from flask import request, jsonify
from flask_jwt_extended import jwt_required
from . import users_bp
from ...models import User
from ...extensions import db
from ..auth.decorators import admin_required


@users_bp.route('', methods=['GET'])
@admin_required
def list_users():
    """List all users (admin only)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = User.query.order_by(User.created_at.desc())

    # Filter by role
    role = request.args.get('role')
    if role:
        query = query.filter_by(role=role)

    # Filter by active status
    is_active = request.args.get('is_active')
    if is_active is not None:
        query = query.filter_by(is_active=is_active.lower() == 'true')

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': [u.to_dict() for u in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page
    })


@users_bp.route('', methods=['POST'])
@admin_required
def create_user():
    """Create a new user (admin only)"""
    data = request.get_json()

    # Validate required fields
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'viewer')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    if role not in ('admin', 'editor', 'viewer'):
        return jsonify({'error': 'Invalid role'}), 400

    # Check if email exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    # Create user
    user = User(
        email=email,
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        role=role,
        is_active=data.get('is_active', True)
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@users_bp.route('/<user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    """Get user details (admin only)"""
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict())


@users_bp.route('/<user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user (admin only)"""
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    # Update fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'role' in data:
        if data['role'] not in ('admin', 'editor', 'viewer'):
            return jsonify({'error': 'Invalid role'}), 400
        user.role = data['role']
    if 'is_active' in data:
        user.is_active = data['is_active']
    if 'password' in data and data['password']:
        user.set_password(data['password'])

    db.session.commit()

    return jsonify(user.to_dict())


@users_bp.route('/<user_id>', methods=['DELETE'])
@admin_required
def deactivate_user(user_id):
    """Deactivate user (admin only)"""
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.is_active = False
    db.session.commit()

    return jsonify({'message': 'User deactivated'})
