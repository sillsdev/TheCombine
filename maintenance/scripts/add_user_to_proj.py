#!/usr/bin/env python3
"""
Add user to a project.

This script will add a user to a Combine project in the database

To add the user to the project, we need to:
 1. Look up the user id from the provided username/email.
 2. Look up the project id from the provided project name.
 3. Check to see if the user is already in the project.
    If so (and if they're not the project owner), update their role.
 4. If the user is not in the project:
     a. create a document in the UserRolesCollection,
     b. set the role field in the user role to the requested role.
     c. add the new role to the user's document in the UsersCollection
"""

import argparse
import sys

from combine_app import CombineApp, Role


def parse_args() -> argparse.Namespace:
    """Parse the command line arguments."""
    parser = argparse.ArgumentParser(
        description="Add a user to a project on The Combine."
        "The user can be specified by username or e-mail address.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--project", required=True, help="Name of the project to which the user is being added"
    )
    parser.add_argument(
        "--user", required=True, help="Username or e-mail of the user to be added to the project"
    )
    parser.add_argument(
        "--role",
        choices=[role.value for role in Role if role != Role.Owner],
        default=Role.Harvester.value,
        help="Project role of the user to be added",
    )
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def main() -> None:
    """Add a user to a project."""
    args = parse_args()
    combine = CombineApp()

    # 1. Look up the user id.
    user_id = combine.get_user_id(args.user)
    if user_id is None:
        print(f"Cannot find user {args.user}")
        sys.exit(1)
    if args.verbose:
        print(f"User Id: {user_id}")

    # 2. Look up the project id.
    proj_id = combine.get_project_id(args.project)
    if proj_id is None:
        print(f"Cannot find project {args.project}")
        sys.exit(1)
    if args.verbose:
        print(f"Project ID: {proj_id}")

    # 3. Check to see if the user is already in the project.
    # define the query selection and projection arguments separately to
    # improve readability
    select_crit = f'{{ _id: ObjectId("{user_id}"), "projectRoles.{proj_id}": {{ $exists: true}} }}'
    projection = f'{{ "projectRoles.{proj_id}" : 1}}'
    result = combine.db_query("UsersCollection", select_crit, projection)
    if len(result) == 1:
        # The user is in the project
        user_role_id = result[0]["projectRoles"][proj_id]
        select_role = f'{{ _id: ObjectId("{user_role_id}")}}'
        # Don't update if they're the project owner
        user_role = combine.db_query("UserRolesCollection", select_role)[0]["role"]
        if user_role == Role.Owner.value:
            print(f"Could not update role for {args.user}, the project owner", file=sys.stderr)
            sys.exit(1)
        # Update the role
        update_role = f'{{ $set: {{"role" : "{args.role}"}} }}'
        upd_result = combine.db_cmd(
            f"db.UserRolesCollection.findOneAndUpdate({select_role}, {update_role})"
        )
        if upd_result is None:
            print(f"Could not update role for {args.user}.", file=sys.stderr)
            sys.exit(1)
        if args.verbose:
            print(f"Updated Role {user_role_id} with role {args.role}.")
    elif len(result) == 0:
        #  4. The user is not in the project
        #    a. create a document in the UserRolesCollection,
        #    b. set the role field in the user role to the requested role.
        insert_doc = f'{{ "role" : "{args.role}", "projectId" : "{proj_id}" }}'
        insert_result = combine.db_cmd(f"db.UserRolesCollection.insertOne({insert_doc})")
        if insert_result is not None:
            # c. add the new role to the user's document in the UsersCollection
            user_role_id = insert_result["insertedId"]
            select_user = f'{{ _id: ObjectId("{user_id}")}}'
            update_user = f'{{ $set : {{"projectRoles.{proj_id}" : "{user_role_id}" }}}}'
            add_role_result = combine.db_cmd(
                f"db.UsersCollection.updateOne({select_user}, {update_user})"
            )
            if add_role_result is None:
                print(f"Could not add new role to {args.user}.", file=sys.stderr)
                sys.exit(1)
            if args.verbose:
                print(f"{args.user} added to {args.project} with role {args.role}.")
        else:
            print(f"Could not create role for {args.user} in {args.project}.", file=sys.stderr)
            sys.exit(1)
    else:
        print(
            f"Too many documents in UserRolesCollection for User {args.user}"
            f" in Project {args.project}"
        )


if __name__ == "__main__":
    main()
