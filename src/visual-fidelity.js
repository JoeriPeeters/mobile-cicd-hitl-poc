// Pure helpers for the advisory "design fidelity review" agent
// (specs/visual-fidelity-agent.md). The workflow glue lives in
// .github/scripts/visual-fidelity-review.js; the reasoning that's worth testing
// — which spec a PR implements, where its Figma frame is, how the PR comment is
// shaped — lives here so CI (`npm test`) exercises real logic.

// Hidden marker so re-runs update the one comment instead of posting duplicates.
const COMMENT_MARKER = "<!-- visual-fidelity-review -->";
const COMMENT_TITLE = "🎨 Design fidelity review";

/**
 * Find the `specs/<feature>.md` path a PR implements, from its body / linked
 * issue text (the convention is a line like "Implement specs/home-screen.md").
 * Returns the normalized path, or null if none is mentioned.
 */
function findSpecPath(text) {
  if (typeof text !== "string") return null;
  const m = text.match(/specs\/([A-Za-z0-9._-]+\.md)/);
  return m ? `specs/${m[1]}` : null;
}

/**
 * Extract the `figma:` link from a spec's YAML frontmatter. Returns the URL
 * string, or null if there's no frontmatter or the field is absent/empty (an
 * empty `figma:` means "nothing to compare" — the caller skips, fail-open).
 */
function extractFigmaLink(specContent) {
  if (typeof specContent !== "string") return null;
  const fm = specContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const line = fm[1].match(/^figma:[ \t]*(.*)$/m);
  if (!line) return null;
  const val = line[1].trim();
  return val || null;
}

/**
 * Parse a Figma frame URL into the pieces the REST API needs. Handles both
 * `/design/` and `/file/` links and either node-id form (`4-2` or `4%3A2`).
 * Returns `{ fileKey, nodeId, nodeIdRaw }` (nodeId in the `4:2` API form,
 * nodeIdRaw in the `4-2` display form), or null if it isn't a frame link.
 */
function parseFigmaLink(url) {
  if (typeof url !== "string") return null;
  const keyMatch = url.match(/figma\.com\/(?:design|file|board|proto)\/([A-Za-z0-9]+)/);
  const nodeMatch = url.match(/[?&]node-id=([^&#]+)/);
  if (!keyMatch || !nodeMatch) return null;
  const decoded = decodeURIComponent(nodeMatch[1]);
  const nodeId = decoded.replace(/-/g, ":");
  return { fileKey: keyMatch[1], nodeId, nodeIdRaw: nodeId.replace(/:/g, "-") };
}

/**
 * Build the Figma REST API URL that renders a node to PNG.
 * GET https://api.figma.com/v1/images/:fileKey?ids=:nodeId&format=png
 */
function figmaImageApiUrl({ fileKey, nodeId }) {
  return `https://api.figma.com/v1/images/${encodeURIComponent(fileKey)}` +
    `?ids=${encodeURIComponent(nodeId)}&format=png&scale=2`;
}

/** Pick the screenshot that matches a spec, e.g. `home-screen.md` → `home`. */
function screenKeyForSpec(specPath) {
  if (typeof specPath !== "string") return null;
  const base = specPath.split("/").pop().replace(/\.md$/, "");
  return base.replace(/-screen$/, "");
}

/** Wrap a graceful skip note as the advisory comment (fail-open path). */
function buildSkipComment(reason) {
  return [
    `## ${COMMENT_TITLE} — advisory`,
    "",
    reason || "No spec / Figma frame to compare — skipping.",
    "",
    "_Advisory only — the human reviewer decides at GATE 1._",
    COMMENT_MARKER,
  ].join("\n");
}

/**
 * Wrap the vision model's findings as the advisory comment. `body` is the
 * model's categorized discrepancy list; the header/footer are added here so the
 * "Advisory — the human decides" framing is always present and consistent.
 */
function buildReviewComment({ specPath, nodeIdRaw, body }) {
  return [
    `## ${COMMENT_TITLE} — advisory`,
    "",
    `Compared: \`${specPath}\` → Figma node ${nodeIdRaw}  vs  visual-test screenshot`,
    "",
    (body || "").trim(),
    "",
    "_Advisory only — the human reviewer decides at GATE 1._",
    COMMENT_MARKER,
  ].join("\n");
}

module.exports = {
  COMMENT_MARKER,
  COMMENT_TITLE,
  findSpecPath,
  extractFigmaLink,
  parseFigmaLink,
  figmaImageApiUrl,
  screenKeyForSpec,
  buildSkipComment,
  buildReviewComment,
};
