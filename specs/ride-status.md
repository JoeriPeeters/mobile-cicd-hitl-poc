---
status: draft
figma: https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=48-16
---

# Ride status badge

> Status: draft
> Related issue: #<n> (once filed)

## Problem

Every ride currently looks equally available. Give each attraction a quick
**operational status** — **Open**, **Busy**, or **Closed** — shown as a small
colored badge on the Attractions cards and on the detail screen, so a visitor can
tell at a glance whether to head there now.

## Design

- **Figma:** [Screens → Attractions — Ride Status](https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=48-16)
  — the Attractions list with a status pill on each `AttractionCard` (Screaming
  Comet · Open, Cyclone Twister · Busy, Splash Canyon · Open). Apply the same badge
  on the detail screen.
- **Reuses:** the existing category-chip pattern (pill shape, `Radius.pill`,
  small bold label) and the card/detail layouts. Plain RN primitives only.
- **New tokens:** three status colors — `Open` green, `Busy` amber, `Closed` red.
  Introduced as small additions (extra review surface); see Behavior for values.

## Goals

- Add a `status` field to each ride in `ATTRACTIONS` (`"Open" | "Busy" | "Closed"`).
- Render a **status badge** — a small colored pill with a leading dot and the
  status word — on each `AttractionCard`, next to the category chip.
- Show the same status badge on the **attraction detail** screen (near the category
  chip / stats).
- Status is a hardcoded data field (no live data source).

## Non-goals

- No real-time / fetched wait times or live status — it's a static field.
- No filtering or sorting by status (a later spec could add "hide closed").
- No navigation library or native-heavy deps; no new screens.

## Behavior

Add `status` to each ride and map it to a color + dot:

| status | color | hex | meaning |
| --- | --- | --- | --- |
| Open | green | `#34d399` | running normally |
| Busy | amber | `#f59e0b` | long queue |
| Closed | red | `#ef4444` | not operating today |

- **`StatusBadge`** — a pill: colored dot `●` + the status word, on a tinted
  background (the status color at low opacity) or a solid colored pill with white
  text, matching the category-chip treatment already in `mobile/App.js`.
- **On `AttractionCard`** — the badge sits in the card's text column, next to the
  category chip (same row or just below).
- **On the detail screen** — the badge appears near the category chip / stats card.

Suggested seed values: Screaming Comet = Open, Cyclone Twister = Busy, Splash
Canyon = Open, Grand Carousel = Open, Skyline Wheel = Closed, Haunted Mine = Busy.

## Acceptance criteria

- [ ] Matches the linked Figma frame (badge placement, colors, copy).
- [ ] Each `ATTRACTIONS` entry has a `status` of `Open`, `Busy`, or `Closed`.
- [ ] `AttractionCard` shows the status badge next to the category chip.
- [ ] The attraction detail screen shows the same status badge.
- [ ] Status colors use the mapping above via a shared lookup (no per-card literals).
- [ ] Built in `mobile/App.js` with plain RN primitives — no navigation library or
      native-heavy deps added.
- [ ] **`visual/app.spec.js`** asserts a visible status on the Attractions tab (e.g.
      an `Open` badge) and **captures that screen as `ride-status-*.png`** — so the
      visual test and the design-fidelity agent compare it to the Figma frame
      (`screenKeyForSpec` maps `ride-status.md` → `ride-status-*.png`).
- [ ] `npm test` passes.

## Open questions

- **Badge style:** solid colored pill with white text (like the category chip) vs.
  tinted background + colored text + dot. Baseline: match the category chip (solid).
- **Detail placement:** next to the category chip vs. on the hero. Baseline: next to
  the category chip.
