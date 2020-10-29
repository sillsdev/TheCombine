"""
Collection of functions for managing Amazon Web Services
"""
from pathlib import Path

def aws_login() -> bool:
    print("AWS Login")

def aws_s3_put(src: Path, dest: str) -> bool:
    print(f"AWS S3 put {src} to {dest}")

def aws_s3_get(src: str, dest: Path) -> bool:
    print(f"AWS S3 get {dest} from {src}")

def aws_logout() -> bool:
    print("AWS Logout")
