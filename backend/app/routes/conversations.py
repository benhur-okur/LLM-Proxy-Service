# app/routes/conversations.py

from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..database import db
from ..models.conversation import Conversation
from ..models.message import Message

conversations_bp = Blueprint('conversations_bp', __name__, url_prefix='/conversations')


@conversations_bp.route('', methods=['GET'])
@jwt_required()
def get_user_conversations():
    user_id = g.user_id
    conversations = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc()).all()

    result = []
    for conv in conversations:
        result.append({
            'id': conv.id,
            'title': conv.title,
            'created_at': conv.created_at.isoformat(),
            'updated_at': conv.updated_at.isoformat()
        })

    return jsonify(result), 200


@conversations_bp.route('', methods=['POST'])
@jwt_required()
def create_conversation():
    user_id = g.user_id
    data = request.get_json() or {}

    title = data.get('title', '').strip() or "Yeni Sohbet"

    new_conv = Conversation(user_id=user_id, title=title)
    db.session.add(new_conv)
    db.session.commit()

    return jsonify({
        'id': new_conv.id,
        'title': new_conv.title,
        'created_at': new_conv.created_at.isoformat(),
        'updated_at': new_conv.updated_at.isoformat()
    }), 201


@conversations_bp.route('/<int:conv_id>', methods=['GET'])
@jwt_required()
def get_conversation(conv_id):
    user_id = g.user_id
    conv = Conversation.query.filter_by(id=conv_id, user_id=user_id).first()
    if not conv:
        return jsonify({"msg": "Sohbet bulunamadı"}), 404

    #used timestamp inseatd of created_at
    messages = Message.query.filter_by(conversation_id=conv.id).order_by(Message.timestamp.asc()).all()
    msgs = []
    for msg in messages:
        msgs.append({
            'id': msg.id,
            'role': msg.sender, # modelde sender var
            'modelName': msg.model_name,  
            'content': msg.content,
            'created_at': msg.timestamp.isoformat()  # frontend ile uyumlu
        })

    return jsonify({
        'id': conv.id,
        'title': conv.title,
        'messages': msgs,
        'created_at': conv.created_at.isoformat(),
        'updated_at': conv.updated_at.isoformat(),
        'selected_models': conv.selected_models or []
    }), 200




@conversations_bp.route('/<int:conv_id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(conv_id):
    user_id = g.user_id
    conv = Conversation.query.filter_by(id=conv_id, user_id=user_id).first()
    if not conv:
        return jsonify({"msg": "Sohbet bulunamadı"}), 404

    # Önce mesajları sil
    Message.query.filter_by(conversation_id=conv.id).delete()
    db.session.delete(conv)
    db.session.commit()

    return jsonify({"msg": "Sohbet ve mesajlar silindi"}), 200

@conversations_bp.route('/last', methods=['GET'])
@jwt_required()
def get_last_conversation():
    user_id = g.user_id
    last_conv = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc()).first()
    if not last_conv:
        return jsonify({}), 404
    return jsonify({
        'id': last_conv.id,
        'title': last_conv.title,
        'created_at': last_conv.created_at.isoformat(),
        'updated_at': last_conv.updated_at.isoformat(),
    }), 200

@conversations_bp.route('/<int:conv_id>/models', methods=['PUT']) # update conversation models
@jwt_required()
def update_conversation_models(conv_id):
    user_id = g.user_id
    conv = Conversation.query.filter_by(id=conv_id, user_id=user_id).first()
    if not conv:
        return jsonify({"msg": "Sohbet bulunamadı"}), 404

    data = request.get_json() or {}
    models = data.get("models", [])

    if not isinstance(models, list):
        return jsonify({"msg": "Modeller list formatında olmalı"}), 400

    conv.selected_models = models
    db.session.commit()

    return jsonify({
        "msg": "Modeller güncellendi",
        "selected_models": conv.selected_models
    }), 200