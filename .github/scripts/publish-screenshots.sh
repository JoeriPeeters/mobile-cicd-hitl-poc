#!/usr/bin/env bash
# Publish captured screenshots so they render INLINE in the PR.
#
# GitHub can't embed local files in a comment, so we push the PNGs to a
# dedicated `visual-snapshots` branch and reference their raw URLs. Best-effort:
# the workflow marks this step continue-on-error, and the artifacts upload is the
# guaranteed fallback.
set -uo pipefail

BRANCH="visual-snapshots"
DIR="pr-${PR}"
REPO="${GITHUB_REPOSITORY}"
RAW="https://raw.githubusercontent.com/${REPO}/${BRANCH}"

ls screenshots/*.png >/dev/null 2>&1 || { echo "No screenshots to publish."; exit 0; }

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

tmp="$(mktemp -d)"
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  git fetch origin "$BRANCH" >/dev/null 2>&1
  git worktree add -B "$BRANCH" "$tmp" "origin/$BRANCH" >/dev/null 2>&1
else
  git worktree add --detach "$tmp" >/dev/null 2>&1
  ( cd "$tmp" && git switch --orphan "$BRANCH" && git rm -rf . >/dev/null 2>&1 || true )
fi

mkdir -p "$tmp/$DIR"
cp screenshots/*.png "$tmp/$DIR/"

(
  cd "$tmp"
  git add -A
  git commit -m "Screenshots for PR #${PR} (${GITHUB_SHA})" >/dev/null 2>&1 || { echo "nothing to commit"; exit 0; }
  git push origin "HEAD:${BRANCH}" >/dev/null 2>&1
) || { echo "publish push failed — artifacts still available."; exit 0; }

{
  echo "## 📱 Visual snapshots — instrumented mobile simulation"
  echo
  echo "_Playwright rendered the app in a browser at mobile viewports (the Expo-web seam) and captured these. Swap the static render for \`expo export --platform web\` for real fidelity._"
  echo
  for f in screenshots/*.png; do
    n="$(basename "$f")"
    echo "### ${n}"
    echo
    echo "![${n}](${RAW}/${DIR}/${n})"
    echo
  done
  echo "<!-- visual-snapshots -->"
} > comment.md

gh pr comment "$PR" --repo "$REPO" --body-file comment.md || echo "comment failed — artifacts still available."
echo "Published ${DIR} to ${BRANCH}."
