#!/usr/bin/env python3
"""Make a user a site administrator."""

import argparse
import json
from pathlib import Path
from typing import Dict

from combine_app import CombineApp


def parse_args() -> argparse.Namespace:
    """Parse the command line arguments."""
    parser = argparse.ArgumentParser(
        description="Make an existing user a site administrator "
        "for TheCombine.  "
        "The user can be specified by username or e-mail address.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "users", nargs="*", help="Username or e-mail of the user to be made a site admin"
    )
    default_config = Path(__file__).resolve().parent / "script_conf.json"
    parser.add_argument("--config", help="backup configuration file.", default=default_config)
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    return parser.parse_args()


def main() -> None:
    """Make a user a site administrator."""
    args = parse_args()
    config: Dict[str, str] = json.loads(Path(args.config).read_text())
    combine = CombineApp(Path(config["docker_compose_file"]))
    for user in args.users:
        user_id = combine.get_user_id(user)
        if user_id is not None:
            result = combine.db_cmd(
                f'db.UsersCollection.updateOne({{ _id : ObjectId("{user_id}")}},'
                "{ $set: { isAdmin : true }})"
            )
            if result is not None and args.verbose and result["acknowledged"]:
                print(f"{user} is a Site Admin.")
        elif args.verbose:
            print(f"Cannot find user {user}.")


if __name__ == "__main__":
    main()
