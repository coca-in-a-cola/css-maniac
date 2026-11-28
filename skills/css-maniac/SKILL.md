---
name: css-maniac
description: Write, fix and review CSS/SCSS the way an experienced hand-coder would. Use whenever creating, editing or reviewing stylesheets, component styles or HTML/CSS layout, when fixing AI-generated styles, or when the user runs /css-maniac. Loads the project's CSS conventions from ARCHITECTURE.md (asks for them or infers them when missing), then enforces them with the rule of least power, Baseline CSS, the smallest edit, one unit grid, derived OKLCH color, and lint / visual / contrast checks before done.
---

# CSS Maniac

Every time you write, fix or review styles:

1. Load the Conventions.
2. Read the CSS Architecture: for a big change, the whole of it; for a small one, the file you touch.
3. Diagnose before you change anything.
4. Pick the Least Powerful Layer, with the flattest markup.
5. Make it Work with the smallest edit.
6. Make it Right: lint, pin, contrast.
7. Report.

The rules below are defaults. The project's conventions beat every one of them.

# Conventions

## Where they live
- A `## CSS conventions` section in `ARCHITECTURE.md`. Template: `templates/ARCHITECTURE.md`; its values are this skill's defaults.
- Start at the folder of the file you touch and walk up to the repo root. The nearest file wins key by key; a parent fills the keys a child leaves out. Different subtrees may have different styles.
- Also read CSS rules stated in `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md` and the linter config. A linter config is law for what it covers.

## The keys
Stack (CSS / SCSS), framework, file structure (where styles live, how they split), Baseline target, grid unit, units, mobile root scale, breakpoints and their unit, layout default (flex-first / grid-first), naming (BEM or not, `&__` concatenation or not), component API, palette and color format, themes, logical properties, nesting depth, z-index scale, motion, lint command.

## When they are missing
- **New project, new feature, new component, refactor, any big change:** stop before writing. Ask only for the missing keys, offering the defaults as the recommended answer. Write the answers to `ARCHITECTURE.md` at the root of the styles' subtree, then go.
- **A fix** (a bug, one component, a quick change): don't block. Infer the keys from the file you are editing, and only that file. Make the fix in that file's style. In the report, list what you inferred and advise the user to state their conventions; offer to write them.
- **Nobody to ask:** infer from the file, else use the defaults. Say which in the report. Don't write `ARCHITECTURE.md` unasked.

## Inferring from one file
- Grid unit: the largest step that divides most spacing values (`0.25rem`, `5px`, `8px`).
- Units: the unit most declarations use. Mixed → follow the nearest neighboring rule.
- Naming: 50% or more of the classes are BEM → BEM. Look for `&__` to see if concatenation is used.
- Layout: count `display: flex` against `display: grid`.
- File structure: look at where the file sits and what imports it.
- Breakpoints: the `@media` values and their direction (`min-width` → mobile-first).
- Themes: `light-dark()`, `prefers-color-scheme` or a theme class present → themed.
- Anything the file doesn't show → default.

## Conflicts
- Code that breaks its own conventions: report it, don't migrate it unasked.
- A request that breaks a convention: say so once, then do what was asked.
- Conventions change only when the user says so.

# Architecture

## Big change first, small change second
- A big change (a feature, several components, a page, a refactor): before writing, read the CSS architecture itself: the entry file, `@layer` order, tokens and palette, existing primitives, components, mixins and utilities. Extend that local framework consistently; then make the specific change inside it.
- A small change: consistency with the file and its neighbors first.
- Never start a second system next to the first: no new token set, no new spacing scale, no new button when one exists.

## Split the files
- Never put all styles in one file when you can split. One file per component, next to it or in `components/`. Separate files for palette and tokens, reset and base, layout primitives, utilities.
- One entry file decides the order, ideally with `@layer` (`reset, base, layout, components, utilities`). SCSS: partials through `@use` / `@forward`. Framework: its per-component styles. Plain CSS: the project's bundler, or a few `<link>`s in cascade order.
- The project already has a structure → follow it. A new file goes where its siblings live.

## Order inside a file
- Rules follow the markup: the block first, then its elements in the order they appear in the HTML, outer before inner.
- States, modifiers and `@media` / `@container` for a rule sit with that rule (nested or right after it), not in a block at the end of the file.
- A new rule goes where its element sits in the HTML, not at the bottom.
- Reordering existing rules can change equal-specificity results: reorder only in a refactor, and pin it.

