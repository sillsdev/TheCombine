#!/usr/bin/env python3
"""Reflow Markdown prose: unwrap hard-wrapped paragraphs, then rebreak one sentence per line.

The user-guide docs are uploaded to Crowdin for translation. Hard-wrapping paragraphs at a
fixed column breaks reimporting translations produced outside Crowdin (the line breaks do not
line up with sentence/segment boundaries). Keeping each sentence on its own, unwrapped line
avoids that: paragraphs join back into a single logical line and are then split at sentence
boundaries.

Headings, images, admonition markers, code fences, thematic breaks, and list structure are
preserved verbatim; only the prose inside a block is unwrapped and re-split. Blank lines and
block indentation (e.g. the 4-space indent of an admonition body) are kept.

After reflowing, each translation file (name.<lang>.md) is compared against its English source
(name.md): because prose is now one sentence per line, a faithful translation should have the
same number of content lines in each section. A mismatch is reported as a warning, flagging
sections where the translation has drifted from the source (merged/split sentences, missing or
extra content).

Usage:
    python scripts/rewrap_docs_by_sentence.py [--check] [PATH ...]

With no arguments, every *.md file under docs/user_guide/docs/ is processed in place. Each PATH
may be a Markdown file or a directory (searched recursively for *.md). Pass --check to only run
the translation comparison without modifying any files.
"""

from __future__ import annotations

from pathlib import Path
import sys
import re

DOCS_DIR = Path(__file__).parent.parent / "docs" / "user_guide" / "docs"

# Abbreviations whose trailing period must not be treated as a sentence break. Kept small on
# purpose: entries like "no." or "al." would suppress breaks after the common words "no"/"al".
ABBREVIATIONS = {
    "e.g.", "i.e.", "etc.", "vs.", "cf.", "approx.",
    "mr.", "mrs.", "ms.", "dr.", "st.", "fig.", "vol.",
    "a.m.", "p.m.", "u.s.", "ph.d.",
}

_HEADING = re.compile(r"^\s{0,3}#{1,6}(\s|$)")
_HEADING_CAPTURE = re.compile(r"^\s{0,3}(#{1,6})(?:\s+(.*))?$")
_HEADING_ANCHOR = re.compile(r"\s*\{#[^}]*\}\s*$")
_ADMONITION = re.compile(r"^\s*(!!!|\?\?\?)")
_FENCE = re.compile(r"^\s*(```|~~~)")
_THEMATIC_BREAK = re.compile(r"^\s*([-*_])(\s*\1){2,}\s*$")
_LIST_ITEM = re.compile(r"^(\s*)([-*+]|\d+[.)])\s+(.*)$")
_IMAGE_ONLY = re.compile(r"^\s*!\[[^\]]*\]\([^)]*\)(\{[^}]*\})?\s*$")
_HTML = re.compile(r"^\s*<")
_PRE_OPEN = re.compile(r"^\s*<pre\b", re.IGNORECASE)
_PRE_CLOSE = re.compile(r"</pre\s*>", re.IGNORECASE)
_BLANK = re.compile(r"^\s*$")

# Characters that terminate a sentence.
_ASCII_ENDERS = ".!?"
_CJK_ENDERS = "。！？"
# Closing punctuation that may trail a sentence-ending character (quotes, brackets, emphasis).
_CLOSERS = ")]}\"'`*_）」』”’"
# Closing quotation marks. A full-width ender directly inside a quote (e.g. the label
# "忘记密码？") is not a sentence boundary, since CJK has no capitalization to disambiguate.
_QUOTE_CLOSERS = "\"'」』”’"
# Characters (besides letters/digits) that may legitimately begin a new sentence.
_ASCII_STARTERS = set("([{\"'`*_!¡¿")


def _breaks_block(line: str) -> bool:
    """Whether a line ends the current prose/list block and must be emitted verbatim itself."""
    return bool(
        _BLANK.match(line)
        or _HEADING.match(line)
        or _THEMATIC_BREAK.match(line)
        or _ADMONITION.match(line)
        or _FENCE.match(line)
        or _HTML.match(line)
        or _IMAGE_ONLY.match(line)
    )


