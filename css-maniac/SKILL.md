---
name: css-maniac
description: Write, fix and review CSS/SCSS the way an experienced hand-coder would. Use whenever creating or editing stylesheets, component styles or HTML/CSS layout, when fixing AI-generated styles, or when the user runs /css-maniac. Enforces the rule of least power, Baseline-widely-available CSS, flex-first layout, one unit grid, derived OKLCH color, and lint / visual / contrast checks before done.
---

# CSS Maniac

Every time you write or change styles:

1. Read the Project.
2. Pick the Least Powerful Layer.
3. Make it Work with the smallest edit.
4. Make it Right: lint, pin, contrast.
5. Report.

# Read the Project

## Conventions win
- The project's existing convention beats every rule below. Follow it, report the conflict, don't migrate unasked.
- Before writing a line, read the neighbouring styles: grid unit, breakpoints, naming, palette, units.

## Linter
- Stylelint installed → its config is law. Run it.
- Not installed → set it up from `templates/stylelint.config.mjs` (install command in its header) and tell the user.

## Framework
- New project → argue for plain CSS, SCSS only for breakpoints.
- Framework present (Tailwind, CSS Modules, Vue/Svelte scoped, CSS-in-JS, a UI kit) → solve it inside the framework's own rules. Plain CSS only for what the framework can't do.

## BEM
- Count the classes in the file you edit. 50% or more are BEM → write BEM. Otherwise don't.
- Form: `block__element--modifier`.
- Write full class names. No `&__el`, `&--mod`, `&_x` concatenation unless the project already does it: full names stay greppable.

# Least Power

- HTML → CSS → SCSS → JS → canvas. Use the first layer that can do the job.
- HTML first: `<details>`, `<dialog>`, `popover`, `<label>`, input types, `required`, `pattern`, `inert`, `hidden`, `loading="lazy"`.
- State lives in HTML attributes (`aria-expanded`, `aria-current`, `data-state`), styled with attribute selectors. Not in JS variables.
- `:has()`, `:checked`, `:focus-within`, `:target`, `:user-invalid` before a JS listener.
- SCSS only for what CSS can't do: breakpoint values inside `@media`, `@include` mixins. Never `@extend`. Use native nesting, custom properties, `calc()`, `color-mix()`.
- JS only for what the lower layers can't express. Canvas only for 3D or non-document graphics.