## Orphans
- A selector that matches nothing in the markup is an orphan. Before calling it one, search templates, components, JS that adds classes, dynamic class names (`'btn--' + size`), CMS and markdown content.
- Never delete orphans silently. List them with file:line and ask the user to approve the deletion.
- Dead declarations inside a rule you are already editing are different: remove them (see Smallest Edit).

# Diagnose

- Reproduce first: the width, theme and state where the bug shows.
- Find why the current value wins: computed value, the rule that sets it, its layer, specificity, source order. Change that rule.
- Never win by appending an override at the end of the file, raising specificity, duplicating a selector or adding `!important`.
- Fix the cause, not the symptom. An overflow comes from a child's min-content: fix it with `min-inline-size: 0`, `minmax(0, 1fr)`, `flex-wrap` or `overflow-wrap`, not with `overflow: hidden` on a parent.

# Least Power

- HTML → CSS → SCSS → JS → canvas. Use the first layer that can do the job.
- HTML first: `<details>`, `<dialog>`, `popover`, `<label>`, input types, `required`, `pattern`, `inert`, `hidden`, `loading="lazy"`.
- Native controls carry their state to assistive tech for free. Pick the one whose meaning fits: `<details>` to show and hide, `popover` for menus, radios for one-of filters, a checkbox for on/off, `<dialog>` for modals.
- Style state from what HTML already holds: `:checked`, `[open]`, `:popover-open`, `:user-invalid`, `[aria-expanded]`, `[aria-current]`, `[data-state]`. Not from JS variables or extra classes.
- `:has()`, `:focus-within`, `:target` before a JS listener.
- SCSS for what CSS can't do: breakpoint values inside `@media`, mixins that reuse a declaration group. Native nesting, custom properties, `calc()`, `color-mix()` for the rest.
- JS only for what the lower layers can't express. Canvas only for 3D or non-document graphics.

## Flat markup
- Always the fewest elements. Text inside a div inside a div inside a div is the anti-pattern; AI and inexperienced devs add wrappers by reflex.
- Every element earns its place: it has a meaning (`<nav>`, `<li>`, `<button>`), creates a layout context the content needs, or is a hook JS or the framework truly requires.
- Style the element that exists. A `<ul>` can be the flex container; a `<button>` can hold the icon and the label; `::before` / `::after` instead of a decorative span. Use the semantic element, not a `div` inside it.
- In the markup you are editing, remove wrappers that do nothing. Every one removed is a selector and a nesting level gone.
- A wrapper you can't remove (the framework's host element, an Angular component tag, a JS mount point, a slot) that does nothing for styles gets `display: contents`, so its children join the parent's layout. Use it widely on such elements: `:host { display: contents; }`.
- Never `display: contents` on a button, link, form control, anything focusable, a table part, a list item, a heading or a landmark: they lose their box and can drop out of the accessibility tree. A `display: contents` element takes no box styles: no padding, border, background.

## Animation
- Movement: `transform`, `opacity`, `filter`. They run on the compositor.
- Never animate layout: `width`, `height`, `inline-size`, `block-size`, `inset`, `top`, `left`, `margin`, `padding`. Transitions of `color`, `background-color`, `border-color` are fine.
- CSS transition → `@keyframes` → scroll-driven animation (`@supports`) → Web Animations API → `requestAnimationFrame`.
- Open and close without JS: `@starting-style` plus `transition-behavior: allow-discrete` on `display` and `overlay`. Without support it just appears.
- Name the transitioned properties. Never `transition: all`.
- Respect `@media (prefers-reduced-motion: reduce)`: nothing moves.

# Baseline

- Default target: Baseline Widely available. Conventions may set another.
- Newly available: fine when a browser without it loses nothing that matters (`text-wrap: pretty`, `@starting-style`, `contrast-color()` over a fallback). Otherwise only inside `@supports`, with a working fallback outside it.
- Unsure? Check MDN or web-features, or run `stylelint-plugin-use-baseline` if the project has it. Snapshot, 2026-11:
  - Widely: nesting, `:has()`, `@container` size queries, `color-mix()`, `oklch()`, `light-dark()`, `dvh`/`svh`, `@layer`, subgrid, logical properties, `clamp()`/`min()`/`max()`, `gap` on flex, `text-wrap: balance`, `:user-invalid`, `inert`.
  - Newly: relative color `oklch(from …)` (widely ~2027-03), `@starting-style`, `@property`, `popover`, `@scope`, `contrast-color()`.
  - Not yet in every engine: check before use (container style queries, `interpolate-size`, anchor positioning).

# Smallest Edit, Least Code

