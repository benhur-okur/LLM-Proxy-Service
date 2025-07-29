from flask import Flask, g
from .database import db
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, verify_jwt_in_request, get_jwt_identity
import os
from datetime import timedelta
import logging
from .routes.llm_routes import llm_bp
from flask_migrate import Migrate  # <- Bunu ekle

# Blueprint'ler
from .routes.ask import ask_bp
from .routes.auth import auth_bp
from .routes.apikeys import apikeys_bp
from .auth.google_oauth import google_bp, google_oauth_bp

from flask_cors import CORS
from flask import Blueprint, jsonify, make_response, request, redirect, url_for

from app.routes.config_models import config_models_bp



def create_app():
    app = Flask(__name__)

    CORS(app, 
        supports_credentials=True, 
        origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Cookie"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        expose_headers=["Set-Cookie"]
    )

    jwt = JWTManager()
    logging.basicConfig(level=logging.DEBUG)

    load_dotenv()

    app.debug = True


    app.config["SESSION_TYPE"] = "filesystem"
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///llmproxy.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")

    app.debug = True
    app.config["PROPAGATE_EXCEPTIONS"] = True

    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # local testte gerek yok
    app.config['JWT_TOKEN_LOCATION'] = ["cookies"]
    app.config['JWT_COOKIE_SAMESITE'] = "Lax"
    app.config['JWT_COOKIE_SECURE'] = False  # HTTP için False
    app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token_secure'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # 1 saat geçerli, değiştirliebilir
    app.config['JWT_COOKIE_DOMAIN'] = None  # Bu satırı ekle
    app.config['JWT_REFRESH_COOKIE_PATH'] = '/'  # Bu satırı ekle
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/'  # Bu satırı ekle

    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # 'Lax' genelde işe yarar
    app.config['SESSION_COOKIE_SECURE'] = False  # Localde https yoksa False olmalı bunu deploy ederken true yapman lazım

    print("SECRET_KEY: env'den okunuyor", app.config['SECRET_KEY'])  # debug için



    from flask_session import Session
    Session(app)

    db.init_app(app)
    jwt.init_app(app)

    #CORS(app, supports_credentials=True, origins=["http://localhost:3000"])


    with app.app_context():
        db.create_all()
    
    # Blueprints url_prefix ile ekleniyor, bunlar bir fonksiyon altında toplanılabilir (gerek var mı araştır!)
    app.register_blueprint(ask_bp, url_prefix='/ask')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(apikeys_bp, url_prefix='/apikeys')
    app.register_blueprint(llm_bp, url_prefix="/api")  # reach llm proxy with -> /api/proxy

    app.register_blueprint(google_bp, url_prefix="/login")
    app.register_blueprint(google_oauth_bp, url_prefix="/auth")       
    app.register_blueprint(config_models_bp)
         


    from flask_jwt_extended.exceptions import NoAuthorizationError
    from flask import jsonify
    @app.errorhandler(NoAuthorizationError)
    def handle_auth_error(e):
        print("JWT Auth Error:", e)
        return jsonify({"msg": "Missing or invalid JWT"}), 401

    @app.before_request
    def attach_user_to_global():
        try:
            verify_jwt_in_request(optional=True)
            identity = get_jwt_identity()
            if identity:
                try:
                    g.user_id = int(identity)
                except ValueError:
                    g.user_id = None
            else:
                g.user_id = None
        except Exception:
            g.user_id = None

            
    return app
