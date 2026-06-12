# Release Testing Procedure

## Purpose

- Broad manual smoke/regression test for any deployment of a new release of _The Combine_.
- Covers core functionality across all deployment targets.
- Not a substitute for automated tests or for testing release-specific changes.

## General Information and Assumptions

- The deployment itself is already verified: no pod/deployment/job errors, db migrations applied.
  - See [How To Deploy _The Combine_](./README.md).
- Only a browser is needed; no WireGuard or cluster access.
- You have (or will create in step 2) two user accounts, at least one a site admin.
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

### 1. Load the login page

- Open the site; confirm the login page loads without error.
  - This confirms the frontend, backend, and database are all running and communicating.
- 🟧 Confirm the Turnstile (captcha) widget loads.

### 2. Sign up

- 🔵 Always do this step.
- 🟧 Skip if you already have 2 users, unless a sign-up code change is being tested.
- 🟧 If signing up, use a valid email you control, e.g. `<last>_<first>+combine@sil.org`.
- Create a user via the sign-up form; confirm you land in the app.

### 3. Log in

- Log out (if signed up in step 2), then log in.
  - This confirms authentication end-to-end.
- 🟧 Confirms Turnstile verification passes on login.

### 4. Password reset — 🟧 Online only

- From the login page, request a password reset.
- Open the email, follow the link, set a new password, log in.
  - This confirms the email service.
- Alternates that also test the email service: email verify, project invite (step 11).

### 5. Create projects

- 🟥 Include "test" in project names to distinguish them from real projects.
- Create one project with LIFT import:
  - Test LIFT files (zipped): [`Backend.Tests/Assets/`](../../Backend.Tests/Assets/), e.g. `Lotud.zip`, `Natqgu.zip`,
    `Sena.zip`.
  - Confirm imported entries appear.
- Create one project without LIFT:
  - Use an RTL vernacular, e.g. Arabic `ar` or Hebrew `he`.

### 6. Project settings

- Open project settings; click through the tabs.
- Change the semantic domain language; confirm the domain tree updates.
  - Include any language new in this release (e.g., Telugu in v3.0.0).
- Change the vernacular font if available; confirm it applies.

### 7. Data entry

- In the RTL project, enter several words across multiple semantic domains.
  - Paste from [Sample text](#sample-text) as needed.
- Confirm RTL text displays correctly and the vernacular font renders.
  - This confirms fonts are being served.
- Add a gloss and a note to at least one entry.

### 8. Review entries

- Open Data Cleanup > Review Entries.
- Edit a word; record and play audio; add a flag.
- Verify the changes were captured in the goal timeline history.

### 9. Merge duplicates

- Open Data Cleanup > Merge Duplicates (use the LIFT-imported project).
- Complete at least one merge and one defer.
- Verify the merge was captured in the goal timeline history.

### 10. Export and verify

- Export the LIFT-imported project; download the zip.
- Spot-check contents: entries present, audio files included.

### 11. Second user and project roles

- Add a second user to a project:
  - 🟧 Via email invite or username search.
  - 🔵 Via username search.
- Change the user's role; verify permissions match (e.g., Harvester sees only Data Entry).

### 12. User interface localization

- In user settings, switch the UI language; confirm the UI updates.
  - Include any UI language new in this release.
- Test RTL UI: set browser language to Arabic, set user setting to detect browser, refresh.
  - Confirm layout mirrors (menus, navigation, dialogs).

### 13. User Guide

- Open the User Guide from the app.
- Switch the guide to a non-English language; confirm pages render.

### 14. Site admin checks

- Log in as a site admin; confirm Site Settings loads.
- Add a banner; confirm it displays for users.
- Remove test banners when done.
- 🟥 Release announcement banners are managed separately (see release plan).

### 15. Analytics — 🟧 Online only

- In Honeycomb, verify analytics are coming in from this deployment.
