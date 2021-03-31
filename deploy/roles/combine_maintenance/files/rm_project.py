#!/usr/bin/env python3
"""
Remove a project and its associated data from TheCombine.

To delete a project from the database, we need to delete:
 1. documents in the
     - FrontierCollection,
     - WordsCollection,
     - UserEditsCollection, and
     - UserRolesCollection
    with a projectId field that matches the project being deleted;
 2. entries in the workedProject and projectRoles arrays in
    the UsersCollection that reference the project being deleted.
 3. the project document from the ProjectsCollection;

To delete a project from the backend, we need to delete:
 4. the directory
      /home/app/.CombineFiles/<project_id>
   and all of its contents.
"""

import argparse
import json
from pathlib import Path
import sys
from typing import Dict

from combine_app import CombineApp


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Remove a project from the Combine server. "
        "Project data are deleted from the database and "
        "the backend containers.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("projects", nargs="*", help="Project(s) to be removed from TheCombine.")
    default_config = Path(__file__).resolve().parent / "script_conf.json"
    parser.add_argument("--config", help="backup configuration file.", default=default_config)
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def db_delete_from_collection(project_id: str, collection: str) -> str:
    """Remove the specified project from the collection."""
    return f'db.{collection}.deleteMany({{ projectId: "{project_id}"}})'


def db_delete_from_user_fields(project_id: str, field: str) -> str:
    """Remove the specified project from the field in the UsersCollection."""
    return f'db.UsersCollection.updateMany({{}}, {{ $unset: {{ "{field}.{project_id}" : ""}} }})'


def db_delete_from_projects(project_id: str) -> str:
    """Remove the specified project from the ProjectsCollection."""
    return f'db.ProjectsCollection.deleteOne({{ _id: ObjectId("{project_id}")}})'


def main() -> None:
    """Remove a project and its associated data from TheCombine."""
    args = parse_args()
    config: Dict[str, str] = json.loads(Path(args.config).read_text())
    combine = CombineApp(Path(config["docker_compose_file"]))

    for project in args.projects:
        project_id = combine.get_project_id(project)
        if project_id:
            if args.verbose:
                print(f"Remove project {project}")
                print(f"Project ID: {project_id}")
            for collection in (
                "FrontierCollection",
                "WordsCollection",
                "UserEditsCollection",
                "UserRolesCollection",
            ):
                combine.db_cmd(db_delete_from_collection(project_id, collection))
            for field in ("workedProjects", "projectRoles"):
                combine.db_cmd(db_delete_from_user_fields(project_id, field))
            combine.db_cmd(db_delete_from_projects(project_id))
            combine.exec("backend", ["rm", "-rf", f"/home/app/.CombineFiles/{project_id}"])
        else:
            print(f"Cannot find {project}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
