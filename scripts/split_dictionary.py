#!/usr/bin/env python
"""
Splits a dictionary file into smaller files.
"""

import argparse
import logging
from pathlib import Path
from shutil import rmtree
from typing import List
from unicodedata import normalize

from regex import sub

combine_dir = Path(__file__).resolve().parent.parent
public_dir = combine_dir / "public" / "dictionaries"
resources_dir = combine_dir / "src" / "resources" / "dictionaries"


def parse_args() -> argparse.Namespace:
    def lang_tag_type(tag: str) -> str:
        if not tag.isalpha():
            raise argparse.ArgumentTypeError("Language tag must be only letters")
        if len(tag) not in [2, 3]:
            raise argparse.ArgumentTypeError("Language tag must be 2 or 3 letters long")
        return tag

    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Prepares all needed fonts.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--input",
        "-i",
        help="Override the path of the .txt file to be split",
    )
    parser.add_argument(
        "--lang", "-l", help="2- or 3-letter language tag", required=True, type=lang_tag_type
    )
    parser.add_argument(
        "--max",
        "-m",
        help="Override the lang's default max word-length, or -1 to force no limit",
        type=int,
    )
    parser.add_argument("--normalize", "-n", choices=["NFC", "NFD", "NFKC", "NFKD"], default="NFD")
    parser.add_argument(
        "--threshold",
        "-t",
        default=2000,
        help="Minimum entry count for a word-start to have its own file",
        type=int,
    )
    parser.add_argument(
        "--Threshold",
        "-T",
        default=20000,
        help="Minimum entry count for a word-start to be split into multiple files",
        type=int,
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Print intermediate values to aid in debugging.",
    )
    args = parser.parse_args()
    args.lang = args.lang.lower()
    if args.input:
        args.input = Path(args.input)
    return args


def max_length(lang: str) -> int:
    lang = lang.lower()
    if lang == "ar":
        return 4
    elif lang == "es":
        return 9
    elif lang == "fr":
        return 10
    elif lang == "hi":
        return 6
    elif lang == "pt":
        return 7
    elif lang == "ru":
        return 7
    return -1


def write_dict_part(file_path: Path, entries: List[str], include_count: bool = False) -> None:
    if not len(entries):
        return

    with open(file_path, "w", encoding="utf-8") as file:
        if include_count:
            file.write(f"{len(entries)}\n")
        for entry in entries:
            file.write(entry + "\n")


