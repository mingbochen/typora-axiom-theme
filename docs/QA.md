# Verification record

## 0.2.1 export task-list regression — completed 2026-11-01

- Reproduced a real cascade defect in representative exported DOM with installed Typora base CSS: paragraph-wrapped task labels appeared about 30px below their checkboxes. The previous browser Markdown preview used tight lists and did not expose it.
- Scoped the fix to `.typora-export #write`: positioned task controls beside the first text line, cleared inherited checkbox margins and removed only the first label paragraph's top margin. Editor task controls remain untouched.
- Six screen/print cases cover 1100px / 390px widths and 16px / 24px root fonts, with tight, paragraph, wrapped and nested task shapes. Installed-base and portable variants passed after the fix.
- Reviewed normal and narrow/large-font screenshots. This is representative DOM layout QA, not an invocation of Typora's native exporter.
- Native CSS fixture also confirms pointer cursors on clickable file/outline surfaces and a non-pointer cursor in the search field.

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

Local installation found: Windows Typora 1.9.5. The theme file was installed. Initial Computer Use state capture timed out; a later capture showed the existing document under its old theme, but subsequent screenshots did not match the target window. Input automation was stopped. No successful loading or editing of this theme in the native app has been recorded.

- [ ] Load theme through Typora's Themes menu.
- [ ] Check typing/caret, code focus/blur, language selector, line numbers, long-line scrolling.
- [ ] Check task toggle, nested lists and table editing controls.
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
- Rendered four formulas (one inline, three blocks) with the installed MathJax engine, and the showcase flowchart with the installed Mermaid engine at three widths. No formula errors, duplicate visible accessibility math or document-level overflow. Confirmed diagram language headers are hidden after a selector specificity fix.
- Local engines and native app CSS are development inputs only. They remain under ignored `artifacts/local-engines/` and are not redistributed.

## Print fixture — completed 2026-11-01

- Chrome A4 PDF output: showcase 3 pages; stress document 4 pages.
- Confirmed application fixture chrome hidden, 11pt root size and long code wrapping.
- Rendered PDFs to PNG with Poppler and reviewed the first two showcase pages and the wide-table stress page. No observed crop or overlap in those inspected regions. Code can continue on the next page rather than forcing an oversized unbroken block.
- This fixture retains raw math markers and an SVG diagram placeholder. Native PDF export and native formula/diagram printing remain pending.
