# Release Testing Procedure

## Purpose

A broad manual smoke/regression test to run on any deployment of a new release of _The Combine_.

- Covers core functionality across all deployment targets.
- Not a substitute for automated tests or for testing release-specific changes.

## General Information and Assumptions

Assumptions and notes that apply throughout:

- The deployment itself is already verified: no pod/deployment/job errors, db migrations applied.
  - See [How To Deploy _The Combine_](./README.md).
- Only a browser is needed; no WireGuard or cluster access.
- You have (or will create in step 2A) two user accounts, at least one a site admin.
- 🟨 `master` is auto-deployed to QA, so fixes can be retested shortly after merge.

### Flags

Steps and sub-steps are tagged with the narrowest applicable flags. Untagged items apply to all deployments.

| Flag                | Applies to                                          |
| ------------------- | --------------------------------------------------- |
| 🟧 `[ONLINE]`       | Both online deployments (QA and Prod)               |
| &emsp;🟥 `[PROD]`   | &emsp;<https://thecombine.app> only                 |
| &emsp;🟨 `[QA]`     | &emsp;<https://qa.thecombine.app> only              |
| 🔵 `[OFFLINE]`      | Both offline deployments (Laptop and NUC)           |
| &emsp;🟢 `[LAPTOP]` | &emsp;Laptop install (Ubuntu installer script) only |
| &emsp;🟣 `[NUC]`    | &emsp;NUC install only                              |

### Sample text

Paste these for font and RTL testing as needed.

| Script       | Text          |
| ------------ | ------------- |
| Arabic (RTL) | مرحبا بالعالم |
| Hebrew (RTL) | שלום עולם     |
| Telugu       | నమస్కారం      |
| Thai         | สวัสดีชาวโลก  |
| Korean       | 안녕하세요    |

## Testing Steps

### 1. Load the login/signup page

Open the site and confirm the page loads without error.

- This confirms the frontend, backend, and database are all running and communicating.
- 🟧 Confirms the Turnstile (captcha) widget loads.

| Flag | Login                                | Sign-up                               |
| ---- | ------------------------------------ | ------------------------------------- |
| 🟥   | <https://thecombine.app/login>       | <https://thecombine.app/signup>       |
| 🟨   | <https://qa.thecombine.app/login>    | <https://qa.thecombine.app/signup>    |
| 🟢   | <https://local.thecombine.app/login> | <https://local.thecombine.app/signup> |
| 🟣1  | <https://nuc1.thecombine.app/login>  | <https://nuc1.thecombine.app/signup>  |
| 🟣2  | <https://nuc2.thecombine.app/login>  | <https://nuc2.thecombine.app/signup>  |
| 🟣3  | <https://nuc3.thecombine.app/login>  | <https://nuc3.thecombine.app/signup>  |

### 2A. Sign up

Create a user via the sign-up form and confirm you land in the app.

- 🟧 Skip if you already have 2 users, unless a sign-up code change is being tested.
- 🟧 If signing up, use a valid email you control, e.g. `<last>_<first>+combine@sil.org`.

### 2B. Log in

Log in.

- Skip if you were logged in via [signup](#2a-sign-up).
- This confirms authentication end-to-end.

### 3. Password reset — 🟧 Online only

From the login page, request a password reset; open the email, follow the link, set a new password, and log in.

- This confirms the email service.
- Alternates that also test the email service: email verify, project invite (step 10).

### 4. Create projects

Create two projects: one with LIFT import and one without.

- 🟥 Include "test" in project names to distinguish them from real projects.
- With LIFT import:
  - Test LIFT files (zipped): [`Backend.Tests/Assets/`](../../Backend.Tests/Assets/), e.g. `Lotud.zip`, `Natqgu.zip`,
    `Sena.zip`.
  - Confirm imported entries appear.
- Without LIFT: use an RTL vernacular, e.g. Arabic `ar` or Hebrew `he`.

### 5. Project settings

Open project settings and click through the tabs.

- Change the semantic domain language; confirm the domain tree updates.
  - Include any language new in this release (e.g., Telugu in v3.0.0).
- Change the vernacular font if available; confirm it applies.

### 6. Data entry

Enter several words across multiple semantic domains.

- Paste from [Sample text](#sample-text) as needed to test LTR and RTL non-Latin scripts.
- Confirm RTL text displays correctly and the vernacular font renders.
  - This confirms fonts are being served.
- Add a gloss and a note to at least one entry.
- On one entry, add a recording before submitting it and another after submitting it.

### 7. Review entries

Open Data Cleanup > Review Entries and make edits.

- Edit a word; record and play audio; add a flag.
- Verify the changes were captured in Data Cleanup under "You've completed:".

### 8. Merge duplicates

Open Data Cleanup > Merge Duplicates in the LIFT-imported project.

- Complete at least one merge and one defer.
- Verify the changes were captured in Data Cleanup under "You've completed:".

### 9. Export and verify

Export the LIFT-imported project and spot-check the zip contents:

- entries present in the `.lift` file;
- audio files included.

### 10. Second user and project roles

Add a second user to a project.

- 🟧 Via email invite or username search.
- 🔵 Via username search.
- Change the user's role; verify permissions match (e.g., Harvester sees only Data Entry).

### 11. User interface localization

In user settings, switch the UI language and confirm the UI updates.

- Include any UI language new in this release.
- Test RTL UI: set browser language to Arabic, set user setting to detect browser, refresh.
  - Confirm layout mirrors (menus, navigation, dialogs).

### 12. User Guide

Open the User Guide from the app.

- Switch the guide to a non-English language; confirm pages render.

### 13. Site admin checks

Log in as a site admin and confirm Site Settings loads.

- Add a banner; confirm it displays for users.
- Remove test banners when done.
- 🟥 Release announcement banners are managed separately (see release plan).
