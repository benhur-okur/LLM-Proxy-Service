# app/backend/llm_proxy/__init__.py
from flask import Flask, g
from .database import db
from dotenv import load_dotenv
import os, logging

from flask_cors import CORS
from flask_migrate import Migrate
from flask_security import Security, SQLAlchemyUserDatastore
from flask_login import current_user, LoginManager

# Blueprints
from .routes.ask import ask_bp
from .routes.conversations import conversations_bp
from .routes.auth import auth_bp
from .routes.apikeys import apikeys_bp
from .routes.llm_routes import llm_bp
from .routes.config_models import config_models_bp
from .auth.google_oauth import google_bp, google_oauth

# Modeller
from .models.conversation import Conversation
from .models.message import Message
from .models.models import User, APIKey, Role, roles_users

security        = Security()
user_datastore  = SQLAlchemyUserDatastore(db, User, Role)


def create_app() -> Flask:
    app = Flask(__name__)
    load_dotenv()
    logging.basicConfig(level=logging.DEBUG)

    # ---------- Sabitler ----------
    FRONTEND_ORIGIN = "https://localhost:3000"
    #BACKEND_DOMAIN  = "localhost"     # Cookie'lerde Domain attributu

    # ---------- CORS ----------
    CORS(
        app,
        supports_credentials=True,
        origins=[FRONTEND_ORIGIN],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Cookie"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        expose_headers=["Set-Cookie"],
    )

    # ---------- Temel + Cookie ayarları ----------
    app.config.update(
        SECRET_KEY=os.getenv("SECRET_KEY", "dev-secret"),
        SQLALCHEMY_DATABASE_URI="sqlite:///llmproxy.db",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        PROPAGATE_EXCEPTIONS=True,
        DEBUG=True,

        SESSION_COOKIE_NAME      ="llm_session",
        REMEMBER_COOKIE_NAME     ="llm_remember",

        # Cross-site için zorunlu ikili
        SESSION_COOKIE_SAMESITE  ="None",
        SESSION_COOKIE_SECURE    =True,
        REMEMBER_COOKIE_SAMESITE ="None",
        REMEMBER_COOKIE_SECURE   =True,

        SESSION_COOKIE_HTTPONLY  =True,
        REMEMBER_COOKIE_HTTPONLY =True,
    )

    # ---------- Flask-Security-Too ----------
    app.config.update(
        SECURITY_PASSWORD_SALT           = os.getenv("SECURITY_PASSWORD_SALT", "dev-salt"),
        SECURITY_PASSWORD_HASH           = "bcrypt",
        SECURITY_REGISTERABLE            = True,
        SECURITY_RECOVERABLE             = True,
        SECURITY_CHANGEABLE              = True,
        SECURITY_CONFIRMABLE             = False,
        SECURITY_TRACKABLE               = True,
        SECURITY_SEND_REGISTER_EMAIL     = False,
        SECURITY_REDIRECT_BEHAVIOR       = "spa",
        SECURITY_JSONIFY_RESPONSES       = True,
        WTF_CSRF_ENABLED                 = False,           # dev
        SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS = True,
    )

    # ---------- Init ----------
    db.init_app(app)
    security.init_app(app, user_datastore)
    Migrate(app, db)

    # Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id: str):
        return User.query.get(int(user_id)) if user_id.isdigit() else None

    with app.app_context():
        db.create_all()

    # ---------- g.user_id ----------
    @app.before_request
    def attach_user_to_global():
        g.user_id = int(current_user.get_id()) if current_user.is_authenticated else None

    # ---------- Blueprints ----------
    app.register_blueprint(ask_bp,             url_prefix="/ask")
    app.register_blueprint(auth_bp,            url_prefix="/auth")
    app.register_blueprint(apikeys_bp,         url_prefix="/apikeys")
    app.register_blueprint(llm_bp,             url_prefix="/api")
    app.register_blueprint(google_bp,         url_prefix="/auth")
    app.register_blueprint(google_oauth,    url_prefix="/auth")
    app.register_blueprint(config_models_bp)
    app.register_blueprint(conversations_bp)

    return app