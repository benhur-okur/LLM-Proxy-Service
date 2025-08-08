from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..database import db
from ..models.models import APIKey
from ..validators.api_key_validators import validate_api_key_by_provider
from ..utils.crypto import encrypt_api_key, decrypt_api_key

apikeys_bp = Blueprint('apikeys', __name__)

@apikeys_bp.route('/', methods=['GET'])
@login_required
def get_api_keys():
    user_id = int(current_user.get_id())
    keys = APIKey.query.filter_by(user_id=user_id).all()
    result = [{
        "id": key.id,
        "model_name": key.model_name,
        "key_value": decrypt_api_key(key.key_value),
        "created_at": key.created_at.isoformat()
    } for key in keys]
    return jsonify(result), 200

@apikeys_bp.route('/', methods=['POST'])
@login_required
def add_api_key():
    data = request.get_json() or {}
    model_name = data.get('model_name')
    key_value = data.get('key_value')
    user_id = int(current_user.get_id())

    if not model_name or not key_value:
        return jsonify({"error": "model_name and key_value are required"}), 400

    encrypted_key = encrypt_api_key(key_value)
    new_key = APIKey(user_id=user_id, model_name=model_name, key_value=encrypted_key)
    db.session.add(new_key)
    db.session.commit()
    return jsonify({"message": "API key added successfully", "id": new_key.id}), 201

@apikeys_bp.route('/<int:key_id>', methods=['PUT'])
@login_required
def update_api_key(key_id):
    data = request.get_json() or {}
    model_name = data.get('model_name')
    key_value = data.get('key_value')
    user_id = int(current_user.get_id())

    if not model_name or not key_value:
        return jsonify({'error': 'model_name and key_value are required'}), 400

    api_key = APIKey.query.get(key_id)
    if not api_key or api_key.user_id != user_id:
        return jsonify({'error': 'API key not found or unauthorized'}), 404

    api_key.model_name = model_name
    api_key.key_value = encrypt_api_key(key_value)
    db.session.commit()
    return jsonify({'message': 'API key updated successfully'}), 200

@apikeys_bp.route('/<int:key_id>', methods=['DELETE'])
@login_required
def delete_api_key(key_id):
    user_id = int(current_user.get_id())
    api_key = APIKey.query.get(key_id)

    if not api_key or api_key.user_id != user_id:
        return jsonify({'error': 'API key not found or unauthorized'}), 404

    db.session.delete(api_key)
    db.session.commit()
    return jsonify({'message': 'API key deleted successfully'}), 200

@apikeys_bp.route('/validate', methods=['POST'])
@login_required
def validate_api_key():
    data = request.get_json() or {}
    model_name = data.get('model_name')
    key_value = data.get('key_value')

    if not model_name or not key_value:
        return jsonify({'valid': False, 'error': 'model_name and key_value are required'}), 400

    try:
        is_valid, error_msg = validate_api_key_by_provider(model_name, key_value)
        return jsonify({"valid": is_valid, "error": error_msg}), 200
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500