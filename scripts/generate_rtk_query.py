#! /usr/bin/env python3

from __future__ import annotations

import argparse
from contextlib import closing
import json
import logging
from pathlib import Path
import re
import socket
from typing import Dict, List

project_dir = Path(__file__).resolve().parent.parent
config_dir = project_dir / "src" / "rtk-query"
files_dir = Path(__file__).resolve().parent / "files"
controllers_dir = project_dir / "Backend" / "Controllers"


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate API Slice for RTK Query from Backend Controllers.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Print INFO logging messages.",
    )
    return parser.parse_args()


def backend_running() -> bool:
    """Return true if the backend is running and listening on port 5000."""
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        return sock.connect_ex(("localhost", 5000)) == 0


def find_endpoints(controller_file: Path) -> List[str]:
    """Build a list of endpoints in the controller source file specified."""
    endpoints: List[str] = []
    with open(controller_file, "r") as file:
        for line in file.readlines():
            match = re.search(r"IActionResult>?\s+(\w+)\(", line)
            if match:
                endpoints.append(match.group(1))
    return endpoints


def get_controllers() -> Dict[str, List[str]]:
    """
    Build the list of endpoint filters for the different backend controllers.

    Returns a dictionary keyed by the name of the controller.  Each value
    is a list of API Operations for that controller.
    """
    controllers: Dict[str, List[str]] = {}
    for controller_src in controllers_dir.iterdir():
        match = re.search(r"^(\w+)Controller$", controller_src.stem)
        if match:
            api_name = (match.group(1)).lower()
            controllers[api_name] = find_endpoints(controller_src)
    return controllers


def main() -> None:
    args = parse_args()
    log_level = logging.INFO if args.verbose else logging.WARNING
    logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)
    if backend_running():
        logging.info("Backend is running.")
    else:
        logging.info("Backend needs to be started.")
    logging.info(f"Project dir == {project_dir}")
    controllers = get_controllers()
    with open(files_dir / "openapi-config.json") as cfg_file:
        config = json.load(cfg_file)
    logging.info(config)


if __name__ == "__main__":
    main()
