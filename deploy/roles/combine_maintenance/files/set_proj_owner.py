#!/usr/bin/env python3
"""
Set the project Owner for all projects.

This script will set a user as Owner for all existing Combine projects
in the database

For each project, it will check to see if it already has an owner.
If not, it will list the current administrators.  If there is only one administrator,
it will make it the owner.
If there are multiple administrators, it will prompt the user for which user should
be the owner.
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
        proj_id = proj["_id"]
        if args.verbose:
            print(f"Checking project: {proj['name']} ({proj_id})")
        # Get the admin user roles (roles that have Permission.DeleteEditSettingsAndUsers set)
        if len(combine.get_project_roles(proj_id, Permission.Owner)) > 0:
            continue
        admin_roles = combine.get_project_roles(proj_id, Permission.DeleteEditSettingsAndUsers)
        update_role = None
        if len(admin_roles) == 1:
            # There is only one admin role, set as selected user role
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
            f"{{ $addToSet: {{ 'permissions': { Permission.Owner.value} }} }})"
        )


if __name__ == "__main__":
    main()
