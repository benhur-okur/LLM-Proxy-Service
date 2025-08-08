import anthropic
from .base_client import BaseLLMClient

class ClaudeClient(BaseLLMClient):
    def ask(self, prompt: str, api_key: str, model: str) -> str:
        client = anthropic.Anthropic(api_key=api_key)
        try:
            message = client.messages.create(
                model=model,
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )
            return message.content.strip()
        except Exception as e:
            raise RuntimeError(f"Claude API error: {e}")

    def stream(self, prompt: str, api_key: str, model: str):
        client = anthropic.Anthropic(api_key=api_key)
        try:
            stream = client.completions.create(
                model=model,
                prompt=prompt,
                max_tokens_to_sample=1024,
                stream=True
            )
            for chunk in stream:
                yield chunk.completion
        except Exception as e:
            raise RuntimeError(f"Claude API streaming error: {e}")