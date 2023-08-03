#!/usr/bin/env python3
"""
Generates font support for all SIL fonts used in Mui-Language-Picker.
"""

import argparse
from csv import reader
import json
import logging
import os
from pathlib import Path
from shutil import rmtree
from typing import List
import urllib.request

import requests

PATH_MLP_FONT_LIST = "deploy/scripts/font_lists/mui-language-picker-fonts.txt"
PATH_MLP_FONT_MAP = "deploy/scripts/font_lists/mui-language-picker-font-map.json"
URL_FONT_FAMILIES_INFO = "https://github.com/silnrsi/fonts/raw/main/families.json"
URL_LANG_TAGS_LIST = "https://ldml.api.sil.org/en?query=langtags"
URL_SCRIPT_FONT_TABLE = "https://raw.githubusercontent.com/silnrsi/langfontfinder/main/data/script2font.csv"


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Prepares all needed fonts.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("-c", "--clean", action="store_true", help="Delete the fonts directory")
    parser.add_argument(
        "-l",
        "--langs",
        help="Comma-separated list of lang-tags of the languages for which fonts should be downloaded.",
    )
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


def getFontDefault(defaults: dict) -> str:
    """Determine which default file to use, with preference for woff2 if available."""
    keys = ["woff2", "woff", "ttf"]
    for key in keys:
        if key in defaults.keys():
            return defaults[key]
    return ""


def checkFontInfo(font_info: dict) -> bool:
    """Given an entry from the font families info file, check if the font family is usable. """
    family: str = font_info["family"]

    # Check that the font is current and licensed as expected.
    if font_info["distributable"] != True:
        logging.warning(f"{family}: Not distributable")
        return False
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

    if "defaults" not in font_info.keys() or getFontDefault(font_info["defaults"]) == "":
        logging.warning(f"{family}: No defaults")
        return False

    if "files" not in font_info.keys():
        logging.warning(f"{family}: No file list")
        return False

    return True


def extractLangSubtags(langs: str, sep=",") -> List[str]:
    """Given a string of (comma-separated) lang tags, return list of the initial language subtags."""
    tags: List[str] = [lang.strip() for lang in langs.split(sep) if lang.strip() != ""]
    subtags = [tag.split("-")[0].lower() for tag in tags]
    langs = [subtag for subtag in set(subtags) if subtag != ""]
    langs.sort()
    return langs


def fetchScriptsForLangs(langs: List[str]) -> List[str]:
    """Given a list of language tags, look up and return all script tags used with the languages."""
    langs = [lang.lower() for lang in langs]
    scripts = []
    req = requests.get(URL_LANG_TAGS_LIST)
    for line in req.iter_lines():
        tags: List[str] = line.decode("UTF-8").split(" = ")
        if len(tags) == 0 or tags[0].split("-")[0].strip("*") not in langs:
            continue
        for tag in tags:
            for subtag in tag.split("-"):
                if len(subtag) == 4 and subtag not in scripts:
                    scripts.append(subtag)

    scripts.sort()
    return scripts


def fetchFontsForScripts(scripts: List[str]) -> List[str]:
    """Given a list of script tags, look up and return the default fonts used with the languages."""
    scripts = [script.capitalize() for script in scripts]

    # Always include the Mui-Language-Picker default/safe fonts (except "SimSun", which is proprietary).
    fonts = ["AnnapurnaSIL", "CharisSIL", "DoulosSIL", "NotoSans", "ScheherazadeNew"]

    req = requests.get(URL_SCRIPT_FONT_TABLE)
    script_font_table = reader(
        req.content.decode("UTF-8").splitlines(), delimiter=",", quotechar='"'
    )

    # Get the font-column indices
    header_row: List[str] = next(script_font_table)
    font_index = header_row.index("Default Font")
    font_indices = [
        i for i in range(font_index, len(header_row)) if header_row[i] != "Default Features"
    ]

    for row in script_font_table:
        if len(row) == 0 or row[0] not in scripts:
            continue
        for i in font_indices:
            font = row[i].replace(" ", "")
            if font != "" and font not in fonts:
                fonts.append(font)

    fonts.sort()
    return fonts


def fetchFontFamiliesInfo(targetPath: str) -> dict:
    urllib.request.urlretrieve(URL_FONT_FAMILIES_INFO, targetPath)
    with open(targetPath, "r") as families_file:
        families: dict = json.load(families_file)
    return families