def main() -> None:
    args = parse_args()
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)

    if not args.input:
        args.input = resources_dir / f"{args.lang}.txt"

    if not args.input.is_file():
        logging.error("No such word-list file")
        exit(1)

    subdir = public_dir / args.lang
    if subdir.is_dir():
        for path in subdir.iterdir():
            logging.info(f"Deleting {path}")
            if path.is_dir():
                rmtree(path)
            else:
                path.unlink()
    Path.mkdir(subdir, exist_ok=True)

    all_entries: List[str] = []
    with open(args.input, "r", encoding="utf-8") as file:
        for line in file.readlines():
            # The characters sub()-ed here should match those used in spellChecker.ts
            # Cf. https://en.wikipedia.org/wiki/Unicode_character_property
            words = sub("[^\\p{L}\\p{M}]+", " ", normalize(args.normalize, line)).split()

            # If user doesn't specify -m, use lang-specific default of max_length().
            if not args.max:
                args.max = max_length(args.lang)
            if args.max > 0:
                words = [w for w in words if len(w) <= args.max]

            all_entries.extend(words)

    def split_and_export_entries(
        entries: List[str], all_starts: List[str], start: str = ""
    ) -> None:
        logging.info(f"Splitting {len(entries)} entries beginning with '{start}'")
        entry_sets: dict[str, dict[str, bool]] = {}
        others: dict[str, bool] = {}

        for entry in entries:
            if len(entry) <= len(start):
                others[entry] = True
                continue

            sub_start = entry[: len(start) + 1].lower()
            if sub_start not in entry_sets:
                entry_sets[sub_start] = {}
            entry_sets[sub_start][entry] = True

        for key, val in entry_sets.items():
            subentries = list(val.keys())
            if len(subentries) < args.threshold:
                for subentry in subentries:
                    others[subentry] = True
                continue

            elif len(subentries) > args.Threshold:
                split_and_export_entries(subentries, all_starts, key)
                continue

            all_starts.append(key)
            file_path = subdir / f"u{'-'.join([str(ord(c)) for c in key])}.dic"
            logging.info(f"Saving {len(subentries)} entries to {file_path}")
            write_dict_part(file_path, subentries)

        file_path = subdir / f"u{'-'.join([str(ord(c)) for c in start])}.dic"
        other_words = list(others.keys())
        if len(other_words):
            if start:
                all_starts.append(start)
            logging.info(f"Saving {len(other_words)} entries to {file_path}")
            write_dict_part(file_path, other_words, True)

    word_starts: List[str] = []
    split_and_export_entries(all_entries, word_starts)

    def generate_lang_index_file_lines() -> List[str]:
        # Generate the comment for the top of the language's index file
        header_line = "// This file was generated by `python scripts/split_dictionary.py"
        header_line += f" -l {args.lang} -m {args.max} -t {args.threshold} -T {args.Threshold}"
        header_line += "`.\n\n"

        # Generate the needed import
        import_line = "import { fetchText } from \"utilities/fontCssUtilities\";\n\n"

        # Generate the exported array of keys for this language's dictionary parts...
        key_lines = ["export const keys = [\n"]
        # ... and the switch cases for fetching dictionary parts by key
        switch_lines = ["  switch (key) {\n"]
        for start in sorted(word_starts):
            key = "-".join([str(ord(c)) for c in start])
            key_lines.append(f'  "{key}",\n')
            switch_lines.append(f'    case "{key}":\n')
            import_path = f'"/dictionaries/{args.lang}/u{key}.dic"'
            switch_lines.append(f"      return (await fetchText({import_path}));\n")
        key_lines.append("];\n\n")
        switch_lines.append("    default:\n      return;\n  }\n")

        # Generate the default exported dictionary-fetch function
        default_path = f'"/dictionaries/{args.lang}/u.dic"'
        default_function_lines = [
            "export default async function (key?: string): Promise<string | undefined> {\n",
            "  if (!key) {\n",
            f"    return (await fetchText({default_path}));\n",
            "  }\n\n",
            *switch_lines,
            "}\n",
        ]

        return [header_line, import_line, *key_lines, *default_function_lines]

    index_file_path = resources_dir / f"{args.lang}.ts"
    logging.info(f"Generating {index_file_path}")
    with open(index_file_path, "w") as index_file:
        index_file.writelines(generate_lang_index_file_lines())

    def generate_main_index_file_lines() -> List[str]:
        # Generate the comments for the top of the main dictionary index file
        header_lines = [
            "// This file was generated by scripts/split_dictionary.py\n\n",
            "// Arabic word-list source (GPLv3):\n",
            "// https://sourceforge.net/projects/arabic-wordlist\n"
            "// Other languages source (MPLv2):\n",
            "// https://github.com/LibreOffice/dictionaries\n\n",
        ]

        # Generate the imports of the various language dictionaries...
        import_lines: List[str] = []
        # ... and the function for getting the dictionary-part keys for a language...
        keys_lines = [
            "/** For a given lang-tag, return the associated dictionary keys,\n",
            " * or undefined if there is no dic for the lang-tag. */\n",
            "export function getKeys(bcp47: Bcp47Code): string[] | undefined {\n",
            "  switch (bcp47) {\n",
        ]
        # ... and the function for getting the dictionary parts for a language...
        dict_lines = [
            "/** For a given lang-tag and dict key,\n"
            " * return the dictionary piece associated with that key,\n"
            " * or undefined if there is no dictionary for the lang-tag. */\n"
            "export async function getDict(\n"
            "  bcp47: Bcp47Code,\n"
            "  key?: string\n"
            "): Promise<string | undefined> {\n"
            "  switch (bcp47) {\n"
        ]
        for file_path in public_dir.iterdir():
            if file_path.is_dir():
                lang = file_path.stem
                lang_index_path = resources_dir / f"{lang}.ts"
                if lang_index_path.is_file():
                    import_lines.append(f"import {lang}Dic, {{ keys as {lang}Keys }} ")
                    import_lines.append(f'from "resources/dictionaries/{lang}";\n')
                    keys_lines.append(f"    case Bcp47Code.{lang.capitalize()}:\n")
                    keys_lines.append(f"      return {lang}Keys;\n")
                    dict_lines.append(f"    case Bcp47Code.{lang.capitalize()}:\n")
                    dict_lines.append(f"      return await {lang}Dic(key);\n")
        import_lines.append('import { Bcp47Code } from "types/writingSystem";\n\n')
        keys_lines.append("    default:\n      return;\n  }\n}\n\n")
        dict_lines.append("    default:\n      return;\n  }\n}\n")

        return [*header_lines, *import_lines, *keys_lines, *dict_lines]

    langs_index_file_path = resources_dir / "index.ts"
    logging.info(f"Generating {langs_index_file_path}")
    with open(langs_index_file_path, "w") as langs_index_file:
        langs_index_file.writelines(generate_main_index_file_lines())


if __name__ == "__main__":
    main()
