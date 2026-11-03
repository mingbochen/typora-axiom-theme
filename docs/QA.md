# Verification record

## 0.2.7 alert surface — completed 2026-11-03

- Native evidence: installed Typora 1.9.5 `base.css` styles `.md-alert` plus per-type border/text colours, and `frame.js` renders `<div class="md-alert md-alert-*">` around a native icon-and-label span (edit mode nests `.md-alert-text-container[data-text]` and supplies the label through `::after`; export mode writes the label text inline). The theme styles only the surface and keeps that markup, icon and editing behaviour.
- The stock saturated left bar is replaced by a pale per-type surface, a hairline semantic border and a coloured label: note `#3f6ea3` / `#f3f7fc`, tip `#327a50` / `#f2f9f5`, important `#6f4bb0` / `#f7f3fd`, warning `#8a5a12` / `#fcf7e9`, caution `#a63a40` / `#fdf3f3`. Body copy keeps the ink colour.
- A dedicated fixture loads installed `base.css` with both edit and export alert markup (12 alerts per case) at 1440 / 640 / 390px. No document or card overflow; labels compute to 14px / 600; the native `::after` still supplies the capitalised label.
- Contrast audit: 4.92 / 4.87 / 5.80 / 5.52 / 5.84:1 for the note / tip / important / warning / caution labels on their own surfaces, all above 4.5:1.
- Print: seven alerts across the showcase and stress fixtures stay inside the 672px A4 content width, keep `break-inside: avoid` and retain their tinted surfaces with `print-color-adjust: exact`.
- The committed preview fixture mirrors the same Octicon paths (MIT) so browser samples match Typora; the theme itself does not bundle icons or assets.
- Owner visually confirmed the alert cards, icons and labels in Typora 1.9.5 on 2026-11-03. Edit-mode meta text, caret behaviour and native print/export remain separate pending checks.

## 0.2.6 typewriter print regression — completed 2026-11-01

- Native control CSS gives `#write.typewriter-mode` a 50% top padding with `!important`. With the theme's previous normal print reset, a 672px fixture retained 334px of blank space before the first printed heading.
- A print-only override now clears that padding with the matching required priority and disables the native padding transition during printing. Screen typewriter centering remains unchanged; the fixture waits for its native transition to finish before measuring it.
- The optional installed-CSS `check:focus-print` now verifies typewriter spacing as well as focus text/media states in both screen and print media. This remains representative DOM integration, not native export acceptance.

## 0.2.5 long-token table print regression — completed 2026-11-01

- With installed base CSS, three unbroken identifiers expanded a four-column table to 1053px inside a 668px print region. The last cell extended beyond the printable right edge.
- Print-only `overflow-wrap: anywhere` lets long cell tokens participate in table sizing; the same table now fits exactly. Its screen width remains 1255px and the figure still scrolls locally.
- Added plain long identifiers to the eight-column stress table. The portable print check now measures table width/right-edge containment at A4's 178mm content width, matching the PDF's 16mm margins rather than a wide desktop viewport.
- Both example PDFs pass table containment. Rendered and reviewed the stress PDF's table page: all eight columns and complete long identifiers are present, without right-edge cropping. Text extraction also preserves all three identifiers after removing line-wrap whitespace.
- These are browser/installed-CSS integration checks. Typora's native PDF exporter remains a separate pending acceptance gate.

## 0.2.4 focus-mode print regression — completed 2026-11-01

- Installed control CSS dims inactive text/code to `#c8c8c8`, images/diagrams to 0.3 opacity and task controls to 0.2. A representative focus-mode DOM retained that dimming in browser print media.
- Print-only overrides now restore ink and full image/diagram/task opacity. Both screen and print states pass: screen focus behavior remains unchanged.
- This verifies installed CSS in browser print media. It does not establish how Typora's native exporter prepares its DOM; native export acceptance is still pending.
- Run locally with `TYPORA_RESOURCES` set: `npm run check:focus-print`. Installed styles are read-only development inputs and are not redistributed.

## 0.2.3 inline math regression — completed 2026-11-01

- A normal conditional-probability expression with native inline wrappers extended a 390px page to 424px. Both wrappers and the installed MathJax engine were included in the fixture.
- The fix bounds the outer inline preview and its SVG. It leaves the native container's display/overflow intact: short superscript/subscript expression width and baseline remain unchanged at three widths.
- Verified native expansion CSS still hides preview and shows raw math. This checks CSS states only, not live typing/selection in Typora.
- Inline math may scale down on narrow pages; use display math to retain font size with local scrolling for complex expressions.

## 0.2.2 file-tree scaling regression — completed 2026-11-01

- The installed control stylesheet retains a 22px file-tree line box and a separate 29px-high selection background. At a 24px root the theme's sidebar font becomes 21px: multiline Chinese/Latin filenames were crowded, while the old background protruded outside the rounded selection.
- Verified the defect with the actual native file-tree DOM layers, which the earlier simplified sidebar fixture omitted.
- The theme now scales row leading/padding and removes only the redundant background paint; the rounded content row owns selection paint. Native element geometry and wrapping preferences remain intact.
- Installed-base fixtures at 16px and 24px roots pass readable leading, selection-paint and document-width checks. Screenshots before/after reviewed; these remain static browser integration fixtures, not a native app screenshot.

## 0.2.1 export task-list regression — completed 2026-11-01