def main() -> None:
    args = parse_args()
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)

    root_dir = Path(args.root)
    if not os.path.exists(root_dir):
        logging.error("Root directory specified with -r not valid")
        exit(1)
    target_dir = root_dir.joinpath("fonts")

    if args.langs:
        langs = extractLangSubtags(args.langs)
        logging.info(f"Lang-tags to download fonts for: {', '.join(langs)}")

        scripts = fetchScriptsForLangs(langs)
        logging.info(f"Scripts used for specified lang-tags: {', '.join(scripts)}")

        fonts = fetchFontsForScripts(scripts)
        logging.info(f"Default fonts and fonts used for specified lang-tags: {', '.join(fonts)}")
    else:
        with open(PATH_MLP_FONT_LIST, "r") as mlp_fonts_list:
            fonts = [f.strip().replace(" ", "") for f in mlp_fonts_list.readlines()]

    if args.clean:
        logging.info(f"Deleting {target_dir}")
        if target_dir.is_dir():
            rmtree(target_dir)

    if not os.path.exists(target_dir):
        logging.info(f"Making {target_dir}")
        os.mkdir(target_dir)

    families_file_path = target_dir.joinpath("families.json")
    logging.info(f"Downloading font families info to {families_file_path}")
    families = fetchFontFamiliesInfo(families_file_path)

    with open(PATH_MLP_FONT_MAP, "r") as mlp_map_file:
        mlp_map: dict = json.load(mlp_map_file)
        # Assumes no two keys map to the same value.
        mlp_map_rev = {val: key for key, val in mlp_map.items()}

    # Pre-seed with corrections to the in-file fallbacks.
    google_fallback: dict[str] = {
        "NotoSansLeke": "",
        "NotoSansMeroiticCursive": "Noto Sans Meroitic",
        "NotoSansShuishu": "",
        "NotoSansTangut": "Noto Serif Tangut",
        "NotoSansTibetan": "Noto Serif Tibetan",
    }

    for font in fonts:
        logging.info(f"Font: {font}")
        font_id = font.lower()
        if not args.langs and font in mlp_map.keys():
            font_id = mlp_map[font].lower()

        # Get font family info from font families info, using fallback font if necessary
        while font_id != "" and font_id in families.keys():
            font_info: dict = families[font_id]
            family: str = font_info["family"]
            if checkFontInfo(font_info):
                break
            if "fallback" in font_info.keys():
                font_id: str = font_info["fallback"]
                logging.warning(f"{family}: Using fallback {font_id}")
            else:
                logging.warning(f"{family}: No fallback")
                if (
                    not args.langs
                    and "source" in font_info.keys()
                    and font_info["source"] == "Google"
                ):
                    if font not in google_fallback.keys():
                        google_fallback[font] = family
                    logging.info(f"Google fallback: {font}/{google_fallback[font]}")
                font_id = ""
        else:
            if font_id != "":
                logging.warning(f"Font {font_id} not in file {families_file_path}")
            continue

        # Get the font's default file info.
        file_name = getFontDefault(font_info["defaults"])
        files: dict = font_info["files"]
        if file_name not in files.keys():
            logging.error(f"{family}: Default file not in file list")
            continue
        file_info: dict = files[file_name]

        # Build the css info for this font in this style.
        css_lines: List[str] = []
        css_lines.append("@font-face {\n")
        css_lines.append("  font-display: swap;\n")
        css_lines.append(f"  font-family: '{font}';\n")
        css_line_local = f"local('{family}'), local('{family} Regular'),"

        # Build the url source, downloading if requested.
        if "flourl" not in file_info.keys():
            if "url" not in file_info.keys():
                logging.warning(f"{file_name}: No 'flourl' or 'url' for this file")
                continue
            src = file_info["url"]
        else:
            src = file_info["flourl"]

        if args.langs:
            # With the https://fonts.languagetechnology.org "flourl" urls,
            # urllib.request.urlretrieve() is denied (403), but requests.get() works.
            req = requests.get(src)
            dest = Path.joinpath(target_dir, file_name)
            logging.info(f"Downloading {src} to {dest}")
            with open(dest, "wb") as out:
                out.write(req.content)
            css_lines.append(f"  src: {css_line_local} url('{dest}');\n")
        else:
            css_lines.append(f"  src: {css_line_local} url('{src}');\n")

        # Finish the css info for this font in this style.
        css_lines.append("}\n")

        # Create font override file
        css_file_path = target_dir.joinpath(f"{font}.css")
        logging.info(f"Writing css info for font family: {css_file_path}")
        with open(css_file_path, "w") as css_file:
            css_file.writelines(css_lines)
        if font in mlp_map_rev.keys():
            font = mlp_map_rev[font]
            css_file_path = target_dir.joinpath(f"{font}.css")
            css_lines[2] = f"  font-family: '{font}';\n"
            logging.info(f"Writing css info for font family: {css_file_path}")
            with open(css_file_path, "w") as css_file:
                css_file.writelines(css_lines)

    if not args.langs:
        keys = [key for key in google_fallback.keys() if google_fallback[key] != ""]
        google_fallback_lines = [f"{key}:{google_fallback[key]}\n" for key in sorted(keys)]
        google_fallback_file_path = target_dir.joinpath("google_fallback.txt")
        with open(google_fallback_file_path, "w") as google_fallback_file:
            google_fallback_file.writelines(google_fallback_lines)


if __name__ == "__main__":
    main()
