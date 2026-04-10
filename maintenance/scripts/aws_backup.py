"""Wrappers to push/pull backups to/from AWS S3 bucket."""

from __future__ import annotations

from pathlib import Path
import subprocess

from maint_utils import run_cmd


class AwsBackup:
    """Simple interface for managing backups in AWS S3 bucket."""

    def __init__(self, *, bucket: str) -> None:
        """Initialize backup object."""
        if bucket.find("s3://") == 0:
            self.bucket = bucket
        else:
            self.bucket = f"s3://{bucket}"

    def push(self, src: Path, dest: str) -> subprocess.CompletedProcess[str]:
        """Push a file to the AWS S3 bucket."""
        s3_uri = f"{self.bucket}/{dest}"
        return run_cmd(["aws", "s3", "cp", "--no-progress", str(src), s3_uri])

    def push_stream(self, dest: str) -> subprocess.Popen[bytes]:
        """Start a streaming upload to the AWS S3 bucket.

        Returns a Popen process whose stdin accepts the data to upload.
        The caller must close stdin and call wait() to finalize the upload.
        """
        s3_uri = f"{self.bucket}/{dest}"
        return subprocess.Popen(
            ["aws", "s3", "cp", "--no-progress", "-", s3_uri],
            stdin=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

    def pull(self, src: str, dest: Path) -> subprocess.CompletedProcess[str]:
        """Pull a file from the AWS S3 bucket."""
        s3_uri = f"{self.bucket}/{src}"
        return run_cmd(["aws", "s3", "cp", "--no-progress", s3_uri, str(dest)])

    def list(self) -> subprocess.CompletedProcess[str]:
        """List the objects in the S3 bucket."""
        return run_cmd(["aws", "s3", "ls", f"{self.bucket}", "--recursive"])
