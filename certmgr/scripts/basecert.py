#!/usr/bin/env python3


class BaseCert(ABC):
    @abstractmethod
    def create(self, force: bool = False) -> None:
        pass

    @abstractmethod
    def renew(self) -> None:
        pass
