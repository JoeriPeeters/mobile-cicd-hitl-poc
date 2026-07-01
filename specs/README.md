# Specs

The durable **what & why** for each piece of work, written (and agreed) before the
code. Specs are the source of truth for this repo's
[human-in-the-loop workflow](../docs/pipeline.md) and the artifact the coding agent
implements against.

```
🎨 Figma frame ──referenced by──▶ specs/<feature>.md ──"Implement this"──▶ issue (label: claude)
                                          │                                        │
                                          │                         🤖 agent implements in mobile/App.js
                                          │                                        ▼
                                          └────── 🧑 human reviews the PR *against this spec* ──▶ merge
```

## Why specs

- **Context for the agent.** A spec carries far more intent than an issue title and
  it persists after the issue closes. `.github/copilot-instructions.md` tells the
  agent to read the relevant spec before implementing.
- **A rubric for human review.** The reviewer checks the PR against the spec's
  acceptance criteria (and the linked Figma frame) instead of eyeballing a diff —
  this is what makes the GATE 1 human-in-the-loop review meaningful.

## Design-driven: every UI spec links Figma

UI specs reference the exact Figma frame in their frontmatter, so the agent and the
reviewer look at the same pixels:

```yaml
---
status: draft
figma: https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=4-2
---
```

The design system (components + tokens) and the current screens live in the
**[Thunderloop Park — App Design](https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design)**
Figma file. See [`../docs/design-workflow.md`](../docs/design-workflow.md) for the
full design → spec → agent → PR loop, including how to copy a frame link.

## How to use

1. Copy [`TEMPLATE.md`](TEMPLATE.md) to `specs/<feature>.md` and fill it in. For a
   UI feature, design the frame in Figma first and paste its link into `figma:`.
2. Open a PR with **just the spec** and get it reviewed/merged — agree the *what*
   before any code exists.
3. File an issue whose body is: **"Implement `specs/<feature>.md`."** Add the
   `claude` label to hand it to the coding agent.
4. Review the agent's PR against the spec's acceptance criteria and the Figma
   frame. Merge.

## Worked examples

The screens already in the app are documented as reference specs — new features are
built the same way:

- [`home-screen.md`](home-screen.md) — hero + featured coasters + CTA
- [`attractions-screen.md`](attractions-screen.md) — placeholder tab screen
- [`about-screen.md`](about-screen.md) — story, hours, contact

## Conventions

- One spec per feature, kebab-case filename: `specs/ticket-checkout.md`.
- Keep specs short and behavioral — *what* should be true, not *how* to code it.
- For UI, the **Figma frame is the visual truth**; the spec captures behavior,
  content, and acceptance criteria in words.
- A spec is "done" when it's merged; treat changes to it as a reviewed PR too.
- Respect the app constraints: build in the real Expo app (`mobile/App.js`), **no
  navigation library or native-heavy deps** (they break the `expo export
  --platform web` step the visual test relies on).
