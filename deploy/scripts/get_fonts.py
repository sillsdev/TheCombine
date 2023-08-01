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
        description="Prepares all needed fonts.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("-c", "--clean", action="store_true", help="Delete the fonts directory")
    parser.add_argument("-d", "--download", action="store_true", help="Download fonts")
    parser.add_argument(
        "-r",
        "--root",
        action="store_true",
        default="C:/Users/danie/.CombineFiles",
        help="Directory in which the fonts directory should live",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Print intermediate values to aid in debugging",
    )
    return parser.parse_args()


def checkFontInfo(font_info: dict) -> bool:
    family: str = font_info["family"]

    # Check that the font is current and licensed as expected.
    if font_info["distributable"] != True:
        logging.warning(f"{family}: Not distributable")
    if "license" not in font_info.keys():
        logging.warning(f"{family}: No license")
    elif font_info["license"] != "OFL":
        logging.warning(f"{family}: Non-OFL license: {font_info['license']}")
    if "source" not in font_info.keys():
        logging.warning(f"{family}: No source")
    elif font_info["source"] not in ["Google", "SIL"]:
        logging.warning(f"{family}: Non-Google, non-SIL source: {font_info['source']}")
    if "status" not in font_info.keys():
        logging.warning(f"{family}: No status")
    elif font_info["status"] != "current":
        logging.warning(f"{family}: Non-current status: {font_info['status']}")

    if "defaults" not in font_info.keys() or len(font_info["defaults"]) == 0:
        logging.warning(f"{family}: No defaults")
        return False

    if "files" not in font_info.keys():
        logging.warning(f"{family}: no file list")
        return False

    return True


