/**
 * CSS Maniac lint gate. Offered to the user, never installed unasked.
 * Copy to the project root as stylelint.config.mjs, then:
 *
 *   npm i -D stylelint@17 stylelint-config-standard@40 stylelint-config-standard-scss@17 stylelint-use-logical@2
 *   npx stylelint "**\/*.{css,scss}"
 *
 * Pinned to Stylelint 17: the SCSS config and use-logical don't support 18 yet.
 * The settings below mirror the project's CSS conventions (ARCHITECTURE.md).
 * Change them there first, then here.
 */
import stylelint from 'stylelint';

// ── Settings from the conventions ────────────────────────────────────────────
// rem/em fractions allowed on spacing properties. 4px grid → .25 steps.
// 5px grid in a 20px-root project → '(?:25|5|75)0*' still; edit for your grid.
const GRID = '(?:25|5|75)0*';
// px allowed only for these values.
const PX_ALLOWED = ['1', '999'];
// Files allowed to hold literal colors. Exact names, not "anything with theme in it".
const PALETTE_FILES = ['**/palette.{css,scss}', '**/_palette.scss', '**/tokens.{css,scss}', '**/_tokens.scss'];
// Mobile-first: min-width only. Set false for a desktop-first project.
const MOBILE_FIRST = true;
// ─────────────────────────────────────────────────────────────────────────────

const LITERAL_COLOR = [
  '/#[0-9a-f]{3,8}\\b/i',
  '/\\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\\(\\s*[\\d.]/i',
  '/\\bcolor\\(\\s*(?!from\\b)[a-z][\\w-]*\\s+[\\d.]/i',
];
const SPACING_PROPS =
  '/^(?:margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left)(?:-|$)/';
const LAYOUT_PROPS =
  /^(?:width|height|(?:min-|max-)?(?:inline|block)-size|(?:min-|max-)(?:width|height)|top|right|bottom|left|inset(?:-.+)?|margin(?:-.+)?|padding(?:-.+)?)$/;

const OFF_GRID = `(?<![\\w.])\\d*\\.(?!${GRID}r?em\\b)\\d+r?em\\b`;
const BAD_PX = `(?<![\\w.])(?!(?:${PX_ALLOWED.join('|')})px\\b)\\d*\\.?\\d+px\\b`;
const LAYOUT_TRANSITION = '(?:^|[\\s,])(?:all|width|height|inline-size|block-size|top|left|right|bottom|margin|padding|inset)\\b';

// ── Rules Stylelint has no option for ───────────────────────────────────────
const NS = 'css-maniac';

// @keyframes may only move transform, opacity, filter (and colors): no layout.
const keyframesNoLayout = stylelint.createPlugin(`${NS}/keyframes-no-layout`, (on) => (root, result) => {
  if (!on) return;
  root.walkAtRules(/^(?:-webkit-)?keyframes$/i, (at) => {
    at.walkDecls((decl) => {
      if (!LAYOUT_PROPS.test(decl.prop)) return;
      stylelint.utils.report({
        ruleName: `${NS}/keyframes-no-layout`, result, node: decl,
        message: `CSS Maniac: "${decl.prop}" in @keyframes — animate transform, opacity or filter.`,
      });
    });
  });
});

// :hover only inside @media (hover: hover), or touch screens get sticky hovers.
const hoverInMedia = stylelint.createPlugin(`${NS}/hover-in-media`, (on) => (root, result) => {
  if (!on) return;
  root.walkRules((rule) => {
    if (!/:hover\b/.test(rule.selector)) return;
    for (let p = rule.parent; p; p = p.parent) {
      if (p.type === 'atrule' && p.name === 'media' && /\(\s*(?:any-)?hover\s*:\s*hover\s*\)/.test(p.params)) return;
    }
    stylelint.utils.report({
      ruleName: `${NS}/hover-in-media`, result, node: rule,
      message: 'CSS Maniac: wrap :hover in @media (hover: hover).',
    });
  });
});
// ─────────────────────────────────────────────────────────────────────────────

