from google import genai
import time

def ask_gemini(prompt: str, user_api_key: str, model: str = "gemini-2.5-flash") -> str:
    print("User Api Key DENEME1: ", user_api_key)
    client = genai.Client(api_key=user_api_key)

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )
        return response.text
    except Exception as e:
        raise RuntimeError(f"Gemini API error: {e}")

def ask_gemini_stream(prompt: str, user_api_key: str, model: str = "gemini-2.5-flash"):
    client = genai.Client(api_key=user_api_key)
    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )
        text = response.text

        # Streaming yoksa, elle 10 karakterlik chunklara böl ve yield et
        chunk_size = 10
        for i in range(0, len(text), chunk_size):
            yield text[i:i+chunk_size]
            time.sleep(0.05)  # küçük bekleme simülasyonu

    except Exception as e:
        raise RuntimeError(f"Gemini API error: {e}")