## Animation
- Animate only `transform`, `opacity`, `filter`: they run on the compositor. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`.
- CSS transition → `@keyframes` → scroll-driven animation (newly available: `@supports`) → Web Animations API → `requestAnimationFrame`.
- Name the transitioned properties. Never `transition: all`.
- Respect `@media (prefers-reduced-motion: reduce)`.

# Baseline

- Baseline Widely available: use freely.
- Newly available: only when it fits 100%, inside `@supports`, with a working fallback outside it.
- Status on 2026-11 (re-check MDN / web-features when unsure):
  - Widely: nesting, `:has()`, `@container` size queries, `color-mix()`, `oklch()`, `dvh`/`svh`, `@layer`, subgrid, logical properties, `clamp()`/`min()`/`max()`, `gap` on flex.
  - Newly: relative color `oklch(from …)` (widely ~2027-03), `@property`, `light-dark()`, `@scope`, container style queries, `sign()`.

# Smallest Edit, Least Code

- Fix only what was asked. Touch neighbours only when asked to review or refactor. Report what you saw.
- Measure in source lines. An abstraction that adds lines is forbidden. One that saves lines but hides intent: your judgment, lean plain.
- Reuse before you write: an existing component, pattern or custom property.
- Shorthands always: `margin`, `padding`, `inset`, `flex`, `font`, `border`, `place-items`, `gap`.
- Remove the suspicious. If deleting a declaration changes no pixel (pin it), it was dead. Typical AI noise:
  - `display: none` + `visibility: hidden` + `opacity: 0` together → keep the one that does the job.
  - `display: block` on a `div`, `width: 100%` on a block, `box-sizing` per element, vendor prefixes, `position: relative` nobody needs, `z-index` with no stacking need, duplicates, `!important`.
  - Fixed `height` on text containers → remove it or use `min-block-size`.

# Variables

- As few as possible. A variable exists only when something reads it twice, a person or a script will change it, or it is derived.
- One variable holds the fullest shorthand: one whole color, never its `l`/`c`/`h` channels; one `padding`, `border`, `box-shadow`, `font`, `transition`, never their sides or parts. A theme or a script switch changes one variable.

# Components

- Mini-component: one class with a public custom-property API, e.g. `.app-button`.
- Public vars: `--button-bg` without a CSS framework, `--app-button-bg` with one. Nobody sets them by default.
- Private vars (`--_button-bg`) only where a value is read twice or derived. Always unique names, never a bare `--_bg`.
- Multi-fallback: `--_button-bg: var(--button-bg, var(--color-brand));`.
- A derived value reads its unset public var first, then computes: `--_button-bg-hover: var(--button-bg-hover, color-mix(in oklch, var(--_button-bg), var(--_button-fg) 8%));`. Change one var → every state follows; override one state → it alone changes.
- Modifiers set public vars only.
- Inheriting public values is a feature. Prevent collisions with unique names, not by blocking inheritance.
- Set a public var on the instance that uses it (or its modifier), never on a wrapper: nested instances of the same component inherit it too.
- Reference: `references/patterns.css`.

# Layout

## Order of tools
1. Intrinsic: `flex-wrap`, flex basis, `clamp()`, `min()`, `auto-fit` + `minmax()`.
2. `@container`.
3. `@media` through the breakpoint mixin. Last resort.

## Flex first
- Flexbox for almost everything, 2D included when `flex-wrap` does it.
- Grid only for what flex can't do: the Pile, tracks aligned across rows and columns, subgrid.
- Size flex children with `flex: <grow> <shrink> <basis>`. A wrapping item with a minimum width: `flex: 1 0 15rem`. No `width`/`min-width` on flex children unless needed.
- A shrinking flex child with long content needs `min-inline-size: 0`.
- Center with `margin: auto` in flex, `place-items: center` in grid. Never `top: 50%; left: 50%; transform`.

## Primitives (Kevin Powell) — `references/patterns.css`
- Stack: flex column + `gap: var(--stack-gap, 1rem)`. Any vertical list of components.
- Prose: `.prose > * + * { margin-block-start: var(--prose-flow, 1em) }`. Running text; `em` makes spacing follow each element's font size.
- Pile: grid with a `minmax(0, 1fr)` track, every child on `grid-area: 1 / 1`, placed with `place-self`, ordered with `z-index`. Overlays, badges, text over images. Without the `minmax(0, …)` track, an image's intrinsic width overflows the page.
- All three assume a margin reset.

## Absolute positioning
- Prefer flex with correct grow/shrink, then the Pile.
- Allowed: decorative `::before`/`::after`, the card's full-area link overlay, `.visually-hidden`, popovers and tooltips.
- Allowed when avoiding it means rebuilding the parent tree.

## Breakpoints
- One set for the whole app. Mobile-first, `min-width`, boundaries in `px`.
- SCSS: `@include size(md) { … }` from `references/_breakpoints.scss`. Plain CSS: the same px values from one documented place.
- The jump at 767/768 is intended: on mobile, fewer items, bigger, more space. Don't scale desktop down to fit.

# Units and Grid

- Find the grid unit: default 4px = `0.25rem`; follow 5px or whatever the project uses. Every spacing and size is a multiple.
- Raw multiples (`0.75rem`) and tokens are both fine. Don't create tokens nobody will use.
- `rem` for sizes. `em` when it should scale with the element's font: button padding, icon size, prose flow. `%`, `dvh`, `svh`, `dvw` for large layout bounds. `ch` for measure.
- `px` only for `1px` lines, `999px` pills and media-query boundaries.
- Never `100vh`: `100dvh` or `100svh`.
- `line-height` unitless, from the font. `letter-spacing` in `em`.
- All UI is in `rem`, so the root font-size scales the whole UI. The mobile root may grow (see `html` in `references/patterns.css`).
- Form fields compute to ≥ 16px or iOS zooms on focus.

# Color

- Base colors: the few colors the design is built on, as many as the design needs. Each is one variable holding one whole color.
- Every color that can be computed from a base color is computed in OKLCH: `color-mix(in oklch, …)`, or `oklch(from …)` / `color(from …)` inside `@supports (color: oklch(from red l c h))` with a fallback.
- Theme colors are plain variables in the root palette, each reassignable. Component colors follow the derived-value rule in Components.
- Light and dark themes always exist, switched by one `--is-dark` (0 or 1). The user never writes the second palette.
- Components never contain a literal color. Only `var()`, `color-mix()` of vars, `currentColor`, `transparent`.
- Given a hex → convert it to OKLCH once, keep the hex in a comment.
- Theme switch: `.is-dark` / `.is-light` or `prefers-color-scheme`. Re-declare the derived vars on every selector that sets `--is-dark`: custom properties compute where they are declared.
- Derive with math, not by eye. Reference: `references/palette.css`.
  - Neutrals: paper and ink (`oklch(L 0 none)`) tinted by a base through `color-mix(in oklch, …)`. Mixing is linear in L, so their contrast holds for any base.
  - A base used as text or fill: L clamped ≤ 0.48 light, ≥ 0.75 dark, chroma shrinking with it (Material tone 40 / 80).
  - State layers (Material 3): hover 8%, focus 10%, pressed 10% of the on-color mixed into the container.
  - Text on a fill: black or white by WCAG luminance, never by OKLCH L. No L threshold is safe; the luminance flip at Y 0.179 guarantees ≥ 4.58:1 on any sRGB fill.

# Specificity and Stacking

- No IDs in selectors. No `!important` except utilities that must always win.
- Nesting ≤ 3 levels. `:where()` for zero-specificity defaults. `@layer` to order sources instead of selector weight.
- `z-index`: `-1`, `0`, `1` or a token. Contain stacking with `isolation: isolate` instead of escalating numbers.

# Accessibility Floor

- Never `outline: none` without a `:focus-visible` replacement.
- Hover styles inside `@media (hover: hover)`.
- Logical properties: `margin-inline`, `padding-block`, `inset-inline-start`, `inline-size`.
- `aspect-ratio`, not padding hacks. `object-fit` for media.

# Make it Right

## Lint
- Run the project's linter on every file you touched. Zero new errors.
- Fix the code, don't silence the rule. A disable comment carries its reason on the same line.

## Pin
- Pin how it renders before the change: every breakpoint, both themes.
- A fix or refactor changes nothing outside its target. A removal changes nothing, or it wasn't dead.
- Can't render it → say so, and say what stayed unverified.

## Contrast
- Check every text you touched, light and dark. Body text ≥ 4.5:1, large text and UI ≥ 3:1.

# Report

- Keep a log: each change, why, how it was proved (lint, pin, contrast).
- List bad styles you saw but didn't touch, with file:line, and offer to fix them.
