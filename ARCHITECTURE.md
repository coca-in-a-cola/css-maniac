# Architecture

CSS Maniac is an agent skill. Its entrypoint is [`skills/css-maniac/SKILL.md`](skills/css-maniac/SKILL.md); supporting [references](skills/css-maniac/references/) and [templates](skills/css-maniac/templates/) live beside it.

The consuming project's CSS conventions take precedence over the skill's defaults. Conventions are read from `ARCHITECTURE.md` starting at the edited file's folder and walking to the repository root: the nearest values win, with parents filling missing keys. See the [CSS conventions template](skills/css-maniac/templates/ARCHITECTURE.md).

[English README](README.md) · [Русский README](README.ru.md) · [Changelog](CHANGELOG.md)
