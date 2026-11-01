# Visual specification · 0.1.0

## Baseline and accuracy

The requested reference is the user's current desktop App theme. The saved appearance inspected on 2026-10-31 recorded light Codex preset, contrast 45, 16px UI/code fonts, and no light-theme color/font overrides.

Exact App color values, font names and geometry have not been extracted or measured. The implementation below is an original interpretation of that reference, not a pixel-identical port. App contrast 45 is a preset setting, not a CSS contrast ratio.

## Palette

| Role | Value | Intent |
| :--- | :--- | :--- |
| Reading surface | `#ffffff` | White document canvas |
| Body | `#242424` | Soft black, strong text contrast |
| Heading / active UI | `#171717` | Quiet emphasis |
| Secondary | `#616161` | Quotes, code labels, sidebar |
| Muted | `#737373` | Supporting metadata |
| Sidebar | `#f9f9f9` | Slight separation from document |
| Code | `#f7f7f8` | Neutral, cool gray |
| Border | `#e5e5e7` | Thin structural edge |
| Strong border | `#d4d4d8` | Quote rail, table ending |
| Link | `#2563a6` | Recognizable link affordance |
| Selection | `#dbeafe` | Readable selected text |

Code syntax colors prioritize text contrast and muted saturation. The development report calculates representative foreground/background pairs; it does not certify every possible editor state.

## Typography and rhythm

- Root size: 16px, with relative units for document and code sizes.
- Body: 1rem / 1.8; code fence: 1rem / 1.65; inline code: 0.9em.
- H1: 2rem / 1.3; H2: 1.5rem / 1.45; H3: 1.25rem / 1.45.
- H4: 1.125rem; H5/H6: 1rem. No heading underline decoration.
- Body font: system sans-serif stack, including Chinese fallbacks.
- Code font: system monospace stack; no bundled webfonts.
- Document max width: 53rem including 3rem horizontal padding → 800px usable text at root 16px.
- Paragraph ending margin: 1.15em; primary section heading top margin: 2rem.
- Code radius: 0.75rem; 1px border; language label in reserved header space.
- Quotes: 3px neutral rail, no filled card background.
- Tables: quiet header surface and horizontal rules; preserve cell alignment.

## Editing constraints

Do not globally reset `white-space`, position CodeMirror line content, hide native tooltips or simulate interactive controls using CSS. Document selectors are scoped to `#write`; UI variables and component selectors are separate. Native task checkboxes remain native controls.

Diagram fences do not receive code language headers. CodeMirror syntax token colors are shared with source mode; editor line and cursor geometry is retained.

## Responsive and print

Below 640px: reduce page side padding and H1/H2 size. Preserve code and table local scrolling rather than expanding the page. Print uses a white page, 11pt root and wrapped code. Very wide print tables and multi-page CodeMirror output require native export testing.
