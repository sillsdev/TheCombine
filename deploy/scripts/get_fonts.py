#!/usr/bin/env python3
"""
Generates font support for all SIL fonts used in Mui-Language-Picker.
"""

import argparse
import json
import logging
import os
from pathlib import Path
from shutil import rmtree
from typing import List
import urllib.request

import requests


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Prepares all needed SIL fonts in src/resources/fonts.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("-c", "--clean", action="store_true", help="Delete src/resources/fonts")
    parser.add_argument(
        "-d", "--download", action="store_true", help="Download fonts (for NUC deployment)"
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Print intermediate values to aid in debugging",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)

    # Assumes script is run from The Combine's root directory
    target_dir = Path("./src/resources/fonts").absolute()

    if args.clean:
        logging.info(f"Deleting {target_dir}")
        if target_dir.is_dir():
            rmtree(target_dir)

    if not os.path.exists(target_dir):
        logging.info(f"Making {target_dir}")
        os.mkdir(target_dir)

    if args.download:
        ts_declare_path = Path.joinpath(target_dir, "fonts.d.ts")
        if not os.path.exists(ts_declare_path):
            logging.info(f"Making TypeScript declaration file for font files: {ts_declare_path}")
            with open(ts_declare_path, "w") as ts_file:
                ts_file.writelines(
                    [
                        'declare module "*.ttf";\n',
                        'declare module "*.woff";\n',
                        'declare module "*.woff2";\n',
                    ]
                )

    source_url = "https://github.com/silnrsi/fonts/raw/main/families.json"
    families_file_path = Path.joinpath(target_dir, "families.json")
    logging.info(f"Downloading {source_url} to {families_file_path}")
    urllib.request.urlretrieve(source_url, families_file_path)

    family_ids = [
        "abyssinicasil",
        "annapurnasil",
        "awaminastaliq",
        "charissil",
        "daibannasil",
        "doulossil",
        "ezrasil",
        "galatiasil",
        "gentiumplus",
        "harmattan",
        "mingzat",
        "namdhinggo",
        "narnoor",
        "nokyung",
        "nuosusil",
        "padauk",
        "scheherazadenew",
        "shimenkan",
        "sophianubian",
        "taiheritagepro",
    ]

    # The Mui Language Picker name doesn't always match the current font.
    # https://github.com/sillsdev/mui-language-picker/blob/master/src/langPicker/fontList.js > fontMap
    MLP_family_override = {
        "galatiasil": "Galatia",  # MLP omits SIL
        "namdhinggo": "Namdhinggo SIL",  # MLP adds SIL
        "scheherazadenew": "Scheherazade",  # MLP omits New
    }

    # These will be filed with the lines needed to generate the font .ts file.
    import_lines: List[str] = []
    css_lines: List[str] = []

    with open(families_file_path, "r") as families_file:
        families: dict = json.load(families_file)
        for id in family_ids:
            logging.info(f"Font: {id}")

            # Get font info from the file of font families.
            if not id in families.keys():
                logging.warning(f"Font {id} not in file {families_file_path}")
                continue
            font_info: dict = families[id]
            family: str = font_info["family"]

            # Check that the font is current and licensed as expected.
            if font_info["distributable"] != True:
                logging.warning(f"{family}: Not distributable")
            if font_info["license"] != "OFL":
                logging.warning(f"{family}: Non-OFL license: {font_info['license']}")
            if font_info["source"] != "SIL":
                logging.warning(f"{family}: Non-SIL source: {font_info['source']}")
            if font_info["status"] != "current":
                logging.warning(f"{family}: Non-current status: {font_info['status']}")

            # Determine which format to use, with preference for woff2 if available.
            defaults: dict = font_info["defaults"]
            format = ""
            for key in ["woff2", "woff", "ttf"]:
                if key in defaults.keys():
                    format = key
                    break
            if format == "":
                logging.warning(f"{family}: 'ttf', 'woff', 'woff2' formats all unavailable")
                continue
            logging.info(f"{family}: Using format '{format}'")

            # Determine the naming convention in this font's files.
            default_name: str = defaults[format]
            if "Regular." in default_name:
                # Most fonts
                file_name_prefix = default_name.split("-Regular.")[0]
                style_suffixes = ["-Bold", "-BoldItalic", "-Italic", "-Regular"]
            elif "R." in default_name:
                # Galatia SIL, Sophia Nubian
                file_name_prefix = default_name.split("R.")[0]
                style_suffixes = ["B", "BI", "I", "R"]
            else:
                # Ezra SIL
                file_name_prefix = default_name.split(".")[0]
                style_suffixes = [""]

            if args.download:
                logging.info(f"{family}: Populating font subfolder '{id}'")
                subdir = Path.joinpath(target_dir, id)
                if not os.path.exists(subdir):
                    os.mkdir(subdir)

            files: dict = font_info["files"]
            for style_suffix in style_suffixes:
                file_name = f"{file_name_prefix}{style_suffix}.{format}"
                if file_name in files.keys():
                    # Build the css info for this font in this style.
                    css_lines.append("@font-face {\n")
                    css_lines.append("  font-display: swap;\n")
                    if id in MLP_family_override.keys():
                        css_lines.append(f"  font-family: '{MLP_family_override[id]}';\n")
                    else:
                        css_lines.append(f"  font-family: '{family}';\n")
                    variable_name = f"{file_name_prefix}_"
                    if style_suffix in ["-Regular", "R", ""]:
                        css_lines.append("  font-style: normal;\n")
                        css_lines.append("  font-weight: normal;\n")
                        css_line_local = f"local('{family}'), local('{family} Regular'),"
                        variable_name += "Regular"
                    elif style_suffix in ["-Bold", "B"]:
                        css_lines.append("  font-style: normal;\n")
                        css_lines.append("  font-weight: bold;\n")
                        css_line_local = f"local('{family} Bold'),"
                        variable_name += "Bold"
                    elif style_suffix in ["-Italic", "I"]:
                        css_lines.append("  font-style: italic;\n")
                        css_lines.append("  font-weight: normal;\n")
                        css_line_local = f"local('{family} Italic'),"
                        variable_name += "Italic"
                    elif style_suffix in ["-BoldItalic", "BI"]:
                        css_lines.append("  font-style: italic;\n")
                        css_lines.append("  font-weight: bold;\n")
                        css_line_local = f"local('{family} Bold Italic'),"
                        variable_name += "BoldItalic"
                    else:
                        logging.error(f"Impossible font style suffix: {style_suffix}")
                        continue

                    # Build the url source, downloading if requested.
                    src = files[file_name]["flourl"]
                    if args.download:
                        dest = Path.joinpath(subdir, file_name)
                        import_lines.append(
                            f'import {variable_name} from "resources/fonts/{id}/{file_name}";\n'
                        )
                        css_line_url = "url(${" + variable_name + "})"
                        # With the https://fonts.languagetechnology.org "flourl" urls,
                        # urllib.request.urlretrieve() is denied (403), but requests.get() works.
                        req = requests.get(src)
                        logging.info(f"Downloading {src} to {dest}")
                        with open(dest, "wb") as out:
                            out.write(req.content)
                    else:
                        css_line_url = f"url('{src}')"

                    # Finish the css info for this font in this style.
                    css_lines.append(
                        f"  src: {css_line_local} {css_line_url} format('{format}');\n"
                    )
                    css_lines.append("}\n")

    # Create font override file
    css_file_path = Path.joinpath(target_dir, "silFonts.ts")
    logging.info(f"Generating font overrides file: {css_file_path}")
    with open(css_file_path, "w") as css_file:
        if len(import_lines) > 0:
            css_file.writelines(import_lines)
            css_file.write("\n")
        css_file.write("export default `\n")
        css_file.writelines(css_lines)
        css_file.write("`;\n")


if __name__ == "__main__":
    main()
