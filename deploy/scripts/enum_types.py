"""Define a collection of enum types for The Combine scripts."""

from enum import Enum, unique


@unique
class ExitStatus(Enum):
    SUCCESS = 0
    FAILURE = 1


@unique
class JobStatus(Enum):
    """Enumerate status values for a job being run in background."""

    RUNNING = "Running"
    SUCCESS = "Success"
    ERROR = "ERROR"
