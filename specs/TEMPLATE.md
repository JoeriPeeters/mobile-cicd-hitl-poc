---
# status: draft | agreed | implemented
status: draft
# For a UI feature: deep link to the exact Figma frame (right-click frame →
# "Copy link to selection"). Omit for non-UI work.
figma:
---

# <Feature name>

> Status: draft | agreed | implemented
> Related issue: #<n> (once filed)

## Problem

<!-- What need or gap does this address? Who is it for? -->

## Design

<!-- For UI: link the Figma frame(s) and name the design-system components/tokens
     it reuses (Hero, Card, Button, TabBar, TopBar; Color/Radius/Spacing variables).
     Call out anything NEW the design introduces (a new component or token), since
     that's extra review surface. -->

- **Figma:** <frame link — also set in `figma:` frontmatter>
- **Reuses:**
- **New components/tokens:** none

## Goals

<!-- Bullet the outcomes that must be true when this is done. -->

-

## Non-goals

<!-- Explicitly out of scope, so the agent doesn't over-build. -->

-

## Behavior

<!-- Describe the screen/feature concretely: layout top-to-bottom, content,
     interactions, states. Examples are gold. -->

## Acceptance criteria

<!-- The checklist the human reviewer verifies the PR against, alongside the Figma
     frame and the visual-test screenshot. -->

- [ ] Matches the linked Figma frame (layout, colors, copy)
- [ ] Built in `mobile/App.js` with plain RN primitives — no navigation library or
      native-heavy deps added
- [ ] `visual/app.spec.js` updated if its text assertions changed
- [ ] `npm test` passes
- [ ] The visual-test job's screenshot on the PR matches the Figma frame

## Open questions

<!-- Anything undecided. The agent should call these out rather than guess. -->

-
