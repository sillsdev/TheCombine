"""Define a collection of enum types for The Combine scripts."""

from enum import Enum, unique


@unique
class HelmAction(Enum):
    """Enumerate helm commands for maintaining The Combine on the target system."""

    INSTALL = "install"
    """INSTALL is used when the chart is not already installed on the target."""
    UPGRADE = "upgrade"
    """UPGRADE is used when the chart is already installed."""


@unique
class ExitStatus(Enum):
    SUCCESS = 0
    FAILURE = 1


@unique
class JobStatus(Enum):
    """Enumerate status values for a job being run in background."""

    RUNNING = -1
    SUCCESS = 0
    ERROR = 1


@unique
class OutputMode(Enum):
    NONE = "none"
    PROGRESS = "progress"
    ALL = "all"
