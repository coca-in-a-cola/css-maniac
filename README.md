# CSS Maniac

An agent skill that makes AI write, fix and review CSS/SCSS like someone who has hand-written it for years. Modeled on [ub-mode](https://github.com/unclebob/ub-mode): short imperative rules, backed by checks instead of good intentions.

AI-written CSS works on the screenshot and rots in the codebase: `!important` to win a fight, `overflow: hidden` over a bug, `z-index: 9999`, hex colors copied from the design tool, a `@media` per component, a new style for every file. CSS Maniac makes the agent work the way a careful senior does: learn the project's conventions, find the cause, make the smallest edit, prove it.

## What it does

- **Conventions first.** Reads the project's `## CSS conventions` from `ARCHITECTURE.md` (nested files per subtree; the nearest wins). Missing? For new work it asks you, offering sensible defaults, and writes them down. For a quick fix it infers them from the file it edits, then suggests you state them.
- **Diagnose before fixing.** Finds the rule that actually wins and fixes it there. No appended overrides, no `!important`.
- **Rule of least power.** HTML → CSS → SCSS → JS. Native controls and their state before JS and extra classes.
- **Baseline.** Widely available by default; newer features only when they degrade harmlessly or sit in `@supports` with a fallback.
- **Smallest edit, least code.** Removes AI noise: restated defaults, magic numbers, wrapper divs, zombie rules.
- **Layout.** Flex-first by default, intrinsic before `@container` before `@media`, primitives (Stack, Prose, Cluster, Pile), one grid unit, rem-scaled UI.
- **Color by math.** A few base colors; everything else derived in OKLCH with `light-dark()` themes, guaranteed text contrast and state layers that never lose it.
- **Checks before done.** The project's linter, a visual pin of every breakpoint and theme, WCAG contrast. A structured review mode.

Every default is just that: the project's conventions override all of them.

## Install

Claude Code (2.1.275 or later):

```
/plugin install css-maniac --marketplace coca-in-a-cola/css-maniac-workspace
```

Or in two steps:

```
/plugin marketplace add coca-in-a-cola/css-maniac-workspace
/plugin install css-maniac@css-maniac
```

Any other agent with skills support: copy `skills/css-maniac/` into its skills folder (for Claude Code without the plugin system, `~/.claude/skills/css-maniac/`).

Then just work on styles; the skill triggers on its own. To call it directly: `/css-maniac:css-maniac` (plugin) or `/css-maniac` (copied folder). Add `review` for a review.

## Contents

```
skills/css-maniac/
├── SKILL.md                    the rules
├── references/
│   ├── palette.css             derived OKLCH palette, light-dark() themes
│   ├── patterns.css            reset, root scale, Stack, Prose, Cluster, Pile, button, dialog
│   └── _breakpoints.scss       @include size(md) { … }
└── templates/
    ├── ARCHITECTURE.md         the conventions section, with the defaults
    └── stylelint.config.mjs    optional lint gate, offered, never installed unasked
```

The palette is checked against thousands of random base colors in both themes: every text and fill pair, pressed state included, stays at or above 4.5:1.

## Credits

The W3C TAG's *Rule of Least Power* (Berners-Lee & Mendelsohn); Kevin Powell's flow utility and layout teaching; the Stack and the "owl" selector from *Every Layout* (Heydon Pickering & Andy Bell); Lea Verou's work on OKLCH contrast; Material 3 tone and state-layer sizes; Robert C. Martin's ub-mode for the format.

## License

[MIT](LICENSE)
