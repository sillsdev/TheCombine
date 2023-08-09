#!/usr/bin/env python3

"""Runs maintenance/scripts/get_fonts.py with dev arguments for -f and -o

Requirements:
    - npm/node installed and in PATH
    - java 8+ installed and in PATH
"""
import argparse
import os
from pathlib import Path
from typing import List

EXIT_SUCCESS = 0

dev_frontend_font_dir = "fonts"
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
        help="Comma-separated list of lang-tags of the languages for which fonts should be downloaded.",
    )
    parser.add_argument(
        "-f",
        "--frontend",
        default=dev_frontend_font_dir,
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


def execute(command: List[str], check: bool = True) -> None:
    exec_command = " ".join(command)
    print(f"Executing: {exec_command}")
    ret = os.system(exec_command)
    if check and ret != EXIT_SUCCESS:
        raise RuntimeError(f"Execution failed with return code: {ret}")

def main() -> None:
    args = parse_args()

    if not args.output.is_dir():
        os.mkdir(args.output)

    exec_args = [
            "python",
            "maintenance/scripts/get_fonts.py",
            f"-f {args.frontend}",
            f"-o {args.output}",
        ]
    if args.clean:
        exec_args.append("-c")
    if args.langs:
        exec_args.append(f"-l {args.langs}")
    if args.verbose:
        exec_args.append("-v")
    execute(exec_args    )


if __name__ == "__main__":
    main()
