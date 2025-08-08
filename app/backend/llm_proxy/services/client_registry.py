from .openai_client import OpenAIClient
from .claude_client import ClaudeClient
from .gemini_client import GeminiClient
from .grok_client  import GroqClient
from .deepseek_client import DeepSeekClient
from .openrouter_client import OpenRouterClient

CLIENT_REGISTRY = {
    "openai":    OpenAIClient(),
    "anthropic": OpenRouterClient(),
    "gemini":    GeminiClient(),
    "groq":      OpenRouterClient(),
    "deepseek":  OpenRouterClient(),
}