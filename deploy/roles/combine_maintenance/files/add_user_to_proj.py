#!/usr/bin/env python3
"""
Add user to a project.

This script will add a user to a Combine project in the database

To add the user to the project, we need to:
 1. Look up the user id - check the "user" info against the username and
    email fields in the UsersCollection.
 2. Check to see if the user is already in the project.  If he/she is
    already a member and the --admin argument is used, set the permissions to
    [5,4,3,2,1], otherwise do nothing.
 3. If the user is not in the project:
     a. create a document in the UserRolesCollection,
     b. add the new role to the user's document in the UsersCollection
     c. set the permissions field in the user role to [5,4,3,2,1] if the
        --admin argument is used, [3,2,1] otherwise.
"""

import argparse
import json
from pathlib import Path
import sys
from typing import Dict

from combine_app import CombineApp, Permission


def parse_args() -> argparse.Namespace:
    """Parse the command line arguments."""
    parser = argparse.ArgumentParser(
        description="Add a user to a project on TheCombine. "
        "The user can be specified by username or e-mail address.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--project", required=True, help="Project(s) to be removed from TheCombine."
    )
    parser.add_argument(
        "--user", required=True, help="Username or e-mail of the user to be added to the project"
    )
    parser.add_argument(
        "--admin", action="store_true", help="Add the user as an admin for the project"
    )
    default_config = Path(__file__).resolve().parent / "script_conf.json"
    parser.add_argument("--config", help="backup configuration file.", default=default_config)
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def main() -> None:
    """Add a user to a project."""
    args = parse_args()
    config: Dict[str, str] = json.loads(Path(args.config).read_text())
    combine = CombineApp(Path(config["docker_compose_file"]))

    # 0. Define user permission sets
    if args.admin:
        user_permissions = [
            Permission.DeleteEditSettingsAndUsers.value,
            Permission.ImportExport.value,
            Permission.MergeAndCharSet.value,
            Permission.Unused.value,
            Permission.WordEntry.value,
        ]
    else:
        user_permissions = [
            Permission.MergeAndCharSet.value,
            Permission.Unused.value,
            Permission.WordEntry.value,
        ]

    # 1. Lookup the user id
    user_id = combine.get_user_id(args.user)
    if user_id is None:
        print(f"Cannot find user {args.user}")
        sys.exit(1)
    if args.verbose:
        print(f"User Id: {user_id}")

    # Look up the project id
    proj_id = combine.get_project_id(args.project)
    if proj_id is None:
        print(f"Cannot find project {args.project}")
        sys.exit(1)
    if args.verbose:
        print(f"Project ID: {proj_id}")

    # 2. Check to see if the user is already in the project.
    # define the query selection and projection arguments separately to
    # improve readability
    select_crit = f'{{ _id: ObjectId("{user_id}"), "projectRoles.{proj_id}": {{ $exists: true}} }}'
    projection = f'{{ "projectRoles.{proj_id}" : 1}}'
    result = combine.db_cmd(f"db.UsersCollection.find({select_crit}, {projection})")
    if result is not None:
        # The user is in the project
        if not args.admin:
            print(f"{args.user} is already a member of {args.project}")
            sys.exit(0)
        user_role_id = result["projectRoles"][proj_id]
        if args.verbose:
            print(f"UserRole ID: {user_role_id}")
        select_role = f'{{ _id: ObjectId("{user_role_id}")}}'
        update_role = f'{{ $set: {{"permissions" : {user_permissions}}} }}'
        combine.db_cmd(f"db.UserRolesCollection.findOneAndUpdate({select_role}, {update_role})")
        if args.verbose:
            print(f"Updated Role {user_role_id} with permissions {user_permissions}")
    else:
        #  3. The user is not in the project:
        #      a. create a document in the UserRolesCollection,
        if args.admin:
            user_permissions = [
                Permission.DeleteEditSettingsAndUsers.value,
                Permission.ImportExport.value,
                Permission.MergeAndCharSet.value,
                Permission.Unused.value,
                Permission.WordEntry.value,
            ]
        else:
            user_permissions = [
                Permission.MergeAndCharSet.value,
                Permission.Unused.value,
                Permission.WordEntry.value,
            ]
        insert_doc = f'{{ "permissions" : {user_permissions}, "projectId" : "{proj_id}" }}'
        insert_result = combine.db_cmd(f"db.UserRolesCollection.insertOne({insert_doc})")
        if insert_result is not None:
            #      b. add the new role to the user's document in the UsersCollection
            user_role_id = insert_result["insertedId"]
            select_user = f'{{ _id: ObjectId("{user_id}")}}'
            update_user = f'{{ $set : {{"projectRoles.{proj_id}" : "{user_role_id}" }}}}'
            add_role_result = combine.db_cmd(
                f"db.UsersCollection.updateOne({select_user}, {update_user})"
            )
            if add_role_result is None:
                print(f"Could not add new role to {args.user}.", file=sys.stderr)
                sys.exit(1)
            elif args.verbose:
                print(f"{args.user} added to {args.project} with permissions {user_permissions}")
        else:
            print(f"Could not create role for {args.user} in {args.project}.", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
