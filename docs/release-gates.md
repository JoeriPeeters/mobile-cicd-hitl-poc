# Release gates & mock strategy

This POC proves the **shape** of a HITL CI/CD pipeline for a React Native app
without any real-store side effects. Two kinds of gates:

## The gates

| Gate | Where | Real or mocked | Who acts |
| --- | --- | --- | --- |
| **Code merge** | branch protection on `main` | real | human reviewer (code owner) |
| **Release approval** | `production` environment on the `submit` job | real | required reviewer |
| **Store review** | Apple / Google | **mocked** (`store-review-sim.yml`) | external (simulated) |

The first two are *your* gates and are real. The third is external and async, so
it's simulated.

## What's mocked and why

- **Native build** — mocked. No signing/credentials/macOS runner needed for a
  feasibility test. The step is a clean seam: swap it for `fastlane gym` /
  `./gradlew bundleRelease` / `eas build`.
- **Store submit** — mocked. No real submission (irreversible + reviewed). Swap
  for `fastlane deliver`/`supply` or `eas submit`.
- **Store verdict** — simulated via a manual workflow, so we can exercise the
  `submit → wait → react` lifecycle and the rejection loop.

## What this proves vs. defers

**Proves:** pipeline flow, gate placement, the human release-approval gate, and
the async submit-then-react lifecycle (incl. rejection handling).

**Defers to a real pilot:** signing/credential setup, real store API quirks and
quotas, actual review latency, and real rejection categories.

## Making it real later

Each mock step names its real replacement. Add signing (fastlane match / EAS
credentials), switch the iOS build to a `macos-latest` runner, and replace the
mock submit with the real `fastlane` / `eas submit` call. Add store webhooks /
API polling to replace the manual verdict simulation. Keep the human
release-approval gate — it's the containment for the one action you can't undo.
