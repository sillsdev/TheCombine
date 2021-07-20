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
from typing import Dict

from combine_app import CombineApp, Permission


def parse_args() -> argparse.Namespace:
    """Parse the command line arguments."""
    parser = argparse.ArgumentParser(
        description="Add project owner where missing.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    default_config = Path(__file__).resolve().parent / "script_conf.json"
    parser.add_argument("--config", help="backup configuration file.", default=default_config)
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def main() -> None:
    """Set project owner permissions to projects that have no owner."""
    args = parse_args()
    config: Dict[str, str] = json.loads(Path(args.config).read_text())
    combine = CombineApp(Path(config["docker_compose_file"]))

    # Get list of existing projects
    proj_list = combine.db_query("ProjectsCollection", "{}", "{ name: 1 }")

    # Iterate over each project
    for proj in proj_list:
        if args.verbose:
            print(f"Checking project: {proj['name']} ({proj['_id']})")
        # get the admin user roles (roles that have Permission.DeleteEditSettingsAndUsers set)
        proj_id = proj["_id"]
        if len(combine.get_project_roles(proj_id, Permission.ProjectOwner)) > 0:
            continue
        admin_roles = combine.get_project_roles(proj_id, Permission.DeleteEditSettingsAndUsers)
        update_role = None
        if len(admin_roles) == 1:
            # there is only one admin role, set as selected user role
            update_role = admin_roles[0]["_id"]
        elif len(admin_roles) > 1:
            # Create list of admin users
            role_id_list = []
            for admin_role in admin_roles:
                role_id_list.append(admin_role["_id"])
            if args.verbose:
                print(f"Admin roles for project: {role_id_list}")
            admin_users = combine.db_query(
                "UsersCollection", f"{{'projectRoles.{proj_id}': {{ $in: {role_id_list} }} }}"
            )
            print(f"Current administrators for {proj['name']}")
            for i, user in enumerate(admin_users):
                print(f"{i+1}: {user['name']} ({user['username']})")
            # Prompt for project owner selection
            num_proj_owner = (
                int(input("Enter the number of the user to be project owner (0 = None):")) - 1
            )
            if num_proj_owner >= 0:
                if args.verbose:
                    print(f"Selected {admin_users[num_proj_owner]['name']}")
                update_role = admin_users[num_proj_owner]["projectRoles"][proj_id]
        # Set "Project Owner" permission in selected user role
        combine.db_cmd(
            "db.UserRolesCollection.updateOne("
            f"{{ '_id': ObjectId('{update_role}') }}, "
            f"{{ $addToSet: {{ 'permissions': { Permission.ProjectOwner.value} }} }})"
        )


if __name__ == "__main__":
    main()
