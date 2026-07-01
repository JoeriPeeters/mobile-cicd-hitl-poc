---
status: implemented
figma: https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=5-29
---

# Attractions screen

> Status: implemented
> Related issue: #5 (amusement-park theme + bottom tab navigation)

## Problem

The Attractions tab needs to exist so tab switching is demonstrable, but its real
content (every ride, show, and snack stand) isn't built yet. It should read as an
intentional, on-theme placeholder — not a broken screen.

## Design

- **Figma:** [Screens → Attractions](https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=5-29)
- **Reuses:** `TopBar`, `TabBar`. Centered placeholder content uses `Color` text
  tokens; no card/hero here.
- **New components/tokens:** none

## Goals

- A centered, themed placeholder: big emoji, title, one line of copy.
- Reachable by tapping the **Attractions** tab; the tab bar shows it selected.

## Non-goals

- No attractions list, filtering, or detail views yet — that's a future spec.

## Behavior

- **TopBar** (shared) at the top.
- **Centered content** (vertically and horizontally): carousel emoji `🎠`, a
  yellow `Attractions` title, and the muted line
  `Every ride, show, and snack stand — coming soon to this tab.`.
- **TabBar** with **Attractions active** (yellow, bold); Home and About dimmed.

## Acceptance criteria

- [x] Matches the linked Figma frame (centered placeholder, colors, copy)
- [x] Tapping the Attractions tab shows this screen with the tab marked active
- [x] Built in `mobile/App.js` with plain RN primitives — no navigation library
- [x] `npm test` passes

## Open questions

- The real Attractions list is a future feature — design it in Figma and spec it
  as `specs/attractions-list.md` when ready.
