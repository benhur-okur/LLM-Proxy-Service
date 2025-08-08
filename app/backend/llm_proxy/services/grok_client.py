import requests
import json
from .base_client import BaseLLMClient

class GroqClient(BaseLLMClient):
    def ask(self, prompt: str, api_key: str, model: str) -> str:
        chunks = self.stream(prompt, api_key, model)
        return ''.join(chunks)

    def stream(self, prompt: str, api_key: str, model: str):
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,  # örnek: "mixtral-8x7b-32768"
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1024,
            "stream": True
        }

        with requests.post(url, headers=headers, json=payload, stream=True) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if line:
                    decoded_line = line.decode("utf-8").strip()
                    if decoded_line.startswith("data: "):
                        data_json = decoded_line[len("data: "):]
                        if data_json == "[DONE]":
                            break
                        data = json.loads(data_json)
                        content = data.get("choices", [{}])[0].get("delta", {}).get("content")
                        if content:
                            yield content