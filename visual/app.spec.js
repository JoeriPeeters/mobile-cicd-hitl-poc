const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const OUT = "screenshots";

// Instrumented mobile simulation: load the app, assert it rendered, and capture
// a screenshot per device viewport as visual evidence for the PR.
test("home screen renders", async ({ page }, testInfo) => {
  await page.goto("/");
  // react-native-web renders <Text> as spans/divs, not HTML headings, so match by text.
  await expect(page.getByText("HITL CI/CD POC")).toBeVisible();
  await expect(page.getByText("Release gates")).toBeVisible();
  await expect(page.getByText("Get started")).toBeVisible();

  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `home-${testInfo.project.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
});