const disallowedValues = (withColors) => ({
  // Every property, custom properties and gradients included.
  ...(withColors && { '/.+/': LITERAL_COLOR }),
  [SPACING_PROPS]: [`/${OFF_GRID}/`],
  '/^transition(?:-property)?$/': [`/${LAYOUT_TRANSITION}/`],
  outline: ['/^(?:none|0)$/'],
  '/^(?!\\$)/': [`/${BAD_PX}/`], // not SCSS $variables
});

const explain = (prop, value) => {
  const v = String(value);
  if (prop === 'outline' && /^(?:none|0)$/.test(v)) return 'outline removed: replace it in :focus-visible instead.';
  if (/^transition/.test(prop) && new RegExp(LAYOUT_TRANSITION).test(v)) return 'name the properties; never all or layout properties.';
  if (new RegExp(BAD_PX).test(v)) return `px only for ${PX_ALLOWED.map((n) => `${n}px`).join(', ')}; use rem / em.`;
  if (new RegExp(OFF_GRID).test(v)) return 'off the grid unit.';
  return 'literal color: use a palette var.';
};

const rules = (withColors) => ({
  'declaration-property-value-disallowed-list': [
    disallowedValues(withColors),
    { message: (prop, value) => `CSS Maniac: "${prop}: ${value}" — ${explain(prop, value)}` },
  ],
  'color-named': withColors ? 'never' : null,
  'function-disallowed-list': [['rgb', 'rgba', 'hsl', 'hsla'], { message: 'CSS Maniac: use oklch() or keep the hex in the palette.' }],
  'unit-disallowed-list': [['vh'], { message: 'CSS Maniac: use dvh or svh, never vh.' }],
  'declaration-property-value-allowed-list': {
    'z-index': ['/^-?[01]$/', '/^var\\(/', 'auto'],
  },
  'media-feature-name-disallowed-list': MOBILE_FIRST
    ? [['max-width', 'max-inline-size'], { message: 'CSS Maniac: mobile-first, use min-width.' }]
    : null,

  // Specificity
  'selector-max-id': 0,
  'declaration-no-important': true,
  'max-nesting-depth': [3, { ignoreAtRules: ['media', 'supports', 'container', 'layer', 'include', 'starting-style'] }],

  // Logical properties
  'csstools/use-logical': ['always', { except: ['float', 'clear'] }],

  // Rules Stylelint has no option for
  [`${NS}/keyframes-no-layout`]: true,
  [`${NS}/hover-in-media`]: true,

  // Conventions decided per project, not here
  'selector-class-pattern': null, // BEM: '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$'
  'custom-property-pattern': '^_?[a-z][a-z0-9]*(?:-[a-z0-9]+)*$', // --public, --_private
  'media-feature-range-notation': 'prefix', // classic min-width
  'hue-degree-notation': 'number', // oklch(0.5 0.2 277): plain-number hue
  'lightness-notation': 'number', // L as 0–1, like `l` inside oklch(from …) math
});

export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-use-logical', keyframesNoLayout, hoverInMedia],
  // Optional Baseline gate: npm i -D stylelint-plugin-use-baseline, then add
  // 'stylelint-plugin-use-baseline' to plugins and
  // 'plugin/use-baseline': [true, { available: 'widely' }] to rules.
  reportDescriptionlessDisables: true,
  reportNeedlessDisables: true,
  reportInvalidScopeDisables: true,
  rules: rules(true),
  overrides: [
    {
      files: ['**/*.scss'],
      extends: ['stylelint-config-standard-scss'],
      rules: {
        ...rules(true),
        'at-rule-disallowed-list': [['extend', 'import'], { message: 'CSS Maniac: @use / @include, never @import or @extend.' }],
        // SCSS variables only for breakpoints (CSS vars can't live in @media).
        'scss/dollar-variable-pattern': ['^breakpoints$', { ignore: 'local' }],
        // Full, greppable class names: no &__el / &--mod / &_x.
        'scss/selector-no-union-class-name': true,
      },
    },
    {
      files: PALETTE_FILES,
      rules: {
        'declaration-property-value-disallowed-list': rules(false)['declaration-property-value-disallowed-list'],
        'color-named': null,
      },
    },
  ],
};
