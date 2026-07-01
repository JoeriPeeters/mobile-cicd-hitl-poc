# mobile-cicd-hitl-poc

A **feasibility POC** for a human-in-the-loop (HITL) CI/CD pipeline for a React
Native app. It proves the **pipeline shape and the human gates** — the native
build and the app-store submission are **mocked** (clean seams to fill in later),
so the POC has zero real-world side effects.

```
PR ─▶ CI (npm test)  ─▶ 🧑 code review + merge        ← real HITL gate
                                                       │
                        Release (manual)               │
                          build (mock)                 │
                            └─▶ 🧑 release approval     ← real HITL gate (production env)
                                  └─▶ submit (mock) ─▶ "pending review"
                                                       │
                        🍏🤖 store review = EXTERNAL + ASYNC
                          simulate via a manual workflow
                            ├─ approved ─▶ release (mock staged rollout)
                            └─ rejected ─▶ 🧑 human rejection loop (issue)
```

## What's real vs mocked

| | Real | Mocked |
| --- | --- | --- |
| CI (`npm test`) | ✅ | |
| Code-merge gate (branch protection) | ✅ | |
| Release-approval gate (`production` env) | ✅ | |
| Native build | | ✅ seam → `fastlane gym` / `eas build` |
| Store submit | | ✅ seam → `fastlane deliver`/`supply` / `eas submit` |
| Store verdict | | ✅ simulated workflow |

See [`docs/release-gates.md`](docs/release-gates.md) for the full rationale.

## Where to start

Pick the door for what you're here to do:

| I want to… | Start here |
| --- | --- |
| Understand the whole gated flow | [`docs/pipeline.md`](docs/pipeline.md) |
| **Build a UI feature** | [`docs/design-workflow.md`](docs/design-workflow.md) — design → spec → agent → PR |
| Write/read a feature's spec | [`specs/`](specs/) (start from [`specs/TEMPLATE.md`](specs/TEMPLATE.md)) |
| Run a release end to end | [Try the flow](#try-the-flow) below |
| Act as the coding agent | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) |

**Build a feature (the common path).** UI work is design-driven: design a frame in
the [Thunderloop Park — App Design](https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design)
Figma file, capture it as `specs/<feature>.md` (link the frame in `figma:`), open a
PR with just the spec, then file a `claude`-labelled issue "Implement
`specs/<feature>.md`". The agent builds it in `mobile/App.js`; you review the PR —
comparing the visual-test screenshot to the Figma frame — and merge. Full loop:
[`docs/design-workflow.md`](docs/design-workflow.md). Worked examples:
[`specs/home-screen.md`](specs/home-screen.md) and its siblings.

**Day one, hands on.** `npm install` → `npm test`, then open a trivial PR to watch
CI and the visual screenshot run.

## Try the flow

1. **CI** — open a PR; `CI / test` runs and must pass. Branch protection requires
   your approval before merge.
2. **Release** — Actions → **Release** → Run workflow → set a `version` (e.g.
   `1.2.0`). The `build` job runs (tests + mock build), then the `submit` job
   **pauses at the `production` approval gate**. Approve it → mock submit prints
   a `submission_id` and "PENDING review".
3. **Store verdict** — Actions → **Store review (simulated)** → Run workflow with
   that `submission_id` and `verdict = approved` or `rejected`.
   - `approved` → mock release / staged-rollout note.
   - `rejected` → opens a `store-rejection` issue (the human loop).

## Setup notes

- **Branch protection** on `main` (PR + approving review + `test` check) enforces
  the code-merge gate.
- The **`production` environment** must have a **required reviewer** for the
  release-approval gate to actually pause. (Settings → Environments → production.)

## Next increments

- Swap a mock for a real build/submit (fastlane or EAS) behind the same gate.
- Add **risk-based routing** and agent-assisted review (ported from the
  `agentic-hitl-poc` reference).
- Extend the **design flow** (already seeded — see
  [`docs/design-workflow.md`](docs/design-workflow.md)): add Figma **Code Connect**
  mappings and an automated visual-verify step that diffs the PR screenshot against
  the linked Figma frame.
