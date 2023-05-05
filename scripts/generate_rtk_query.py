#! /usr/bin/env python3

from __future__ import annotations

import argparse
from contextlib import closing
import json
import logging
from pathlib import Path
import re
import subprocess
import time
from typing import Dict, List, Optional

project_dir = Path(__file__).resolve().parent.parent
config_dir = project_dir / "src" / "rtk-query"
files_dir = Path(__file__).resolve().parent / "files"
controllers_dir = project_dir / "Backend" / "Controllers"
openapi_config = project_dir / "src" / "rtk-query" / "openapi-config.ts"


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate API Slice for RTK Query from Backend Controllers.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--backend",
        "-b",
        action="store_true",
        help="Start the backend before generating OpenAPI code.",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Print INFO logging messages.",
    )
    return parser.parse_args()


def find_endpoints(controller_file: Path) -> List[str]:
    """Build a list of endpoints in the controller source file specified."""
    endpoints: List[str] = []
    with open(controller_file, "r") as file:
        for line in file.readlines():
            match = re.search(r"IActionResult>?\s+(\w+)\(", line)
            if match:
                endpoints.append(match.group(1))
    return endpoints


def get_controllers() -> Dict[str, List[str]]:
    """
    Build the list of endpoint filters for the different backend controllers.

    Returns a dictionary keyed by the name of the controller.  Each value
    is a list of API Operations for that controller.
    """
    controllers: Dict[str, List[str]] = {}
    for controller_src in controllers_dir.iterdir():
        match = re.search(r"^(\w+)Controller$", controller_src.stem)
        if match:
            api_name = (match.group(1)).lower()
            controllers[api_name] = find_endpoints(controller_src)
    return controllers


def main() -> None:
    args = parse_args()
    log_level = logging.INFO if args.verbose else logging.WARNING
    logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)

    backend_job: Optional[subprocess.Popen[str]] = None
    if args.backend:
        logging.info("Starting backend process")
        backend_job = subprocess.Popen(
                    ["dotnet", "run"],
                    cwd=project_dir / "Backend",
                )
        # replace with a more elegant solution, i.e. read stdout/stderr to see
        # if process started or if it exited
        time.sleep(5)
    # Read in the openapi-codegen configuration (except for the outputFiles)
    with open(files_dir / "openapi-config.json") as cfg_file:
        config = json.load(cfg_file)
    controllers = get_controllers()
    logging.info(f"Controllers:\n{controllers}")
    # create the configuration file for openapi-codegen
    with open(openapi_config, "w") as output_file:
        output_file.writelines([
            'import type { ConfigFile } from "@rtk-query/codegen-openapi";\n\n',
            'const config: ConfigFile = {\n',
            f'  schemaFile: "{config["schemaFile"]}",\n',
            f'  apiFile: "{config["apiFile"]}",\n',
            f'  apiImport: "{config["apiImport"]}",\n',
            '  outputFiles: {\n',
        ])
        for controller in controllers:
            api_filename = f"./api/{controller}-api.ts"
            output_file.writelines([
                f'    "{api_filename}": {{\n',
                f'      filterEndpoints: {controllers[controller]},\n'
                 '    },\n',
            ])
        output_file.writelines([
            '  },\n',
            '  hooks: true\n',
            '};\n\n',
            'export default config\n'
        ])
    openapi_filename = f"./{openapi_config.relative_to(project_dir)}"
    subprocess.run(["npx", "@rtk-query/codegen-openapi", openapi_filename], cwd=project_dir)
    subprocess.run(["npm", "run", "lint:fix-layout"], cwd=project_dir)
    if backend_job is not None:
        backend_status = backend_job.poll()
        if backend_status is None:
            backend_job.terminate()
            logging.info("Backend terminated.")
        else:
            logging.info(f"Backend exited with return code: {backend_status}.")

if __name__ == "__main__":
    main()
