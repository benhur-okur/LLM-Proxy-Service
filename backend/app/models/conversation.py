from ..database import db
from datetime import datetime

class Conversation(db.Model):
    __tablename__ = 'conversations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Kullanıcı ilişkisi
    title = db.Column(db.String(255), nullable=False)  # Sohbet başlığı
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # User modeli ile ilişki: bir conversation bir kullanıcıya ait
    user = db.relationship('User', backref=db.backref('conversations', lazy=True))

    # Message modelleri ile ilişki: bir conversation'un çok sayıda mesajı olabilir
    messages = db.relationship('Message', backref='conversation', cascade="all, delete-orphan", lazy=True)

    def __repr__(self):
        return f"<Conversation {self.id} - User {self.user_id} - Title '{self.title}'>"
