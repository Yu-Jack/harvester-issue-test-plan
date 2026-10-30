# harvester-issue-test-plan

Searchable collection of Harvester issue test plans. React + Vite, deployed to GitHub Pages.

## Add a test plan

Create `plans/<repo>-<issue>.md` with front matter:

```markdown
---
issue: 8436
repo: harvester/harvester
title: "[FEATURE] Resource Health Dashboard"
source: https://github.com/harvester/harvester/issues/8436#issuecomment-6514405862
---

## Pre-suite Test Setup
...
```

`npm run dev` / `npm run build` regenerate `src/plans.json` from `plans/*.md` automatically.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
```

## Publish

Settings → Pages → Source: **GitHub Actions**. Pushing to `main` runs `.github/workflows/deploy.yml`.
