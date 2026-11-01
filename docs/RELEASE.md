# Release preparation

## Proposed repository

Selected by the owner: https://github.com/mingbochen/typora-axiom-theme (public), project name **Axiom**. Repository was empty when checked. Development preview source can be published there; stable release remains gated on native QA.

Resolve the intended owner and usable write authorization before publication. Do not place any tokens or local account configuration in the repository.

## Preview release

- Preview tag: `v0.2.4-preview`.
- Suggested title: `Axiom 0.2.4 — development preview`.
- Attach `axiom-v0.2.4.zip` and its `.sha256` file.
- State that screenshots are browser fixtures and native editor/export validation is pending.
- README should show a real Typora screenshot once available; replace the clearly labeled browser preview at that point.

The validation workflow publishes a **new prerelease only** after all required checks succeed, and only when a main-branch push commit explicitly contains `[preview release]`. Routine pushes and pull requests cannot enter that job. Publication uses the repository's ephemeral Actions token, scoped to the publishing job; no local user token is required.

The job verifies the ZIP checksum and contained CSS, targets the exact validated commit, refuses an existing tag, never clobbers assets, and passes `--prerelease --latest=false`. Stable releases remain manual and gated by native QA. Notes come from `docs/PREVIEW_NOTES.md`.

## Before stable release

- [ ] Complete native QA in `docs/QA.md`.
- [ ] Check CSS, README, changelog and release tag versions match.
- [ ] Review the release archive's allowlist and absence of local paths, tokens and development state.
- [x] Select destination owner / repository / visibility with the user.
- [x] Verify repository authentication and write access (connected GitHub integration).
- [ ] Push the reviewed source and create the selected release.
- [ ] Optionally submit to the Typora theme gallery after the repository is ready.

## Repository contents

Include CSS, documentation, examples, original sample SVG, screenshot, development scripts, package metadata and MIT license. Keep `artifacts/`, generated `dist/`, dependencies and local operational notes out of version control.

## Rebuild

Run `npm run check` and `npm run build`. `scripts/package.py` uses an explicit file allowlist, stable ZIP timestamps and SHA-256 output. Browser reports and any native QA notes must describe the actual version being shipped.
