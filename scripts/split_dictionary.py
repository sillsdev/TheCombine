#!/usr/bin/env python3
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
dictionary_dir = combine_dir / "src" / "resources" / "dictionaries"
utilities_dir = combine_dir / "src" / "utilities"


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
        "-i",
        "--input",
        help="Override the path of the .txt file to be split",
    )
    parser.add_argument(
        "-l", "--lang", help="2- or 3-letter language tag", required=True, type=lang_tag_type
    )
    parser.add_argument("-m", "--max", help="Max word length", type=int)
    parser.add_argument(
        "-n", "--normalize", choices=["NFC", "NFD", "NFKC", "NFKD"], default="NFKD"
    )
    parser.add_argument(
        "-t",
        "--threshold",
        default=3000,
        help="Minimum entry count for a word-start to have its own file",
        type=int,
    )
    parser.add_argument(
        "-T",
        "--Threshold",
        default=30000,
        help="Minimum entry count for a word-start to be split into multiple files",
        type=int,
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Print intermediate values to aid in debugging.",
    )
    args = parser.parse_args()
    args.lang = args.lang.lower()
    if args.input:
        args.input = Path(args.input)
    return args


def write_dict_part(file_path: Path, entries: List[str], include_count: bool = False) -> None:
    if not len(entries):
        return

    with open(file_path, "w", encoding="utf-8") as file:
        if include_count:
            file.write(f"export default `{len(entries)}\n")
        else:
            file.write("export default `")
        entries[-1] += "`;"
        for entry in entries:
            file.write(entry + "\n")


def main() -> None:
    args = parse_args()
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)

    if not args.input:
        args.input = dictionary_dir / f"{args.lang}.txt"

    if not args.input.is_file():
        logging.error("No such word-list file")
        exit(1)

    subdir = dictionary_dir / args.lang

    all_entries: List[str] = []
    with open(args.input, "r", encoding="utf-8") as file:
        for line in file.readlines():
            words = sub("\\p{P}+", " ", normalize(args.normalize, line)).split()
            all_entries.extend(words)

    if subdir.is_dir():
        for path in subdir.iterdir():
            logging.info(f"Deleting {path}")
            if path.is_dir():
                rmtree(path)
            else:
                path.unlink()
    Path.mkdir(subdir, exist_ok=True)

    def split_and_export_entries(
        entries: List[str], all_starts: List[str], start: str = ""
    ) -> None:
        logging.info(f"Splitting {len(entries)} entries beginning with '{start}'")
        entry_sets: dict[str, dict[str, bool]] = {}
        others: dict[str, bool] = {}

        for entry in entries:
            if args.max and len(entry) > args.max:
                continue

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
            file_path = subdir / f"u{'-'.join([str(ord(c)) for c in key])}.dic.js"
            logging.info(f"Saving {len(subentries)} entries to {file_path}")
            write_dict_part(file_path, subentries)

        file_path = subdir / f"u{'-'.join([str(ord(c)) for c in start])}.dic.js"
        other_words = list(others.keys())
        if len(other_words):
            logging.info(f"Saving {len(other_words)} entries to {file_path}")
            write_dict_part(file_path, other_words, start == "")

    word_starts: List[str] = []
    split_and_export_entries(all_entries, word_starts)

    index_file_path = subdir / "index.ts"
    logging.info(f"Generating {index_file_path}")

    case_lines: List[str] = []
    switch_lines: List[str] = []
    for start in sorted(word_starts):
        case = "-".join([str(ord(c)) for c in start])
        case_lines.append(f'  "{case}",\n')
        switch_lines.append(f'    case "{case}":\n')
        import_path = f"resources/dictionaries/{args.lang}/u{case}.dic"
        switch_lines.append(
            f'      return [startCode, (await import("{import_path}")).default];\n'
        )

    cmd = (
        "python scripts/split_dictionary.py"
        f" -l {args.lang} -t {args.threshold} -T {args.Threshold}"
    )
    if args.max:
        cmd += f" -m {args.max}"
    index_lines = [f"// This file was generated by `{cmd}`.\n\nconst cases = [\n"]
    index_lines.extend(case_lines)
    index_lines.append(
        """]

export default async function (start?: string, exclude?: string[]): Promise<[string?,string?]> {
  if (!start) {
    return ["", (await import("resources/dictionaries/"""
        + args.lang
        + """/u.dic")).default];
  }

  const startCase = start.split("").map(c=>c.toLocaleLowerCase().charCodeAt(0))
  var startCode = startCase.join("-")
  while (startCode){
    if (cases.includes(startCode)){
      break
    }
    startCase.pop()
    startCode = startCase.join("-")
  }

  if (!startCode || exclude?.includes(startCode)) {
    return [undefined, undefined]
  }

  switch (startCode) {
"""
    )
    index_lines.extend(switch_lines)
    index_lines.append("    default:\n      return [undefined, undefined];\n    }\n}\n")
    with open(index_file_path, "w") as index_file:
        index_file.writelines(index_lines)

    langs_index_file_path = dictionary_dir / "index.ts"
    logging.info(f"Generating {langs_index_file_path}")
    dic_lines: List[str] = []
    import_lines: List[str] = []
    for file_path in dictionary_dir.iterdir():
        if file_path.is_dir():
            lang: str = file_path.stem
            lang_index_path = file_path / "index.ts"
            if lang_index_path.is_file():
                dic_lines.append(f"    case Bcp47Code.{lang.capitalize()}:\n")
                dic_lines.append(
                    f"      return (await {lang}Dic(start, exclude)) ?? [undefined, undefined];\n"
                )
                import_lines.append(f'import {lang}Dic from "resources/dictionaries/{lang}";\n')
    with open(langs_index_file_path, "w") as langs_index_file:
        langs_index_file.writelines(
            [
                "// This file was generated by scripts/split_dictionary.py\n\n",
                "// Arabic word-list source (GPLv3):\n",
                "// https://sourceforge.net/projects/arabic-wordlist\n"
                "// Other languages source (MPLv2):\n",
                "// https://cgit.freedesktop.org/libreoffice/dictionaries\n\n",
                *import_lines,
                """import { Bcp47Code } from "types/writingSystem";

/** For a given lang-tag, string start, and list of keys to exclude,
 * return the key associated with the start and a dictionary piece,
 * or [undefined, undefined] if there is no dic or if the key is in exclude.  */
export async function getKeyDic(
  bcp47: Bcp47Code,
  start?: string,
  exclude?: string[]
): Promise<[string?, string?]> {
  switch (bcp47) {
""",
                *dic_lines,
                "    default:\n      return [undefined, undefined];\n  }\n}\n",
            ]
        )


if __name__ == "__main__":
    main()