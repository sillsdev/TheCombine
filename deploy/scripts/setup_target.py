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
        "--user", default="sillsdev", help="Username for ssh connection to the target device."
    )
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
    # Generate ssh keys
    os.system("ssh-keygen")
    # Copy ssh id to target
    os.system(f"ssh-copy-id {args.user}@{args.name}")


if __name__ == "__main__":
    main()