- Reproduced a real cascade defect in representative exported DOM with installed Typora base CSS: paragraph-wrapped task labels appeared about 30px below their checkboxes. The previous browser Markdown preview used tight lists and did not expose it.
- Scoped the fix to `.typora-export #write`: positioned task controls beside the first text line, cleared inherited checkbox margins and removed only the first label paragraph's top margin. Editor task controls remain untouched.
- Six screen/print cases cover 1100px / 390px widths and 16px / 24px root fonts, with tight, paragraph, wrapped and nested task shapes. Installed-base and portable variants passed after the fix.
- Reviewed normal and narrow/large-font screenshots. This is representative DOM layout QA, not an invocation of Typora's native exporter.
- Native CSS fixture also confirms pointer cursors on clickable file/outline surfaces and a non-pointer cursor in the search field.
- A follow-up 20-column MathJax matrix reproduced document overflow at 640px and 390px (page scroll width 807px). The fix gives only math preview regions local scrolling, keeps the end reachable, and fits SVG math to the print container without clipping editor toolbars.

## Browser fixture — completed 2026-11-01

Tool: local Chrome via Playwright. Sample inputs: `examples/showcase.md` and `examples/stress-test.md`.

- 8 viewport/device-scale cases: 1440, 1024, 640 and 390 CSS pixels; DPR 1, 1.25 and 1.5. DPR captures pixel density, **not** Typora zoom; actual 125%/150% application zoom remains a native check.
- All cases: no page-level horizontal overflow, theme CSS parsed, no HTTP(S) requests.
- Font preference simulation: change root font size to 20px; body and fenced code both become 20px.
- The original0.1.0 selected palette met4.5:1. Version0.2.0 reads colors directly from CSS and checks body, secondary, links, selected text and accent-button text against4.5:1. Two source-matched syntax colors (string4.19:1 and attribute3.10:1 on the chosen code surface) are recorded as explicit non-AA reference exceptions.
- First-screen and code-detail screenshots visually reviewed. Heading hierarchy, neutral code surface, Chinese spacing and quote indentation look coherent at 1440px.
- Full reports and screenshots are development outputs under ignored `artifacts/`.

The browser fixture uses an illustrative sidebar, a small test syntax highlighter and a local SVG instead of a Mermaid engine. It leaves math as raw markup. These checks establish layout behavior, not real Typora editor compatibility.

## Native Typora — pending

Local installation found: Windows Typora 1.9.5. The theme file is installed and in active use; the owner confirmed the themed alert cards, icons and labels on 2026-11-03. Earlier automated window capture failed, so the checklist below remains a manual gate for the rest of the native surface.

- [x] Load theme through Typora's Themes menu.
- [ ] Check typing/caret, code focus/blur, language selector, line numbers, long-line scrolling.
- [ ] Check task toggle, nested lists and table editing controls.
- [x] Check alert cards, icons and labels in the editor (owner confirmed 2026-11-03).
- [ ] Check alert edit-mode meta text and native print/export.
- [ ] Check math, Mermaid and local images.
- [ ] Check source/focus/typewriter modes.
- [ ] Check file tree, outline, search, dropdowns and common dialogs.
- [ ] Check actual application zoom at 100%, 125%, 150%.
- [ ] Export HTML and PDF; inspect code, wide tables, images and pagination.
- [ ] Record platform, app version, actual screenshots and findings before stable release.

## Release gate

The current ZIP is a **development preview**. Publish a stable v1.0.0 only after native checks above are completed and any defects are resolved. The owner selected the public repository `mingbochen/typora-axiom-theme` for Axiom. Any publication before native sign-off must retain the preview status.

## Local integration fixtures — completed 2026-11-01

- Version0.2.0 uses the owner's exact export, correct yellow/ink colors and source-verified font stacks. Local platform font probe resolved Segoe UI / Microsoft YaHei / Consolas. Original App assets/fonts are not copied or distributed.

- Loaded installed Typora base/CodeMirror CSS with representative editor DOM at 1100, 640 and 390px.
- Fixed ordinary preformatted-block styling reaching CodeMirror line elements; native line margin, border and background now remain unchanged.
- Verified task checkbox dimensions and code line height without replacing native control geometry.
- Loaded installed Bootstrap / Typora control styles for static file-tree active/hover, search focus and dialog-button checks.
- Fixed source-mode column styling to preserve a full-width editor viewport and native gutter space.
- Rendered five formulas (one inline, four blocks including a wide matrix) with the installed MathJax engine, and the showcase flowchart with the installed Mermaid engine at three widths. No formula errors, duplicate visible accessibility math or document-level overflow. Wide math scrolls locally and its end remains reachable. Confirmed diagram language headers are hidden after a selector specificity fix.
- Local engines and native app CSS are development inputs only. They remain under ignored `artifacts/local-engines/` and are not redistributed.

## Print fixture — completed 2026-11-01

- Chrome A4 PDF output: showcase 3 pages; stress document 4 pages.
- Confirmed application fixture chrome hidden, 11pt root size and long code wrapping.
- Rendered PDFs to PNG with Poppler and reviewed the first two showcase pages and the wide-table stress page. No observed crop or overlap in those inspected regions. Code can continue on the next page rather than forcing an oversized unbroken block.
- This fixture retains raw math markers and an SVG diagram placeholder. Native PDF export and native formula/diagram printing remain pending.
