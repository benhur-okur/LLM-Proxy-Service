# app/backend/llm_proxy/routes/auth.py
from flask import Blueprint, request, jsonify, session
from flask_login import login_required, current_user, login_user, logout_user
from ..database import db
from ..models.models import User
from flask_security.utils import hash_password, verify_password

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email, password zorunlu"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Bu email zaten kayıtlı"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Bu kullanıcı adı zaten kayıtlı"}), 400

    user = User(
        username=username,
        email=email,
        password=hash_password(password),
        active=True,
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Kayıt başarılı"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email ve password zorunlu"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(password, user.password):
        return jsonify({"error": "Email veya şifre hatalı"}), 401
    if not user.active:
        return jsonify({"error": "Hesap aktif değil"}), 403

    session.permanent = True
    login_user(user, remember=True)
    return jsonify({"message": "Giriş başarılı"}), 200

@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify({
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }), 200

@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Çıkış başarılı"}), 200