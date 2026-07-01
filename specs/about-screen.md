---
status: implemented
figma: https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=6-40
---

# About screen

> Status: implemented
> Related issue: #5 (amusement-park theme + bottom tab navigation)

## Problem

The About Us tab tells the park's story and gives the practical details a visitor
needs — hours, location, contact — in the same playful theme as the rest of the app.

## Design

- **Figma:** [Screens → About](https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=6-40)
- **Reuses:** `TopBar`, `Hero`, `Card`, `TabBar`. Section titles use the yellow
  accent token; card bodies use the muted text token.
- **New components/tokens:** none (the hours rows are a card-internal layout, not a
  new component)

## Goals

- A scrollable About screen with a hero and four labelled sections.
- Reachable via the **About Us** tab; the tab bar shows it selected.

## Non-goals

- No map, dialer, or mail integration — location and contact are display-only.

## Behavior

Top to bottom:

1. **TopBar** (shared).
2. **Hero** — `ℹ️`, `About Us`, tagline `Spinning smiles since 1974`.
3. **Our Story** — section title + card with the park's origin-story paragraph.
4. **Park Hours** — section title + card with rows (day range left, hours right in
   yellow):
   | Days | Hours |
   | --- | --- |
   | Mon – Thu | 10:00 – 20:00 |
   | Fri – Sat | 10:00 – 23:00 |
   | Sunday | 10:00 – 21:00 |
5. **Find Us** — section title + card: `📍`, `Thunderloop Park`,
   `1 Coaster Way, Thrillsville, CA 90210`.
6. **Get in Touch** — section title + card: `✉️`, `hello@thunderloop.park`,
   `+1 (555) 843-7767`.
7. **TabBar** with **About Us active**.

## Acceptance criteria

- [x] Matches the linked Figma frame (sections, order, colors, copy)
- [x] Content scrolls; all four sections render below the hero
- [x] Tapping the About Us tab shows this screen with the tab marked active
- [x] Built in `mobile/App.js` with plain RN primitives — no navigation library
- [x] `npm test` passes
