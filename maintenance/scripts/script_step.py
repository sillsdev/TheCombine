"""Manage the step number for steps that are printed while running a script."""

from dataclasses import dataclass
import logging


@dataclass
class ScriptStep:
    """Manage the step number for steps that are printed while running a script."""

    step_num: int = 1

    def print(self, descr: str) -> None:
        """Print the step number with its description and bump the step number."""
        logging.info("  %i. %s", self.step_num, descr)
        self.step_num += 1
