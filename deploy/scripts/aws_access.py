""" Create AWS configuration dict from current environment."""

from dataclasses import dataclass
import os
from typing import Dict


@dataclass
class AwsAccess:
    """Manage access credentials for an AWS service."""

    account: str
    region: str
    access_key: str
    secret: str

    def as_dict(self) -> Dict[str, str]:
        return {
            "account": self.account,
            "region": self.region,
            "access_key": self.access_key,
            "secret": self.secret,
        }


class AwsAccessConfig:

    ecr_config: AwsAccess
    s3_config: AwsAccess

    def __init__(self) -> None:
        self.ecr_config = AwsAccess(
            account=os.environ["AWS_ACCOUNT"],
            region=os.environ["AWS_DEFAULT_REGION"],
            access_key=os.environ["AWS_ECR_ACCESS_KEY_ID"],
            secret=os.environ["AWS_ECR_SECRET_ACCESS_KEY"],
        )
        self.s3_config = AwsAccess(
            account=os.environ["AWS_ACCOUNT"],
            region=os.environ["AWS_DEFAULT_REGION"],
            access_key=os.environ["AWS_S3_ACCESS_KEY_ID"],
            secret=os.environ["AWS_S3_SECRET_ACCESS_KEY"],
        )

    def as_dict(self) -> Dict[str, Dict[str, str]]:
        return {"ecr_config": self.ecr_config.as_dict(), "s3_config": self.s3_config.as_dict()}
