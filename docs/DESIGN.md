# Visual specification · 0.2.7

## Reference and evidence

The source of truth is the owner-supplied codex-theme-v1 export in reference/chatgpt-light.json: light variant, ChatGPT accent source, yellow #f6c543, surface #ffffff, ink #1a1c1f, contrast 45, default fonts and translucent windows. codeThemeId codex identifies the code palette; it does not mean the UI uses the older blue/black Codex accent.

The initial 0.1.0 interpretation from historical saved configuration is superseded. Base values come from the export; secondary surfaces and typography adaptations are evidence-based design decisions, not a claim of pixel identity.

## Palette

| Role | Value | Evidence |
| :--- | :--- | :--- |
| Surface | #ffffff | Theme export |
| Body / heading | #1a1c1f | Theme export |
| Accent | #f6c543 | Theme export |
| Added / removed / skill | #00a240 / #ba2623 / #924ff7 | Theme export, exposed as semantic tokens |
| Accent soft / link | #fdf6dc / #95611f | Light yellow shades in local App palette; dark shade for readable links |
| Secondary | #606163 | Opaque approximation of reference light text opacity at contrast45 |
| Muted | #737477 | Readable supporting text adaptation |
| Sidebar fallback | #fdfaf7 | Most frequent background pixel in owner's original sidebar screenshot |
| Sidebar glass | rgb(249 242 232 /36%) | Warm frame tint over white approximates the screenshot |
| Active row | #f0efec | Sampled screenshot state |
| Code | #f4f4f4 | Neutral secondary surface adaptation |
| Border | #ededee | Reference low-opacity ink approximation |

Local App palette declarations were read without redistributing its assets: keyword #ab4f7a, literal #ac4f23, string #3a843f, variable #643cae, name #1f4e94, attribute #b8802b. CodeMirror5 token categories cannot exactly reproduce the App's newer engine. String and attribute pairs fall below4.5:1 on this code surface; the audit records these as explicit reference exceptions, not accessibility passes.

## Alerts

Typora1.8+ renders `> [!TYPE]` as its own `div.md-alert` plus a native icon-and-label span; Axiom keeps that DOM and its icons instead of reimplementing the syntax. The stock saturated left bar is replaced by a pale per-type surface, a hairline semantic border and a coloured label: note #3f6ea3 on #f3f7fc, tip #327a50 on #f2f9f5, important #6f4bb0 on #f7f3fd, warning #8a5a12 on #fcf7e9, caution #a63a40 on #fdf3f3. Body copy keeps the ink colour.

Labels are0.875rem semibold at1.5 leading; the native svg inherits currentColor. Colour is not the only signal — the icon and the capitalised label remain. All five label/surface pairs are measured at4.5:1 or above in the browser fixture. Cards use a0.6rem radius,0.8rem/1rem padding and no decorative bar, matching the quiet code and TOC surfaces. A card never splits across printed pages unless it is taller than the page.

## Fonts and rhythm

- Default UI stack verified in local App resources: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif.
- Default code stack: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace.
- Chrome platform-font probe locally resolved Segoe UI for Latin UI, Microsoft YaHei for Chinese and Consolas for Latin code. This tests matching declarations, not the live App DOM.
- Root16px; body1rem /1.75; fenced code1rem /1.5. Code leading follows the reference code-editor declaration; body leading is a visual adaptation.
- Heading weight600; H1 2rem, H2 1.5rem, H3 1.25rem. No decorative heading underline.
- Document max53rem includes3rem side padding, giving800px usable text at16px root. CSS units avoid assuming the unknown monitor/application scaling.
- Paragraph ending1.15em; section heading top2rem; code radius0.75rem with reserved language header.
- White table headers and horizontal rules; outer cells align to the document column, matching the supplied table reference.

## Editing and material constraints

Preserve CodeMirror line geometry, native task controls, tooltip positioning and full-window source editor scrolling. Keep content selectors under #write. No fake copying controls, chat bubbles or window buttons.

Sidebar tint falls back to opaque warm white. Supported browsers use backdrop blur; a CSS theme cannot turn on native operating system window translucency. Diagram fences do not receive code headers.

## Responsive and print

Below640px reduce page inset and H1/H2 size. Code and wide tables scroll locally. Print uses white paper,11pt root and wrapped code. Native editing, application zoom and Typora PDF export remain separate acceptance checks.
