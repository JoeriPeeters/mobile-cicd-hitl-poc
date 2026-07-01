const {
  COMMENT_MARKER,
  COMMENT_TITLE,
  findSpecPath,
  extractFigmaLink,
  parseFigmaLink,
  figmaImageApiUrl,
  screenKeyForSpec,
  buildSkipComment,
  buildReviewComment,
} = require("./visual-fidelity");

describe("findSpecPath", () => {
  it("pulls the spec path out of an 'Implement specs/...' line", () => {
    expect(findSpecPath("Implement specs/home-screen.md\n\nCloses #9")).toBe(
      "specs/home-screen.md"
    );
  });

  it("returns null when no spec is mentioned", () => {
    expect(findSpecPath("Just a bugfix, no spec here.")).toBeNull();
    expect(findSpecPath(null)).toBeNull();
  });
});

describe("extractFigmaLink", () => {
  const withLink = `---\nstatus: implemented\nfigma: https://www.figma.com/design/abc123/App?node-id=4-2\n---\n\n# Home\n`;

  it("reads the figma link from frontmatter", () => {
    expect(extractFigmaLink(withLink)).toBe(
      "https://www.figma.com/design/abc123/App?node-id=4-2"
    );
  });

  it("returns null when figma is empty (nothing to compare — skip)", () => {
    expect(extractFigmaLink("---\nstatus: draft\nfigma:\n---\n")).toBeNull();
  });

  it("returns null when there's no frontmatter", () => {
    expect(extractFigmaLink("# Just a heading")).toBeNull();
    expect(extractFigmaLink(null)).toBeNull();
  });
});

describe("parseFigmaLink", () => {
  it("extracts fileKey and node id from a /design/ link (dash form)", () => {
    expect(
      parseFigmaLink("https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/App?node-id=4-2")
    ).toEqual({ fileKey: "dS7tk29b3L60YYGpobJn3t", nodeId: "4:2", nodeIdRaw: "4-2" });
  });

  it("handles the url-encoded colon form (4%3A2)", () => {
    expect(parseFigmaLink("https://www.figma.com/file/KEY/App?node-id=12%3A34").nodeId).toBe(
      "12:34"
    );
  });

  it("returns null for links without a node id", () => {
    expect(parseFigmaLink("https://www.figma.com/design/KEY/App")).toBeNull();
    expect(parseFigmaLink("not a url")).toBeNull();
  });
});

describe("figmaImageApiUrl", () => {
  it("builds the REST image endpoint with the colon-form node id", () => {
    expect(figmaImageApiUrl({ fileKey: "KEY", nodeId: "4:2" })).toBe(
      "https://api.figma.com/v1/images/KEY?ids=4%3A2&format=png&scale=2"
    );
  });
});

describe("screenKeyForSpec", () => {
  it("maps a screen spec to its screenshot prefix", () => {
    expect(screenKeyForSpec("specs/home-screen.md")).toBe("home");
    expect(screenKeyForSpec("specs/attractions-screen.md")).toBe("attractions");
  });
});

describe("comment builders", () => {
  it("skip comment carries the title, marker, and advisory line", () => {
    const c = buildSkipComment("no spec found");
    expect(c).toContain(COMMENT_TITLE);
    expect(c).toContain("no spec found");
    expect(c).toContain("Advisory only");
    expect(c.trimEnd().endsWith(COMMENT_MARKER)).toBe(true);
  });

  it("review comment names the spec + frame and embeds the findings", () => {
    const c = buildReviewComment({
      specPath: "specs/home-screen.md",
      nodeIdRaw: "4-2",
      body: "⚠️ Color — CTA reads orange vs #ffd93d",
    });
    expect(c).toContain("`specs/home-screen.md` → Figma node 4-2");
    expect(c).toContain("CTA reads orange");
    expect(c).toContain("Advisory only");
    expect(c.trimEnd().endsWith(COMMENT_MARKER)).toBe(true);
  });
});
