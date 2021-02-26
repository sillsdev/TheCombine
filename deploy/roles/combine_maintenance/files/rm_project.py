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
import sys

from maint_utils import db_cmd, get_project_id, run_docker_cmd


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    # Parse user command line arguments
    parser = argparse.ArgumentParser(
        description="""Remove a project from the Combine server. """
        """Project data are deleted from the database and """
        """the backend containers.""",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("projects", nargs="*", help="Project(s) to be removed from TheCombine.")
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def delete_from_collection(project_id: str, collection: str) -> None:
    """Remove the specified project from the collection."""
    db_cmd(f'db.{collection}.deleteMany({{ projectId: "{project_id}"}})')


def delete_from_user_fields(project_id: str, field: str) -> None:
    """Remove the specified project from the field in the UsersCollection."""
    db_cmd(f'db.UsersCollection.updateMany({{}}, {{ $unset: {{ "{field}.{project_id}" : ""}} }})')


def delete_from_projects(project_id: str) -> None:
    """Remove the specified project from the ProjectsCollection."""
    db_cmd(f'db.ProjectsCollection.deleteOne({{ _id: ObjectId("{project_id}")}})')


def main() -> None:
    """Remove a project and its associated data from TheCombine."""
    args = parse_args()
    for project in args.projects:
        project_id = get_project_id(project)
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
                delete_from_collection(project_id, collection)
            for field in ("workedProjects", "projectRoles"):
                delete_from_user_fields(project_id, field)
            delete_from_projects(project_id)
            run_docker_cmd("backend", ["rm", "-rf", f"/home/app/.CombineFiles/{project_id}"])
        else:
            print(f"Cannot find {project}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
