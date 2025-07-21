from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User
from app.database import db
from app.services.llm_router import LLMRouter
from app.config import Config as LLMConfig

llm_bp = Blueprint("llm", __name__)
router = LLMRouter(config=LLMConfig())  

@llm_bp.route("/proxy", methods=["POST"])
@jwt_required()
def proxy_llm():
    data = request.get_json()
    model = data.get("model_name") 
    prompt = data.get("prompt")

    if not model or not prompt:
        return jsonify({"error": "Model and prompt are required"}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_api_key = user.get_api_key_for_model(model)  # user modeline göre uyarlanır bu kullanıcının kendi api key'i olan için, root api key Config odsyasıdnaki fonsiyondan .env'den cekerek elde eder

    if not user_api_key:
        user_api_key = router.config.get_api_key(model)
        print("User Api Key DİMİ: ", user_api_key)

    
    try:
        print("Routing to model:", model)
        print("Prompt:", prompt)
        print("API Key:", user_api_key)
        response = router.route_to_model(model, prompt, user_api_key)
        print("BURYAYA GELDİM")
        return jsonify({"response": response}), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "LLM request failed", "detail": str(e)}), 500