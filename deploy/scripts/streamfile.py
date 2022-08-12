"""Class to encapulate a temporary file to capture streaming output."""

from __future__ import annotations

from tempfile import NamedTemporaryFile
from typing import IO


class StreamFile:
    def __init__(self) -> None:
        self.fp = NamedTemporaryFile(mode="w+", encoding="utf-8")

    def open(self) -> None:
        self.close()
        self.fp = NamedTemporaryFile(mode="w+", encoding="utf-8")

    def file(self) -> IO[str]:
        return self.fp.file

    def print(self) -> None:
        if not self.fp.closed:
            self.fp.seek(0)
            for line in self.fp:
                print(line, end="")

    def close(self) -> None:
        if not self.fp.closed:
            self.fp.close()
