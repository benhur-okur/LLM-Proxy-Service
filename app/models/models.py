from app.database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    api_keys = db.relationship('APIKey', backref = 'user', lazy=True)

    def get_api_key_for_model(self, model_name: str):
        for key in self.api_keys:
            if model_name.lower() in key.model_name.lower():
                return key.key_value
        return None


    def __repr__(self):
        return f"<User {self.username}>"
    
class APIKey(db.Model):
    __tablename__ = 'api_keys'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    model_name = db.Column(db.String(100), nullable=False)
    key_value = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<APIKey {self.model_name} for User {self.user_id}>"

    