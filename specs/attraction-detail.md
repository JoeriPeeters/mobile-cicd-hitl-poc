---
status: draft
figma: https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=24-7
---

# Attraction detail

> Status: draft
> Related issue: #<n> (once filed)

## Problem

The Attractions tab is now a browsable, filterable list
([`specs/attractions-list.md`](attractions-list.md)), but tapping a card does
nothing — the list's own non-goal. Give each ride a **detail screen** that opens
when its card is tapped and shows that ride's data on its own, larger view, with a
way back to the list.

The screen is deliberately **minimal**: it reuses only the data the app already has
per ride (`emoji`, `name`, `category`, `stat`, `thrill`). No new ride fields — see
Non-goals and Open questions.

## Design

- **Figma:** [Screens → Attraction Detail](https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop-Park--App-Design?node-id=24-7)
- **Reuses:** `TopBar`, `TabBar` (Attractions active), the `Hero` block, and the
  existing `card` surface + `categoryChip` + 5-dot thrill meter already built for
  `AttractionCard`. All `Color`/`Radius`/`Spacing` values come from the existing
  `StyleSheet`.
- **New components/tokens:** none. The hero background is tinted with the ride's
  existing category color (`CATEGORY_COLOR[category]`), the same mapping the list
  thumbnail and chip already use.

## Goals

- Tapping an `AttractionCard` on the Attractions list opens the **detail screen for
  that ride**; a back affordance returns to the list.
- The detail shows, top to bottom: a **back link**, a **category-tinted hero** (big
  emoji + ride name + a short "<Category> ride" subtitle), a **category chip**, and
  a **stats card** with the ride's `stat` line and a **Thrill level** 5-dot meter.
- The bottom tab bar shows **Attractions** active while on the detail screen (it's a
  child of the Attractions tab, not a new tab).

## Non-goals

- **No navigation library.** The list ↔ detail transition is plain local state in
  `AttractionsScreen` (e.g. a `selected` ride) — the same constraint as every other
  screen, because it must survive `expo export --platform web`.
- **No new ride data.** Don't invent speed/height/duration/wait-time fields; show
  only `emoji`, `name`, `category`, `stat`, `thrill`. (Enriching the model is a
  possible later spec — see Open questions.)
- No image/gallery, no "get in line"/booking action, no favourites or sharing.

## Behavior

`AttractionsScreen` gains a `selected` state (the tapped ride, or `null`).

- **When `selected` is `null`** — render the list exactly as today (header, filter
  chips, cards).
- **Tapping a card** sets `selected` to that ride. Each `AttractionCard` becomes a
  `Pressable` (`accessibilityRole="button"`) whose `onPress` selects the ride.
- **When `selected` is set** — render the detail for that ride instead of the list:

  1. **Back link** — a `Pressable` reading `‹ Attractions` (yellow, `accent`), which
     sets `selected` back to `null` and returns to the list.
  2. **Hero** — the shared hero block, its background set to
     `CATEGORY_COLOR[ride.category]`, containing the ride `emoji` (large), the ride
     `name`, and a subtitle `"<Category> ride"` (e.g. "Thrill ride").
  3. **Category chip** — a pill filled with the category color, white text = the
     `category` (e.g. `THRILL`), matching the chip on the list card.
  4. **Stats card** — a `card`-surface block containing:
     - the ride's `stat` line, shown prominently (e.g. **⚡ 120 km/h**);
     - a **Thrill level** row: the label plus the 5-dot meter
       `●`×`thrill` + `○`×`(5 − thrill)`, filled dots in `accent` yellow.

The `TopBar` (shared) and the bottom `TabBar` (Attractions active) frame the screen
as on every other tab. Returning via the back link restores the list; whether the
previously active **filter chip** is preserved is an Open question (either is
acceptable).

### Reference rides

The Figma frame is drawn for **The Screaming Comet** (Thrill · `⚡ 120 km/h` ·
thrill 5 → `●●●●●`). The screen is data-driven, so every ride renders the same
layout with its own emoji, name, category color, stat, and dot count (e.g. Splash
Canyon → Water · `💧 22 m drop` · `●●●○○`).

## Acceptance criteria

- [ ] Matches the linked Figma frame (back link, category-tinted hero, chip, stats
      card, Attractions tab active).
- [ ] Tapping any `AttractionCard` opens that ride's detail; the back link returns
      to the list. Implemented with plain local state — **no navigation library or
      native-heavy deps added**.
- [ ] The detail is data-driven from the existing `ATTRACTIONS` fields; no new ride
      data fields are introduced.
- [ ] Hero background, chip, and thrill meter use the ride's `CATEGORY_COLOR` and the
      existing style tokens (no hardcoded one-off colors/radii/spacing).
- [ ] Bottom tab bar shows **Attractions** active on the detail screen.
- [ ] **`visual/app.spec.js` captures the detail screen** — on the Attractions tab it
      taps a card, asserts the detail (ride name + `Thrill level`), and screenshots it
      as **`attraction-detail-*.png`** so the visual test and the design-fidelity agent
      compare it to the Figma frame. It also taps the back link and re-asserts the list.
- [ ] `npm test` passes.

## Open questions

- **Filter persistence:** should returning from a detail restore the filter chip that
  was active, or reset to `All`? Baseline: reset to `All` (simplest). Flag if you want
  it preserved.
- **Enriched detail (future):** if the minimal screen feels sparse in the running app,
  a follow-up spec can extend `ATTRACTIONS` with a description + a stats grid
  (speed/height/duration/min-height) + a CTA. Out of scope here.
