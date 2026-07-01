const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const OUT = "screenshots";

// Instrumented mobile simulation: load the app, assert it rendered, and capture
// a screenshot per device viewport as visual evidence for the PR.
test("home screen renders", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "HITL CI/CD POC" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();

  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `home-${testInfo.project.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
});
