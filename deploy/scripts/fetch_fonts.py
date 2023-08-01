#!/usr/bin/env python3
"""
Generates font support for all fonts used in Mui-Language-Picker.
"""

import argparse
import logging
import os
from pathlib import Path
from shutil import rmtree

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


if __name__ == "__main__":
    main()
