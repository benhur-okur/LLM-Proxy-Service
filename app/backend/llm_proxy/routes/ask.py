# app/backend/llm_proxy/routes/ask.py

from flask import Blueprint, request, jsonify, current_app, Response, stream_with_context
import concurrent.futures
import time
import json
from datetime import datetime

#Flask-Security (session-cookie) ile koruma
from flask_security import auth_required, current_user, login_required

from ..services.llm_router import LLMRouter
from ..config import Config
from ..database import db
from ..models.conversation import Conversation
from ..models.message import Message
from ..models.models import APIKey
from ..utils.crypto import decrypt_api_key  # 

ask_bp = Blueprint('ask', __name__)

config = Config()
llm_router = LLMRouter(config)


@ask_bp.route('/', methods=['POST'])
@login_required
def ask():
    data = request.json or {}

    prompt = data.get("prompt")
    model_name = data.get("model_name")
    user_api_key = data.get("user_api_key") 

    if not prompt or not model_name:
        return jsonify({"error": "prompt and model_name are required"}), 400

    user_id = int(current_user.get_id())

    if not user_api_key:
        key_entry = APIKey.query.filter_by(user_id=user_id, model_name=model_name).first()
        if key_entry:
            try:
                user_api_key = decrypt_api_key(key_entry.key_value)
            except Exception as e:
                return jsonify({"error": f"Failed to decrypt API key: {str(e)}"}), 500

    try:
        response = llm_router.route_to_model(
            model_name=model_name,
            prompt=prompt,
            user_api_key=user_api_key
        )
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ask_bp.route('/chat', methods=['POST'])
@login_required
def multi_model_chat():
    data = request.get_json() or {}
    prompt = data.get("prompt")
    models = data.get("models")
    user_api_key = data.get("user_api_key")
    conversation_id = data.get("conversationId")

    if not prompt or not isinstance(models, list) or len(models) == 0:
        return jsonify({
            "error": "Invalid request. 'prompt' (string) and 'models' (non-empty list) are required."
        }), 400

    user_id = int(current_user.get_id())

    conv = None
    if conversation_id:
        conv = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        if not conv:
            return jsonify({"error": "Conversation not found or not accessible"}), 404

    if conv:
        try:
            user_msg = Message(
                conversation_id=conv.id,
                sender="user",
                content=prompt,
                created_at=datetime.utcnow()
            )
            db.session.add(user_msg)
            db.session.commit()
        except Exception as e:
            current_app.logger.error(f"Failed to save user prompt: {str(e)}")

    responses = {}

    def get_response(model_name):
        nonlocal user_api_key

        model_api_key = user_api_key
        if not model_api_key:
            key_entry = APIKey.query.filter_by(user_id=user_id, model_name=model_name).first()
            if key_entry:
                try:
                    model_api_key = decrypt_api_key(key_entry.key_value)
                except Exception as e:
                    return {"success": False, "error": f"Decryption failed: {str(e)}"}

        try:
            response = llm_router.route_to_model(
                model_name=model_name,
                prompt=prompt,
                user_api_key=model_api_key
            )

            
            if conv:
                model_msg = Message(
                    conversation_id=conv.id,
                    sender="model",
                    model_name=model_name,
                    content=response,
                    created_at=datetime.utcnow()
                )
                db.session.add(model_msg)
                db.session.commit()

            return {"success": True, "response": response}
        except Exception as e:
            return {"success": False, "error": str(e)}

    start_time = time.time()
    #parallelism
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_map = {
            executor.submit(get_response, model): model for model in models
        }
        for future in concurrent.futures.as_completed(future_map):
            model = future_map[future]
            try:
                responses[model] = future.result()
            except Exception as e:
                responses[model] = {"success": False, "error": str(e)}

    duration = round(time.time() - start_time, 2)
    return jsonify({"duration": duration, "responses": responses}), 200


@ask_bp.route('/chat/stream', methods=['POST'])
@login_required
def multi_model_chat_stream():
    data = request.get_json() or {}
    prompt = data.get("prompt")
    models = data.get("models")
    user_api_key = data.get("user_api_key")
    conversation_id = data.get("conversation_id")

    if not prompt or not isinstance(models, list) or len(models) == 0:
        return jsonify({"error": "Invalid request"}), 400

    user_id = int(current_user.get_id())
    responses = {model: "" for model in models}  

    def event_stream():
        streams = {}

        for model in models:
            model_api_key = user_api_key
            if not model_api_key:
                key_entry = APIKey.query.filter_by(user_id=user_id, model_name=model).first()
                if key_entry:
                    try:
                        model_api_key = decrypt_api_key(key_entry.key_value)
                    except Exception as e:
                        yield f"data: {json.dumps({'modelName': model, 'error': 'API key decryption failed', 'done': True})}\n\n"
                        continue
            try:
                streams[model] = llm_router.route_to_model_stream(model, prompt, model_api_key)
            except Exception as e:
                current_app.logger.error(f"Stream setup error: {e}")
                yield f"data: {json.dumps({'modelName': model, 'error': str(e), 'done': True})}\n\n"
                continue

        done_models = set()
        while len(done_models) < len(streams):
            for model, stream in streams.items():
                if model in done_models:
                    continue
                try:
                    chunk = next(stream)
                    responses[model] += chunk
                    yield f"data: {json.dumps({'modelName': model, 'chunk': chunk, 'done': False})}\n\n"
                except StopIteration:
                    done_models.add(model)
                    yield f"data: {json.dumps({'modelName': model, 'done': True})}\n\n"
                except Exception as e:
                    done_models.add(model)
                    yield f"data: {json.dumps({'modelName': model, 'error': str(e), 'done': True})}\n\n"

        try:
            conv = db.session.get(Conversation, conversation_id)
            if conv:
                user_msg = Message(conversation_id=conv.id, sender="user", content=prompt)
                db.session.add(user_msg)

                for model, full_reply in responses.items():
                    if full_reply.strip():
                        assistant_msg = Message(
                            conversation_id=conv.id,
                            sender="model",
                            model_name=model,
                            content=full_reply
                        )
                        db.session.add(assistant_msg)

                db.session.commit()
        except Exception as e:
            current_app.logger.error(f"DB kayıt hatası: {e}")

    return Response(
        stream_with_context(event_stream()),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )