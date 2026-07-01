#!/usr/bin/env node
// Advisory "design fidelity review" agent — specs/visual-fidelity-agent.md.
//
// Runs after the Visual test workflow (workflow_run). It figures out which UI
// spec the PR implements, renders that spec's Figma frame to PNG, grabs the
// matching visual-test screenshot, and asks a vision model to compare them —
// then posts (or updates) a single advisory PR comment. It NEVER blocks the PR
// and NEVER edits code: read-only blast radius, the human decides at GATE 1.
//
// Fail-open by design: anything we can't do cleanly becomes a short skip note
// (or a silent exit), never a hard failure. Secrets are read from env and never
// written to logs or the comment.
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const {
  COMMENT_MARKER,
  findSpecPath,
  extractFigmaLink,
  parseFigmaLink,
  figmaImageApiUrl,
  screenKeyForSpec,
  buildSkipComment,
  buildReviewComment,
} = require("../../src/visual-fidelity");

const {
  GH_TOKEN,
  FIGMA_TOKEN,
  ANTHROPIC_API_KEY,
  REPO, // owner/name
  PR_NUMBER, // resolved by the workflow (may be empty)
  RUN_ID, // the Visual test run whose screenshots we download
  HEAD_BRANCH,
} = process.env;

const MODEL = "claude-opus-4-8"; // vision-capable; matches the repo's claude workflows

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", ...opts });
}

// --- GitHub helpers (via the gh CLI already present on the runner) ----------

function ghApi(args, opts = {}) {
  return sh("gh", ["api", ...args], { env: { ...process.env, GH_TOKEN }, ...opts });
}

// A workflow_run event doesn't always carry the PR number; resolve it from the
// head branch when the workflow didn't hand us one.
function resolvePrNumber() {
  if (PR_NUMBER && PR_NUMBER !== "") return PR_NUMBER;
  if (!HEAD_BRANCH) return null;
  try {
    const out = sh("gh", [
      "pr", "list", "--repo", REPO, "--head", HEAD_BRANCH,
      "--state", "open", "--json", "number", "--jq", ".[0].number",
    ], { env: { ...process.env, GH_TOKEN } }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function prBodyAndIssues(pr) {
  // PR title/body plus the bodies of the issues it closes, so "Implement
  // specs/..." is found whether it's on the PR or (the usual case) on the
  // "Implement specs/<feature>.md" issue the PR closes.
  let text = "";
  try {
    const view = JSON.parse(
      sh("gh", [
        "pr", "view", pr, "--repo", REPO,
        "--json", "title,body,closingIssuesReferences",
      ], { env: { ...process.env, GH_TOKEN } })
    );
    text += (view.title || "") + "\n" + (view.body || "") + "\n";
    for (const ref of view.closingIssuesReferences || []) {
      try {
        const issueBody = ghApi(["/repos/" + REPO + "/issues/" + ref.number, "--jq", ".body"]);
        text += "\n" + (issueBody || "");
      } catch { /* ignore a single issue we can't read */ }
    }
  } catch { /* ignore — fall through to a graceful skip */ }
  return text;
}

// Post the advisory comment, updating the existing one (matched by marker) so
// re-runs don't pile up duplicates.
function upsertComment(pr, body) {
  fs.writeFileSync("visual-fidelity-comment.md", body);
  let existingId = "";
  try {
    existingId = ghApi([
      "/repos/" + REPO + "/issues/" + pr + "/comments", "--paginate",
      "--jq", `.[] | select(.body | contains("${COMMENT_MARKER}")) | .id`,
    ]).trim().split("\n")[0];
  } catch { /* ignore */ }

  if (existingId) {
    ghApi([
      "--method", "PATCH",
      "/repos/" + REPO + "/issues/comments/" + existingId,
      "-F", "body=@visual-fidelity-comment.md",
    ]);
  } else {
    ghApi([
      "--method", "POST",
      "/repos/" + REPO + "/issues/" + pr + "/comments",
      "-F", "body=@visual-fidelity-comment.md",
    ]);
  }
}

// --- Figma + screenshot + vision model -------------------------------------

async function fetchFigmaPng({ fileKey, nodeId }) {
  const meta = await fetch(figmaImageApiUrl({ fileKey, nodeId }), {
    headers: { "X-Figma-Token": FIGMA_TOKEN },
  });
  if (!meta.ok) throw new Error("Figma images API returned " + meta.status);
  const json = await meta.json();
  const imageUrl = json.images && (json.images[nodeId] || Object.values(json.images)[0]);
  if (!imageUrl) throw new Error("Figma returned no image for the node");
  const img = await fetch(imageUrl);
  if (!img.ok) throw new Error("Figma image download returned " + img.status);
  return Buffer.from(await img.arrayBuffer()).toString("base64");
}

// Download the Visual test run's `screenshots` artifact and pick the PNG that
// matches the spec's screen (prefer the Chromium render).
function fetchScreenshotBase64(specPath) {
  const dir = "vf-screenshots";
  try {
    sh("gh", ["run", "download", RUN_ID, "--repo", REPO, "-n", "screenshots", "-D", dir], {
      env: { ...process.env, GH_TOKEN },
    });
  } catch {
    return null;
  }
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".png")) : [];
  if (files.length === 0) return null;
  const key = screenKeyForSpec(specPath);
  const chosen =
    files.find((f) => f.startsWith(key + "-") && /chromium/i.test(f)) ||
    files.find((f) => f.startsWith(key + "-")) ||
    files[0];
  return fs.readFileSync(path.join(dir, chosen)).toString("base64");
}

async function compareWithClaude({ figmaB64, shotB64, specContent }) {
  const prompt =
    "You are an advisory design-fidelity reviewer for a React Native (Expo) app.\n" +
    "The FIRST image is the Figma design frame (the visual rubric). The SECOND is a " +
    "screenshot of the built screen rendered via Expo web. Ignore differences that are " +
    "just web-vs-native rendering (font hinting, scrollbars, minor antialiasing).\n\n" +
    "Compare them against the spec's acceptance criteria below and report concrete, " +
    "likely discrepancies grouped by category: layout, color, copy/text, spacing, and " +
    "missing/extra elements. Then give a one-line overall fidelity read.\n\n" +
    "Format as GitHub markdown:\n" +
    "`✅ Matches: ...` (one line) then `⚠️ Discrepancies` as a bullet list prefixed " +
    "`• <Category> — ...`. If it looks faithful, write `✅ Looks faithful — no notable " +
    "discrepancies.` and omit the bullet list. Be specific and concise; do not invent " +
    "issues you can't see.\n\n--- SPEC ---\n" +
    specContent;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/png", data: figmaB64 } },
            { type: "image", source: { type: "base64", media_type: "image/png", data: shotB64 } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error("Anthropic API returned " + res.status);
  const json = await res.json();
  const text = (json.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return text.trim() || "_(vision model returned no text)_";
}

// --- Orchestration ----------------------------------------------------------

async function main() {
  const pr = resolvePrNumber();
  if (!pr) {
    console.log("No open PR for this run — nothing to review.");
    return;
  }

  const text = prBodyAndIssues(pr);
  const specPath = findSpecPath(text);
  if (!specPath || !fs.existsSync(specPath)) {
    upsertComment(pr, buildSkipComment("No spec referenced by this PR — nothing to compare. Skipping."));
    return;
  }

  const specContent = fs.readFileSync(specPath, "utf8");
  const figmaLink = extractFigmaLink(specContent);
  const frame = figmaLink && parseFigmaLink(figmaLink);
  if (!frame) {
    upsertComment(
      pr,
      buildSkipComment(`\`${specPath}\` has no Figma frame link — no design to compare. Skipping.`)
    );
    return;
  }

  const shotB64 = fetchScreenshotBase64(specPath);
  if (!shotB64) {
    upsertComment(pr, buildSkipComment("No visual-test screenshot available yet — skipping."));
    return;
  }

  let figmaB64;
  try {
    figmaB64 = await fetchFigmaPng(frame);
  } catch (e) {
    upsertComment(pr, buildSkipComment("Couldn't fetch the Figma frame (" + e.message + ") — skipping."));
    return;
  }

  const body = await compareWithClaude({ figmaB64, shotB64, specContent });
  upsertComment(pr, buildReviewComment({ specPath, nodeIdRaw: frame.nodeIdRaw, body }));
  console.log("Posted design-fidelity review for " + specPath + " on PR #" + pr + ".");
}

main().catch((e) => {
  // Advisory agent: log and exit 0 so a review hiccup never reads as a PR failure.
  console.error("visual-fidelity-review error:", e.message);
  process.exit(0);
});
