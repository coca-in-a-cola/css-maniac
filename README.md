# CSS Maniac

English · [Русский](README.ru.md)

Give your coding agent a practical CSS workflow: learn the project's conventions, find the cause of a styling problem, and make the smallest fitting change. CSS Maniac is a reusable skill for writing, fixing and reviewing CSS and SCSS—not a linter or a guarantee of correct output.

**[Install](#install) · [Examples](#examples) · [First task](#first-task) · [What's inside](#whats-inside)**

## Install

With Node.js and the [skills CLI](https://github.com/vercel-labs/skills), run in your project:

```sh
npx skills add coca-in-a-cola/css-maniac --skill css-maniac
```

Select your agent and installation scope when prompted. This repository must be public or accessible to your Git client. Review the skill before installing: agent skills are instructions that run with the agent's permissions.

**Claude Code:** alternatively, in a session, add the marketplace and install the plugin:

```text
/plugin marketplace add coca-in-a-cola/css-maniac
/plugin install css-maniac@css-maniac
```

Complete installation in the plugin details panel. For a local checkout, use its absolute path instead of the GitHub shorthand. See [Claude Code's marketplace guide](https://code.claude.com/docs/en/plugin-marketplaces).

**Manual install:** copy the entire [`skills/css-maniac/`](skills/css-maniac/) directory, including references and templates, to a supported skill directory: `$HOME/.agents/skills/css-maniac` for Codex, or `$HERMES_HOME/skills/css-maniac` for the active Hermes profile (`$HOME/.hermes/skills/css-maniac` for its default home). Check the destination first; do not overwrite an existing skill without reviewing it. See [Codex](https://developers.openai.com/codex/skills/) and [Hermes](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/) documentation.

## Examples

These are **illustrative** before-and-after edits, not benchmarks or recorded agent output. Whether they fit depends on your markup and conventions.

### Space a stack

When `.stack` is a vertical flex container, its children have no other vertical margins, and equal spacing is intended, replace per-item margins and the last-child exception with `gap`:

```css
/* Before */
.stack { display: flex; flex-direction: column; }
.stack > * { margin-block-end: 1rem; }
.stack > :last-child { margin-block-end: 0; }

/* After */
.stack { display: flex; flex-direction: column; gap: 1rem; }
```

### Let a flex child shrink

When a flex row overflows because its text child has an automatic minimum size, allow that child to shrink and let long words wrap instead of clipping the row:

```css
/* Before */
.row { display: flex; overflow: hidden; }
.row__text { flex: 1; }

/* After */
.row { display: flex; }
.row__text { flex: 1; min-inline-size: 0; overflow-wrap: anywhere; }
```

## First task

Open a project with styles and ask your agent:

> Use CSS Maniac to investigate why the card row overflows on a narrow screen. Follow this project's conventions, make the smallest fix, and report the checks you ran and anything you could not verify.

For a review, ask for a CSS review without edits. Selection and invocation vary by agent; naming the skill explicitly is a useful starting point, not a guarantee it was loaded. Check the agent's report.

## What's inside

- [`SKILL.md`](skills/css-maniac/SKILL.md) — conventions, diagnosis, layout, color, accessibility and review workflow.
- [`references/`](skills/css-maniac/references/) — CSS patterns, palette and SCSS breakpoints.
- [`templates/`](skills/css-maniac/templates/) — CSS conventions and an optional Stylelint configuration.

Project conventions take precedence over the skill's defaults. The skill asks the agent to run the project's linter, check rendering and assess contrast; it does not install a linter or perform those checks by itself. Verify visual changes in the relevant widths, states and themes, and measure contrast with a suitable tool. If a check cannot be run, treat it as unverified.

## Credits and license

Inspired by [ub-mode](https://github.com/unclebob/ub-mode), the W3C TAG's Rule of Least Power, Kevin Powell's flow utility, Every Layout's Stack and owl selector, Lea Verou's work on OKLCH contrast, and Material 3 tones and state layers.

[MIT](LICENSE)
