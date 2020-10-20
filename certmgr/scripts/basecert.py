#! /usr/bin/env python3

from func import *


class BaseCert:
    def __init__(self) -> None:
        self.verbose: bool = False if lookup_env("CERT_VERBOSE") == "0" else True

    def create(self) -> None:
        raise NotImplementedError

    def renew(self) -> None:
        raise NotImplementedError

    def debug_log(message: str) -> None:
        if self.verbose:
            print(message)
