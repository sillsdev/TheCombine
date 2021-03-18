#!/usr/bin/env python3

from combine_env import get_setting, print_step

print(f"Verbose is set to {get_setting('VERBOSE')}")
print_step("The first step.")
print_step("The second step.")
print_step("The third step.")
