const { defineConfig, devices } = require("@playwright/test");

// Visual test config. Serves the web render (the Expo-web seam) and screenshots
// it at two mobile device viewports. Swap the webServer command for the Expo
// web export once the Nx+Expo app exists — the specs stay the same.
module.exports = defineConfig({
  testDir: "./visual",
  outputDir: "./playwright-out",
  webServer: {
    command: "python3 -m http.server 4173 --directory web",
    url: "http://localhost:4173",
    reuseExistingServer: false,
  },
  use: { baseURL: "http://localhost:4173" },
  projects: [
    { name: "iPhone", use: { ...devices["iPhone 13"] } },
    { name: "Pixel", use: { ...devices["Pixel 5"] } },
  ],
});
