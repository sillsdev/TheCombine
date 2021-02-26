#!/usr/bin/env python3
"""Make a user a site administrator."""

import argparse

from maint_utils import db_cmd, get_user_id


def parse_args() -> argparse.Namespace:
    """Parse the command line arguments."""
    parser = argparse.ArgumentParser(
        description="Make an existing user a site administrator "
        "for TheCombine.  "
        "The user can be specified by username or e-mail address.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "users", nargs="*", help="Username or e-mail of the user to be added to the project"
    )
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def main() -> None:
    """Make a user a site administrator."""
    args = parse_args()
    for user in args.users:
        user_id = get_user_id(user)
        if user_id is not None:
            result = db_cmd(
                f'db.UsersCollection.updateOne({{ _id : ObjectId("{user_id}")}},'
                "{ $set: { isAdmin : true }})"
            )
            if result is not None and args.verbose and result["acknowledged"]:
                print(f"{user} is a Site Admin.")
        elif args.verbose:
            print(f"Cannot find user {user}.")


if __name__ == "__main__":
    main()
