---
status: draft
figma: https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=17-62
---

# Attractions list

> Status: draft
> Related issue: #<n> (once filed)

## Problem

The Attractions tab is currently a "coming soon" placeholder
([`specs/attractions-screen.md`](attractions-screen.md)). Replace it with a real,
browsable **list of the park's rides** — each with a themed thumbnail, name,
category, and a quick stat — plus category **filter chips** so a visitor can narrow
the list.

## Design

- **Figma:** [Screens → Attractions List](https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=17-62)
- **Reuses:** `TopBar`, `TabBar` (Attractions active). New **`AttractionCard`**
  component: rounded thumbnail (category color + emoji) + name + category **chip** +
  a stat/thrill line.
- **New tokens:** `color/cat/water` (`#37b6f6`), `color/cat/family` (`#34d399`).
  Existing `brand/magenta` = Thrill, `brand/purple` = Dark ride.
- **Imagery note:** the Figma thumbnails use a per-ride **gradient**. The baseline
  implementation uses a **solid per-category color** block behind the emoji (no new
  dependency). The gradient is an accepted visual simplification — see Open
  questions. (The fidelity agent may flag the gradient→solid delta; that's expected
  and pre-approved here.)

## Goals

- Replace the Attractions placeholder in `mobile/App.js` with a scrollable list of
  the 6 attractions below.
- A header ("Attractions" + "N rides & attractions") and a row of filter chips:
  **All · Thrill · Water · Family**. `All` is active by default.
- **Tapping a chip filters the list** to that category (local component state);
  the active chip is visually highlighted.
- The bottom tab bar shows **Attractions** active while on this screen.

## Non-goals

- No ride **detail** screen (tapping a card does nothing yet) — a later spec.
- No search, sorting, favourites, or data fetching — the list is a hardcoded
  constant.
- No navigation library; filtering is plain local state.

## Behavior

Top to bottom, on the app background:

1. **TopBar** (shared).
2. **Header** — "Attractions" (yellow) + subtitle "6 rides & attractions".
3. **Filter chips** — `All` (active) · `Thrill` · `Water` · `Family`. Active chip:
   yellow fill, dark text. Inactive: card fill, muted text. Tapping sets the active
   filter and shows only matching cards (`All` shows everything).
4. **Attraction cards** — one `AttractionCard` per ride: a 72×72 rounded thumbnail
   (category color + emoji), the name, a category chip (colored per category), and a
   stat line ending in a 5-dot thrill meter (`●` filled / `○` empty).

The rides:

| Emoji | Name | Category | Stat line |
| --- | --- | --- | --- |
| 🎢 | The Screaming Comet | Thrill | ⚡ 120 km/h · Thrill ●●●●● |
| 🌀 | Cyclone Twister | Thrill | 🔁 7 loops · Thrill ●●●●● |
| 💦 | Splash Canyon | Water | 💧 22 m drop · Thrill ●●●○○ |
| 🎠 | Grand Carousel | Family | 🎵 all ages · Thrill ●○○○○ |
| 🎡 | Skyline Wheel | Family | 🌇 85 m views · Thrill ●●○○○ |
| 👻 | Haunted Mine | Dark | 🕯️ indoor · Thrill ●●●○○ |

Category → color: Thrill `#f637ec`, Water `#37b6f6`, Family `#34d399`, Dark `#7b2ff7`.

## Acceptance criteria

- [ ] Matches the linked Figma frame (header, chips, cards, active tab), allowing
      the documented gradient→solid thumbnail simplification.
- [ ] The Attractions tab renders the list (not the old placeholder), with all 6
      rides above.
- [ ] Filter chips work: `All` default; tapping a category filters the list via
      local state; the active chip is highlighted.
- [ ] `AttractionCard` shows thumbnail (category color + emoji) + name + category
      chip + stat/thrill line.
- [ ] Bottom tab bar shows Attractions active on this screen.
- [ ] Built in `mobile/App.js` with plain RN primitives — no navigation library or
      native-heavy deps added.
- [ ] **`visual/app.spec.js` captures the Attractions screen** (taps the Attractions
      tab and screenshots it) as `attractions-*.png`, so the visual test — and the
      design-fidelity agent — can compare it to the Figma frame.
- [ ] `npm test` passes.

## Open questions

- **Gradient thumbnails:** the baseline uses solid per-category colors. Want exact
  gradient fidelity? That means adding `expo-linear-gradient` (Expo-official,
  web-safe) — flag if you want it; otherwise we keep the no-dependency solid color.
- **Ride count in subtitle:** hardcoded "6 rides & attractions" — derive it from the
  list length so it stays correct if the list changes.