def _is_cjk(ch: str) -> bool:
    o = ord(ch)
    return (
        0x3000 <= o <= 0x9FFF  # CJK punctuation, kana, CJK unified ideographs
        or 0xAC00 <= o <= 0xD7A3  # Hangul syllables
        or 0xF900 <= o <= 0xFAFF  # CJK compatibility ideographs
        or 0xFF00 <= o <= 0xFFEF  # full-width / half-width forms
        or 0x20000 <= o <= 0x2FA1F  # CJK extension planes
    )


def _join_wrapped(parts: list[str]) -> str:
    """Join hard-wrapped line fragments. A wrap between two CJK characters closes with no space
    (CJK text is unspaced); every other wrap becomes a single space (restoring e.g. "App Bar")."""
    result = ""
    for part in parts:
        if not part:
            continue
        if result and not (_is_cjk(result[-1]) and _is_cjk(part[0])):
            result += " "
        result += part
    return result


def _starts_sentence(ch: str) -> bool:
    return ch.isupper() or ch.isdigit() or ch in _ASCII_STARTERS


def _is_abbreviation(text: str, dot_index: int) -> bool:
    """Whether the period at dot_index is the tail of a known abbreviation (e.g. "e.g.")."""
    if text[dot_index] != ".":
        return False
    start = dot_index
    while start > 0 and not text[start - 1].isspace():
        start -= 1
    return text[start : dot_index + 1].lower() in ABBREVIATIONS


def split_sentences(text: str) -> list[str]:
    """Split a single logical line into one string per sentence."""
    text = text.strip()
    if not text:
        return []
    sentences: list[str] = []
    start = 0
    i = 0
    n = len(text)
    while i < n:
        ch = text[i]
        if ch in _ASCII_ENDERS or ch in _CJK_ENDERS:
            end = i + 1
            while end < n and text[end] in _CLOSERS:
                end += 1
            after = end
            while after < n and text[after] in " \t":
                after += 1
            if ch in _CJK_ENDERS:
                # Full-width punctuation ends a sentence with no trailing space required, unless
                # it sits inside a quotation (a closing quote follows it immediately).
                followed_by_quote = i + 1 < n and text[i + 1] in _QUOTE_CLOSERS
                is_break = after < n and not followed_by_quote
            else:
                is_break = (
                    after > end  # whitespace separated the two sentences
                    and after < n
                    and _starts_sentence(text[after])
                    and not _is_abbreviation(text, i)
                )
            if is_break:
                sentences.append(text[start:end].strip())
                start = after
                i = after
                continue
            i = end
        else:
            i += 1
    tail = text[start:].strip()
    if tail:
        sentences.append(tail)
    return sentences


def reflow(text: str) -> str:
    lines = text.splitlines()
    out: list[str] = []
    i = 0
    n = len(lines)
    in_fence = False
    in_pre = False

    while i < n:
        line = lines[i]

        # Verbatim regions: fenced code blocks and <pre> blocks (whitespace is significant).
        if in_pre:
            out.append(line)
            if _PRE_CLOSE.search(line):
                in_pre = False
            i += 1
            continue

        if in_fence:
            out.append(line)
            if _FENCE.match(line):
                in_fence = False
            i += 1
            continue

        if _FENCE.match(line):
            out.append(line)
            in_fence = True
            i += 1
            continue

        if _PRE_OPEN.match(line):
            out.append(line)
            if not _PRE_CLOSE.search(line):
                in_pre = True
            i += 1
            continue

        # Lines that stand on their own are emitted unchanged.
        if _breaks_block(line):
            out.append(line)
            i += 1
            continue

        # List item, possibly wrapped onto indented continuation lines.
        item = _LIST_ITEM.match(line)
        if item:
            indent, marker, first = item.group(1), item.group(2), item.group(3)
            content_indent = len(indent) + len(marker) + 1
            parts = [first.strip()]
            i += 1
            while i < n and not _breaks_block(lines[i]) and not _LIST_ITEM.match(lines[i]):
                leading = len(lines[i]) - len(lines[i].lstrip())
                if leading < content_indent:
                    break
                parts.append(lines[i].strip())
                i += 1
            sentences = split_sentences(_join_wrapped(parts))
            pad = " " * content_indent
            out.append(f"{indent}{marker} {sentences[0]}")
            out.extend(f"{pad}{s}" for s in sentences[1:])
            continue

        # Plain prose paragraph: gather consecutive prose lines, then unwrap and re-split.
        block_indent = line[: len(line) - len(line.lstrip())]
        parts = [line.strip()]
        i += 1
        while i < n and not _breaks_block(lines[i]) and not _LIST_ITEM.match(lines[i]):
            parts.append(lines[i].strip())
            i += 1
        for sentence in split_sentences(_join_wrapped(parts)):
            out.append(f"{block_indent}{sentence}")

    result = "\n".join(out)
    if text.endswith(("\n", "\r")):
        result += "\n"
    return result


