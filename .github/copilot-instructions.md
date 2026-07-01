# Copilot / agent instructions

## What this repo is

A **feasibility POC** for a human-in-the-loop (HITL) CI/CD pipeline for a React
Native app. The pipeline shape and the human gates are the point — the native
**build and the app-store submission are deliberately mocked** so the POC has no
real-world side effects. Optimize for a clear, reviewable pipeline, not for a
real release.

## Layout

- `src/` — a tiny testable JS module (real, so CI does real work).
- `App.js` — a skeleton RN entry point (illustrative; not built here).
- `.github/workflows/` — CI + the release pipeline (see below).
- `docs/release-gates.md` — the HITL gates and the mock strategy.

## Pipeline (what's real vs mocked)

- **CI** (`ci.yml`) — real: `npm install` + `npm test` on every PR.
- **Release** (`release.yml`) — build and store-submit are **mocked**, behind a
  `production` environment **approval gate** (a human must approve before submit).
- **Store review** (`store-review-sim.yml`) — manually simulates Apple/Google's
  async approve/reject verdict.

The build/submit steps are clean **seams**: each mock step has a comment showing
the real `fastlane` / `eas` command that replaces it.

## Commands

```bash
npm install
npm test      # jest
```

## Definition of done

1. `npm test` passes and new behavior is covered by tests.
2. Changes are small and single-purpose.
3. Public functions have a short doc comment.

## Do not

- Do not turn the mocked build/submit steps into real store submissions.
- Do not modify `.github/workflows/` or the release gates unless the task
  explicitly asks — these are the controls of the pipeline.
