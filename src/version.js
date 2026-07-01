// The app's release version. In a real RN app this comes from app.json /
// native build config; here it's a tiny testable module so CI has real work
// to do (the native build itself is mocked in this feasibility POC).

const APP_VERSION = "0.1.0";

/** True if `v` is a plain semver string like "1.2.3". */
function isValidSemver(v) {
  return typeof v === "string" && /^\d+\.\d+\.\d+$/.test(v);
}

module.exports = { APP_VERSION, isValidSemver };
