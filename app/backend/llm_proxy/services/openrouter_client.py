import requests
import json
import os
from .base_client import BaseLLMClient

class OpenRouterClient(BaseLLMClient):
    def ask(self, prompt: str, api_key: str, model: str) -> str:
        return ''.join(self.stream(prompt, api_key, model))

    def stream(self, prompt: str, api_key: str, model: str):
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.getenv("APP_PUBLIC_URL", "http://localhost:3000"),
            "X-Title": os.getenv("APP_NAME", "LLM Proxy Service"),
        }

        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1024,
            "stream": True
            # "provider": sonradan eklenebilir ek özellik olarak!
        }

        with requests.post(url, headers=headers, json=payload, stream=True) as resp:
            try:
                resp.raise_for_status()
            except requests.HTTPError:
                # log the errors
                try:
                    print("OpenRouter error:", resp.status_code, resp.text)
                except Exception:
                    pass
                raise

            for line in resp.iter_lines():
                if not line:
                    continue
                decoded = line.decode("utf-8").strip()
                if not decoded.startswith("data: "):
                    continue
                data_json = decoded[len("data: "):]
                if data_json == "[DONE]":
                    break
                data = json.loads(data_json)
                content = data.get("choices", [{}])[0].get("delta", {}).get("content")
                if content:
                    yield content