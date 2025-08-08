# app/backend/llm_proxy/services/llm_router.py
from typing import Iterable
from .client_registry import CLIENT_REGISTRY

class LLMRouter:
    def __init__(self, config):
        self.config = config

    # ---------- public ----------
    def route_to_model(self, model_name: str, prompt: str, user_api_key: str | None = None) -> str:
        client, api_key = self._resolve(model_name, user_api_key)
        return client.ask(prompt, api_key, model=model_name)

    def route_to_model_stream(self, model_name: str, prompt: str, user_api_key: str | None = None) -> Iterable[str]:
        client, api_key = self._resolve(model_name, user_api_key)
        return client.stream(prompt, api_key, model=model_name)

    # ---------- helpers ----------
    def _resolve(self, model_name: str, user_api_key: str | None):
        model_info = self.config.get_model_info(model_name)
        if not model_info:
            raise ValueError(f"Unknown model '{model_name}'")

        model_type = model_info["type"]
        client = CLIENT_REGISTRY.get(model_type)
        if not client:
            raise ValueError(f"No client for model type '{model_type}'")

        api_key = user_api_key or self._expand_env(model_info["default_api_key"])
        return client, api_key

    @staticmethod
    def _expand_env(raw_key: str) -> str:
        if raw_key.startswith("env:"):
            import os
            env_name = raw_key.split("env:", 1)[1]
            val = os.getenv(env_name)
            if not val:
                raise RuntimeError(f"Env var '{env_name}' is empty")
            return val
        return raw_key