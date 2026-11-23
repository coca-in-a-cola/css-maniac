## CSS conventions

<!--
  Read by the CSS Maniac skill before it touches styles.
  Scope: this folder and everything below it. A nested ARCHITECTURE.md
  overrides only the keys it sets; the rest comes from the nearest parent.
  Values below are CSS Maniac's defaults. Edit them to match the project.
-->

| Key | Value |
|---|---|
| Stack | Plain CSS. With SCSS: mixins for breakpoints and for any declaration group used twice or more. |
| Framework | None. |
| Files | One file per component, next to it or in `components/`; separate palette, base, layout and utilities files; one entry file orders them with `@layer reset, base, layout, components, utilities`. Rules inside a file follow the markup order. |
| Baseline target | Widely available. Newly available only when it degrades harmlessly or sits in `@supports` with a fallback. |
| Grid unit | 4px = `0.25rem`. Every spacing and size is a multiple. |
| Units | `rem` for sizes; `em` for what scales with the element's font (button padding, icons, prose flow); `ch` for measure; `px` only for `1px` lines and `999px` pills. |
| Root scale | Mobile root grows with the viewport, `clamp(100%, 62.5% + 2.5vw, 137.5%)`; `100%` from `md`. |
| Breakpoints | Mobile-first, `min-width`, in `rem`: xs 22.5, sm 36, md 48, lg 64, xl 90. Defined once in `_breakpoints.scss`. |
| Layout | Flex-first. Grid for tracks aligned across rows and columns, the Pile, subgrid. |
| Markup | Fewest elements. Wrappers the framework or JS forces but styles don't need get `display: contents`. |
| Naming | BEM `block__element--modifier`, full class names (no `&__` concatenation). |
| Components | One class with a public custom-property API (`--button-bg`), private vars `--_button-bg`. |
| Color | Base colors in `palette.css`, one variable each; everything else derived in OKLCH. No literal colors outside the palette. |
| Themes | Light and dark via `light-dark()`; `.is-light` / `.is-dark` switch a subtree. |
| Properties | Logical (`margin-inline`, `inline-size`). |
| Nesting | Native CSS nesting, at most 3 levels. |
| z-index | `-1`, `0`, `1` or a token; `isolation: isolate` instead of bigger numbers. |
| Motion | Movement with `transform` / `opacity`; nothing moves under `prefers-reduced-motion: reduce`. |
| Lint | `npx stylelint "**/*.{css,scss}"` (or: none). |
