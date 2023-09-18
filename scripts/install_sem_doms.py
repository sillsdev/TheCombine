#!/usr/bin/env python3

"""Generate and install the Semantic Domain definitions."""

from __future__ import annotations

import argparse
import logging
from pathlib import Path
import platform
import subprocess
import sys
import time
from typing import List, Optional

project_dir = Path(__file__).resolve().parent.parent


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate and import semantic domain data for The Combine.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--database",
        "-d",
        action="store_true",
        help="Start the database before generating semantic domain data.",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Print extended log messages.",
    )
    return parser.parse_args()


def run_cmd(
    cmd: List[str], *, check_results: bool = True, shell_needed: bool = True
) -> subprocess.CompletedProcess[str]:
    """Run a command with subprocess and catch any CalledProcessErrors."""
    try:
        logging.info(f"Running: {cmd}")
        results = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            check=check_results,
            shell=shell_needed,
        )
        if (results.stdout):
            logging.info(f"STDOUT: {results.stdout}")
        if (results.stderr):
            logging.info(f"STDERR: {results.stderr}")
        return results

    except subprocess.CalledProcessError as err:
        logging.error("CalledProcessError")
        logging.error(f"...Command: {err.cmd}")
        logging.error(f"...returncode {err.returncode}")
        logging.error(f"...stdout: {err.stdout}")
        logging.error(f"...stderr: {err.stderr}")
        sys.exit(err.returncode)


def main() -> None:
    args = parse_args()
    log_level = logging.INFO if args.verbose else logging.WARNING
    logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)
    db_job: Optional[subprocess.Popen[str]] = None
    if args.database:
        db_cmd = ["npm", "run", "database"]
        logging.info("Starting database process.")
        db_job = subprocess.Popen(
            db_cmd,
            cwd=project_dir,
            universal_newlines=True,
        )
        # replace with a more elegant solution, i.e. read stdout/stderr to see
        # if process started or if it exited
        time.sleep(5)
    shell_needed = platform.system() == "Windows"
    script_dir = project_dir / "deploy" / "scripts"
    xml_files = (script_dir / "semantic_domains" / "xml").glob("**/*.xml")
    gen_xml_cmd = [script_dir / "sem_dom_import.py"] + [str(x) for x in list(xml_files)]
    results = run_cmd(gen_xml_cmd, shell_needed=shell_needed, check_results=True)
    import_cmd = ["mongoimport", "-d", "CombineDatabase"]
    if not args.verbose:
        import_cmd.append("--quiet")
    results = run_cmd(
        import_cmd
        + [
            "-c",
            "SemanticDomains",
            str(script_dir / "semantic_domains" / "json" / "nodes.json"),
            "--mode=upsert",
            "--upsertFields=id,lang,guid",
        ],
        shell_needed=shell_needed,
        check_results=True,
    )
    results = run_cmd(
        import_cmd
        + [
            "-c",
            "SemanticDomainTree",
            str(script_dir / "semantic_domains" / "json" / "tree.json"),
            "--mode=upsert",
            "--upsertFields=id,lang,guid",
        ],
        shell_needed=shell_needed,
        check_results=True,
    )
    if db_job is not None:
        backend_status = db_job.poll()
        if backend_status is None:
            db_job.terminate()
            logging.info("Backend terminated.")
        else:
            logging.info(f"Backend exited with return code: {backend_status}.")


if __name__ == "__main__":
    main()
