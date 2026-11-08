# css-maniac

An agent skill that makes AI write and fix CSS/SCSS like someone who has hand-written it for years. Modeled on [ub-mode](https://github.com/unclebob/ub-mode): short imperative rules, backed by deterministic gates instead of good intentions.

## What it enforces

- **Rule of least power** (W3C TAG): HTML → CSS → SCSS → JS → canvas. State in HTML attributes, animation on the compositor.
- **Baseline Widely available** by default; newly available only behind `@supports` with a fallback.
- **Smallest edit, least code**: shorthands, no dead declarations, no abstraction that adds lines.
- **Mini-components** with public custom-property APIs and unique private vars.
- **Flex first**, then Kevin Powell's Stack / Prose / Pile; grid only where flex can't; absolute as a last resort.
- **One grid unit**, rem-scaled UI, one mobile-first breakpoint set.
- **Derived OKLCH palette**: one primary color + a dark flag; light and dark themes, states and contrast all computed.

## Before done

- **Lint**: the project's linter, or `templates/stylelint.config.mjs` when there is none. It catches literal colors, px, off-grid spacing, `vh`, `transition: all`, `outline: none`, IDs, `!important`, physical properties, `@extend` and `&__` concatenation.
- **Pin**: a refactor or removal changes nothing it shouldn't, at every breakpoint and in both themes.
- **Contrast**: every touched text meets WCAG 2 AA, light and dark.

The palette was verified against 8,192 hex inputs in both themes: every text and fill pair, hover and pressed states included, is ≥ 4.99:1.

## Install

Copy this folder to your agent's skills directory as `css-maniac/` (for example `~/.claude/skills/css-maniac/`), then invoke `/css-maniac`.

```
css-maniac/
├── SKILL.md
├── references/
│   ├── palette.css          derived OKLCH palette
│   ├── patterns.css         reset, root scale, stack, prose, pile, app-button, allowed absolutes
│   └── _breakpoints.scss    @include size(md) { … }
└── templates/
    └── stylelint.config.mjs
```

## Credits

The W3C TAG's *Rule of Least Power* (Berners-Lee & Mendelsohn); Kevin Powell's Stack, Prose and Pile; Lea Verou's OKLCH contrast threshold; Material 3 tone and state-layer math.
