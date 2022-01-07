#!/usr/bin/env/ python3

from aws_access import AwsAccessConfig
from combine_config import config

if __name__ == "__main__":
    aws_access = AwsAccessConfig()
    tgt_config = config("nuc1")
    config = tgt_config | aws_access.as_dict()
    print("Config:")
    print(config)
