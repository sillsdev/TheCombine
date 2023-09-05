#!/usr/bin/env python3

"""Runs maintenance/scripts/get_fonts.py with dev arguments for -f and -o"""

import argparse
from pathlib import Path
import platform
import subprocess

project_dir = Path(__file__).resolve().parent.parent
dev_output_dir = project_dir / "public" / "fonts"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Arguments to pass to maintenance/scripts/get_fonts.py",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--clean", "-c", action="store_true", help="Delete the contents of the fonts directory."
    )
    parser.add_argument(
        "--langs",
        "-l",
        nargs="*",
        metavar="LANG",
        help="List of language tags for which fonts should be downloaded.",
    )
    parser.add_argument(
        "--url",
        "-u",
        dest="local_font_url",
        help="URL for locally hosted fonts, for the css data used by the client.",
    )
    parser.add_argument(
        "--output", "-o", default=dev_output_dir, help="Output directory for font data."
    )
    parser.add_argument(
        "--verbose",
        "-v",
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
        "python",
        project_dir / "maintenance" / "scripts" / "get_fonts.py",
        "-o",
        args.output,
    ]
    if args.clean:
        command.append("-c")
    if args.local_font_url:
        command.append("-f")
        command.extend(args.local_font_url)
    if args.langs:
        command.append("-l")
        command.extend(args.langs)
    if args.verbose:
        command.append("-v")
    subprocess.run(command, shell=(platform.system() == "Windows"), check=True, text=True)


if __name__ == "__main__":
    main()
