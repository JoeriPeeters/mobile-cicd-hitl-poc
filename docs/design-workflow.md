# Design workflow — Figma → spec → agent → PR

This is the **front of the pipeline** ([`pipeline.md`](pipeline.md) step 1). Before
a coding agent writes any UI, the *what it should look like* is decided in **Figma**
and captured as a **spec**. Design is a human-in-the-loop step too: a person
designs and agrees the screen, then hands a precise, referenceable artifact to the
agent.

## Legend

| Symbol | Meaning |
| --- | --- |
| 🧑 | **Human-in-the-loop** — a person designs, writes, or approves here |
| 🎨 | **Figma** — the design source of truth |
| 🤖 | **AI agent** — Claude (coding agent) |
| ⚙️ | **Automated** — CI / workflow, no human |

## The loop

```
🎨 1. Design in Figma                    ← the design system + screens live here
      (build the screen from existing
       components + tokens)
                     │  a person designs & agrees the screen
                     ▼
🧑 2. Capture it as a spec               specs/<feature>.md, with a Figma node link
      (what & why + acceptance criteria;   in the frontmatter (`figma:`)
       link the exact frame)
                     │  reviewed & merged first — agree the *what* before code
                     ▼
🧑 3. File an issue: "Implement          add the `claude` label
      specs/<feature>.md"
                     │
                     ▼
🤖 4. Agent implements in mobile/App.js  bot-authored branch + PR
      (reads the spec, builds the UI,
       updates the visual spec, runs tests)
                     │
                     ▼
⚙️ 5. Automated checks                   CI (typecheck + tests) +
      ├─ Visual test screenshots the       Playwright renders the Expo web export
      │  real app on the PR
      └─ 🤖 Design fidelity agent          visual-fidelity.yml — a vision model
         compares that screenshot to the      compares screenshot vs Figma frame and
         spec's Figma frame (advisory)        posts a "🎨 Design fidelity review"
                     │                         comment; advisory, never blocks
      ══════════════════════════════════════════════════════════
🧑 6. GATE 1 — review the PR             ← the human decides
      read the design fidelity comment,      (branch protection: 1 review + CI)
      compare the visual-test screenshot
      against the Figma frame; check the
      spec's acceptance criteria
      ══════════════════════════════════════════════════════════
                     │
                     ▼
⚙️ 7. Merge → continues into pipeline.md (build side → release side)
```

The key move: **the Figma frame is the visual rubric and the visual-test
screenshot is the evidence.** The reviewer at GATE 1 puts them side by side —
and the **design fidelity agent** ([`specs/visual-fidelity-agent.md`](../specs/visual-fidelity-agent.md),
`.github/workflows/visual-fidelity.yml`) does that comparison first and posts a
focused, advisory list of likely discrepancies. It never blocks; the human decides.

## The Figma file

The design system and current screens live in one file:

**[Thunderloop Park — App Design](https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design)**

| Page | What's there |
| --- | --- |
| **Components** | `Hero`, `Card`, `Button`, `TabBar`, `TopBar` — bound to variables |
| **Screens** | `Home`, `Attractions`, `About` — assembled from the components |

Tokens live as **Figma variables**: `Color` (bg/brand/accent/text), `Radius`,
`Spacing`. These mirror the `StyleSheet` constants in `mobile/App.js` — change a
token in Figma and every component instance updates, which is what keeps new
feature designs on-brand.

## Referencing Figma from a spec

Every screen/UI spec carries a deep link to the exact frame in its frontmatter, so
the agent and the reviewer look at the same pixels:

```yaml
---
status: draft
figma: https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=4-2
---
```

To get a frame's link in Figma: right-click the frame → **Copy link to selection**
(or **Copy/Paste as → Copy link**). Paste it into the spec's `figma:` field.

## Designing the next feature (the repeatable part)

1. **Design 🎨.** In the Figma file, add a new frame on the *Screens* page and
   build it from the existing components (drag in `Card`, `Button`, etc.). Add new
   components/tokens only if the feature genuinely needs them.
2. **Spec 🧑.** Copy [`../specs/TEMPLATE.md`](../specs/TEMPLATE.md) to
   `specs/<feature>.md`, fill in the behavior + acceptance criteria, and paste the
   frame link into `figma:`. Open a PR with just the spec and get it merged.
3. **Hand off 🧑.** File an issue whose body is **"Implement `specs/<feature>.md`"**
   and add the `claude` label.
4. **Review 🧑.** At GATE 1, read the design fidelity agent's advisory comment,
   check the PR's visual-test screenshot against the Figma frame and the spec's
   acceptance criteria, then approve.

The existing screens are documented as worked examples — see
[`specs/home-screen.md`](../specs/home-screen.md),
[`specs/attractions-screen.md`](../specs/attractions-screen.md), and
[`specs/about-screen.md`](../specs/about-screen.md). New features are built the
**same way**.
