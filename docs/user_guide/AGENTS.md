# `docs/user_guide/mkdocs.yml`

The user guide languages should match `localization-ug-badge` of `README.md`.

---

# `docs/user_guide/docs/`

**When the English `.md` files are updated,** do not update the corresponding file in other languages.

**Rationale:**

- Localization is handled externally through [Crowdin](https://crowdin.com/project/the-combine)
- Manual translations in the User Guide will be overwritten during the next Crowdin sync

---

# Paragraph line breaks

**Do not hard-wrap paragraphs at a fixed column.** Prose is written one sentence per line (sentences are not wrapped,
regardless of length). These files are excepted from the `[*.md]` `max_line_length` rule in
[`.editorconfig`](../../.editorconfig).

**Rationale:**

- Fixed-column wrapping does not line up with Crowdin's sentence/segment boundaries, which breaks importing translations
  obtained outside Crowdin

**To reformat existing files,** run [`scripts/rewrap_docs_by_sentence.py`](../../scripts/rewrap_docs_by_sentence.py): it
unwraps paragraphs and breaks them into one sentence per line, preserving headings, images, admonitions, lists, and
code/`<pre>` blocks. It also warns when a translation's per-section line count diverges from the English source
(`--check` compares without modifying files).
