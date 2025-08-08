# app/backend/llm_proxy/services/gemini_client.py
from google import genai
import time
from .base_client import BaseLLMClient

class GeminiClient(BaseLLMClient):
    """Google Gemini wrapper with real streaming when available."""

    def ask(self, prompt: str, api_key: str, model: str):
        client = genai.Client(api_key=api_key)
        try:
            resp = client.models.generate_content(
                model=model,
                contents=prompt,
            )
            text = getattr(resp, "text", None)
            if text is not None:
                return text

            try:
                if hasattr(resp, "candidates") and resp.candidates:
                    cand0 = resp.candidates[0]
                    parts = getattr(getattr(cand0, "content", None), "parts", None)
                    if parts:
                        return "".join(getattr(p, "text", "") for p in parts)
            except Exception:
                pass

            return str(resp)

        except Exception as e:
            raise RuntimeError(f"Gemini API error: {e}")

    def stream(self, prompt: str, api_key: str, model: str):
        client = genai.Client(api_key=api_key)
        try:
            #prefer native streaming (if SDK supports it)
            resp = client.models.generate_content(
                model=model,
                contents=prompt,
                stream=True,
            )

            got_any_chunk = False
            for chunk in resp:
                piece = getattr(chunk, "text", None)

                if not piece:
                    try:
                        if hasattr(chunk, "candidates") and chunk.candidates:
                            cand0 = chunk.candidates[0]
                            content = getattr(cand0, "content", None)
                            parts = getattr(content, "parts", None) if content else None
                            if parts:
                                piece = "".join(getattr(p, "text", "") for p in parts) or None
                    except Exception:
                        piece = None

                if piece:
                    got_any_chunk = True
                    yield piece

            # Some builds buffer and only return once; if nothing streamed, fallback
            if not got_any_chunk:
                final = client.models.generate_content(model=model, contents=prompt)
                text = getattr(final, "text", None)
                if text is None:
                    try:
                        if hasattr(final, "candidates") and final.candidates:
                            cand0 = final.candidates[0]
                            parts = getattr(getattr(cand0, "content", None), "parts", None)
                            if parts:
                                text = "".join(getattr(p, "text", "") for p in parts)
                    except Exception:
                        text = None
                if text is None:
                    text = str(final)

                #manual chunking fallback
                for i in range(0, len(text), 32):
                    yield text[i:i+32]
                    time.sleep(0.02)

        except TypeError:
            # SDK doesn’t support stream=True →> return to non-stream
            final = client.models.generate_content(model=model, contents=prompt)
            text = getattr(final, "text", None)
            if text is None:
                try:
                    if hasattr(final, "candidates") and final.candidates:
                        cand0 = final.candidates[0]
                        parts = getattr(getattr(cand0, "content", None), "parts", None)
                        if parts:
                            text = "".join(getattr(p, "text", "") for p in parts)
                except Exception:
                    text = None
            if text is None:
                text = str(final)

            for i in range(0, len(text), 32):
                yield text[i:i+32]
                time.sleep(0.02)

        except Exception as e:
            raise RuntimeError(f"Gemini API error: {e}")