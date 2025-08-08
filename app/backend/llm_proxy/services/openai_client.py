from openai import OpenAI
from .base_client import BaseLLMClient

class OpenAIClient(BaseLLMClient):
    def ask(self, prompt: str, api_key: str, model: str) -> str:
        client = OpenAI(api_key=api_key)
        try:
            response = client.responses.create(
                model=model,
                input=prompt,
            )
            return response.output_text.strip()
        except Exception as e:
            raise RuntimeError(f"OpenAI API error: {e}")

    def stream(self, prompt: str, api_key: str, model: str):
        client = OpenAI(api_key=api_key)
        try:
            response_stream = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )
            for chunk in response_stream:
                choices = chunk.choices
                if choices and len(choices) > 0:
                    delta = choices[0].delta
                    if hasattr(delta, "content"):
                        yield delta.content
        except Exception as e:
            raise RuntimeError(f"OpenAI API streaming error: {e}")