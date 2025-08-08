# app/backend/llm_proxy/auth/google_oauth.py

import os, secrets
from flask import redirect, url_for, current_app, session, Blueprint
from flask_dance.contrib.google import make_google_blueprint, google
from ..database import db
from ..models.models import User
from flask_security.utils import login_user, hash_password

# 1) Google-Dance blueprint, callback'i /auth/google/callback adresine yönlendirsin:
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ],
    redirect_url="/auth/google/callback",   # buraya dönecek
)

# 2) Her authorization isteğine 'select_account' parametresini ekleyelim
google_bp.session.authorization_url_params = {"prompt": "select_account"}

# 3) Blueprint’e login ve callback rotalarını ekleyelim
google_oauth = Blueprint("google_oauth", __name__)

@google_oauth.route("/google/login")
def login_with_google():
    # Bu rota SPA’dan çağrılacak:
    return redirect(url_for("google.login", _external=True))

@google_oauth.route("/google/callback")
def handle_google_callback():
    current_app.logger.info("[GOOGLE] callback, authorized=%s", google.authorized)
    if not google.authorized:
        return redirect(url_for("google.login"))

    resp = google.get("/oauth2/v2/userinfo")
    if not resp.ok:
        current_app.logger.warning("[GOOGLE] userinfo failed, redirecting")
        return redirect(url_for("google.login"))

    info = resp.json()
    email = info.get("email")
    if not email:
        return "Google'dan e-posta alınamadı", 400

    # Kullanıcıyı DB’den alalım veya yarat
    user = User.query.filter_by(email=email).first()
    if not user:
        pwd = "!oauth!" + secrets.token_hex(16)
        user = User(
            email=email,
            username=email.split("@")[0],
            password=hash_password(pwd),
            active=True,
        )
        db.session.add(user)
        db.session.commit()
        current_app.logger.info("[GOOGLE] new user id=%s", user.id)

    # Flask-Login ile oturum aç
    session.permanent = True
    ok = login_user(user, remember=True)
    current_app.logger.info("[GOOGLE] login_user ok=%s", ok)

    # SPA dashboard’a dön
    return redirect("https://localhost:3000/dashboard")