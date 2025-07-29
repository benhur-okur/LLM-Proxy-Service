from flask import Blueprint, request, jsonify, current_app
from ..services.llm_router import LLMRouter
from ..config import Config
from flask_jwt_extended import jwt_required, get_jwt_identity
import concurrent.futures
import time




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

ask_bp = Blueprint('ask', __name__)
config = Config()
llm_router = LLMRouter(config)

@ask_bp.route('/chat', methods=['POST'])
@jwt_required()
def multi_model_chat():
    """
    Prompt'i birden fazla modele aynı anda gönderir ve paralel şekilde cevaplarını döner.
    """
    data = request.get_json()
    prompt = data.get("prompt")
    models = data.get("models")
    user_api_key = data.get("user_api_key")  # Opsiyonel: override key

    if not prompt or not isinstance(models, list) or len(models) == 0:
        return jsonify({
            "error": "Invalid request. 'prompt' (string) and 'models' (non-empty list) are required."
        }), 400

    user_id = get_jwt_identity()
    start_time = time.time()

    def get_response(model_name):
        try:
            response = llm_router.route_to_model(
                model_name=model_name,
                prompt=prompt,
                user_api_key=user_api_key
            )
            return {"success": True, "response": response}
        except Exception as e:
            current_app.logger.error(f"[Model: {model_name}] Error for user {user_id}: {str(e)}")
            return {"success": False, "error": str(e)}

    responses = {}

    # ThreadPoolExecutor ile modelleri paralel çalıştır
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_map = {
            executor.submit(get_response, model_name): model_name
            for model_name in models
        }

        for future in concurrent.futures.as_completed(future_map):
            model_name = future_map[future]
            try:
                result = future.result()
                responses[model_name] = result
            except Exception as e:
                responses[model_name] = {
                    "success": False,
                    "error": f"Unexpected error: {str(e)}"
                }

    duration = round(time.time() - start_time, 2)
    current_app.logger.info(f"[User: {user_id}] Chat completed in {duration}s for models: {models}")

    return jsonify({
        "duration": duration,
        "responses": responses
    }), 200
