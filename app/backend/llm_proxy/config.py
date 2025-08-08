import os
import json
from dotenv import load_dotenv

load_dotenv()  # .env dosyasını yükle

class Config:
    def __init__(self, config_path: str = None):
        if config_path is None:
            # Automatically resolve the absolute path to project root/config.json
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
            config_path = os.path.join(base_dir, "config.json")

        with open(config_path, "r") as f:
            self.model_config = json.load(f)

    def get_model_info(self, model_name):
        models = self.model_config.get("models", {})
        return models.get(model_name)

    def get_all_models(self):
        return self.model_config.get("models", {})

    def get_api_key(self, model_name):
        model_config = self.get_model_info(model_name)
        if not model_config:
            return None
        
        key_ref = model_config.get("default_api_key")
        if key_ref and key_ref.startswith("env:"):
            env_var = key_ref.split(':', 1)[1]
            print(f"Using environment variable for API key: {env_var}") # Buryaa gelebiliyoruz
            return os.getenv(env_var)

        return key_ref
         