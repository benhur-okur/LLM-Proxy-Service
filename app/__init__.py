from flask import Flask
from .database import db
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta
import logging
from app.routes.llm_routes import llm_bp




# Blueprint'ler
from .routes.ask import ask_bp
from .routes.auth import auth_bp
from .routes.apikeys import apikeys_bp


def create_app():
    app = Flask(__name__)


    jwt = JWTManager()
    logging.basicConfig(level=logging.DEBUG)

    load_dotenv()

    app.debug = True


    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///llmproxy.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")

    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # 1 saat geçerli, değiştirliebilir


    db.init_app(app)
    jwt.init_app(app)
    
    # Blueprints url_prefix ile ekleniyor, bunlar bir fonksiyon altında toplanılabilir (gerek var mı araştır!)
    app.register_blueprint(ask_bp, url_prefix='/ask')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(apikeys_bp, url_prefix='/apikeys')
    app.register_blueprint(llm_bp, url_prefix="/api")  # reach llm proxy with -> /api/proxy


    return app
