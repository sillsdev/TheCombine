"""Define a collection of enum types for The Combine scripts."""

from enum import Enum, unique


@unique
class HelmAction(Enum):
    """
    Enumerate helm commands for maintaining The Combine on the target system.

    INSTALL is used when the chart is not already installed on the target.
    UPGRADE is used when the chart is already installed.
    """

    INSTALL = "install"
    UPGRADE = "upgrade"


@unique
class ExitStatus(Enum):
    SUCCESS = 0
    FAILURE = 1
