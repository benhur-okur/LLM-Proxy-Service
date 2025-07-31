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

def ask_claude_stream(prompt: str, api_key: str, model: str = "claude-sonnet-4-20250514"):
    client = anthropic.Anthropic(api_key=api_key)
    try:
        # Stream generator döner
        stream = client.completions.create(
            model=model,
            prompt=prompt,
            max_tokens_to_sample=1024,
            stream=True
        )

        for chunk in stream:
            # chunk.text kısmı model cevabının parçası olur
            yield chunk.completion  # veya chunk.text (SDK versiyonuna göre değişir)

    except Exception as e:
        raise RuntimeError(f"Claude API streaming error: {e}")