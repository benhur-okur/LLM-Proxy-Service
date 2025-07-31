# app/routes/conversations.py

from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import db
from app.models.conversation import Conversation
from app.models.message import Message

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

    # ✅ created_at yerine timestamp kullandık
    messages = Message.query.filter_by(conversation_id=conv.id).order_by(Message.timestamp.asc()).all()
    msgs = []
    for msg in messages:
        msgs.append({
            'id': msg.id,
            'role': msg.sender,               # modelde sender var
            'content': msg.content,
            'created_at': msg.timestamp.isoformat()  # frontend ile uyumlu
        })

    return jsonify({
        'id': conv.id,
        'title': conv.title,
        'messages': msgs,
        'created_at': conv.created_at.isoformat(),
        'updated_at': conv.updated_at.isoformat()
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