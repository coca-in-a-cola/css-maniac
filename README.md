<h1 align="center"><img src="docs/assets/own_css-maniac-lockup.png" alt="CSS Maniac" width="500"></h1>

English · [Русский](README.ru.md)

Help your coding agent write, fix and review CSS and SCSS with your project's conventions and the smallest fitting change.

<p align="center">
  <a href="CHANGELOG.md#110--2026-11-23"><img src="https://img.shields.io/badge/version-v1.1.0-blue?style=for-the-badge" alt="version: v1.1.0"></a>
  <a href="https://agentskills.io/"><img src="https://img.shields.io/badge/Agent%20Skills-Open%20standard-blue?style=for-the-badge" alt="Agent Skills: Open standard"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License: MIT"></a>
</p>

<p align="center"><a href="ARCHITECTURE.md">ARCHITECTURE</a> · <a href="CHANGELOG.md">CHANGELOG</a> · AGENTS</p>

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

## What's inside

- [`SKILL.md`](skills/css-maniac/SKILL.md) — conventions, diagnosis, layout, color, accessibility and review workflow.
- [`references/`](skills/css-maniac/references/) — CSS patterns, palette and SCSS breakpoints.
- [`templates/`](skills/css-maniac/templates/) — CSS conventions and an optional Stylelint configuration.

Project conventions take precedence over the skill's defaults. The skill asks the agent to run the project's linter, check rendering and assess contrast; it does not install a linter or perform those checks by itself. Verify visual changes in the relevant widths, states and themes, and measure contrast with a suitable tool. If a check cannot be run, treat it as unverified.

## Credits and license

Inspired by [ub-mode](https://github.com/unclebob/ub-mode), the W3C TAG's Rule of Least Power, Kevin Powell's flow utility, Every Layout's Stack and owl selector, Lea Verou's work on OKLCH contrast, and Material 3 tones and state layers.

[MIT](LICENSE)
