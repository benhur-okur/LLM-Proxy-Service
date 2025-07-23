from openai import OpenAI

def ask_openai(prompt: str, api_key: str, model: str = "gpt-4.1") -> str:
    client = OpenAI(api_key=api_key)
    try:
        response = client.responses.create(
            model=model,
            input=prompt,
        )
        return response.output_text.strip()
    except Exception as e:
        raise RuntimeError(f"OpenAI API error: {e}")

