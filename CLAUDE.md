# CLAUDE.md

Repo conventions, the real-vs-mocked pipeline shape, commands, and the
definition of done live in **`.github/copilot-instructions.md`** — read that
first. This file is a pointer so both Claude Code and the Claude GitHub Action
pick up the same single source of truth.

## The one-line why

A **feasibility POC** for a human-in-the-loop (HITL) CI/CD pipeline for a React
Native (Expo) app. The **human release-approval gate is the point**; the native
build and app-store submission are deliberately **mocked** (clean seams with the
real `fastlane`/`eas` command in a comment). Optimize for a clear, reviewable
pipeline — not a real release.

## Key paths

- `mobile/` — the real Expo app (`mobile/App.js`). No native-heavy deps / no nav
  library: they break the `expo export --platform web` step the visual test uses.
- `.github/workflows/` — `ci.yml`, `visual.yml` (Playwright screenshot of the web
  export), `release.yml` (mocked build/submit behind a `production` approval
  gate), `store-review-sim.yml` (simulated store verdict).
- `docs/` — `pipeline.md` / `pipeline.drawio` (HITL gates mapped),
  `release-gates.md` (gate + mock strategy).

## Workflow

Features are driven as GitHub issues handed to the Claude coding agent (add the
`claude` label); it opens a PR behind branch protection, and a human reviews,
approves, and merges. Nothing reaches `main` without that human gate.
