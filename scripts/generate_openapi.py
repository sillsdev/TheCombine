#!/usr/bin/env python3

"""Regenerate the frontend OpenAPI bindings to the backend.

Requirements:

    - npm/node installed and in PATH
    - java 8+ installed and in PATH
"""
import os
from pathlib import Path
import subprocess
import sys
from typing import List


def execute(command: List[str]) -> None:
    print(f"Executing: {' '.join(command)}")
    subprocess.run(command, stdout=sys.stdout, stderr=sys.stderr, shell=True, check=True)


def main() -> None:
    project_dir = Path(__file__).resolve().parent.parent
    os.chdir(project_dir)
    output_dir = project_dir / "src" / "api"
    execute(
        [
            "npx",
            "@openapitools/openapi-generator-cli",
            "generate",
            "--input-spec=http://localhost:5000/openapi/v1/openapi.json",
            f"--output={output_dir}",
            "--generator-name=typescript-axios",
            "--additional-properties=useSingleRequestParameter=true",
            # TODO: Remove this when path parameter validation issue is resolved.
            "--skip-validate-spec",
        ]
    )
    execute(["npm", "run", "fmt-frontend"])


if __name__ == "__main__":
    main()
