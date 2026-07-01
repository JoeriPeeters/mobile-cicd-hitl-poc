---
# status: draft | agreed | implemented
status: draft
# Not a UI feature — no Figma frame of its own. This agent *reads* the figma:
# link from other specs to know what to compare against.
figma:
---

# Visual fidelity review agent

> Status: draft
> Related issue: #<n> (once filed)

## Problem

The design loop ([`docs/design-workflow.md`](../docs/design-workflow.md)) says the
**Figma frame is the visual rubric** and the **visual-test screenshot is the
evidence** — but today a human does that side-by-side comparison by hand at GATE 1.
That's tedious and easy to eyeball wrong: a shifted color, dropped copy, or missing
section slips through.

An **advisory** review agent should do the comparison first and post its findings on
the PR, so the human approver reviews a focused list of likely discrepancies instead
of squinting at two images. It never blocks — the human still decides.

## Design

This is a **pipeline control**, not app UI. It follows the same shape as the
`agentic-hitl-poc` OWASP security agent: a read-only advisory agent that posts
findings on the PR and cannot change code.

- **Reuses:** the screenshot from `visual.yml`; the `figma:` link already carried in
  each UI spec's frontmatter; the `ANTHROPIC_API_KEY` secret already used by the
  `claude*` workflows.
- **New:** a workflow (e.g. `.github/workflows/visual-fidelity.yml`) and a
  `FIGMA_TOKEN` repo secret (a Figma personal access token with read scope).
- This spec **explicitly authorizes adding a workflow**, overriding the default
  "do not modify `.github/workflows/`" rule in `copilot-instructions.md`.

## Goals

- On a PR that implements a UI spec, automatically compare the built screen against
  its linked Figma frame and post an **advisory** findings comment.
- Comparison is **semantic** (a vision model reasoning about layout/color/copy/
  spacing/missing elements), robust to Expo-web-vs-native rendering differences.
- The agent has a **read-only** blast radius: it may read repo + PR and post/update a
  comment; it must not push commits or edit files.

## Non-goals

- **Not a blocking gate.** It does not create a required status check and never
  fails the PR. The human at GATE 1 remains the decision-maker.
- **No pixel-diffing** as the primary signal — rendering differences between the web
  export and the design make raw pixel comparison too noisy to trust.
- No changes to how screenshots are produced (`visual.yml` is unchanged).
- No auto-fixing of discrepancies.

## Behavior

Trigger: on a pull request to `main`, after the visual screenshot is available
(e.g. `workflow_run` on `visual.yml` completing, or a job ordered after it).

Steps:

1. **Find the spec.** Determine which `specs/<feature>.md` the PR implements — from
   the PR body / linked issue text (`Implement specs/<feature>.md`). If none is
   found, post a short note ("no spec/Figma frame to compare — skipping") and exit
   successfully. *Fail-open:* a missing spec is a skip, not a failure.
2. **Resolve the frame.** Read the spec's `figma:` frontmatter → extract `fileKey`
   and `node-id`. If absent, skip as in step 1.
3. **Fetch the design.** Render the frame to PNG via the Figma REST API using
   `FIGMA_TOKEN`:
   `GET https://api.figma.com/v1/images/:fileKey?ids=:nodeId&format=png`.
4. **Get the build.** Obtain the app screenshot produced by the visual test (its
   uploaded artifact / posted image).
5. **Compare.** Send both images **plus the spec's acceptance criteria** to a
   vision-capable model (Claude via `ANTHROPIC_API_KEY`) with an instruction to
   report discrepancies by category: **layout, color, copy/text, spacing, missing or
   extra elements**, and an overall fidelity read.
6. **Report.** Post (or update, idempotently) a single PR comment titled
   **"🎨 Design fidelity review"** containing: what matched, a categorized list of
   discrepancies (empty list = "looks faithful"), and an explicit
   *"Advisory — the human reviewer decides"* line.

Security / least privilege:

- Workflow permissions: `contents: read`, `pull-requests: write` — nothing more.
- Secrets (`FIGMA_TOKEN`, `ANTHROPIC_API_KEY`) are only exposed to this job; they
  are never echoed into logs or the PR comment.

Example comment shape:

```
🎨 Design fidelity review — advisory

Compared: specs/home-screen.md → Figma node 4-2  vs  visual-test screenshot

✅ Matches: hero, three coaster cards, CTA, tab bar with Home active
⚠️ Discrepancies
  • Color — CTA button reads slightly orange vs the design's #ffd93d yellow
  • Copy — card 2 shows "Cyclone" (design: "Cyclone Twister")
  • Spacing — gap above "Featured Coasters" looks tighter than the frame

Advisory only — the human reviewer decides at GATE 1.
```

## Acceptance criteria

- [ ] A workflow runs on PRs and, when the PR implements a UI spec, posts a
      **"🎨 Design fidelity review"** comment.
- [ ] The Figma frame is fetched from the spec's `figma:` link via the Figma REST
      API using a `FIGMA_TOKEN` secret (documented in `README.md` setup).
- [ ] Comparison is done by a vision model against the spec's acceptance criteria;
      the comment lists discrepancies by category (or states it looks faithful).
- [ ] The agent is **advisory**: no required check, never fails the PR, and makes no
      commits or file edits.
- [ ] Re-runs **update** the existing comment rather than posting duplicates.
- [ ] A PR with **no** spec/`figma:` link is skipped gracefully (fail-open), not
      errored.
- [ ] Workflow permissions are least-privilege (`contents: read`,
      `pull-requests: write`); secrets never appear in logs or comments.
- [ ] `docs/pipeline.md` step 3b and `docs/design-workflow.md` are updated to point
      at this agent as the automated visual-verify step.

## Open questions

- **Trigger mechanism:** `workflow_run` after `visual.yml` (decoupled) vs a job
  appended to `visual.yml` (simpler, shares the screenshot directly). Flag a
  preference; default to `workflow_run` to keep visual rendering and review separate.
- **Frame ↔ screenshot mapping:** the app screenshot may be a single composite while
  a spec links one frame. Start with whole-screen comparison; per-section mapping is
  a later refinement.
- **Risk routing:** should this (a CI control touching secrets) be labeled
  high-risk? The mobile repo doesn't yet have the `agentic-hitl-poc` risk-routing
  workflow — porting it is a separate increment.
