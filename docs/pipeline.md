# Pipeline — HITL CI/CD for a React Native (Expo) app

The full flow this POC builds, end to end, with every **human-in-the-loop (HITL)
gate** marked. It has two halves: the **build side** (code → merge) and the
**release side** (release → store). Humans sit at the decisions that matter; AI
and automation do the work in between.

## Legend

| Symbol | Meaning |
| --- | --- |
| 🧑 | **Human-in-the-loop** — a person acts or approves here |
| 🤖 | **AI agent** — Claude (coding agent / advisory reviewer) |
| ⚙️ | **Automated** — CI / workflow, no human |
| 🍏 | **External** — Apple / Google, outside your control |
| 〔MOCK〕 | Mocked seam in this POC — swap for the real tool later |

## The pipeline

```
                          ┌──────────────────────────────────────────┐
                          │                BUILD SIDE                 │
                          └──────────────────────────────────────────┘

 🧑 1. Write an issue  ───────────────▶  (optional: label `claude` to hand to the agent)
        (define the task; optionally a spec)
                                                │
 🤖 2. Claude coding agent implements  ─────────┤   bot-authored branch + PR
        (reads issue/spec, edits code, runs tests)
                                                │
 ⚙️ 3. Automated checks on the PR               │
        ├─ CI: typecheck + unit tests           │
        └─ Visual test: Playwright renders the  │   screenshots posted INLINE on the PR
           real Expo app at mobile viewports    │
 🤖 3b. (optional) advisory agents              │   findings posted on the PR, not blocking
        ├─ Visual agent reviews screenshots     │
        └─ Risk routing → OWASP security agent  │   (high-risk changes only)
                                                │
 ══════════════════════════════════════════════╪══════════════════════════════
 🧑 4. GATE 1 — CODE REVIEW & APPROVAL          │   ← the human decides
        reviews diff + screenshots + findings   │      (branch protection: 1 code-owner
        approves (PR is bot-authored, so a      │       review + CI must pass)
        human can legitimately approve)         │      iterate with @claude if needed
 ══════════════════════════════════════════════╪══════════════════════════════
                                                │
 ⚙️ 5. Merge to main                            ▼   nothing reaches main without GATE 1


                          ┌──────────────────────────────────────────┐
                          │               RELEASE SIDE                │
                          └──────────────────────────────────────────┘

 🧑 6. Trigger a Release (version)  ─────────────▶
                                                │
 ⚙️ 7. Build  〔MOCK〕                            │   real: fastlane gym / eas build
        (+ signing, macOS runner for iOS)       │
                                                │
 ══════════════════════════════════════════════╪══════════════════════════════
 🧑 8. GATE 2 — RELEASE APPROVAL                │   ← the human authorizes the
        `production` environment, required      │      irreversible step. Nothing is
        reviewer approves before submit         │      submitted without this click.
 ══════════════════════════════════════════════╪══════════════════════════════
                                                │
 ⚙️ 9. Submit to stores  〔MOCK〕                 │   real: fastlane deliver/supply /
        → submission_id, status: PENDING        │   eas submit  (App Store Connect API /
                                                │   Google Play Developer API)
                                                │
 🍏 10. EXTERNAL GATE — Apple / Google review   │   async (hours–days); NOT your gate
        〔SIMULATED〕                            │   real: store webhooks / API polling
        ├─ approved ─────────────┐              │
        └─ rejected ─▶ 🧑 human rejection loop   │   opens a `store-rejection` issue:
                        (fix, re-release)        │   a person triages & resubmits
                                                ▼
 ⚙️/🧑 11. Release  〔MOCK〕                        real: phased / staged rollout —
        (approved path)                          the rollout % is your blast-radius dial;
                                                 a human monitors and advances or halts
```

## The gates at a glance

| # | Gate | Who | Enforced by | Real? |
| --- | --- | --- | --- | --- |
| 1 | **Code review & approval** | 🧑 human (code owner) | Branch protection on `main` (PR + 1 review + CI + visual) | ✅ real |
| 2 | **Release approval** | 🧑 human (required reviewer) | `production` GitHub Environment | ✅ real |
| — | **Store review** | 🍏 Apple / Google | the stores | 〔simulated〕 |
| 3 | **Rejection handling** | 🧑 human | `store-rejection` issue → re-release | ✅ real (on the sim) |

## Actors

| Actor | Does | In this POC |
| --- | --- | --- |
| 🧑 **Human** | writes issues, reviews code + screenshots, approves merges & releases, handles rejections | you |
| 🤖 **Coding agent** | implements issues, opens bot-authored PRs, iterates on `@claude` | Claude GitHub Action |
| 🤖 **Advisory agents** | review the diff / screenshots (visual, security) — advisory, not blocking | visual agent, OWASP agent (reference repo) |
| ⚙️ **Automation** | CI, visual render, release orchestration, routing | GitHub Actions |
| 🍏 **External** | app review verdict | Apple / Google (simulated here) |

## Real vs. mocked (feasibility POC)

**Real:** the whole HITL structure — both approval gates, CI, the Playwright
visual test on the real Expo app, agent-authored PRs, the async submit→wait→react
lifecycle, and the rejection loop.

**Mocked (clean seams, each names its real replacement):** the native build
(`fastlane gym` / `eas build`), the store submit (`fastlane deliver`/`supply` /
`eas submit`), and the store verdict (real: store webhooks / API polling).

## Why the gates sit where they do

Review intensity scales with **blast radius** (how much breaks if it's wrong, ×
how hard to undo):

- **Merge** is reviewable and revertible → one human gate, backed by CI + visual
  evidence.
- **Release submit** is the highest-blast-radius, least-reversible action (you
  can't un-ship; a rollback is a new submission + review) → its own dedicated
  human approval gate, and the blast radius is then contained by staged rollout,
  feature flags, and OTA updates.
