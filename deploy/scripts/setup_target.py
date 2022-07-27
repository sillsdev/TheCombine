#! /usr/bin/env python3

import argparse
import os
from pathlib import Path
import re
import shutil
import tempfile


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Setup access to the target device for Ansible.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("ip", help="IPv4 address for the target device.")
    parser.add_argument("name", help="Name of the target device.")
    parser.add_argument(
        "--target-user",
        "-t",
        default="sillsdev",
        help="Username for ssh connection to the target device.",
    )
    parser.add_argument("--local-user", "-l", help="Local user for creating ssh keys.")
    parser.add_argument("--hosts", default="/etc/hosts", help="File for host definition.")
    return parser.parse_args()


def update_hosts_file(tgt_ip: str, tgt_name: str, hosts_filename: Path) -> None:
    """Map tgt_name to tgt_ip in the specified hosts_filename."""
    match = re.search(r"^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\..(\d{1,3})$", tgt_ip)
    if match is not None:
        ip_pattern = tgt_ip.replace(".", r"\.")
    else:
        raise ValueError(f"Invalid IPv4 address: {tgt_ip}")
    # create ip address pattern from string
    # Update /etc/hosts
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_hosts = Path(temp_dir).resolve() / "hosts"
        output_file = open(temp_hosts, "w")
        hosts_file = open(hosts_filename)
        both_in_line = re.compile(f"^{ip_pattern}[ \t]+.*{tgt_name}")
        ip_in_line = re.compile(f"^{ip_pattern}[ \t]+.*")
        name_in_line = re.compile(f"[ \t]{tgt_name}")
        entry_found = False
        for line in hosts_file:
            line = re.sub(r"[\r\n]+$", "", line)
            # check to see if we've already found the entry
            if entry_found:
                output_line = line
            # check to see if target is in this line
            elif both_in_line.search(line):
                entry_found = True
                output_line = f"{line}"
            elif ip_in_line.search(line):
                output_line = f"{line} {tgt_name}"
                entry_found = True
            elif name_in_line.search(line):
                # replace IP address for args.name and any other hosts with that IP address
                output_line = re.sub(r"^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\..(\d{1,3})", tgt_ip, line)
                entry_found = True
            else:
                output_line = f"{line}"
            output_file.write(f"{output_line}\n")

        if not entry_found:
            output_file.write(f"{tgt_ip}  {tgt_name}\n")
        hosts_file.close()
        output_file.close()
        shutil.copy(temp_hosts, hosts_filename)


def main() -> None:
    """Setup access to the target specified on the command line."""
    args = parse_args()
    # Add the target IP and target name to /etc/hosts (or other hosts file)
    update_hosts_file(args.ip, args.name, Path(args.hosts).resolve())

    """
    Set up the ssh key and copy it do the target.

    Usually this script needs to be run with `sudo` so that the /etc/hosts file can
    be modified.  This results in, the key getting setup for the root user instead of
    the user that invoked the script with `sudo`.
    The --local-user/-l option is available to generate the key for a local user instead
    of root.  Some things to note are:
      1. This script switches to the local user with `su` to run the two commands for setting
         up the ssh key
      2. The --session-command option for su needs to be used instead of -c
         (at least for ssh-copy-id)
      3. The command needs to be quoted.
    """
    if args.local_user is None:
        cmd_prefix = ""
        cmd_suffix = ""
    else:
        cmd_prefix = f'su {args.local_user} --session-command "'
        cmd_suffix = '"'
    # Generate ssh keys
    ssh_cmd = f"{cmd_prefix}ssh-keygen{cmd_suffix}"
    os.system(ssh_cmd)
    # Copy ssh id to target
    ssh_cmd = f"{cmd_prefix}ssh-copy-id {args.target_user}@{args.name}{cmd_suffix}"
    print(ssh_cmd)
    os.system(ssh_cmd)


if __name__ == "__main__":
    main()
