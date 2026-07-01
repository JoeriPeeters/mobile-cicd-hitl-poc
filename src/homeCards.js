// Content for the home-screen cards. Kept as plain data (separate from the RN
// view in App.js) so it stays unit-testable without a native/JSX toolchain —
// the native build itself is mocked in this feasibility POC.

/**
 * Cards shown on the app home screen, in display order. Each card is
 * `{ title, body }`. The "Release gates" card summarizes the human approval
 * gate that fronts the (mocked) store submit in this HITL CI/CD POC.
 */
const HOME_CARDS = [
  {
    title: "HITL CI/CD POC",
    body: "A React Native app that proves a human-in-the-loop release pipeline.",
  },
  {
    title: "Mocked build & submit",
    body:
      "The native build and the app-store submit are mocked seams — no real " +
      "release side effects.",
  },
  {
    title: "Release gates",
    body:
      "Every release passes a human approval gate before the (mocked) store " +
      "submit.",
  },
];

module.exports = { HOME_CARDS };