def split_sections(text: str) -> list[tuple[int, str, int]]:
    """Split a document into sections at heading lines.

    Returns one (level, title, content_line_count) tuple per section, where content_line_count
    is the number of non-blank body lines (the heading itself excluded). Index 0 is the preamble
    before the first heading (level 0); lines inside code fences and <pre> blocks are counted as
    body content but never treated as headings.
    """
    sections: list[tuple[int, str, int]] = []
    level, title, count = 0, "(preamble)", 0
    in_fence = in_pre = False
    for line in text.splitlines():
        if in_pre:
            if line.strip():
                count += 1
            if _PRE_CLOSE.search(line):
                in_pre = False
            continue
        if in_fence:
            if line.strip():
                count += 1
            if _FENCE.match(line):
                in_fence = False
            continue
        if _FENCE.match(line):
            count += 1
            in_fence = True
            continue
        if _PRE_OPEN.match(line):
            count += 1
            if not _PRE_CLOSE.search(line):
                in_pre = True
            continue
        heading = _HEADING_CAPTURE.match(line)
        if heading:
            sections.append((level, title, count))
            level = len(heading.group(1))
            title = _HEADING_ANCHOR.sub("", heading.group(2) or "").strip()
            count = 0
        elif line.strip():
            count += 1
    sections.append((level, title, count))
    return sections


def english_source(path: Path) -> Path | None:
    """Return the English source for a translation file (name.<lang>.md -> name.md), else None."""
    if "." not in path.stem:
        return None  # already English (no language suffix)
    base = path.with_name(path.stem.rsplit(".", 1)[0] + path.suffix)
    return base if base.exists() and base != path else None


def compare_to_english(path: Path) -> list[str]:
    """Warn where a translation's per-section content-line counts differ from its English source."""
    base = english_source(path)
    if base is None:
        return []
    lang = path.stem.rsplit(".", 1)[1]
    eng = split_sections(base.read_text(encoding="utf-8"))
    tr = split_sections(path.read_text(encoding="utf-8"))
    warnings: list[str] = []
    if len(eng) != len(tr):
        warnings.append(
            f"{path.name}: heading count differs (English {len(eng) - 1}, {lang} {len(tr) - 1})"
        )
    for idx in range(min(len(eng), len(tr))):
        level, title, e_count = eng[idx]
        t_count = tr[idx][2]
        if e_count != t_count:
            where = f'{"#" * level} {title}' if level else title
            warnings.append(
                f"{path.name}: section [{where}] has {t_count} content lines "
                f"vs English {e_count}"
            )
    return warnings


def iter_markdown(paths: list[str]) -> list[Path]:
    files: list[Path] = []
    for raw in paths:
        p = Path(raw)
        if p.is_dir():
            files.extend(p.rglob("*.md"))
        elif p.suffix == ".md":
            files.append(p)
        else:
            print(f"Skipping non-Markdown path: {p}", file=sys.stderr)
    return sorted(set(files))


def main(argv: list[str]) -> int:
    check_only = "--check" in argv
    paths = [a for a in argv if not a.startswith("--")]
    files = iter_markdown(paths) if paths else sorted(DOCS_DIR.rglob("*.md"))
    if not files:
        print("No Markdown files found.", file=sys.stderr)
        return 1

    if not check_only:
        changed = 0
        for path in files:
            original = path.read_text(encoding="utf-8")
            modified = reflow(original)
            if modified != original:
                path.write_text(modified, encoding="utf-8", newline="\n")
                changed += 1
                print(f"Reflowed {path}")
            else:
                print(f"No changes: {path}")
        print(f"\n{changed} of {len(files)} file(s) changed.")

    warnings = [w for path in files for w in compare_to_english(path)]
    if warnings:
        print(f"\n{len(warnings)} translation section mismatch(es):", file=sys.stderr)
        for warning in warnings:
            print(f"  ! {warning}", file=sys.stderr)
    else:
        print("\nNo translation section mismatches.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
