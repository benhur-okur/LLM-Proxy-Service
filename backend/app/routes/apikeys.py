from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required
from ..database import db
from ..models.models import APIKey
from ..validators.api_key_validators import validate_api_key_by_provider

apikeys_bp = Blueprint('apikeys', __name__)

@apikeys_bp.route('/', methods=['GET'])
@jwt_required()
def get_api_keys():
    user_id = g.user_id
    keys = APIKey.query.filter_by(user_id=user_id).all()
    result = [{
        "id": key.id,
        "model_name": key.model_name,
        "key_value": key.key_value,
        "created_at": key.created_at.isoformat()
    } for key in keys]
    return jsonify(result), 200

@apikeys_bp.route('/', methods=['POST'])
@jwt_required()
def add_api_key():
    data = request.get_json()
    model_name = data.get('model_name')
    key_value = data.get('key_value')
    user_id = g.user_id

    if not model_name or not key_value:
        return jsonify({"error": "model_name and key_value are required"}), 400

    new_key = APIKey(user_id=user_id, model_name=model_name, key_value=key_value)
    db.session.add(new_key)
    db.session.commit()
    return jsonify({"message": "API key added successfully", "id": new_key.id}), 201

@apikeys_bp.route('/<int:key_id>', methods=['PUT'])
@jwt_required()
def update_api_key(key_id):
    data = request.get_json()
    model_name = data.get('model_name')
    key_value = data.get('key_value')
    user_id = g.user_id

    if not model_name or not key_value:
        return jsonify({'error': 'model_name and key_value are required'}), 400

    api_key = APIKey.query.get(key_id)
    if not api_key or api_key.user_id != user_id:
        return jsonify({'error': 'API key not found or unauthorized'}), 404

    api_key.model_name = model_name
    api_key.key_value = key_value
    db.session.commit()

    return jsonify({'message': 'API key updated successfully'}), 200

@apikeys_bp.route('/<int:key_id>', methods=['DELETE'])
@jwt_required()
def delete_api_key(key_id):
    user_id = g.user_id
    api_key = APIKey.query.get(key_id)

    if not api_key or api_key.user_id != user_id:
        return jsonify({'error': 'API key not found or unauthorized'}), 404

    db.session.delete(api_key)
    db.session.commit()

    return jsonify({'message': 'API key deleted successfully'}), 200

@apikeys_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_api_key():
    data = request.get_json()
    model_name = data.get('model_name')
    key_value = data.get('key_value')

    if not model_name or not key_value:
        return jsonify({'valid': False, 'error': 'model_name and key_value are required'}), 400

    try:
        is_valid, error_msg = validate_api_key_by_provider(model_name, key_value)
        return jsonify({"valid": is_valid, "error": error_msg}), 200
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500

