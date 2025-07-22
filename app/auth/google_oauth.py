from flask import Blueprint, redirect, url_for, session, jsonify
from flask_dance.contrib.google import make_google_blueprint, google
from flask_jwt_extended import create_access_token
from app.database import db
from app.models.models import User
import os

# Google OAuth için blueprint tanımı
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=[
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid"
    ],
    #scope=["profile", "email"],
    # redirect_url=os.getenv("GOOGLE_REDIRECT_URL")  # dikkat: burada artık default vermiyoruz
)

# Ek route'ları barındıran Flask Blueprint
google_oauth_bp = Blueprint("google_oauth", __name__)

# === Giriş Başlatıcı ===
@google_oauth_bp.route("/login/google")
def login_with_google():
    if not google.authorized:
        # Flask-Dance Google giriş sayfasına yönlendirir
        print("Kullanıcı google ile giriş yapmaya yönlendiriliyor!")
        return redirect(url_for("google.login"))
    # Eğer zaten giriş yapılmışsa doğrudan callback'e yönlendir
    print("Giriş yapıldı şimdi callback'e yönlendiriliyor")
    return redirect(url_for("google_oauth.handle_google_callback"))

# === Callback Endpoint ===
@google_oauth_bp.route("/google/callback")
def handle_google_callback():
    print("Callback fonksiyonunun en başı, fonksiyona geliyor")
    if not google.authorized:
        return redirect(url_for("google.login"))

    try:
        resp = google.get("/oauth2/v2/userinfo")
        if not resp.ok:
            raise Exception("Token expired or invalid")
    except Exception as e:
        print("Google token hatası:", e)
        return redirect(url_for("google.login"))

    #resp = google.get("/oauth2/v2/userinfo") # todo HATA BU KODDA
    print("bunu görememeiz lazım, göremessek üstteki kod hata yaratıyr!")
    if not resp.ok:
        print("resp gelmedi") # girmiyor
        return jsonify({"msg": "Google kullanıcı bilgisi alınamadı"}), 400

    print("Geliyor mu-2")
    user_info = resp.json()
    email = user_info.get("email")
    name = user_info.get("name") or "Anonim"

    print("logging-1") #gelemiyor
    if not email:
        return jsonify({"msg": "E-posta bilgisi eksik!"}), 400

    # 2️⃣ E-posta veritabanında kayıtlı mı?
    user = User.query.filter_by(email=email).first()

    print("logging-2")
    # 3️⃣ Kayıtlı değilse kullanıcıyı veritabanına ekle
    if not user:
        username = email.split("@")[0]
        user = User(
            email=email,
            name=name,
            username=username  # username nullable=False ise bu gerekli
        )
        db.session.add(user)
        db.session.commit()

    # 4️⃣ Kullanıcıya JWT token oluştur
    print("Kullanıcı id'si bununla access token oluşturulcak :", user.id)
    access_token = create_access_token(identity = str(user.id))

    # 5️⃣ İsteğe göre token’ı döndür veya frontend’e yönlendir
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    })
