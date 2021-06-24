#!/usr/bin/env python3

"""Regenerate the frontend OpenAPI bindings to the backend.

Requirements:
    - npm/node installed and in PATH
    - java 8+ installed and in PATH
"""
import os
from pathlib import Path
import shutil
from typing import List

EXIT_SUCCESS = 0


def execute(command: List[str], check: bool = True) -> None:
    exec_command = " ".join(command)
    print(f"Executing: {exec_command}")
    ret = os.system(exec_command)
    if check and ret != EXIT_SUCCESS:
        raise RuntimeError(f"Execution failed with return code: {ret}")


def main() -> None:
    project_dir = Path(__file__).resolve().parent.parent
    os.chdir(project_dir)
    output_dir = project_dir / "src" / "api"
    print(f"Cleaning {output_dir}")
    shutil.rmtree(output_dir, ignore_errors=True)
    execute(
        [
            "npx",
            "@openapitools/openapi-generator-cli",
            "generate",
            "--input-spec=http://localhost:5000/openapi/v1/openapi.json",
            f"--output={output_dir}",
            "--generator-name=typescript-axios",
            "--additional-properties="
            # For usage of withSeparateModelsAndApi, see:
            # https://github.com/OpenAPITools/openapi-generator/issues/5008#issuecomment-613791804
            "useSingleRequestParameter=true,"
            "withSeparateModelsAndApi=true,modelPackage=models,apiPackage=api",
        ]
    )
    execute(["npm", "run", "fmt-frontend"])


if __name__ == "__main__":
    main()
