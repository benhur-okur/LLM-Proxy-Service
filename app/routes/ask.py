from flask import Blueprint, request, jsonify
from app.services.llm_router import LLMRouter
from app.config import Config
from flask_jwt_extended import jwt_required, get_jwt_identity


ask_bp = Blueprint('ask', __name__)

config = Config()
llm_router = LLMRouter(config)

@ask_bp.route('/', methods=['POST'])  
@jwt_required()  # cant ask without JWT token
def ask():
    data = request.json

    prompt = data.get("prompt")
    model_name = data.get("model_name")
    user_api_key = data.get("user_api_key")  # kullanıcı kendi key'ini vermiş olabilir

    if not prompt or not model_name:
        return jsonify({"error": "prompt and model_name are required"}), 400

    try:
        response = llm_router.route_to_model(
            model_name=model_name,
            prompt=prompt,
            user_api_key=user_api_key
        )
        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
