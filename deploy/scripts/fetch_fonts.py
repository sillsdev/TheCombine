#!/usr/bin/env python3
"""
Generates font support for all fonts used in Mui-Language-Picker.
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

    source_dir = "https://s3.amazonaws.com/fonts.siltranscriber.org/"

    with open("deploy/scripts/font_lists/mui-language-picker-fonts.txt", "r") as mlp_families_file:
        mlp_families = [f.strip() for f in mlp_families_file.readlines()]

    for mlp_family in mlp_families:
        family = mlp_family.replace(" ", "")
        logging.info(f"Font: {family}")

        logging.info(f"{family}: Populating font subfolder '{family}'")
        subdir = target_dir.joinpath(family)
        if not os.path.exists(subdir):
            os.mkdir(subdir)

        css_source = f"{source_dir}{family}.css"
        css_target = subdir.joinpath(f"{family}.css")                    
        # With the https://s3.amazonaws.com/fonts.siltranscriber.org/ urls,
        # urllib.request.urlretrieve() is denied (403), but requests.get() works.
        logging.info(f"Downloading {css_source}")
        req = requests.get(css_source)

        if "Error" in req.text:
            logging.warning(f"Download failed: {css_source}")
            continue

        if not args.download:
            logging.info(f"Saving to {css_target}")
            with open(css_target, "wb") as out:
                out.write(req.content)
            continue

        css_lines = [l for l in req.iter_lines()]
        for i in range(len(css_lines)):
            line: str = css_lines[i]
            if line[:4] == "src:":
                src_parts = line.split("'")
                logging.info(f"Downloading {src_parts[1]}")
                

        '''

        # Get font info from the file of font families.
        if not nrsi_id in families.keys():
            logging.warning(f"Font {nrsi_id} not in file {families_file_path}")
            continue
        font_info: dict = families[nrsi_id]
        family: str = font_info["family"]

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
        if "Regular." in default_name:
            # Most fonts
            file_name_prefix = default_name.split("-Regular.")[0]
            style_suffixes = ["-Bold", "-BoldItalic", "-Italic", "-Regular"]
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

        if "files" not in font_info.keys():
            logging.warning(f"{family}: no file list")
            continue

    
        files: dict = font_info["files"]
        for style_suffix in style_suffixes:
            file_name = f"{file_name_prefix}{style_suffix}.{format}"
            if file_name in files.keys():
                # Build the css info for this font in this style.
                css_lines.append("@font-face {\n")
                css_lines.append("  font-display: swap;\n")
                css_lines.append(f"  font-family: '{mlp_family}';\n")
                variable_name = f"{file_name_prefix}_"
                if style_suffix in ["-Regular", "-R", "R", ""]:
                    css_lines.append("  font-style: normal;\n")
                    css_lines.append("  font-weight: normal;\n")
                    css_line_local = f"local('{family}'), local('{family} Regular'),"
                    variable_name += "Regular"
                elif style_suffix in ["-Bold", "-B", "B"]:
                    css_lines.append("  font-style: normal;\n")
                    css_lines.append("  font-weight: bold;\n")
                    css_line_local = f"local('{family} Bold'),"
                    variable_name += "Bold"
                elif style_suffix in ["-Italic", "-I", "I"]:
                    css_lines.append("  font-style: italic;\n")
                    css_lines.append("  font-weight: normal;\n")
                    css_line_local = f"local('{family} Italic'),"
                    variable_name += "Italic"
                elif style_suffix in ["-BoldItalic", "-BI", "BI"]:
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
        '''

if __name__ == "__main__":
    main()
