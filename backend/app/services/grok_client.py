import requests

def ask_grok_stream(prompt: str, api_key: str, model: str = "grok-1"):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
        "stream": True
    }

    with requests.post(url, headers=headers, json=payload, stream=True) as resp:
        resp.raise_for_status()
        for line in resp.iter_lines():
            if line:
                decoded_line = line.decode('utf-8').strip()
                # Stream yanıtları genelde "data: {json}" şeklinde gelir
                if decoded_line.startswith("data: "):
                    data_json = decoded_line[len("data: "):]
                    if data_json == "[DONE]":
                        break
                    import json
                    data = json.loads(data_json)
                    # data yapısına göre metni çek
                    content = data.get("choices", [{}])[0].get("delta", {}).get("content")
                    if content:
                        yield content
