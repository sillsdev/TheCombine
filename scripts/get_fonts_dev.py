#!/usr/bin/env python3

"""Runs maintenance/scripts/get_fonts.py with dev arguments for -f and -o"""

import argparse
import importlib.util
import os
from pathlib import Path
import subprocess
import sys
from typing import List

project_dir = Path(__file__).resolve().parent.parent

EXIT_SUCCESS = 0

dev_output_dir = Path(__file__).resolve().parent.parent / "public" / "fonts"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Arguments to pass to maintenance/scripts/get_fonts.py",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "-c", "--clean", action="store_true", help="Delete the contents of the fonts directory."
    )
    parser.add_argument(
        "-l",
        "--langs",
        help="Comma-separated list of lang-tags for which fonts should be downloaded.",
    )
    parser.add_argument(
        "-f",
        "--frontend",
        help="Directory path of hosted fonts, for the css data the frontend uses.",
    )
    parser.add_argument(
        "-o", "--output", default=dev_output_dir, help="Output directory for font data."
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Print intermediate values to aid in debugging.",
    )
    args = parser.parse_args()
    args.output = Path(args.output)
    return args


def main() -> None:
    args = parse_args()

    args.output.mkdir(mode=0o755, parents=True, exist_ok=True)

    command = [
        project_dir / "maintenance" / "scripts" / "get_fonts.py",
        "-o",
        args.output,
    ]
    if args.clean:
        command.append("-c")
    if args.frontend:
        exec_args.extend(["-f", args.frontend])
    if args.langs:
        command.extend(["-l", args.langs])
    if args.verbose:
        command.append("-v")
    print(f"Running command: {command}")
    subprocess.run(command, shell=False, check=True, text=True)


if __name__ == "__main__":
    main()
