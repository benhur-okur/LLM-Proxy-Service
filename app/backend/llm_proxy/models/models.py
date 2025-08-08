# app/backend/llm_proxy/models/models.py
from datetime import datetime
from uuid import uuid4
from flask_login import UserMixin
from ..database import db

roles_users = db.Table(
    "roles_users",
    db.Column("user_id", db.Integer(), db.ForeignKey("users.id"), primary_key=True),
    db.Column("role_id", db.Integer(), db.ForeignKey("roles.id"), primary_key=True),
)

class Role(db.Model):
    __tablename__ = "roles"
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False, index=True)
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)

    password_hash = db.Column(db.String(255), nullable=True)

    # Flask-Security şifre alanı
    password = db.Column(db.String(255), nullable=True)

    # Flask-Security alanları
    active = db.Column(db.Boolean(), default=True, nullable=False)
    confirmed_at = db.Column(db.DateTime())
    fs_uniquifier = db.Column(
        db.String(64),
        unique=True,
        nullable=False,
        default=lambda: uuid4().hex,
        index=True,
    )

    # Trackable alanlar (SECURITY_TRACKABLE=True için zorunlu tutmaj zorundayız)
    last_login_at = db.Column(db.DateTime())
    current_login_at = db.Column(db.DateTime())
    last_login_ip = db.Column(db.String(64))
    current_login_ip = db.Column(db.String(64))
    login_count = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    roles = db.relationship(
        "Role",
        secondary=roles_users,
        backref=db.backref("users", lazy="dynamic"),
        lazy="joined",
    )

    api_keys = db.relationship(
        "APIKey",
        backref="user",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )

    @property
    def is_active(self):
        return bool(self.active)

    def __repr__(self):
        return f"<User id={self.id} username={self.username} email={self.email}>"

class APIKey(db.Model):
    __tablename__ = "api_keys"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    model_name = db.Column(db.String(120), nullable=False, index=True)
    key_value = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<APIKey id={self.id} user_id={self.user_id} model_name={self.model_name}>"