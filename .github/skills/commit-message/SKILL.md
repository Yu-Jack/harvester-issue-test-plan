---
name: commit-message
description: Commit message convention for this repo. Use whenever creating or amending any commit: plan prefix for test plans, Co-authored-by trailer for Copilot, and DCO sign-off.
---

# Commit message convention

Commits that touch a test plan (`plans/harvester-<issue>.md` and `public/images/harvester-<issue>/`) use this prefix:

```
plan(harvester-<issue>): <lowercase summary>
```

Example: `plan(harvester-8436): add test case 5 (ignore) and compress images`

- `<issue>` is the harvester/harvester issue number, with the `harvester-` prefix (same as the plan file name).
- Commits that only change the site (`src/`, `scripts/`, config) do not use this prefix.
- Always sign off with `git commit -s`.

## Co-author

Every commit made with Copilot's help carries a `Co-authored-by` trailer, placed before `Signed-off-by`:

```bash
git commit -s -m "<subject>" -m "Co-authored-by: GitHub Copilot <copilot@github.com>"
```

Resulting message:

```
plan(harvester-8436): add test case 5

Co-authored-by: GitHub Copilot <copilot@github.com>
Signed-off-by: <name> <email>
```

Check with `git log -1 --format=%B` that both trailers are present and appear only once.
