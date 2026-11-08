# 2026-11-08 · Union site, with vs without the skill

Same brief to two agents: a site for a fictional Russian labor union (normative documents, projects, news), hotlinked free photos, unique readable design, stack of their choice. One agent followed CSS Maniac, the other was barred from reading it.

Open `union-with-skill/dist/index.html` and `union-without-skill/dist/index.html`. Renders are in this folder (photos could not load in the sandbox, so they show as placeholders).

## Numbers

| | with skill | without |
|---|---|---|
| CSS, non-blank lines | 887 | 1,704 |
| Substantive lint violations (skill's gate) | 12 (quote style) | 260 |
| Hex colors / bad px / off-grid spacing | 1 / 0 / 0 | 41 / 27 / 23 |
| `!important` | 0 | 3 |
| Dark theme | derived | none |
| JavaScript | 0 (filter on `:has()`) | 60 lines |
| Agent tokens (total) | 238,843 | 225,476 |
| Tool calls | 97 | 93 |
| Wall time | 26.5 min | 15.7 min |

Input/output token split was not reported; measure it in the next run.

## Review (author)

- With the skill: CSS clean, responsive layout ideal. Without: the header already breaks, styles in one file.
- Visual weaker with the skill. Causes: the skill's example had a single "primary" input, so the agent built on one color fewer; and it followed the brief strictly, adding nothing unasked.
- Hero overflow seen in sandbox renders happens only when the photo fails to load (the `width="1600"` attribute takes over); with the photo loaded, `srcset` + `sizes` size it correctly. Fixed in the skill anyway (Pile track `minmax(0, 1fr)`).

## Changes made to the skill after this run

1. No "primary": a few base colors, each one variable; everything derivable is computed in OKLCH.
2. Variables: as few as possible, each holding the fullest shorthand (one whole color, never l/c/h).
3. Text on a fill picked by WCAG luminance (≥ 4.58:1 on any sRGB color); the OKLCH L 0.623 threshold failed ~10% of colors.
