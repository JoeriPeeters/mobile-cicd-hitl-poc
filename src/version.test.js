const { APP_VERSION, isValidSemver } = require("./version");

describe("app version", () => {
  it("is a valid semver string", () => {
    expect(isValidSemver(APP_VERSION)).toBe(true);
  });

  it("rejects non-semver strings", () => {
    expect(isValidSemver("v1")).toBe(false);
    expect(isValidSemver("1.2")).toBe(false);
    expect(isValidSemver("")).toBe(false);
  });
});
