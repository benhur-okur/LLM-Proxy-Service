from . import openai_client, claude_client, gemini_client, grok_client
from .gemini_client import ask_gemini

class LLMRouter:
    def __init__(self, config):
        self.config = config

    def route_to_model(self, model_name: str, prompt: str, user_api_key: str = None):
        model_info = self.config.get_model_info(model_name)
        if not model_info:
            raise ValueError(f"Model '{model_name}' is not supported.")

        model_type = model_info['type']
        default_key = model_info['default_api_key']

        #Logging for debugging
        print("Model Type:", model_type)
        print("Model Name:", model_name)
        print("Default API Key:", default_key)

        api_key = user_api_key or default_key
        if api_key.startswith("env:"):
            from os import getenv
            env_key_name = api_key.split("env:")[1]
            api_key = getenv(env_key_name)
            if not api_key:
                raise ValueError(f"API key for env variable '{env_key_name}' not found.")

        # Burada, kullanıcı model_name ile tam model versiyonunu veriyor.
        # Onu doğrudan ilgili client fonksiyonuna geçiyoruz:
        if model_type == "openai":
            return openai_client.ask_openai(prompt, api_key, model=model_name)
        elif model_type == "anthropic":
            return claude_client.ask_claude(prompt, api_key, model=model_name)
        elif model_type == "gemini":
            print("Using Gemini client with model:", model_name)
            print("ask_gemini() ÇAĞRISI YAPILDI ")
            print("bu API Key:", api_key, " ile ask_gemini() çağrıldı")
            return gemini_client.ask_gemini(prompt, api_key, model=model_name)
        elif model_type == "grok":
            return grok_client.ask_grok(prompt, api_key, model=model_name)
        else:
            raise ValueError(f"Unsupported model type '{model_type}'")

    def route_to_model_stream(self, model_name: str, prompt: str, user_api_key: str = None):
        model_info = self.config.get_model_info(model_name)
        if not model_info:
            raise ValueError(f"Model '{model_name}' is not supported.")

        model_type = model_info['type']
        default_key = model_info['default_api_key']
        api_key = user_api_key or default_key
        if api_key.startswith("env:"):
            from os import getenv
            env_key_name = api_key.split("env:")[1]
            api_key = getenv(env_key_name)
            if not api_key:
                raise ValueError(f"API key for env variable '{env_key_name}' not found.")

        if model_type == "openai":
            return openai_client.ask_openai_stream(prompt, api_key, model=model_name)
        elif model_type == "anthropic":
            return claude_client.ask_claude_stream(prompt, api_key, model=model_name)
        elif model_type == "gemini":
            return gemini_client.ask_gemini_stream(prompt, api_key, model=model_name)
        elif model_type == "grok":
            return grok_client.ask_grok_stream(prompt, api_key, model=model_name)
        else:
            raise ValueError(f"Unsupported model type '{model_type}'")

