#!/usr/bin/env python3

import argparse
import os
from pathlib import Path
from typing import List

project_dir = Path(__file__).resolve().parent


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Set the version for the project in the current repository.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "version",
        type=str,
        help="Version to set project-wide."
    )
    return parser.parse_args()


def update_file_line(file_path: Path, match_str: str, new_line: str) -> None:
    """Update lines in a file that contain a given string.

    Args:
        file_path: File to be modified in place.
        match_str: String that must exist in the line of the file to be edited.
        new_line: A line to replace matched lines with.
    """
    print(f'Updating {file_path}...')
    with open(file_path) as f:
        lines = f.readlines()

    new_lines: List[str] = []
    for line in lines:
        if match_str in line:
            new_lines.append(f'{new_line}\n')
        else:
            new_lines.append(line)

    with open(file_path, 'w') as f:
        f.writelines(new_lines)


def main() -> None:
    args = parse_args()
    npm_version_tag = '"version":'
    update_file_line(
        project_dir / 'package.json',
        npm_version_tag,
        f'  {npm_version_tag}"{args.version}",')

    for docker_file in (project_dir / 'Dockerfile', project_dir / 'Backend' / 'Dockerfile'):
        label = "LABEL com.github.sillsdev.thecombine.version"
        update_file_line(
            docker_file,
            label,
            f'{label}="{args.version}"',
        )

    npm_install_command = f"npm install {project_dir}"
    print(f'To update package-lock.json, executing: {npm_install_command}')
    os.system(npm_install_command)


if __name__ == '__main__':
    main()
