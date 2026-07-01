---
status: implemented
figma: https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=4-2
---

# Home screen

> Status: implemented
> Related issue: #5 (amusement-park theme + bottom tab navigation)

## Problem

The app's landing tab needs to sell the park in one glance: a bold, on-theme hero,
a few featured coasters, and a clear call to action to buy passes. This is the tab
that's active on launch.

## Design

- **Figma:** [Screens → Home](https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=4-2)
- **Reuses:** `TopBar`, `Hero`, `Card` (×3), `Button`, `TabBar` — see the
  [Components page](https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=0-1).
  Colors/radii/spacing come from the `Color` / `Radius` / `Spacing` variables.
- **New components/tokens:** none

## Goals

- A themed Home screen: top bar → hero → "Featured Coasters" → primary CTA.
- `Home` is the default active tab; the bottom tab bar shows it selected.

## Non-goals

- No real ticketing — the "Buy Day Passes" button is presentational.
- No data fetching — the coaster list is a hardcoded constant.
- No navigation library (tab switching is local component state).

## Behavior

Top to bottom, on the deep-purple app background:

1. **TopBar** — `🎢 Thunderloop Park` title with a `React Native (Expo) · v<version>`
   subtitle.
2. **Hero** — magenta card: coaster emoji, `Thunderloop Park`, tagline
   `Where the thrills never stop!`.
3. **Featured Coasters** — a yellow section title, then three cards:
   | Emoji | Name | Blurb |
   | --- | --- | --- |
   | 🎢 | The Screaming Comet | 0 to 120 km/h in 2.8s — hands up! |
   | 🌀 | Cyclone Twister | Seven inversions of pure chaos. |
   | 💦 | Splash Canyon | The wettest drop in the park. |
4. **Buy Day Passes** — yellow primary button (`🎟️  Buy Day Passes`).
5. **TabBar** — Home / Attractions / About Us; **Home active** (yellow, bold).

## Acceptance criteria

- [x] Matches the linked Figma frame (layout, colors, copy)
- [x] Hero, three coaster cards, and CTA render in order on the themed background
- [x] Bottom tab bar present with Home active by default
- [x] Built in `mobile/App.js` with plain RN primitives — no navigation library
- [x] `npm test` passes; visual spec assertions match the screen
