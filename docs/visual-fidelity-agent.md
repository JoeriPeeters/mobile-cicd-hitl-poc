# Visual fidelity review agent (advisory)

Implements [`specs/visual-fidelity-agent.md`](../specs/visual-fidelity-agent.md).

At GATE 1 a human compares the PR's visual-test screenshot against the linked
Figma frame by hand. This **advisory** agent does that comparison first and posts
a focused findings comment, so the reviewer scans a short list instead of
squinting at two images. It **never blocks** — the human still decides.

## The pieces

| Piece | Where | Status |
| --- | --- | --- |
| Deterministic logic (spec discovery, Figma-ref parsing, comment rendering, fail-open skip) | [`src/visual-fidelity.js`](../src/visual-fidelity.js) | ✅ real, unit-tested (`npm test`) |
| The workflow that wires it to Figma + the vision model + the PR | `.github/workflows/visual-fidelity.yml` | ⚠️ **must be added by a human** (see below) |
| `FIGMA_TOKEN` secret (read scope) | repo settings | manual, see [README setup](../README.md#setup-notes) |

The pure module is the testable brain; the workflow is only I/O glue.

## ⚠️ A human must add the workflow

The coding agent that opened this PR is sandboxed **out of `.github/`** — the
pipeline controls — so it cannot create the workflow file itself. That is the
right blast-radius default for this HITL POC: a person owns the pipeline
controls. The spec authorises the workflow; a maintainer places it.

**To activate the agent:** copy the YAML below to
`.github/workflows/visual-fidelity.yml` and add the `FIGMA_TOKEN` secret.

```yaml
# Visual fidelity review — ADVISORY. Compares the PR's visual-test screenshot
# against the Figma frame linked in the implemented spec and posts a findings
# comment. Never blocks: no required check, never fails the PR (see
# specs/visual-fidelity-agent.md). The human at GATE 1 remains the decider.
name: Visual fidelity review

# Runs after the visual screenshot exists — decoupled from rendering.
on:
  workflow_run:
    workflows: ["Visual test"]
    types: [completed]

# Least privilege: read the repo, comment on the PR. Nothing more.
permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    # Only for PR runs; advisory, so we never fail the workflow.
    if: ${{ github.event.workflow_run.event == 'pull_request' }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Download the visual-test screenshot
        uses: actions/download-artifact@v4
        with:
          name: screenshots
          path: screenshots
          run-id: ${{ github.event.workflow_run.id }}
          github-token: ${{ github.token }}

      - name: Compare against the Figma frame and post the advisory comment
        uses: actions/github-script@v7
        env:
          FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          script: |
            const fs = require("fs");
            const path = require("path");
            const vf = require(`${process.env.GITHUB_WORKSPACE}/src/visual-fidelity.js`);

            // 1. Which PR triggered the visual test?
            const prs = context.payload.workflow_run.pull_requests || [];
            if (!prs.length) return; // no PR context → nothing to review
            const prNumber = prs[0].number;
            const { data: pr } = await github.rest.pulls.get({
              ...context.repo, pull_number: prNumber,
            });

            // Idempotent upsert of the single advisory comment.
            const upsert = async (body) => {
              const { data: comments } = await github.rest.issues.listComments({
                ...context.repo, issue_number: prNumber,
              });
              const existing = comments.find((c) => c.body.includes(vf.COMMENT_MARKER));
              if (existing) {
                await github.rest.issues.updateComment({
                  ...context.repo, comment_id: existing.id, body,
                });
              } else {
                await github.rest.issues.createComment({
                  ...context.repo, issue_number: prNumber, body,
                });
              }
            };

            // 2–3. Resolve spec → Figma frame (fail-open on anything missing).
            const readSpec = (p) => fs.readFileSync(path.join(process.env.GITHUB_WORKSPACE, p), "utf8");
            const target = vf.resolveTarget(pr.body || "", readSpec);
            if (!target.ok) {
              await upsert(vf.renderSkip(target.reason));
              return;
            }

            // 4. Render the Figma frame to a PNG URL (token stays server-side).
            const imgApi = vf.figmaImageApiUrl(target.figmaRef.fileKey, target.figmaRef.nodeId);
            const figmaRes = await fetch(imgApi, { headers: { "X-Figma-Token": process.env.FIGMA_TOKEN } });
            const figmaJson = await figmaRes.json();
            const frameUrl = figmaJson.images && figmaJson.images[target.figmaRef.nodeId];
            if (!frameUrl) {
              await upsert(vf.renderSkip("Figma did not return an image for the frame"));
              return;
            }

            // 5. The built screenshot (whole-screen comparison to start).
            const shotDir = path.join(process.env.GITHUB_WORKSPACE, "screenshots");
            const shot = fs.readdirSync(shotDir).find((f) => f.endsWith(".png"));
            const shotB64 = fs.readFileSync(path.join(shotDir, shot)).toString("base64");

            // Send both images + the spec's acceptance criteria to a vision model.
            const specText = readSpec(target.specPath);
            const prompt = [
              "You are a design-fidelity reviewer. Compare the BUILT screenshot",
              "against the DESIGN frame. Report discrepancies by category:",
              vf.CATEGORIES.join(", ") + ".",
              "Be robust to Expo-web-vs-native rendering differences (fonts, AA).",
              "Return STRICT JSON: {\"matches\":[string],\"discrepancies\":[{\"category\":string,\"note\":string}]}.",
              "",
              "Spec acceptance criteria:\n" + specText,
            ].join("\n");

            const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
              },
              body: JSON.stringify({
                model: "claude-opus-4-8",
                max_tokens: 1024,
                messages: [{
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    { type: "text", text: "DESIGN frame:" },
                    { type: "image", source: { type: "url", url: frameUrl } },
                    { type: "text", text: "BUILT screenshot:" },
                    { type: "image", source: { type: "base64", media_type: "image/png", data: shotB64 } },
                  ],
                }],
              }),
            });
            const aiJson = await aiRes.json();
            const text = (aiJson.content || []).map((b) => b.text || "").join("");

            // 6. Render + upsert. Parse failures fail open to an empty review.
            let parsed = { matches: [], discrepancies: [] };
            try { parsed = JSON.parse(text.match(/\{[\s\S]*\}/)[0]); } catch {}
            await upsert(vf.renderReview({
              specPath: target.specPath,
              nodeId: target.figmaRef.nodeId,
              matches: parsed.matches || [],
              discrepancies: parsed.discrepancies || [],
            }));
```

## Design notes

- **Advisory, fail-open.** No spec, no `figma:` link, a missing image, or an
  unparseable model reply all resolve to a graceful skip/empty review — never a
  red PR. This is enforced in `src/visual-fidelity.js` (`resolveTarget`,
  `renderSkip`) and exercised by the unit tests.
- **Idempotent.** The comment carries a hidden `COMMENT_MARKER`; re-runs edit the
  existing comment instead of posting duplicates.
- **Least privilege / no secret leakage.** `contents: read` + `pull-requests:
  write` only. `FIGMA_TOKEN` and `ANTHROPIC_API_KEY` are scoped to the one step
  and never echoed into logs or the comment.
- **Semantic, not pixel-diff.** A vision model reasons about layout/color/copy/
  spacing/missing elements, which survives Expo-web-vs-native rendering
  differences that would make raw pixel diffs too noisy (spec non-goal).
