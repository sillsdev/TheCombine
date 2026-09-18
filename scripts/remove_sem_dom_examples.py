#!/usr/bin/env python3
"""Remove all <ExampleWords> and <ExampleSentences> blocks from semantic domain XML files."""

from pathlib import Path
import re
import sys

XML_DIR = Path(__file__).parent.parent / "deploy" / "scripts" / "semantic_domains" / "xml"
TAGS = ["ExampleWords", "ExampleSentences"]


def strip_examples(text: str) -> str:
    for tag in TAGS:
        # Match the tag with optional attributes, in either self-closing (<Tag/>) or
        # block (<Tag>...</Tag>) form.
        text = re.sub(rf"\s*<{tag}(\s[^>]*)?(/>|>.*?</{tag}>)", "", text, flags=re.DOTALL)
    return text


def main() -> None:
    files = list(XML_DIR.glob("*.xml"))
    if not files:
        print(f"No XML files found in {XML_DIR}", file=sys.stderr)
        sys.exit(1)

    for path in sorted(files):
        original = path.read_text(encoding="utf-8")
        modified = strip_examples(original)
        if modified != original:
            path.write_text(modified, encoding="utf-8")
            print(f"Updated {path.name}")
        else:
            print(f"No changes: {path.name}")


if __name__ == "__main__":
    main()
