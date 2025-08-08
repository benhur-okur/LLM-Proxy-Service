# backend/app/routes/config_models.py
from flask import Blueprint, jsonify, current_app
from ..config import Config

config_models_bp = Blueprint("config_models", __name__)

@config_models_bp.route("/models", methods=["GET"])
def get_models():
    if not hasattr(current_app, "config_manager"):
        current_app.config_manager = Config()
    # Config sınıfını kullanarak config_data'yı al
    models_data = current_app.config_manager.get_all_models()
    models_list = []

    if isinstance(models_data, dict):
        # Dict ise her bir key'i "name" olarak ekleyerek yeni dict oluştur
        for name, config in models_data.items():
            model_entry = {
                "name": name,
                **config
            }
            models_list.append(model_entry)
    elif isinstance(models_data, list):
        models_list = models_data
    else:
        models_list = []

    return jsonify(models_list), 200

