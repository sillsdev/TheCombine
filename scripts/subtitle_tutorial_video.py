#!/usr/bin/env python3
"""
Add subtitles to a tutorial video.
If video path is not provided, still generates .srt files.
If video path is provided, requires ffmpeg to be installed.
"""

import argparse
import logging
from os import system
from pathlib import Path
from typing import List

combine_dir = Path(__file__).resolve().parent.parent
subtitles_dir = combine_dir / "docs" / "tutorial_subtitles"


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Add subtitles to a tutorial video.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    in_arg = parser.add_argument(
        "--input",
        "-i",
        help="Path of tutorial video that needs subtitles added.",
    )
    out_arg = parser.add_argument(
        "--output",
        "-o",
        help="Desired path of tutorial video with subtitles added.",
    )
    parser.add_argument(
        "--subtitles",
        "-s",
        help="Name of the docs/tutorial_subtitles subfolder for this video",
        required=True,
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Print intermediate values to aid in debugging.",
    )
    args = parser.parse_args()

    if args.input:
        args.input = Path(args.input)
        if not args.output:
            raise argparse.ArgumentError(out_arg, "missing (required since -i/--input was given)")
    if args.output:
        args.output = Path(args.output)
        if not args.input:
            raise argparse.ArgumentError(in_arg, "missing (required since -o/--output was given)")

    return args


def create_srt_file(script_path: Path, out_path: Path, times_strings: List[str]) -> None:
    with open(script_path, "r", encoding="utf-8") as in_file:
        with open(out_path, "w", encoding="utf-8") as out_file:
            for i in range(len(times_strings)):
                out_file.write(f"{i+1}\n{times_strings[i]}\n")
                out_file.write(in_file.readline())
                out_file.write("\n")


def main() -> None:
    args = parse_args()
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)

    if args.input and not args.input.is_file():
        logging.error("Input video doesn't exist")
        exit(1)

    subtitles_path: Path = subtitles_dir / args.subtitles
    if not subtitles_path.is_dir():
        logging.error("Subtitles subfolder of docs/tutorial_subtitles/ doesn't exist")
        exit(1)

    times_path = subtitles_path / "times.txt"
    if not times_path.is_file():
        logging.error("Subtitles subfolder is missing the required 'times.txt' file")
        exit(1)

    logging.info(f"Extracting timestamps from {times_path}")
    times_strings: List[str] = []
    with open(times_path, "r", encoding="utf-8") as file:
        start = "00:00:0,000"
        for line in file.readlines():
            if not (line):
                continue
            min_sec = line.strip().split(":")  # Split into minutes and seconds
            sec_mil = min_sec[1].split(".")  # Check for partial seconds
            mil = sec_mil[1] if len(sec_mil) > 1 else "0"  # Compute milliseconds
            end = f"00:{min_sec[0]:0>2}:{sec_mil[0]},{mil:0<3}"
            times_strings.append(f"{start} --> {end}")
            start = end

    logging.info("Generating subtitle .srt files")
    langs: List[str] = []
    for script_file in subtitles_path.glob(f"{args.subtitles}.*.txt"):
        script_path = subtitles_path / script_file
        lang = script_file.suffixes[0][1:]
        langs.append(lang)
        logging.info(f"Generating subtitles file for language: {lang}")
        out_path = subtitles_path / f"{args.subtitles}.{lang}.srt"
        create_srt_file(script_path, out_path, times_strings)
    logging.info(f"Languages found: {', '.join(langs)}")

    if args.input and args.output:
        logging.info(f"Attaching subtitles to {args.input}")
        i_strings: List[str] = []
        map_strings: List[str] = ["-map 0"]
        metadata_strings: List[str] = []
        for i in range(len(langs)):
            in_path = subtitles_path / f"{args.subtitles}.{langs[i]}.srt"
            i_strings.append(f"-i {in_path}")
            map_strings.append(f"-map {i + 1}")
            metadata_strings.append(f"-metadata:s:s:{i} language={langs[i]}")
        exec_command_parts: List[str] = [
            "ffmpeg -i",
            f"{args.input}",
            " ".join(i_strings),
            " ".join(map_strings),
            "-c copy -c:s mov_text",
            " ".join(metadata_strings),
            f"{args.output}",
        ]
        exec_command = " ".join(exec_command_parts)
        logging.info(f"Executing: {exec_command}")
        system(exec_command)
        logging.info(f"Video with subtitles saved to {args.output}")
    else:
        logging.info("No -i and -o file paths provided, so ffmpeg was not run.")


if __name__ == "__main__":
    main()
