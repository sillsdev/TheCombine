#!/usr/bin/env python3
"""
Generates font support for all SIL fonts used in Mui-Language-Picker.

This script uses the following environment variables:
  font_dir          directory where the font-data persistent storage is mounted.
"""

import argparse
from csv import reader
import json
import logging
import os
from pathlib import Path
from shutil import rmtree
from typing import Any, List

import requests

scripts_dir = Path(__file__).resolve().parent
file_name_fallback = "fallback.json"
mlp_font_list = scripts_dir / "mui_language_picker_fonts.txt"
url_font_families_info = "https://github.com/silnrsi/fonts/raw/main/families.json"
url_lang_tags_list = "https://ldml.api.sil.org/en?query=langtags"
url_script_font_table = (
    "https://raw.githubusercontent.com/silnrsi/langfontfinder/main/data/script2font.csv"
)
default_output_dir = os.getenv("font_dir", "/mnt/fonts")
default_local_font_url = os.getenv("local_font_url", "/fonts")


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Prepares all needed fonts.",
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
        default=default_local_font_url,
        help="URL for locally hosted fonts, for the css data used by the client.",
    )
    parser.add_argument(
        "--output", "-o", default=default_output_dir, help="Output directory for font data."
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


def get_font_default(defaults: dict[str, str]) -> str:
    """Determine which default file to use, with preference for woff2 if available."""
    keys = ["woff2", "woff", "ttf"]
    for key in keys:
        if key in defaults.keys():
            return defaults[key]
    return ""


def check_font_info(font_info: dict[str, Any]) -> bool:
    """Given an entry from the font families info file, check if the font family is usable."""
    family: str = font_info["family"]

    # Check that the font is current and licensed as expected.
    if not font_info["distributable"]:
        logging.debug(f"{family}: Not distributable")
        return False
    if "license" not in font_info.keys():
        logging.debug(f"{family}: No license")
        return False
    elif font_info["license"] != "OFL":
        logging.debug(f"{family}: Non-OFL license: {font_info['license']}")
        return False
    if "source" not in font_info.keys():
        logging.debug(f"{family}: No source")
    elif font_info["source"] not in ["Google", "SIL"]:
        logging.debug(f"{family}: Non-Google, non-SIL source: {font_info['source']}")
    if "status" not in font_info.keys():
        logging.debug(f"{family}: No status")
    elif font_info["status"] != "current":
        logging.debug(f"{family}: Non-current status: {font_info['status']}")

    if "defaults" not in font_info.keys() or get_font_default(font_info["defaults"]) == "":
        logging.debug(f"{family}: No defaults")
        return False

    if "files" not in font_info.keys():
        logging.debug(f"{family}: No file list")
        return False

    return True


def extract_lang_subtags(langs: List[str]) -> List[str]:
    """Given a (comma-separated) string langtags, return list of the initial lang subtags."""
    subtags = [tag.split("-")[0].lower() for tag in langs]
    lang_list = [subtag for subtag in set(subtags) if subtag != ""]
    lang_list.sort()
    return lang_list


def fetch_scripts_for_langs(langs: List[str]) -> List[str]:
    """Given a list of langtags, look up and return all script tags used with the languages."""
    langs = [lang.lower() for lang in langs]
    scripts = []
    logging.debug(f"Downloading lang-tag list from {url_lang_tags_list}")
    req = requests.get(url_lang_tags_list)
    for line in req.iter_lines():
        tags: List[str] = line.decode("UTF-8").split(" = ")
        if len(tags) == 0 or tags[0].split("-")[0].strip("*") not in langs:
            continue
        for tag in tags:
            for subtag in tag.split("-"):
                # Script tags always have length 4.
                if len(subtag) == 4 and subtag not in scripts:
                    scripts.append(subtag)

    scripts.sort()
    return scripts


def fetch_fonts_for_scripts(scripts: List[str]) -> List[str]:
    """Given a list of script tags, look up the default fonts used with those scripts."""
    scripts = list({script.capitalize() for script in scripts})

    # Always have the Mui-Language-Picker default/safe fonts.
    fonts = ["Annapurna SIL", "Charis SIL", "Noto Sans TC", "Scheherazade New"]

    logging.debug(f"Downloading script font table from {url_script_font_table}")
    req = requests.get(url_script_font_table)
    script_font_table = reader(
        req.content.decode("UTF-8").splitlines(), delimiter=",", quotechar='"'
    )

    # Use the font-column headers to determine all font-column indices.
    script_font_table_font_columns = [
        "Default Font",
        "WSTech primary",
        "NLCI",
        "Microsoft",
        "Other",
        "Noto Sans",
        "Noto Serif",
        "WSTech secondary",
    ]
    header_row: List[str] = next(script_font_table)
    font_indices = [
        i for i in range(len(header_row)) if header_row[i] in script_font_table_font_columns
    ]

    # Collect all fonts for the specified scripts.
    for row in script_font_table:
        if len(row) == 0 or row[0] not in scripts:
            continue
        for i in font_indices:
            font = row[i]
            if font != "" and font not in fonts:
                fonts.append(font)

    fonts.sort()
    return fonts


def fetch_font_families_info() -> dict[str, Any]:
    logging.debug(f"Downloading font families info from {url_font_families_info}")
    req = requests.get(url_font_families_info)
    content: dict[str, Any] = json.loads(req.content)
    return content


def main() -> None:
    args = parse_args()
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.DEBUG)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)

    if not args.output.is_dir():
        logging.error(f"Invalid output directory: '{args.output}'")
        exit(1)

    is_for_offline: bool = args.langs or args.scripts

    with open(mlp_font_list, "r") as mlp_fonts_list:
        fonts = [f.strip() for f in mlp_fonts_list.readlines()]

    if is_for_offline:
        scripts: List[str] = []
        if args.langs:
            logging.info(f"Specified languages: {', '.join(args.langs)}")
            scripts = fetch_scripts_for_langs(args.langs)
            logging.info(f"Scripts for specified languages: {', '.join(scripts)}")

        if args.scripts:
            logging.info(f"Specified scripts: {', '.join(args.scripts)}")
            scripts.extend(args.scripts)

        script_fonts = fetch_fonts_for_scripts(scripts)
        logging.info(
            f"Fonts (default and those for specified languages/scripts): {', '.join(script_fonts)}"
        )

    if args.clean:
        logging.info(f"Deleting contents of {args.output}")
        for path in args.output.iterdir():
            logging.debug(f"Deleting {path}")
            if path.name != "lost+found":
                if path.is_dir():
                    rmtree(path)
                else:
                    path.unlink()

    families = fetch_font_families_info()

    # Fonts for which the frontend will get css files from Google's font API.
    google_fallback: dict[str, str] = {}

    for font in fonts:
        logging.debug(f"Font: {font}")
        font_id: str = font.replace(" ", "").lower()

        # Get font family info from font families info, using fallback font if necessary.
        while font_id != "" and font_id in families.keys():
            font_info = families[font_id]
            family: str = font_info["family"]
            source_is_google = "source" in font_info.keys() and font_info["source"] == "Google"
            get_from_google = source_is_google and not is_for_offline
            if check_font_info(font_info) or get_from_google:
                # Font available.
                break
            if "fallback" in font_info.keys():
                font_id = font_info["fallback"]
                logging.debug(f"{family}: Using fallback {font_id}")
            else:
                logging.debug(f"{family}: No fallback")
                font_id = ""

        # When downloading, only download fonts used for scripts of the specified languages.
        if is_for_offline and family not in script_fonts:
            logging.debug(f'Skipping font "{font}" as irrelevant for specified languages/scripts.')
            continue

        # Check if font was determined available.
        if font_id == "" or font_id not in families.keys():
            if is_for_offline:
                logging.warning(f'Font "{font}" not available for download')
            else:
                logging.warning(f'Font "{font}" css info not available')
            continue

        # When not downloading, prefer fetching css info from Google when available.
        if get_from_google:
            google_fallback[font] = family
            logging.debug(f"Using Google fallback for {font}: {google_fallback[font]}")
            continue

        # Get the font's default file info.
        file_name = get_font_default(font_info["defaults"])
        files: dict[str, Any] = font_info["files"]
        if file_name not in files.keys():
            logging.error(f"{family}: Default file not in file list")
            continue
        file_info: dict[str, Any] = files[file_name]

        # Build the css info for this font in this style.
        css_lines: List[str] = []
        css_lines.append("@font-face {\n")
        css_lines.append("  font-display: swap;\n")
        css_lines.append(f"  font-family: '{font}';\n")
        css_line_local = f"local('{family}'), local('{family} Regular'),"

        # Build the url source, downloading if requested.
        if "flourl" in file_info.keys():
            src = file_info["flourl"]
        elif "url" in file_info.keys():
            src = file_info["url"]
        else:
            logging.warning(f"{file_name}: No 'flourl' or 'url' for this file")
            continue

        if is_for_offline:
            # With the https://fonts.languagetechnology.org "flourl" urls,
            # urllib.request.urlretrieve() is denied (403), but requests.get() works.
            req = requests.get(src)
            dest = args.output / file_name
            logging.debug(f"Downloading {src} to {dest}")
            with open(dest, "wb") as out:
                out.write(req.content)
            css_lines.append(
                f"  src: {css_line_local} url('{args.local_font_url}/{file_name}');\n"
            )
        else:
            css_lines.append(f"  src: {css_line_local} url('{src}');\n")

        # Finish the css info for this font and write to file.
        css_lines.append("}\n")
        css_file_path = args.output / f"{font}.css"
        logging.debug(f"Writing {css_file_path}")
        with open(css_file_path, "w") as css_file:
            css_file.writelines(css_lines)

    if not is_for_offline:
        fallback_lines = ['{\n  "google": {\n']
        for key, val in google_fallback.items():
            fallback_lines.append(f'    "{key}": "{val}",\n')
        # Remove the final comma to satisfy Prettier.
        fallback_lines[-1] = fallback_lines[-1].replace(",", "")
        fallback_lines.append("  }\n}\n")
        with open(args.output / file_name_fallback, "w") as fallback_file:
            fallback_file.writelines(fallback_lines)


if __name__ == "__main__":
    main()
