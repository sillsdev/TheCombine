#!/usr/bin/env python3


class BaseCert:
    def __init__(self) -> None:
        self.dummy: int = 0

    def create(self) -> None:
        raise NotImplementedError

    def renew(self) -> None:
        raise NotImplementedError
