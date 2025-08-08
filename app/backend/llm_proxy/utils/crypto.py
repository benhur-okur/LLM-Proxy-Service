# app/utils/crypto.py

import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

# Load .env if not already loaded
load_dotenv()

# Get the master encryption key from env
key = os.getenv("MASTER_ENCRYPTION_KEY")

if not key:
    raise ValueError("MASTER_ENCRYPTION_KEY not found in .env")

fernet = Fernet(key.encode())

def encrypt_api_key(plain_text_key: str) -> str:
    """Encrypts the API key for secure storage"""
    return fernet.encrypt(plain_text_key.encode()).decode()

def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypts the stored encrypted API key"""
    return fernet.decrypt(encrypted_key.encode()).decode()