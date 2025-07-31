from flask import Blueprint, request, jsonify, current_app, Response, stream_with_context
from ..services.llm_router import LLMRouter
from ..config import Config
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
import concurrent.futures
import time
import json
from flask import g
from flask import current_app
from ..database import db
from ..models.conversation import Conversation
from ..models.message import Message
from ..models.models import User
from ..models.models import APIKey




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
    data = request.get_json()
    prompt = data.get("prompt")
    models = data.get("models")
    user_api_key = data.get("user_api_key")
    conversation_id = data.get("conversationId")  # Yeni: conversationId bekliyoruz

    if not prompt or not isinstance(models, list) or len(models) == 0:
        return jsonify({
            "error": "Invalid request. 'prompt' (string) and 'models' (non-empty list) are required."
        }), 400

    user_id = get_jwt_identity()
    print(f"[chat] User ID: {user_id}")
    print(f"[chat] Prompt: {prompt}")
    print(f"[chat] Models: {models}")
    print(f"[chat] Conversation ID: {conversation_id}")

    # Conversation doğrulaması
    conv = None
    if conversation_id:
        conv = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        if not conv:
            print(f"[chat] ❌ Conversation {conversation_id} not found or does not belong to user {user_id}")
            return jsonify({"error": "Conversation not found or not accessible"}), 404
        print(f"[chat] ✅ Found conversation {conversation_id} for user {user_id}")

    # Prompt mesajını kaydet
    if conv:
        try:
            user_msg = Message(
                conversation_id=conv.id,
                role="user",
                content=prompt,
                created_at=datetime.utcnow()
            )
            db.session.add(user_msg)
            db.session.commit()
            print(f"[chat] ✅ Saved user prompt message in conversation {conv.id}")
        except Exception as e:
            print(f"[chat] ❌ Failed to save user prompt: {str(e)}")

    responses = {}

    def get_response(model_name):
        try:
            print(f"[chat] 🔁 Sending prompt to model: {model_name}")
            response = llm_router.route_to_model(
                model_name=model_name,
                prompt=prompt,
                user_api_key=user_api_key
            )
            print(f"[chat] ✅ Model {model_name} responded")

            if conv:
                model_msg = Message(
                    conversation_id=conv.id,
                    role="assistant",
                    content=response,
                    created_at=datetime.utcnow()
                )
                db.session.add(model_msg)
                db.session.commit()
                print(f"[chat] ✅ Saved model response from {model_name} in conversation {conv.id}")

            return {"success": True, "response": response}
        except Exception as e:
            print(f"[chat] ❌ Error from model {model_name}: {str(e)}")
            return {"success": False, "error": str(e)}

    import concurrent.futures
    import time
    start_time = time.time()

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
    print(f"[chat] ⏱️ Completed in {duration}s for models: {models}")

    return jsonify({
        "duration": duration,
        "responses": responses
    }), 200


@ask_bp.route('/chat/stream', methods=['POST'])
@jwt_required()
def multi_model_chat_stream():
    data = request.get_json()
    prompt = data.get("prompt")
    models = data.get("models")
    user_api_key = data.get("user_api_key")
    conversation_id = data.get("conversation_id")

    print("DEBUG STREAM BODY:", request.json)
    print("DEBUG conversation_id:", conversation_id)


    if not prompt or not isinstance(models, list) or len(models) == 0:
        return jsonify({"error": "Invalid request"}), 400

    user_id = get_jwt_identity()
    responses = {model_name: "" for model_name in models}  # her modelin cevabını biriktirmek için

    def event_stream():
        streams = {}
        for model_name in models:
            try:
                streams[model_name] = llm_router.route_to_model_stream(model_name, prompt, user_api_key)
            except Exception as e:
                current_app.logger.error(f"Stream setup error: {e}")
                yield f"data: {json.dumps({'model': model_name, 'error': str(e), 'done': True})}\n\n"
                continue

        done_models = set()
        while len(done_models) < len(streams):
            for model_name, stream in streams.items():
                if model_name in done_models:
                    continue
                try:
                    chunk = next(stream)
                    responses[model_name] += chunk  # cevabı biriktiriyoruz
                    yield f"data: {json.dumps({'model': model_name, 'chunk': chunk, 'done': False})}\n\n"
                except StopIteration:
                    done_models.add(model_name)
                    yield f"data: {json.dumps({'model': model_name, 'done': True})}\n\n"
                except Exception as e:
                    done_models.add(model_name)
                    yield f"data: {json.dumps({'model': model_name, 'error': str(e), 'done': True})}\n\n"

                # ✅ Tüm modeller tamamlandığında — mesajları DB'ye kaydet
        try:
            conv = db.session.get(Conversation, conversation_id)
            if conv:
                # Kullanıcının mesajı
                user_msg = Message(
                    conversation_id=conv.id,
                    sender="user",
                    content=prompt
                )
                db.session.add(user_msg)

                # Her modelin cevabı
                for model_name, full_reply in responses.items():
                    if full_reply.strip():
                        assistant_msg = Message(
                            conversation_id=conv.id,
                            sender="model",
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
