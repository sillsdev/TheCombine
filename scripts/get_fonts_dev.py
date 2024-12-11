#!/usr/bin/env python

"""
Runs maintenance/scripts/get_fonts.py with dev arguments for -f and -o.
Run this script with -U/--update whenever the mui-language-picker version is updated.
"""

import argparse
from pathlib import Path
import platform
import re
import subprocess

project_dir = Path(__file__).resolve().parent.parent
dev_output_dir = project_dir / "public" / "fonts"
maintenance_scripts_dir = project_dir / "maintenance" / "scripts"
mlp_font_list = maintenance_scripts_dir / "mui_language_picker_fonts.txt"
mlp_font_families = (
    project_dir / "node_modules" / "mui-language-picker" / "dist" / "data" / "scriptFontIndex.js"
)


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
        "--scripts",
        "-s",
        nargs="*",
        metavar="SCRIPT",
        help="List of script tags for which fonts should be downloaded.",
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
        "--update",
        "-U",
        action="store_true",
        help="Updates the list of fonts from mui-language-picker. (Must have run `npm i`.)",
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

    if args.update:
        # Font families are in the file as: \"family\":\"Font Family Name\"
        family_pattern = re.compile(r'\\"family\\"\:\\"([^\\]+)\\"')
        with open(mlp_font_families, "r") as families_file:
            matches = re.findall(family_pattern, families_file.read())
        font_lines = [match + "\n" for match in set(matches)]
        font_lines.sort()
        with open(mlp_font_list, "w") as fonts_file:
            fonts_file.writelines(font_lines)

    args.output.mkdir(mode=0o755, parents=True, exist_ok=True)

    command = [
        "python",
        maintenance_scripts_dir / "get_fonts.py",
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
    if args.scripts:
        command.append("-s")
        command.extend(args.scripts)
    if args.verbose:
        command.append("-v")
    subprocess.run(command, shell=(platform.system() == "Windows"), check=True, text=True)


if __name__ == "__main__":
    main()
