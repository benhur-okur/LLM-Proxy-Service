from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..database import db
from ..models.models import User


auth_bp = Blueprint("auth", __name__)



@auth_bp.route("/register", methods = ['POST'])
def signup():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if not username or not password or not email:
        return jsonify({"error": "Username, Email and Password are required"}), 400
    
    if User.query.filter_by(email = email).first():
        return jsonify({"error": "Email already exists"}), 400

    if User.query.filter_by(username = username).first():
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_password, email=email)

    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/login', methods = ['POST'])
def login():
    
    print("Login endpoint çağrıldı")  # log
    data = request.get_json()
    print("Gelen veri:", data)  # log
    if data is None:
        return jsonify({"error": "No JSON received"}), 400

    password = data.get("password")
    email = data.get("email")

    if not password or not email:
        return jsonify({"error": "Email and Password are required"}), 400

    user = User.query.filter_by(email = email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid Email or password"}), 401
    
    access_token = create_access_token(identity = str(user.id))
    return jsonify({"access_token": access_token}), 200

@auth_bp.route("/me", methods=['GET'])
@jwt_required()
def get_current_user():
    print(f"Received request to /auth/me")

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "email": user.email,
        "id": user.id,
        "username": user.username,
        "created_at": user.created_at.isoformat()
    }), 200

# auth.py dosyasına bu endpoint'leri ekle:

@auth_bp.route("/debug-cookies", methods=['GET'])
def debug_cookies():
    from flask import request
    import json
    
    cookies = dict(request.cookies)
    headers = dict(request.headers)
    
    print("=== SERVER DEBUG ===")
    print("Request URL:", request.url)
    print("Request method:", request.method)
    print("Cookies received:", cookies)
    print("Headers received:", json.dumps(headers, indent=2))
    print("Access token in cookies:", 'access_token' in cookies)
    print("===================")
    
    return jsonify({
        "cookies": cookies,
        "headers": headers,
        "has_access_token": 'access_token' in cookies,
        "cookie_count": len(cookies)
    }), 200

@auth_bp.route("/test-cookie", methods=['GET'])
def test_cookie():
    """Test cookie'si set et"""
    from flask import make_response
    
    response = make_response(jsonify({"msg": "Test cookie set edildi"}))
    response.set_cookie(
        "test_cookie",
        "test_value",
        httponly=False,
        secure=False,
        samesite="Lax",
        path="/",
        max_age=3600
    )
    return response