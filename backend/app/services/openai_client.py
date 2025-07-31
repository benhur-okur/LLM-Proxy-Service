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

def ask_openai_stream(prompt: str, api_key: str, model: str = "gpt-4.1"):
    client = OpenAI(api_key=api_key)
    try:
        # stream=True ile generator döner
        response_stream = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            stream=True
        )

        for chunk in response_stream:
            # chunk yapısı OpenAI streaming response yapısına göre değişir
            # Genellikle delta.content içerir
            choices = chunk.choices
            if choices and len(choices) > 0:
                delta = choices[0].delta
                if hasattr(delta, "content"):
                    yield delta.content

    except Exception as e:
        raise RuntimeError(f"OpenAI API streaming error: {e}")

