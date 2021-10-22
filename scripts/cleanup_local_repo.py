#!/usr/bin/env python3

"""Remove all temporary files and folders within the local Git repository.

The purpose of this script is to get a developer back to a clean baseline in
the event their repository state does not match other developers or CI.

Requirements: Python 3.8+
"""

from pathlib import Path
import shutil


def main() -> None:
    directories_to_remove = (".mypy_cache", ".tox", "build", "node_modules", "venv")
    files_to_delete = (".env.backend", ".env.certmgr", ".env.frontend", "docker-compose.yml")

    print(
        f"The following temporary files and directories will be deleted:\n"
        f"\t{directories_to_remove}\n"
        f"\t{files_to_delete}\n"
    )
    proceed = input("Are you sure you want to proceed? [y,N]")
    if proceed.lower() != "y":
        print("Cancelling cleanup.")
        return

    project_dir = Path(__file__).resolve().parent.parent
    for directory_to_delete in directories_to_remove:
        print(f"Deleting: {directory_to_delete}")
        shutil.rmtree(project_dir / directory_to_delete, ignore_errors=True)
    for file_to_delete in files_to_delete:
        print(f"Deleting: {file_to_delete}")
        (project_dir / file_to_delete).unlink(missing_ok=True)

    print("\nCleanup complete.")


if __name__ == "__main__":
    main()
