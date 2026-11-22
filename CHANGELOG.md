# Changelog

## 1.0.0 — 2026-11-22

### Added
- Project conventions: a `## CSS conventions` section in `ARCHITECTURE.md`, nested per subtree. The skill asks for missing conventions before new work, infers them from the edited file for quick fixes, and never migrates code unasked. Template with defaults: `templates/ARCHITECTURE.md`.
- Diagnose step: find the winning rule and fix it at its source.
- AI-noise catalogue: `overflow: hidden` over bugs, magic numbers, wrapper divs, `z-index: 9999`, zombie rules, margin + `:last-child`, `1fr` blowout.
- Sections: Typography, SCSS (`@use`, no `@import`), Review mode with a fixed report format.
- Accessibility: 24px targets, forced colors, zoom.
- Open/close animation with `@starting-style`; Cluster primitive.
- Claude Code plugin and marketplace manifests; MIT license.

### Changed
- Themes use `light-dark()` instead of an `--is-dark` flag; derived colors are declared once.
- Base colors stay as given (hex stays hex). Fills use the base exactly; only brand-as-text is clamped (`--color-brand-text`).
- Text on fills: `contrast-color()` where supported, luminance flip as fallback.
- State layers mix away from the text color, so hover and pressed never lose contrast.
- Breakpoints in `rem`.
- Animation rule: layout properties are banned, color transitions are fine.
- Shorthands and dark theme are defaults, not absolutes.
- The skill never installs a linter; the Stylelint template is offered.
- Baseline: harmless newly available features are allowed without `@supports`.

### Fixed
- Reset no longer breaks centered `<dialog>` and `popover`.
- Images keep their ratio when shrunk (`block-size: auto`).
- `flex: 1 1 15rem` instead of `1 0 15rem`, which overflowed narrow screens.
- Lint gate now catches literal colors in custom properties and gradients, layout properties in `@keyframes`, `max-width` queries, `:hover` outside `@media (hover: hover)`, off-grid `em` values, `@import` in SCSS; the palette exemption matches exact file names only.
