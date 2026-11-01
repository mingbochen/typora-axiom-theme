# Changelog

## 0.2.5 — 2026-11-01

- Fixed long plain identifiers forcing printed tables beyond the paper width. Print cells can break long tokens; screen tables retain native local scrolling and original text flow.
- Expanded the stress sample and print regression checks to measure table containment at A4's actual printable width.

## 0.2.4 — 2026-11-01

- Prevented editing focus mode from washing out printed text, code, images, diagrams and task controls; screen focus behavior remains native.
- Matched link underlines to the link's actual color, including user overrides, instead of retaining an old blue tint.
- Added installed-CSS screen/print focus-state regression coverage; native editor/export acceptance remains pending.

## 0.2.3 — 2026-11-01

- Fixed ordinary long inline MathJax expressions extending past narrow pages by bounding the preview SVG while preserving native inline container layout.
- Added real-engine checks for normal-expression baseline/width preservation, narrow-page containment and native preview/raw expansion CSS.

## 0.2.2 — 2026-11-01

- Fixed the native file-tree selection layer protruding beyond rounded active rows, especially on wrapped filenames.
- Made file-tree line height and vertical padding accommodate larger root fonts instead of retaining a fixed 22px line box.
- Added installed-base CSS regression fixtures at 16px and 24px roots; source/editor acceptance remains separately gated on native testing.

## 0.2.1 — 2026-11-01

- Fixed wide SVG math expanding narrow documents; long display formulas scroll inside their preview and scale to the available print width.

- Fixed exported task checkboxes separating from paragraph-wrapped labels. Checkboxes now stay aligned with the first text line in tight, loose, nested and wrapped tasks, including large root fonts.
- Applied pointer cursors to clickable file-tree, file-list, outline and sidebar-tab surfaces while preserving text cursors for rename fields.
- Added portable export-DOM regression checks to CI, with an optional installed-Typora-base-CSS variant. Native application export validation remains pending.

## 0.2.0 — 2026-11-01

Development preview aligned to the owner's actual ChatGPT theme export.

- Corrected accent to yellow `#f6c543` and ink to `#1a1c1f`; added supplied semantic colors and preserved the original reference export.
- Replaced guessed font preferences with source-verified system UI and monospace stacks; added real local glyph-font probe.
- Matched the warm sidebar reference, added CSS translucency with fallback, and refined table alignment, semibold weights and code rhythm.
- Mapped source-verified Codex syntax colors; contrast reports now read current CSS tokens and explicitly disclose reference palette exceptions.
- Stable release remains gated on native Typora editing and export checks.

## 0.1.0 — 2026-11-01

Development preview. Not yet a stable native-verified release.

- Added a self-contained light Typora theme with 16px body and code defaults.
- Added Chinese/English typography, headings, lists, quotes, code fences and syntax colors.
- Added table, task-list, TOC, footnote, image, metadata and math/diagram styles.
- Added sidebar, outline, file-tree, dialog, source-mode and print styles.
- Added showcase, stress document, original SVG and customization example.
- Added browser layout / contrast checks, offline release checks, installer and reproducible packaging.
- Named the project Axiom and prepared `axiom.css` for `mingbochen/typora-axiom-theme`.
- Fixed CodeMirror line selector leakage, diagram language labels and source editor viewport sizing.
- Added installed-engine MathJax/Mermaid and native CSS integration fixtures, plus browser print checks.
- Native Typora editing, math, Mermaid and export checks remain pending.
