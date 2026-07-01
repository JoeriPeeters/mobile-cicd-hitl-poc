const {
  COMMENT_MARKER,
  findSpecPath,
  parseFigmaLink,
  parseFigmaRef,
  figmaImageApiUrl,
  resolveTarget,
  renderReview,
  renderSkip,
} = require("./visual-fidelity");

describe("findSpecPath", () => {
  it("finds the spec in an 'Implement specs/...' PR body", () => {
    expect(findSpecPath("Implement specs/home-screen.md")).toBe("specs/home-screen.md");
  });

  it("finds a spec mentioned anywhere in the text", () => {
    const body = "Closes #9.\n\nThis PR builds specs/about-screen.md against the frame.";
    expect(findSpecPath(body)).toBe("specs/about-screen.md");
  });

  it("returns null when no spec is referenced (fail-open)", () => {
    expect(findSpecPath("Just a docs typo fix")).toBeNull();
    expect(findSpecPath(null)).toBeNull();
  });
});

describe("parseFigmaLink", () => {
  const spec = [
    "---",
    "status: implemented",
    "figma: https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop?node-id=4-2",
    "---",
    "",
    "# Home",
  ].join("\n");

  it("reads the figma: link from frontmatter", () => {
    expect(parseFigmaLink(spec)).toBe(
      "https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop?node-id=4-2",
    );
  });

  it("returns null when figma: is empty", () => {
    expect(parseFigmaLink("---\nstatus: draft\nfigma:\n---\n")).toBeNull();
  });

  it("returns null when there is no frontmatter", () => {
    expect(parseFigmaLink("# just a heading")).toBeNull();
  });
});

describe("parseFigmaRef", () => {
  it("extracts fileKey and normalises node-id from '-' to ':'", () => {
    const ref = parseFigmaRef(
      "https://www.figma.com/design/dS7tk29b3L60YYGpobJn3t/Thunderloop?node-id=4-2",
    );
    expect(ref).toEqual({ fileKey: "dS7tk29b3L60YYGpobJn3t", nodeId: "4:2" });
  });

  it("supports legacy /file/ URLs", () => {
    const ref = parseFigmaRef("https://www.figma.com/file/ABC123/Design?node-id=10-77");
    expect(ref).toEqual({ fileKey: "ABC123", nodeId: "10:77" });
  });

  it("returns null when the node-id is missing", () => {
    expect(parseFigmaRef("https://www.figma.com/design/ABC123/Design")).toBeNull();
  });
});

describe("figmaImageApiUrl", () => {
  it("builds the images endpoint with png format", () => {
    expect(figmaImageApiUrl("ABC123", "4:2")).toBe(
      "https://api.figma.com/v1/images/ABC123?ids=4%3A2&format=png",
    );
  });
});

describe("resolveTarget", () => {
  const goodSpec = "---\nfigma: https://www.figma.com/design/KEY/X?node-id=4-2\n---\n# Home";

  it("resolves the frame when the PR points at a valid spec", () => {
    const res = resolveTarget("Implement specs/home-screen.md", () => goodSpec);
    expect(res.ok).toBe(true);
    expect(res.specPath).toBe("specs/home-screen.md");
    expect(res.figmaRef).toEqual({ fileKey: "KEY", nodeId: "4:2" });
  });

  it("skips (fail-open) when no spec is referenced", () => {
    const res = resolveTarget("chore: bump deps", () => goodSpec);
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/no spec/);
  });

  it("skips when the spec file cannot be read", () => {
    const res = resolveTarget("Implement specs/missing.md", () => {
      throw new Error("ENOENT");
    });
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/not found/);
  });

  it("skips when the spec has no figma: link", () => {
    const res = resolveTarget("Implement specs/x.md", () => "---\nstatus: draft\n---\n");
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/no figma/);
  });
});

describe("renderReview", () => {
  it("lists matches and categorised discrepancies", () => {
    const body = renderReview({
      specPath: "specs/home-screen.md",
      nodeId: "4:2",
      matches: ["hero", "CTA"],
      discrepancies: [
        { category: "color", note: "CTA reads orange vs #ffd93d yellow" },
        { category: "copy", note: 'card 2 shows "Cyclone" (design: "Cyclone Twister")' },
      ],
    });
    expect(body).toContain(COMMENT_MARKER);
    expect(body).toContain("🎨 Design fidelity review");
    expect(body).toContain("specs/home-screen.md");
    expect(body).toContain("Figma node `4:2`");
    expect(body).toContain("✅ **Matches:** hero, CTA");
    expect(body).toContain("- color — CTA reads orange");
    expect(body).toContain("Advisory only — the human reviewer decides");
  });

  it("reads as faithful when there are no discrepancies", () => {
    const body = renderReview({ specPath: "specs/x.md", nodeId: "1:1" });
    expect(body).toContain("looks faithful");
    expect(body).not.toContain("⚠️");
  });
});

describe("renderSkip", () => {
  it("is marked, advisory, and states the reason", () => {
    const body = renderSkip("no spec referenced in the PR");
    expect(body).toContain(COMMENT_MARKER);
    expect(body).toContain("skipping (no spec referenced in the PR)");
    expect(body).toContain("Advisory only");
  });
});
