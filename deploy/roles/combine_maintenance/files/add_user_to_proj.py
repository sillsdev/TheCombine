#!/usr/bin/env python3
"""
Add user to a project.

This script will add a user to a Combine project in the database
Assumptions:
  - The Javascript is run with the following variables set:
      - user: user's username or e-mail address
      - projName: name of the project to which the user is
        to be added
      - isAdmin: set to true/false to determine the user permissions.
        If set to "True", the permissions are set to [5,4,3,2,1], otherwise
        they are set to [3,2,1]

To add the user to the project, we need to:
 1. Look up the user id - check the "user" info against the username and
    email fields in the UsersCollection.
 2. Check to see if the user is already in the project.  If he/she is
    already a member, update the permissions if "isAdmin" is set to True,
    otherwise do nothing.
 3. If the user is not in the project:
     a. create a document in the UserRolesCollection,
     b. add the new role to the user's document in the UsersCollection
"""

import argparse
import sys

from maint_utils import db_cmd, get_project_id, object_id


def parse_args() -> argparse.Namespace:
    """Parse the command line arguments."""
    parser = argparse.ArgumentParser(
        description="""Add a user to a project on TheCombine. """
        """The user can be specified by his/her username or """
        """by his/her e-mail address.""",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--project", required=True, help="Project(s) to be removed from TheCombine."
    )
    parser.add_argument(
        "--user", required=True, help="Username or e-mail of the user to be added to the project"
    )
    parser.add_argument("--admin", help="Add the user as an admin for the project")
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def main():
    """Add a user to a project."""
    args = parse_args()
    # 1. Lookup the user id
    results = db_cmd(
        f'db.UsersCollection.findOne({{ username: "{args.user}"}}, {{ username: 1 }})'
    )
    user_id = object_id(results.stdout)
    if not user_id:
        results = db_cmd(
            f'db.UsersCollection.findOne({{ email: "{args.user}"}}, {{ username: 1 }})'
        )
        user_id = object_id(results.stdout)
    if not user_id:
        print(f"Cannot find user {args.user}")
        sys.exit(1)
    print(f"User Id: {user_id}")

    # Check to see if this user is already in the project.
    proj_id = get_project_id(args.project)
    if not proj_id:
        print(f"Cannot find project {args.project}")
        sys.exit(2)
    print(f"Project ID: {proj_id}")
    results = db_cmd(
        f'db.UsersCollection.find({{ _id: ObjectId("{user_id}"), "projectRoles.{proj_id}": {{ $exists: true}} }}, {{ "projectRoles.{proj_id}" : 1}})'
    )
    print(results.stdout)
    print(results.stderr)


if __name__ == "__main__":
    main()
