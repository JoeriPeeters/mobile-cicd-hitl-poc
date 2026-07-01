# Copilot / agent instructions

## What this repo is

A **feasibility POC** for a human-in-the-loop (HITL) CI/CD pipeline for a React
Native app. The pipeline shape and the human gates are the point — the native
**build and the app-store submission are deliberately mocked** so the POC has no
real-world side effects. Optimize for a clear, reviewable pipeline, not for a
real release.

## Layout

- `mobile/App.js` — the real Expo app (the UI you build features into).
- `src/` — a tiny testable JS module (real, so CI does real work).
- `visual/app.spec.js` — Playwright visual test against the Expo web export.
- `specs/` — the durable "what & why" per feature; read the relevant spec first.
- `.github/workflows/` — CI + the release pipeline (see below).
- `docs/release-gates.md` — the HITL gates and the mock strategy.
- `docs/design-workflow.md` — the Figma → spec → agent → PR loop.

## Specs & design

Features are **spec-driven**. When an issue says "Implement `specs/<feature>.md`":

1. **Read that spec first** — it's the source of truth for behavior and acceptance
   criteria, and it carries a `figma:` link to the exact design frame.
2. Build the UI in `mobile/App.js` to match the linked Figma frame and the spec.
   Reuse the existing look (the `Color`/`Radius`/`Spacing` values already in the
   `StyleSheet`); introduce new patterns only if the spec calls for them.
3. **No navigation library or native-heavy deps** — they break the
   `expo export --platform web` step the visual test relies on. Use plain RN
   primitives (View/Text/Pressable/StyleSheet) + local state.
4. Update `visual/app.spec.js` if its text assertions no longer match the screen.

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
