"""Build a configuration structure for building The Combine Kubernetes Cluster."""

import os
from pathlib import Path
import yaml
from typing import Dict, List, Optional, Union


def config(target: str) -> Dict[str, Union[List[str], str, int, bool]]:
    """Build the Kubernetes configuration for the specified target."""
    print(target)
    config_dir = Path(__file__).resolve().parent / "config"
    with open(config_dir / "targets.yaml", "r") as file:
        target_configs = yaml.safe_load(file)
    # this_target = target_configs[target]
    config_group_file = config_dir / target_configs[target]['config_group']
    with open(config_group_file, "r") as file:
        group_config = yaml.safe_load(file)
    with open(config_dir / 'common.yaml', 'r') as file:
        common_config = yaml.safe_load(file)

    return common_config | group_config | target_configs[target]
