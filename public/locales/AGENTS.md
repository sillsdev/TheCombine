# New strings

**Do not translate any strings** added to `public/locales/en/translation.json`.

**Rationale:**

- Localization is handled externally through [Crowdin](https://crowdin.com/project/the-combine)
- Manual translations in the codebase will be overwritten during the next Crowdin sync

# Deleted strings

**If a string in `public/locales/en/translation.json` is deleted**:

- Make sure it is no longer used anywhere in `src/`
- Delete the corresponding string from the other languages
