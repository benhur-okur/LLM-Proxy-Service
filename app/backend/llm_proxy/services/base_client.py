from abc import ABC, abstractmethod
from typing import Iterable

class BaseLLMClient(ABC):
    """
    Every concrete client must implement these two methods.
    """

    @abstractmethod
    def ask(self, prompt: str, api_key: str, model: str) -> str:
        """Return the full, finished completion."""
        ...

    @abstractmethod
    def stream(self, prompt: str, api_key: str, model: str) -> Iterable[str]:
        """Yield text chunks (SSE / generator style)."""
        ...