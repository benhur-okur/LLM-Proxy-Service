# app/backend/llm_proxy/routes/llm_routes.py

from flask import Blueprint, request, jsonify
from flask_security import auth_required, current_user, login_required

from ..database import db
from ..models.models import User, APIKey
from ..services.llm_router import LLMRouter
from ..config import Config as LLMConfig
from ..utils.crypto import decrypt_api_key

llm_bp = Blueprint("llm", __name__)
router = LLMRouter(config=LLMConfig())

@llm_bp.route("/proxy", methods=["POST"])
@login_required
def proxy_llm():
    data = request.get_json() or {}
    model = data.get("model_name")
    prompt = data.get("prompt")

    if not model or not prompt:
        return jsonify({"error": "Model and prompt are required"}), 400

    # Giriş yapan kullanıcı
    try:
        user_id = int(current_user.get_id())
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # 1) Kullanıcının kendi API anahtarı (DB -> decrypt)
    user_api_key = None
    key_row = APIKey.query.filter_by(user_id=user_id, model_name=model).first()
    if key_row:
        try:
            user_api_key = decrypt_api_key(key_row.key_value)
        except Exception:
            # decrypt hatası olursa root anahtara düşebiliriz (opsiyonel) - bunu düşünme aşamaısnayım şu an !
            user_api_key = None

    # 2) Kullanıcıda yoksa root anahtar (Config)
    if not user_api_key:
        user_api_key = router.config.get_api_key(model)

    if not user_api_key:
        return jsonify({"error": f"No API key available for model '{model}'"}), 400

    try:
        response = router.route_to_model(model, prompt, user_api_key)
        return jsonify({"response": response}), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "LLM request failed", "detail": str(e)}), 500