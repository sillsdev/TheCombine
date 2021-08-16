"""Manage the step number for steps that are printed while running a script."""

import logging


class ScriptStep:
    """Manage the step number for steps that are printed while running a script."""

    def __init__(self) -> None:
        """Initialize the step number to 1."""
        self.step_num = 1

    def print(self, descr: str) -> None:
        """Print the step number with its description and bump the step number."""
        logging.info("  %i. %s", self.step_num, descr)
        self.step_num += 1
