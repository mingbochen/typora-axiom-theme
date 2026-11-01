# Release preparation

## Proposed repository

Selected by the owner: https://github.com/mingbochen/typora-axiom-theme (public), project name **Axiom**. Repository was empty when checked. Development preview source can be published there; stable release remains gated on native QA.

Resolve the intended owner and usable write authorization before publication. Do not place any tokens or local account configuration in the repository.

## Preview release

- Suggested tag: `v0.2.1`.
- Suggested title: `Axiom 0.2.1 — development preview`.
- Attach `axiom-v0.2.1.zip` and its `.sha256` file.
- State that screenshots are browser fixtures and native editor/export validation is pending.
- README should show a real Typora screenshot once available; replace the clearly labeled browser preview at that point.

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
