const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const OUT = "screenshots";

// Instrumented mobile simulation: load the app, assert the themed home screen
// rendered, exercise the bottom tab bar, and capture a screenshot per device
// viewport as visual evidence for the PR.
test("home screen renders and tabs switch", async ({ page }, testInfo) => {
  await page.goto("/");
  // react-native-web renders <Text> as spans/divs, not HTML headings, so match by text.
  await expect(page.getByText("Thunderloop Park").first()).toBeVisible();
  await expect(page.getByText("Featured Coasters")).toBeVisible();
  await expect(page.getByText("The Screaming Comet")).toBeVisible();
  await expect(page.getByText("Buy Day Passes")).toBeVisible();

  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, `home-${testInfo.project.name}.png`), fullPage: true });

  // Bottom tab bar: switching to Attractions swaps the visible screen.
  await page.getByText("Attractions").click();
  await expect(page.getByText("Every ride, show, and snack stand")).toBeVisible();
  await page.screenshot({ path: path.join(OUT, `attractions-${testInfo.project.name}.png`), fullPage: true });

  // ...and switching to About Us shows the real park info (story, hours, contact).
  await page.getByText("About Us").click();
  await expect(page.getByText(/Spinning smiles since 1974/)).toBeVisible();
  await expect(page.getByText("Our Story")).toBeVisible();
  await expect(page.getByText("Park Hours")).toBeVisible();
  await expect(page.getByText("1 Coaster Way, Thrillsville, CA 90210")).toBeVisible();
  await expect(page.getByText("hello@thunderloop.park")).toBeVisible();
  await page.screenshot({ path: path.join(OUT, `about-${testInfo.project.name}.png`), fullPage: true });
});
