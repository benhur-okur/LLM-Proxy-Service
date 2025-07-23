from google import genai

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
