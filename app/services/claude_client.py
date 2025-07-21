import anthropic

def ask_claude(prompt: str, api_key: str, model: str = "claude-sonnet-4-20250514") -> str:
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
