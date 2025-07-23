from flask import Blueprint, redirect, url_for, session, jsonify, make_response
from flask_dance.contrib.google import make_google_blueprint, google
from flask_jwt_extended import create_access_token
from ..database import db
from ..models.models import User
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
    redirect_url=os.getenv("GOOGLE_REDIRECT_URL"),
    #redirect_to="google_oauth.handle_google_callback",  ## bunu yeni değiştiridik

    ##authorization_url_params={"prompt": "consent"}
    #scope=["profile", "email"],
    # redirect_url=os.getenv("GOOGLE_REDIRECT_URL")  # dikkat: burada artık default vermiyoruz
)

# Ek route'ları barındıran Flask Blueprint
google_oauth_bp = Blueprint("google_oauth", __name__)

# === Giriş Başlatıcı ===
@google_oauth_bp.route("/google")
def login_with_google():
    if not google.authorized:
        # Flask-Dance Google giriş sayfasına yönlendirir
        print("Kullanıcı google ile giriş yapmaya yönlendiriliyor!")
        return redirect(url_for("google.login"))
    # Eğer zaten giriş yapılmışsa doğrudan callback'e yönlendir
    print("Giriş yapıldı şimdi callback'e yönlendiriliyor")
    return redirect(url_for("google_oauth.handle_google_callback"))

# === Callback Endpoint ===
# google_oauth.py - callback fonksiyonunu şu şekilde güncelle:

@google_oauth_bp.route("/google/authorized")
def handle_google_callback():
    print("=== CALLBACK BAŞLADI ===")
    print("Google authorized?", google.authorized)
    
    if not google.authorized:
        print("Google authorization failed!")
        return redirect(url_for("google.login"))

    try:
        print("Google'dan kullanıcı bilgileri alınıyor...")
        resp = google.get("/oauth2/v2/userinfo")
        print("Google response status:", resp.status_code)
        print("Google response:", resp.json() if resp.ok else "HATA")
        
        if not resp.ok:
            raise Exception("Token expired or invalid")
    except Exception as e:
        print("Google token hatası:", e)
        return redirect(url_for("google.login"))

    user_info = resp.json()
    email = user_info.get("email")
    name = user_info.get("name") or "Anonim"

    print("Alınan email:", email)
    if not email:
        return jsonify({"msg": "E-posta bilgisi eksik!"}), 400

    # Kullanıcı veritabanı işlemleri
    user = User.query.filter_by(email=email).first()
    print("Veritabanında kullanıcı var mı?", user is not None)

    if not user:
        username = email.split("@")[0]
        user = User(
            email=email,
            username=username
        )
        db.session.add(user)
        db.session.commit()
        print("Yeni kullanıcı oluşturuldu:", user.id)
    else:
        print("Mevcut kullanıcı:", user.id)

    # JWT token oluştur
    access_token = create_access_token(identity=str(user.id))
    print("JWT Token oluşturuldu:", access_token[:50] + "...")

    print("=== COOKIE SET EDİLİYOR ===")
    response = make_response(redirect("http://localhost:3000/dashboard"))
    
    
    # Ayrıca test için httponly=True olan bir tane daha
    response.set_cookie(
        "access_token_secure",
        access_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/",
        max_age=3600
    )
    
    print("Set-Cookie header:", response.headers.get("Set-Cookie"))
    print("Response headers:", dict(response.headers))
    print("=== REDIRECT EDİLİYOR ===")
    return response


