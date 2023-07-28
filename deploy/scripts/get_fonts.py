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

    source_url = "https://github.com/silnrsi/fonts/raw/main/families.json"
    families_file_path = target_dir.joinpath("families.json")
    logging.info(f"Downloading {source_url} to {families_file_path}")
    urllib.request.urlretrieve(source_url, families_file_path)

    family_ids_google = [
        "badami",
        "dokchampa",
        "ebrima",
        "kayahli",
        "khmermondulkiri",
        "kyebogyisil",
        "lisutzimu",
        "notonastaliqurdu",
        "notosans",
        "notosansadlam",
        "notosansanatolianhieroglyphs",
        "notosansarabic",
        "notosansarmenian",
        "notosansavestan",
        "notosansbalinese",
        "notosansbamum",
        "notosansbassavah",
        "notosansbatak",
        "notosansbengali",
        "notosansbhaiksuki",
        "notosansbrahmi",
        "notosansbuginese",
        "notosansbuhid",
        "notosanscanadianaboriginal",
        "notosanscarian",
        "notosanscaucasianalbanian",
        "notosanschakma",
        "notosanscham",
        "notosanscherokee",
        "notosanscoptic",
        "notosanscuneiform",
        "notosanscypriot",
        "notosansdeseret",
        "notosansdevanagari",
        "notosansduployan",
        "notosansegyptianhieroglyphs",
        "notosanselbasan",
        "notosansethiopic",
        "notosansgeorgian",
        "notosansglagolitic",
        "notosansgothic",
        "notosansgrantha",
        "notosansgujarati",
        "notosansgurmukhi",
        "notosanshanunoo",
        "notosanshatran",
        "notosanshebrew",
        "notosansimperialaramaic",
        "notosansinscriptionalpahlavi",
        "notosansinscriptionalparthian",
        "notosansjavanese",
        "notosansjp",
        "notosanskaithi",
        "notosanskannada",
        "notosanskayahli",
        "notosanskharoshthi",
        "notosanskhmer",
        "notosanskhojki",
        "notosanskhudawadi",
        "notosanskr",
        "notosanslao",
        "notosansleke",
        "notosanslepcha",
        "notosanslimbu",
        "notosanslineara",
        "notosanslinearb",
        "notosanslisu",
        "notosanslycian",
        "notosanslydian",
        "notosansmahajani",
        "notosansmalayalam",
        "notosansmandaic",
        "notosansmanichaean",
        "notosansmarchen",
        "notosansmeeteimayek",
        "notosansmendekikakui",
        "notosansmeroitic",
        "notosansmeroiticcursive",
        "notosansmiao",
        "notosansmodi",
        "notosansmongolian",
        "notosansmro",
        "notosansmultani",
        "notosansmyanmar",
        "notosansnko",
        "notosansnabataean",
        "notosansnandinagari",
        "notosansnewtailue",
        "notosansnewa",
        "notosansogham",
        "notosansolchiki",
        "notosansoldpermic",
        "notosansoldhungarian",
        "notosansolditalic",
        "notosansoldnortharabian",
        "notosansoldpersian",
        "notosansoldsoutharabian",
        "notosansoldturkic",
        "notosansoriya",
        "notosansosage",
        "notosansosmanya",
        "notosanspahawhhmong",
        "notosanspalmyrene",
        "notosanspaucinhau",
        "notosansphagspa",
        "notosansphoenician",
        "notosanspsalterpahlavi",
        "notosansrejang",
        "notosansrunic",
        "notosanssamaritan",
        "notosanssaurashtra",
        "notosanssc",
        "notosansshuishu",
        "notosanssiddham",
        "notosanssinhala",
        "notosanssorasompeng",
        "notosanssylotinagri",
        "notosanssyriac",
        "notosanstagalog",
        "notosanstagbanwa",
        "notosanstaile",
        "notosanstaitham",
        "notosanstaiviet",
        "notosanstakri",
        "notosanstamil",
        "notosanstangut",
        "notosanstc",
        "notosanstelugu",
        "notosansthaana",
        "notosansthai",
        "notosanstibetan",
        "notosanstifinagh",
        "notosanstirhuta",
        "notosansugaritic",
        "notosansvai",
        "notosanswarangciti",
        "notosansyi",
        "notoserif",
        "notoserifahom",
        "notoserifarmenian",
        "notoserifbengali",
        "notoserifdevanagari",
        "notoserifethiopic",
        "notoserifgeorgian",
        "notoserifgujarati",
        "notoserifgurmukhi",
        "notoserifhebrew",
        "notoserifjp",
        "notoserifkannada",
        "notoserifkhmer",
        "notoserifkr",
        "notoseriflao",
        "notoserifmalayalam",
        "notoserifmyanmar",
        "notoserifsc",
        "notoserifsinhala",
        "notoseriftamil",
        "notoseriftc",
        "notoseriftelugu",
        "notoserifthai",
        "notoseriftibetan",
        "saysetthamx",
        "shishan",
        "surma",
        "thiruvalluvar",
    ]

    family_ids_sil = [
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

    # Todo: Add info for these font's directly to this script.
    MLP_families_not_in_file = {"simsun": "Sim Sun", "notoseriftangut": "Noto Serif Tangut"}

    # The Mui Language Picker name doesn't always match the current font.
    # Todo: Investigate which ones it removes spaces from.
    # https://github.com/sillsdev/mui-language-picker/blob/master/src/langPicker/fontList.js > fontMap
    MLP_family_override = {
        "badami": "KNDA Badami",  # MLP adds KNDA
        "galatiasil": "Galatia",  # MLP omits SIL
        "kyebogyisil": "Kyebogyi",  # MLP omits SIL
        "namdhinggo": "Namdhinggo SIL",  # MLP adds SIL
        "notosans": "NotoSansLatin",  # MLP has both w and w/o Latin
        "notosansjp": "Noto Sans CJK JP",  # MLP add CJK
        "notosanskr": "Noto Sans CJK JP",  # MLP add CJK
        "notosanssc": "Noto Sans CJK JP",  # MLP add CJK
        "notosanstc": "Noto Sans CJK JP",  # MLP add CJK
        "notoserif": "NotoSerifLatin",  # MLP has both w and w/o Latin
        "notoserifjp": "Noto Sans CJK JP",  # MLP add CJK
        "notoserifkr": "Noto Sans CJK JP",  # MLP add CJK
        "notoserifsc": "Noto Sans CJK JP",  # MLP add CJK
        "notoseriftangut": "NotoSansTangut",  # Sans unavailable, but Serif available
        "notoseriftc": "Noto Sans CJK JP",  # MLP add CJK
        "scheherazadenew": "Scheherazade",  # MLP omits New
        "thiruvalluvar": "TAML ThiruValluvar",  # MLP adds TAML
    }

    with open(families_file_path, "r") as families_file:
        families: dict = json.load(families_file)

    for id in family_ids_google:
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
        if "license" not in font_info.keys():
            logging.warning(f"{family}: No license")
        elif font_info["license"] != "OFL":
            logging.warning(f"{family}: Non-OFL license: {font_info['license']}")
        if "source" not in font_info.keys():
            logging.warning(f"{family}: No source")
        elif font_info["source"] != "Google":
            logging.warning(f"{family}: Non-Google source: {font_info['source']}")
        if "status" not in font_info.keys():
            logging.warning(f"{family}: No status")
        elif font_info["status"] != "current":
            logging.warning(f"{family}: Non-current status: {font_info['status']}")

    """
    for id in family_ids_sil:
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

        logging.info(f"{family}: Populating font subfolder '{id}'")
        subdir = Path.joinpath(target_dir, id)
        if not os.path.exists(subdir):
            os.mkdir(subdir)
        # These will be filed with the lines needed to generate the font's css file.
        css_lines: List[str] = []

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
                dest = Path.joinpath(subdir, file_name)
                if args.download:
                    src = files[file_name]["flourl"]
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
        """


if __name__ == "__main__":
    main()
