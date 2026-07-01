// Visual fidelity review agent — pure logic.
//
// The deterministic "brain" of the advisory design-fidelity agent described in
// `specs/visual-fidelity-agent.md`: given a PR body and a spec file, it works
// out which Figma frame to compare against, builds the Figma REST image URL,
// and renders the advisory PR comment. The I/O around it (fetching the Figma
// PNG, calling the vision model, posting the comment) lives in the workflow;
// keeping this part pure is what lets CI exercise it with real unit tests.
//
// Design rule from the spec: the agent is ADVISORY and FAIL-OPEN. When there is
// no spec or no `figma:` link, callers skip gracefully rather than error.

// Idempotency marker: the workflow finds its previous comment by this hidden
// token and edits it in place, so re-runs update instead of piling up.
const COMMENT_MARKER = "<!-- visual-fidelity-review -->";

// The discrepancy buckets the vision model is asked to report against.
const CATEGORIES = ["layout", "color", "copy", "spacing", "elements"];

/**
 * Find the `specs/<feature>.md` path a PR implements, from its body / linked
 * issue text (e.g. "Implement specs/home-screen.md" or "Closes ... specs/x.md").
 * Returns the first match, or null when none is present (fail-open → skip).
 */
function findSpecPath(text) {
  if (typeof text !== "string") return null;
  const match = text.match(/specs\/[A-Za-z0-9._-]+\.md/);
  return match ? match[0] : null;
}

/**
 * Read the `figma:` value from a spec's YAML frontmatter (the first `---`
 * fenced block). Returns the trimmed link string, or null if absent/empty.
 */
function parseFigmaLink(specContent) {
  if (typeof specContent !== "string") return null;
  const fm = specContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const line = fm[1].match(/^figma:[ \t]*(.*)$/m);
  if (!line) return null;
  const value = line[1].trim();
  return value.length ? value : null;
}

/**
 * Parse a Figma frame deep-link into the pieces the REST API needs.
 * Accepts both `/design/<key>/...` and `/file/<key>/...` URLs and reads the
 * `node-id` query param (URL form `4-2`), normalising it to the API form `4:2`.
 * Returns `{ fileKey, nodeId }`, or null when either part is missing.
 */
function parseFigmaRef(url) {
  if (typeof url !== "string") return null;
  const keyMatch = url.match(/figma\.com\/(?:design|file)\/([A-Za-z0-9]+)/);
  const nodeMatch = url.match(/[?&]node-id=([^&]+)/);
  if (!keyMatch || !nodeMatch) return null;
  const fileKey = keyMatch[1];
  // Figma URLs encode node ids as "4-2"; the API expects "4:2".
  const nodeId = decodeURIComponent(nodeMatch[1]).replace(/-/g, ":");
  return { fileKey, nodeId };
}

/**
 * Build the Figma REST endpoint that renders a frame to PNG.
 * `GET https://api.figma.com/v1/images/:fileKey?ids=:nodeId&format=png`
 */
function figmaImageApiUrl(fileKey, nodeId) {
  const params = new URLSearchParams({ ids: nodeId, format: "png" });
  return `https://api.figma.com/v1/images/${fileKey}?${params.toString()}`;
}

/**
 * Resolve what (if anything) to review from a PR body + a spec reader.
 * `readSpec(path)` returns the spec's text, or null/throws if it doesn't exist.
 * Returns `{ ok: true, specPath, figmaLink, figmaRef }` when a comparison is
 * possible, or `{ ok: false, reason }` describing why to skip (fail-open).
 */
function resolveTarget(prBody, readSpec) {
  const specPath = findSpecPath(prBody);
  if (!specPath) {
    return { ok: false, reason: "no spec referenced in the PR" };
  }
  let specContent = null;
  try {
    specContent = readSpec(specPath);
  } catch {
    specContent = null;
  }
  if (!specContent) {
    return { ok: false, reason: `spec ${specPath} not found` };
  }
  const figmaLink = parseFigmaLink(specContent);
  if (!figmaLink) {
    return { ok: false, reason: `${specPath} has no figma: link` };
  }
  const figmaRef = parseFigmaRef(figmaLink);
  if (!figmaRef) {
    return { ok: false, reason: `${specPath} figma: link is unparseable` };
  }
  return { ok: true, specPath, figmaLink, figmaRef };
}

/**
 * Render the advisory "🎨 Design fidelity review" PR comment.
 * `matches` is a list of things that looked right; `discrepancies` is a list of
 * `{ category, note }`. An empty discrepancy list reads as "looks faithful".
 * Always carries the marker and the explicit advisory line.
 */
function renderReview({ specPath, nodeId, matches = [], discrepancies = [] }) {
  const lines = [COMMENT_MARKER, "## 🎨 Design fidelity review — advisory", ""];
  lines.push(`Compared: \`${specPath}\` → Figma node \`${nodeId}\`  vs  the visual-test screenshot`);
  lines.push("");

  if (matches.length) {
    lines.push(`✅ **Matches:** ${matches.join(", ")}`);
    lines.push("");
  }

  if (discrepancies.length) {
    lines.push("⚠️ **Discrepancies**");
    for (const d of discrepancies) {
      const label = d.category ? `${d.category} — ` : "";
      lines.push(`- ${label}${d.note}`);
    }
  } else {
    lines.push("✅ No discrepancies flagged — looks faithful to the frame.");
  }

  lines.push("");
  lines.push("_Advisory only — the human reviewer decides at GATE 1._");
  return lines.join("\n");
}

/**
 * Render the fail-open skip comment (still marked, so it updates in place).
 */
function renderSkip(reason) {
  return [
    COMMENT_MARKER,
    "## 🎨 Design fidelity review — advisory",
    "",
    `No spec/Figma frame to compare — skipping (${reason}).`,
    "",
    "_Advisory only — the human reviewer decides at GATE 1._",
  ].join("\n");
}

module.exports = {
  COMMENT_MARKER,
  CATEGORIES,
  findSpecPath,
  parseFigmaLink,
  parseFigmaRef,
  figmaImageApiUrl,
  resolveTarget,
  renderReview,
  renderSkip,
};
