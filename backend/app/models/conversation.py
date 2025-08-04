from ..database import db
from datetime import datetime
from sqlalchemy.types import TypeDecorator, TEXT
import json

# Custom JSON type that works for SQLite and Postgres
class JSONEncodedList(TypeDecorator):
    impl = TEXT

    def process_bind_param(self, value, dialect):
        if value is None:
            return "[]"
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        return json.loads(value)

class Conversation(db.Model):
    __tablename__ = 'conversations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('conversations', lazy=True))
    messages = db.relationship('Message', backref='conversation', cascade="all, delete-orphan", lazy=True)

    # for storing selected models in the conversation, using JSONEncodedList that ı created
    selected_models = db.Column(JSONEncodedList, nullable=False, default=[])

    def __repr__(self):
        return f"<Conversation {self.id} - User {self.user_id} - Title '{self.title}'>"