def main() -> None:
    args = parse_args()
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)

    root_dir = Path(args.root)
    if not os.path.exists(root_dir):
        logging.error("Root directory specified with --root_dir not valid")
        exit(1)

    # Assumes script is run from The Combine's root directory
    target_dir = root_dir.joinpath("fonts")

    if args.clean:
        logging.info(f"Deleting {target_dir}")
        if target_dir.is_dir():
            rmtree(target_dir)

    if not os.path.exists(target_dir):
        logging.info(f"Making {target_dir}")
        os.mkdir(target_dir)

    source_url = "https://github.com/silnrsi/fonts/raw/main/families.json"
    families_file_path = target_dir.joinpath("families.json")
    logging.info(f"Downloading {source_url} to {families_file_path}")
    urllib.request.urlretrieve(source_url, families_file_path)

    # Todo: Add info for these font's directly to this script.
    mlp_families_not_in_file = {"simsun": "Sim Sun", "notosanstangut": "Noto Serif Tangut"}

    with open(families_file_path, "r") as nrsi_families_file:
        families: dict = json.load(nrsi_families_file)

    with open("deploy/scripts/font_lists/mui-language-picker-fonts.txt", "r") as mlp_families_file:
        mlp_families = [f.strip() for f in mlp_families_file.readlines()]
        mlp_ids = [f.strip().replace(" ", "").lower() for f in mlp_families_file.readlines()]

    with open("deploy/scripts/font_lists/mlp-nrsi-font-map.json", "r") as mlp_nrsi_map_file:
        mlp_nrsi_map: dict = json.load(mlp_nrsi_map_file)

    for mlp_family in mlp_families:
        mlp_id = mlp_family.replace(" ", "").lower()
        nrsi_id = mlp_nrsi_map[mlp_id] if mlp_id in mlp_nrsi_map.keys() else mlp_id
        logging.info(f"Font: {mlp_id}/{nrsi_id}")

        # Get font info from the file of font families, using fallback font if necessary
        while nrsi_id != "" and nrsi_id in families.keys():
            font_info: dict = families[nrsi_id]
            family = font_info["family"]
            if checkFontInfo(font_info):
                break
            if "fallback" in font_info.keys():
                nrsi_id: str = font_info["fallback"]
                logging.warning(f"{family}: Using fallback {nrsi_id}")
            else:
                logging.warning(f"{family}: No fallback")
                nrsi_id = ""
        else:
            if nrsi_id != "":
                logging.warning(f"Font {nrsi_id} not in file {families_file_path}")
            continue

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
        logging.info(f"{family}: default {default_name}")
        if "-Regular." in default_name:
            # Most fonts
            file_name_prefix = default_name.split("-Regular.")[0]
            style_suffixes = ["-Bold", "-BoldItalic", "-Italic", "-Regular"]
        elif "REGULAR." in default_name:
            # Aboriginal Sans
            file_name_prefix = default_name.split("REGULAR.")[0]
            style_suffixes = ["BOLD", "BOLDITALIC", "ITALIC", "REGULAR"]
        elif "-R." in default_name:
            # Khmer Mondulkiri
            file_name_prefix = default_name.split("-R.")[0]
            style_suffixes = ["-B", "-BI", "-I", "-R"]
        elif "R." in default_name:
            # Galatia SIL, Sophia Nubian
            file_name_prefix = default_name.split("R.")[0]
            style_suffixes = ["B", "BI", "I", "R"]
        else:
            # Ezra SIL
            file_name_prefix = default_name.split(".")[0]
            style_suffixes = [""]

        logging.info(f"{family}: Populating font subfolder '{mlp_id}'")
        subdir = Path.joinpath(target_dir, mlp_id)
        if not os.path.exists(subdir):
            os.mkdir(subdir)
        # To fill with the content of the font family's css file.
        css_lines: List[str] = []

        files: dict = font_info["files"]
        for style_suffix in style_suffixes:
            file_name = f"{file_name_prefix}{style_suffix}.{format}"
            if file_name in files.keys():
                # Build the css info for this font in this style.
                css_lines.append("@font-face {\n")
                css_lines.append("  font-display: swap;\n")
                css_lines.append(f"  font-family: '{mlp_family}';\n")
                variable_name = f"{file_name_prefix}_"
                if style_suffix in ["-Regular", "REGULAR", "-R", "R", ""]:
                    css_lines.append("  font-style: normal;\n")
                    css_lines.append("  font-weight: normal;\n")
                    css_line_local = f"local('{family}'), local('{family} Regular'),"
                    variable_name += "Regular"
                elif style_suffix in ["-Bold", "BOLD", "-B", "B"]:
                    css_lines.append("  font-style: normal;\n")
                    css_lines.append("  font-weight: bold;\n")
                    css_line_local = f"local('{family} Bold'),"
                    variable_name += "Bold"
                elif style_suffix in ["-Italic", "ITALIC" "-I", "I"]:
                    css_lines.append("  font-style: italic;\n")
                    css_lines.append("  font-weight: normal;\n")
                    css_line_local = f"local('{family} Italic'),"
                    variable_name += "Italic"
                elif style_suffix in ["-BoldItalic", "BOLDITALIC", "-BI", "BI"]:
                    css_lines.append("  font-style: italic;\n")
                    css_lines.append("  font-weight: bold;\n")
                    css_line_local = f"local('{family} Bold Italic'),"
                    variable_name += "BoldItalic"
                else:
                    logging.error(f"{family}: Impossible font style suffix: {style_suffix}")
                    continue

                # Build the url source, downloading if requested.
                dest = Path.joinpath(subdir, file_name)
                if args.download:
                    if file_name not in files.keys():
                        logging.error(f"{family}: No such file: {file_name}")
                        continue
                    file_info: dict = files[file_name]
                    if "flourl" not in file_info.keys():
                        logging.info(f"{file_name}: No 'flourl' for this file")
                        if "url" not in file_info.keys():
                            logging.warning(f"{file_name}: No 'flourl' or 'url' for this file")
                            continue
                        src = file_info["url"]
                    else:
                        src = file_info["flourl"]

                    # With the https://fonts.languagetechnology.org "flourl" urls,
                    # urllib.request.urlretrieve() is denied (403), but requests.get() works.
                    req = requests.get(src)
                    logging.info(f"Downloading {src} to {dest}")
                    with open(dest, "wb") as out:
                        out.write(req.content)

                # Finish the css info for this font in this style.
                css_lines.append(f"  src: {css_line_local} url('{dest}');\n")
                css_lines.append("}\n")

        # Create font override file
        css_file_path = subdir.joinpath("fontFace.css")
        logging.info(f"Writing css info for font family: {css_file_path}")
        with open(css_file_path, "w") as css_file:
            css_file.writelines(css_lines)


if __name__ == "__main__":
    main()
