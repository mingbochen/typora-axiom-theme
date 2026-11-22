# Release preparation

## Proposed repository

Selected by the owner: https://github.com/mingbochen/typora-axiom-theme (public), project name **Axiom**. The repository is published, the theme is listed in the official Typora theme gallery, and the 1.0.0 stable release is current.

Resolve the intended owner and usable write authorization before publication. Do not place any tokens or local account configuration in the repository.

## Preview release

- Preview tag: `v0.2.7-preview`.
- Suggested title: `Axiom 0.2.7 — development preview`.
- Attach `axiom-v0.2.7.zip` and its `.sha256` file.
- State that sample images are browser fixtures; native checks are recorded separately in `docs/QA.md`.
- README should show a real Typora screenshot once available; replace the clearly labeled browser preview at that point.

The validation workflow publishes a **new prerelease only** after all required checks succeed, and only when a main-branch push commit explicitly contains `[preview release]`. Routine pushes and pull requests cannot enter that job. Publication uses the repository's ephemeral Actions token, scoped to the publishing job; no local user token is required.

The job verifies the ZIP checksum and contained CSS, targets the exact validated commit, refuses an existing tag, never clobbers assets, and passes `--prerelease --latest=false`. Stable releases remain manual and gated by native QA. Notes come from `docs/PREVIEW_NOTES.md`.

## Stable release 1.0.0

- Tag / title: `v1.0.0` / `Axiom 1.0.0`.
- Release: https://github.com/mingbochen/typora-axiom-theme/releases/tag/v1.0.0
- Assets: `axiom-v1.0.0.zip`, its `.sha256` file and `axiom.css`.
- Notes: `docs/RELEASE_NOTES_1.0.0.md`.
- The stable release is created manually with `gh release create --latest` after the validation workflow passes. The release commit must not contain `[preview release]`; that marker only triggers the preview publication job.
- It packages the theme verified in `docs/QA.md`; the remaining native-control edge checks are documented there as non-blocking.
- The theme styling is unchanged from 0.2.7 except for the version banner.

## Gallery listing

Axiom is listed in the official Typora theme gallery: https://theme.typora.io/theme/Axiom/

- Listing PR: https://github.com/typora/theme.typora.io/pull/604 — merged 2026-11-20 by abnerlee (merge commit `e06b079`).
- 1.0.0 status update PR: https://github.com/typora/theme.typora.io/pull/616 — opened 2026-11-22; maintainer merge pending.
- Source entry: `_posts/theme/2026-11-04-Axiom.md` and `media/thumbnails/axiom.png` in `typora/theme.typora.io`.
- The Download button in the listing points to this repository's Releases page, so new releases are reachable without changing the entry.
- Changing the status text, screenshots, thumbnail or description requires another PR and a maintainer merge.

## Before stable release

- [x] Complete the main native QA and document the remaining edge checks in `docs/QA.md` (main surfaces verified 2026-11-04).
- [x] Check CSS, README, changelog and release tag versions match.
- [x] Review the release archive's allowlist and absence of local paths, tokens and development state.
- [x] Select destination owner / repository / visibility with the user.
- [x] Verify repository authentication and write access (connected GitHub integration).
- [x] Push the reviewed source and create the selected release: https://github.com/mingbochen/typora-axiom-theme/releases/tag/v1.0.0
- [x] Submit to the Typora theme gallery; listed at https://theme.typora.io/theme/Axiom/ (2026-11-20).
- [x] Open a gallery entry update PR for the 1.0.0 status after the stable release: https://github.com/typora/theme.typora.io/pull/616
- [ ] Merge the gallery update PR (maintainer action).

## Repository contents

Include CSS, documentation, examples, original sample SVG, screenshot, development scripts, package metadata and MIT license. Keep `artifacts/`, generated `dist/`, dependencies and local operational notes out of version control.

## Rebuild

Run `npm run check` and `npm run build`. `scripts/package.py` uses an explicit file allowlist, stable ZIP timestamps and SHA-256 output. Browser reports and any native QA notes must describe the actual version being shipped.
