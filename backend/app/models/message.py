from ..database import db
from datetime import datetime

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)  # İlişkili sohbet
    sender = db.Column(db.String(20), nullable=False)  # 'user', 'model', 'system' gibi
    content = db.Column(db.Text, nullable=False)       # Mesaj metni
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Message {self.id} - Conversation {self.conversation_id} - Sender {self.sender}>"
