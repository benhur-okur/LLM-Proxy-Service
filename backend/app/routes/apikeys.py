from flask import Blueprint, request, jsonify, g
from ..database import db
from ..models.models import APIKey
from flask_jwt_extended import jwt_required
import requests

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

def verify_gemini_api_key(api_key: str) -> bool:
    API_VERSION = "v1"
    url = f"https://generativelanguage.googleapis.com/{API_VERSION}/models?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return True
        else:
            # İstersen log atabilirsin
            data = response.json()
            error = data.get("error")
            if error:
                print(f"Gemini API doğrulama hatası: {error.get('message')}")
            return False
    except Exception as e:
        print(f"Gemini API doğrulama sırasında hata: {e}")
        return False

@apikeys_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_api_key():
    user_id = g.user_id
    data = request.get_json()
    model_name = data.get('model_name')
    key_value = data.get('key_value')

    if not model_name or not key_value:
        return jsonify({'valid': False, 'error': 'model_name and key_value are required'}), 400

    try:
        provider = model_name.lower()
        headers = {}
        url = ""
        payload = {}

        if provider == "openai":
            headers["Authorization"] = f"Bearer {key_value}"
            url = "https://api.openai.com/v1/models"

        elif provider == "anthropic":
            headers = {
                "x-api-key": key_value,
                "anthropic-version": "2023-06-01"
            }
            url = "https://api.anthropic.com/v1/models"

        elif provider == "grok":
            headers["Authorization"] = f"Bearer {key_value}"
            url = "https://openrouter.ai/api/v1/chat/completions"
            payload = {
                "model": "grok-1",
                "messages": [{"role": "user", "content": "Hello"}],
                "max_tokens": 5
            }

        elif provider == "gemini":
            is_valid = verify_gemini_api_key(key_value)
            print(f"Gemini API key valid: {is_valid}")
            return jsonify({"valid": is_valid}), 200

        else:
            return jsonify({'valid': False, 'error': 'Unknown model_name/provider'}), 400

        response = (
            requests.get(url, headers=headers)
            if not payload else
            requests.post(url, headers=headers, json=payload)
        )

        return jsonify({"valid": response.status_code in [200, 400]}), 200

    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500