- Fix only what was asked. Touch neighbors only when asked to review or refactor. Report what you saw.
- Measure in source lines. An abstraction that adds lines is forbidden. One that saves lines but hides intent: your judgment, lean plain.
- Reuse before you write: an existing component, pattern or custom property.
- Replacing a rule? Delete the old one. No zombies.
- Shorthands for a full set: `margin`, `padding`, `inset`, `gap`, `flex`, `border`, `place-items`. Longhands when you change one part of an existing value, in modifiers and overrides, and whenever `font`, `background`, `grid`, `transition` or `animation` shorthands would silently reset parts you didn't mean to.
- Remove the dead. If deleting a declaration changes no pixel (pin it), it was dead.

## AI noise: find it, remove it
- `display: none` + `visibility: hidden` + `opacity: 0` together → keep the one that does the job.
- Restated defaults: `display: block` on a `div`, `width: 100%` on a block, `flex-direction: row`, `justify-content: flex-start`, `align-items: stretch`, `position: static`.
- `box-sizing` per element, vendor prefixes, `position: relative` nobody needs, `z-index` with no stacking need, duplicate declarations.
- `overflow: hidden` or `overflow-x: hidden` on `body` or a wrapper to hide an overflow → find the overflowing child.
- Magic numbers: `calc(100dvh - 64px)`, `top: 73px`, `margin-top: -3px` → a layout that needs no number (flex column with `flex: 1`, `position: sticky`, `gap`).
- Wrapper `div`s added only to style → style the element that exists (see Flat markup).
- One giant stylesheet → split it (see Architecture).
- `z-index: 999` and up → `isolation: isolate`, DOM order, the stacking rules below.
- `margin-bottom` on every item + `:last-child { margin-bottom: 0 }` → `gap` or the Stack.
- A `1fr` track that grows with its content → `minmax(0, 1fr)`.
- `height: 100%` chains, fixed `height` on text containers → remove, or `min-block-size`.
- One `@media` per component for what `flex-wrap` or `clamp()` would do.
- Colors and px copied from a design tool's inspect panel → palette vars and grid multiples.
- `!important` added to win a specificity fight → Diagnose.

# Variables

- As few as possible. A variable exists only when something reads it twice, a person or a script will change it, or it is derived.
- One variable holds the fullest shorthand: one whole color, never its `l`/`c`/`h` channels; one `padding`, `border`, `box-shadow`, `font`, `transition`, never their sides or parts. A theme or a script switch changes one variable.

# Components

- Mini-component: one class with a public custom-property API, e.g. `.app-button`.
- Public vars: `--button-bg` without a CSS framework, `--app-button-bg` with one. Nobody sets them by default.
- Private vars (`--_button-bg`) only where a value is read twice or derived. Always unique names, never a bare `--_bg`.
- Multi-fallback: `--_button-bg: var(--button-bg, var(--color-brand));`.
- A derived value reads its unset public var first, then computes: `--_button-bg-hover: var(--button-bg-hover, color-mix(in oklch, var(--_button-bg), var(--_button-shade) 8%));`. Change one var → every state follows; override one state → it alone changes.
- Modifiers set public vars only.
- Inheriting public values is a feature. Prevent collisions with unique names, not by blocking inheritance.
- Set a public var on the instance that uses it (or its modifier), never on a wrapper: nested instances of the same component inherit it too.
- Reference: `references/patterns.css`.

# Layout

## Order of tools
1. Intrinsic: `flex-wrap` with a flex basis, `clamp()`, `min()`.
2. `@container`.
3. `@media` through the breakpoint mixin. Last resort.

## Flex first (default)
- Flexbox for almost everything, 2D included when `flex-wrap` does it.
- Grid only for what flex can't do: tracks aligned across rows and columns (`repeat(auto-fit, minmax(min(15rem, 100%), 1fr))`), the Pile, subgrid, named page areas.
- Size flex children with `flex: <grow> <shrink> <basis>`. A wrapping item with a preferred width: `flex: 1 1 15rem`. Keep shrink on, or a narrow screen overflows. No `width`/`min-width` on flex children unless needed.
- A shrinking flex child with long content needs `min-inline-size: 0`.
- Center with `margin: auto` in flex, `place-items: center` in grid. Never `top: 50%; left: 50%; transform`.

## Primitives (`references/patterns.css`)
- Stack: flex column + `gap: var(--stack-gap, 1rem)`. Any vertical list of components.
- Prose (Kevin Powell's flow): `.prose > * + * { margin-block-start: var(--prose-flow, 1em) }`. Running text; `em` makes spacing follow each element's font size.
- Cluster: `flex-wrap` + `gap`, children `flex: 1 1 <basis>`. Cards, tags, toolbars.
- Pile: grid with a `minmax(0, 1fr)` track, every child on `grid-area: 1 / 1`, placed with `place-self`, ordered with `z-index`. Overlays, badges, text over images. Without the `minmax(0, …)` track, an image's intrinsic width overflows the page.
- All of them assume the margin reset.

## Absolute positioning
- Prefer flex with correct grow/shrink, then the Pile.
- Allowed: decorative `::before`/`::after`, the card's full-area link overlay, `.visually-hidden`, popovers and tooltips.
- Allowed when avoiding it means rebuilding the parent tree.

## Breakpoints
- One set for the whole app. Mobile-first, `min-width`, boundaries in `rem` (default).
- `rem` in a media query is the browser's default size, not the root font-size: the mobile root scale doesn't move breakpoints, the user's font setting does.
- SCSS: `@include size(md) { … }` from `references/_breakpoints.scss`. Plain CSS: the same values from one documented place.
- The jump at `md` is intended: on mobile, fewer items, bigger, more space. Don't scale desktop down to fit.

# Units and Grid

- Every spacing and size is a multiple of the grid unit (default 4px = `0.25rem`).
- Raw multiples (`0.75rem`) and tokens are both fine. Don't create tokens nobody will use.
- `rem` for sizes. `em` when it should scale with the element's font: button padding, icon size, prose flow. `%`, `dvh`, `svh`, `dvw` for large layout bounds. `ch` for measure.
- `px` only for `1px` lines and `999px` pills.
- Never `100vh`: `100dvh` or `100svh`.
- All UI is in `rem`, so the root font-size scales the whole UI. The mobile root may grow (see `html` in `references/patterns.css`).
- Form fields compute to ≥ 16px or iOS zooms on focus.

# Typography

- `font-size` in `rem`. Fluid sizes mix a `rem` term with `vw`: `clamp(2rem, 1.5rem + 2vw, 3rem)`. `vw` alone breaks zoom.
- `line-height` unitless: about 1.5 for body, 1.1–1.2 for headings. `letter-spacing` in `em`.
- `text-wrap: balance` on headings, `pretty` on paragraphs.
- Measure: `max-inline-size: 65ch` or so for running text.
- User content and long URLs: `overflow-wrap: break-word` on the container.
- Web fonts: `font-display: swap`, a fallback stack, only the weights you use.

# Color

- Base colors: the few colors the design is built on. Each is one variable holding one whole color, as the designer gave it: hex stays hex.
- Every color that can be computed from a base is computed in OKLCH: `color-mix(in oklch, …)`, or `oklch(from …)` inside `@supports (color: oklch(from red l c h))` with a fallback.
- Theme colors are plain variables in the root palette, each reassignable. Component colors follow the derived-value rule in Components.
- Themes per conventions; for a new project, light and dark. Use `light-dark()` in the palette with `color-scheme: light dark` on `:root`; `.is-light` / `.is-dark` set `color-scheme` on any subtree. A custom property holding `light-dark()` resolves where it is used, so derived vars are declared once. Inherited `color` is already resolved, so a theme scope re-applies `color` and `background`. The user never writes a second palette.
- Components never contain a literal color. Only `var()`, `color-mix()` of vars, `currentColor`, `transparent`.
- Derive with math, not by eye. Reference: `references/palette.css`.
  - Neutrals: paper and ink (`oklch(L 0 none)`) tinted by a base through `color-mix(in oklch, …)`. Mixing is linear in L, so their contrast holds for any base.
  - A base used as a fill stays exactly as given.
  - A base used as text or an icon on the background: L clamped ≤ 0.48 light, ≥ 0.75 dark, chroma shrinking with it (Material tone 40 / 80).
  - Text on a fill: black or white by WCAG luminance. `contrast-color()` in `@supports`, the luminance flip as fallback. Never by OKLCH L: no L threshold is safe.
  - State layers: hover 8%, pressed 10%, mixed away from the text color, so a state never loses contrast.

# Specificity and Stacking

- Class-first selectors: use an existing class as the hook. If two hooks always travel together, use the existing class alone, not a redundant compound or a new class. For HTML state use the class with its native attribute or pseudo-class: `.disclosure[open]`, `.option:checked`, not a JS-maintained state class.
- Default to zero type selectors. Use at most one per complete selector branch, only when genuinely necessary, such as a semantic document base or markup you cannot attach classes to. Count each path through comma groups and functional pseudos, including tags inside `:is()`, `:not()` and `:where()`, after resolving CSS/SCSS nesting. Neither nesting nor zero specificity makes a tag chain acceptable.
- Good: `.card__title`, `.disclosure[open]`, `.prose > * + *`. Bad: `.card article h2`, `.card :where(article h2)`, `.card { article { h2 { … } } }`. A scoped direct-child universal (`.row > *`) is for layout the parent owns uniformly, as in the Prose flow; never use a broad descendant wildcard (`.card *`) as a component hook.
- Define global tag styles in the base/reset layer, not repeatedly in components. For a global adjustment edit the owning rule; for a local change target the component class, not a tag override. The reset and document-base examples in `references/patterns.css` remain global.
- No IDs in selectors. No `!important` except utilities that must always win.
- Nesting ≤ 3 levels. `:where()` for zero-specificity defaults. `@layer` to order sources instead of selector weight.
- `z-index`: `-1`, `0`, `1` or a token. Contain stacking with `isolation: isolate` instead of escalating numbers.

# Accessibility Floor

- Never `outline: none` without a `:focus-visible` replacement.
- Hover styles inside `@media (hover: hover)`.
- Targets ≥ 24×24 CSS px (`1.5rem`), with space around small ones.
- Forced colors: don't fight them. Keep a `transparent` border or outline where a boundary matters, so it shows in high contrast. Use `@media (forced-colors: active)` only for what disappears: icons drawn with background colors (use `currentColor`), state shown by color alone.
- Text must survive 200% zoom: no `px` font sizes, no `vw`-only sizes, no fixed heights around text.
- Logical properties: `margin-inline`, `padding-block`, `inset-inline-start`, `inline-size`.
- `aspect-ratio`, not padding hacks. `object-fit` for media.

# SCSS

- `@use` and `@forward`, never `@import`: it is deprecated and leaks globals.
- Never `@extend`.
- Reuse with mixins: the same group of declarations used twice or more becomes a parameterized mixin in a partial (`@include focus-ring;`, `@include truncate(2);`). Plus mixins for what CSS can't do (breakpoints). A mixin must save lines; a one-use mixin is noise.
- A repeated group that is really a component or a layout pattern is a class (component or primitive), not a mixin. In plain CSS, reuse through primitives, shared classes and custom properties.
- CSS over Sass: `color-mix()`, not `darken()` / `lighten()`; `calc()` for mixed units; custom properties, not `$vars`, for anything a theme or script changes.
- Class names per conventions; by default full names, no `&__el` / `&--mod` concatenation: full names stay greppable.
- A legacy codebase on `@import` or global functions: follow it, report it, migrate only when asked.

# Make it Right

## Lint
- Run the project's linter on every file you touched. Zero new errors.
- Fix the code, don't silence the rule. A disable comment carries its reason on the same line.
- No linter: install nothing. Apply these rules by reading. In the report you may offer `templates/stylelint.config.mjs` once.

## Pin
- Pin how it renders before the change: every breakpoint, both themes, the states you touched.
- A fix or refactor changes nothing outside its target. A removal changes nothing, or it wasn't dead.
- Can't render it → say so, and say what stayed unverified.

## Contrast
- Check every text you touched, light and dark, every state. Body text ≥ 4.5:1, large text and UI boundaries ≥ 3:1.

# Review

When asked to review, or on `/css-maniac review`:
1. Load the conventions. A review writes no code until asked.
2. Read the architecture, every stylesheet in scope and the markup it styles. Run the linter if there is one.
3. Sort findings by severity:
   - **Broken**: visible bug, overflow, contrast fail, lost focus, layout that breaks with real content.
   - **Fragile**: magic numbers, `!important`, specificity fights, layouts that depend on content length.
   - **Convention**: breaks the project's conventions or the applicable class-first selector policy. Check resolved selector paths and intent, not just a lint count.
   - **Noise**: dead code, restated defaults, AI noise, wrappers that do nothing, rules out of markup order.
   - **Orphans**: selectors that match no markup. Listed for approval, never deleted in the review.
4. Answer in this form:

```
## CSS review: <scope>
Conventions: <ARCHITECTURE.md path | inferred from <file> | defaults>

### Broken
- path:line — what is wrong, when it shows. Fix: …
### Fragile
### Convention
### Noise
### Orphans (delete?)

N broken · N fragile · N convention · N noise · N orphans. Fix which?
```

# Report

- Conventions used: the file, or what you inferred, with an offer to save them.
- Each change, why, how it was proved (lint, pin, contrast).
- Bad styles you saw but didn't touch, with file:line, and an offer to fix them.
- Orphans you found, with file:line, asking whether to delete them.
- Wrappers you removed or set to `display: contents`.
