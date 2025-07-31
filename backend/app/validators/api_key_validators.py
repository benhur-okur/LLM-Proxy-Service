import requests

def verify_openai_api_key(api_key: str) -> bool:
    url = "https://api.openai.com/v1/models"
    headers = {"Authorization": f"Bearer {api_key}"}
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return True
        elif response.status_code == 400:
            # Bad Request olabilir ama anahtar geçerli olabilir.
            # Hata mesajına bak:
            data = response.json()
            # Eğer hata anahtar ile ilgili değilse (örneğin parametre hatası) geçerli say.
            if "error" in data:
                msg = data["error"].get("message", "").lower()
                if "invalid" in msg or "unauthorized" in msg or "forbidden" in msg:
                    return False
                return True
            return True
        else:
            return False
    except Exception as e:
        print(f"[OpenAI Key Validation Error]: {e}")
        return False

def verify_anthropic_api_key(api_key: str) -> bool:
    url = "https://api.anthropic.com/v1/models"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01"
    }
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return True
        elif response.status_code == 400:
            data = response.json()
            if "error" in data:
                msg = data["error"].get("message", "").lower()
                if "invalid" in msg or "unauthorized" in msg or "forbidden" in msg:
                    return False
                return True
            return True
        else:
            return False
    except Exception as e:
        print(f"[Anthropic Key Validation Error]: {e}")
        return False

def verify_grok_api_key(api_key: str) -> bool:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "model": "grok-1",
        "messages": [{"role": "user", "content": "Hello"}],
        "max_tokens": 5
    }
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            return True
        elif response.status_code == 400:
            data = response.json()
            if "error" in data:
                msg = data["error"].get("message", "").lower()
                if "invalid" in msg or "unauthorized" in msg or "forbidden" in msg:
                    return False
                return True
            return True
        else:
            return False
    except Exception as e:
        print(f"[Grok Key Validation Error]: {e}")
        return False

def verify_gemini_api_key(api_key: str) -> bool:
    url = f"https://generativelanguage.googleapis.com/v1/models?key={api_key}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return True
        else:
            return False
    except Exception as e:
        print(f"[Gemini Key Validation Error]: {e}")
        return False

def validate_api_key_by_provider(model_name: str, key_value: str) -> tuple[bool, str]:
    provider = model_name.lower()

    try:
        if provider == "openai":
            return verify_openai_api_key(key_value), ""

        elif provider == "anthropic":
            return verify_anthropic_api_key(key_value), ""

        elif provider == "grok":
            return verify_grok_api_key(key_value), ""

        elif provider == "gemini":
            return verify_gemini_api_key(key_value), ""

        else:
            return False, f"Unknown model/provider: {provider}"

    except Exception as e:
        return False, str(e)
