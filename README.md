# css-maniac workspace

Development and tests of **CSS Maniac**, an agent skill that makes AI write and fix CSS/SCSS like an experienced hand-coder.

- `css-maniac/` — the skill (copy it to your agent's skills folder).
- `union-with-skill/`, `union-without-skill/` — sources of the latest A/B run; regenerated each run. `dist/` is not committed: GitHub Actions builds both and publishes them to Pages (`/with-skill/`, `/without-skill/`).
- `comparison/` — results of every run (`README.md` has the table across runs).
- `tools/compare.py` — the A/B harness (`cd tools && npm ci`, then `python3 tools/compare.py <run> --agents comparison/<run>/agents.json`).
