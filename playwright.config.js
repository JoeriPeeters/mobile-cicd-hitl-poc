const { defineConfig, devices } = require("@playwright/test");

// Visual test config. Serves the web render (the Expo-web seam) and screenshots
// it at two mobile device viewports. Swap the webServer command for the Expo
// web export once the Nx+Expo app exists — the specs stay the same.
module.exports = defineConfig({
  testDir: "./visual",
  outputDir: "./playwright-out",
  webServer: {
    // Serves the real Expo web export (built in CI: `expo export --platform web`).
    command: "python3 -m http.server 4173 --directory mobile/dist",
    url: "http://localhost:4173",
    reuseExistingServer: false,
  },
  use: { baseURL: "http://localhost:4173" },
  projects: [
    { name: "iPhone", use: { ...devices["iPhone 13"] } },
    { name: "Pixel", use: { ...devices["Pixel 5"] } },
  ],
});
