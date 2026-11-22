# Axiom 1.0.0

Axiom is now stable and listed in the official Typora theme gallery: https://theme.typora.io/theme/Axiom/

A quiet light theme inspired by the ChatGPT / Codex reading experience: a white page, a warm sidebar, one yellow accent, muted code colours and soft semantic callouts. One CSS file, no web fonts, scripts or remote assets.

## Highlights

- **Quiet reading surface** — 16px body text, 1.75 leading and an 800px measure, with clear heading rhythm and no decorative rules.
- **Chinese-first typography** — system font stacks resolved for Segoe UI / Microsoft YaHei / Consolas on Windows, comfortable for mixed CJK and Latin text.
- **Semantic callouts** — Note / Tip / Important / Warning / Caution as pale cards with a hairline semantic border, keeping Typora's native icon and label; label/surface contrast is 4.5:1 or above.
- **Muted code** — a low-saturation syntax palette, reserved language label, neutral surface and local scrolling for long lines.
- **Full app coverage** — sidebar, file tree, outline, search, dialogs, source mode, focus mode and print / PDF styles.
- **One offline file** — no plugins, no bundled fonts, no network requests. Optional overrides live in `axiom.user.css`.

## Native verification

Tested on Windows 11 25H2 with Typora 1.9.5: typing and caret, code focus and language dropdown, task toggling, table cell editing, callout edit state, math / Mermaid / local images, source / focus / typewriter modes, search, outline, 120% / 144% / 172% zoom, and native HTML / PDF export of both the QA document and the showcase.

Code-block blur and line numbers (preference-dependent), table column dragging and file-tree dialogs remain documented edge checks; they are native control details and do not change the theme CSS. macOS and Linux remain unverified.

The theme styling is unchanged from 0.2.7; 1.0.0 is the stability declaration after the native verification and official gallery listing.

## Install

1. Download `axiom.css` from the release assets or from [the official gallery](https://theme.typora.io/theme/Axiom/).
2. Open Typora **Preferences → Appearance → Open Theme Folder**.
3. Copy `axiom.css` into that folder.
4. Restart Typora and choose **Axiom** from the Themes menu.

Requires Typora 1.8+ for GitHub-style callouts. No fonts or plugins are required.

## License

MIT. Axiom is an independent project, not affiliated with OpenAI or Typora.
