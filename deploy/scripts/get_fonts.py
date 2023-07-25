#!/usr/bin/env python3
"""
Fetches the SIL fonts needed to support Mui-Language-Picker
"""

import argparse
import json
import logging
import os
from pathlib import Path
import re
from shutil import rmtree
import urllib.request

import requests


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Download all needed SIL fonts to src/resources/fonts",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Print intermediate values to aid in debugging",
    )
    parser.add_argument("-c", "--clean", action="store_true", help="Delete src/resources/fonts")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)

    target_dir = Path("./src/resources/fonts").absolute()
    if args.clean:
        logging.info(f"Deleting {target_dir}")
        if target_dir.is_dir():
            rmtree(target_dir)

    if not os.path.exists(target_dir):
        logging.info(f"Making {target_dir}")
        os.mkdir(target_dir)

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

    with open(families_file_path, "r") as families_file:
        families: dict = json.load(families_file)

        for id in family_ids:
            logging.info(id)
            font_info: dict = families[id]
            if font_info["distributable"] != True:
                logging.warning(f"{id}: Not distributable")
            if font_info["license"] != "OFL":
                logging.warning(f"{id}: Non-OFL license: {font_info['license']}")
            if font_info["source"] != "SIL":
                logging.warning(f"{id}: Non-SIL source: {font_info['source']}")
            if font_info["status"] != "current":
                logging.warning(f"{id}: Non-current status: {font_info['status']}")

            subdir = Path.joinpath(target_dir, id)
            if not os.path.exists(subdir):
                logging.info(f"Making {id} font subdirectory.")
                os.mkdir(subdir)

            defaults: dict = font_info["defaults"]
            format = ""
            for key in ["woff2", "woff", "ttf"]:
                if key in defaults.keys():
                    format = key
                    break
            if format == "":
                logging.warning(f"{id}: 'ttf', 'woff', 'woff2' formats all unavailable")

            logging.info(f"Fetching font files for: {font_info['family']}")
            default_name: str = defaults[format]

            file_name_parts = default_name.split("Regular.")
            styles = [""]
            if len(file_name_parts) == 2:
                # Most fonts
                file_name_prefix = file_name_parts[0]
                styles = ["Bold", "BoldItalic", "Italic", "Regular"]
            else:
                # Ezra, Galatia, SophiaNubian
                file_name_parts = default_name.split(".")
                file_name_prefix = file_name_parts[0]
                if file_name_prefix[-1] == "R":
                    # Galatia, SophiaNubian
                    file_name_prefix = file_name_prefix[:-1]
                    styles = ["B", "BI", "I", "R"]

            files: dict = font_info["files"]
            for style in styles:
                file_name = f"{file_name_prefix}{style}.{format}"
                if file_name in files.keys():
                    src = files[file_name]["flourl"]
                    dest = Path.joinpath(subdir, file_name)
                    req = requests.get(src)
                    logging.info(f"Downloading {src} to {dest}")
                    with open(dest, "wb") as out:
                        out.write(req.content)


if __name__ == "__main__":
    main()
