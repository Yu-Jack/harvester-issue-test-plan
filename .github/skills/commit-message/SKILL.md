---
name: commit-message
description: Commit message convention for this repo. Use whenever creating or amending a commit that adds or changes a test plan under plans/ or its images.
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
