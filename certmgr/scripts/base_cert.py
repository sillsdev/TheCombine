"""BaseCert is an Abstract Base Class for the certificate management classes for TheCombine."""

from abc import ABC, abstractmethod


class BaseCert(ABC):
    """Abstract Base Class for a certificate management class."""

    @abstractmethod
    def create(self) -> None:
        """Create a certificate for TheCombine."""

    @abstractmethod
    def renew(self) -> None:
        """Renew a certificate for TheCombine."""
