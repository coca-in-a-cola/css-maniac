/**
 * CSS Maniac lint gate. Copy to the project root as stylelint.config.mjs.
 *
 *   npm i -D stylelint@17 stylelint-config-standard@40 stylelint-config-standard-scss@17 stylelint-use-logical@2
 *   npx stylelint "**\/*.{css,scss}"
 *
 * Pinned to Stylelint 17: the SCSS config and use-logical don't support 18 yet.
 * Project uses another grid than 4px (0.25rem)? Edit GRID below.
 * Project uses BEM? Set selector-class-pattern to BEM below.
 */

// rem fractions allowed on spacing properties. 4px grid → .25 steps.
const GRID = '(?:25|5|75)0*';

const LITERAL_COLOR = [
  '/#[0-9a-f]{3,8}\\b/i',
  '/\\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\\(\\s*[\\d.]/i',
];
const COLOR_PROPS =
  '/^(?:color|background(?:-color)?|border(?:-(?:block|inline|top|right|bottom|left)(?:-(?:start|end))?)?(?:-color)?|outline(?:-color)?|fill|stroke|box-shadow|text-shadow|text-decoration(?:-color)?|caret-color|accent-color|column-rule(?:-color)?)$/';
const SPACING_PROPS =
  '/^(?:margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left)(?:-|$)/';

const OFF_GRID = `(?<![\\w.])\\d*\\.(?!${GRID}rem\\b)\\d+rem\\b`;
const BAD_PX = '(?<![\\w.])(?!(?:1|999)px\\b)\\d*\\.?\\d+px\\b';
const LAYOUT_TRANSITION = '(?:^|[\\s,])(?:all|width|height|top|left|right|bottom|margin|padding|inset)\\b';

const disallowedValues = (withColors) => ({
  ...(withColors && { [COLOR_PROPS]: LITERAL_COLOR }),
  [SPACING_PROPS]: [`/${OFF_GRID}/`],
  '/^transition(?:-property)?$/': [`/${LAYOUT_TRANSITION}/`],
  outline: ['/^(?:none|0)$/'],
  '/^(?!\\$)/': [`/${BAD_PX}/`], // not SCSS $variables: the breakpoint map is px by rule
});

const explain = (prop, value) => {
  const v = String(value);
  if (prop === 'outline' && /^(?:none|0)$/.test(v)) return 'outline removed: replace it in :focus-visible instead.';
  if (/^transition/.test(prop)) return 'name the properties; animate only transform, opacity, filter.';
  if (new RegExp(BAD_PX).test(v)) return 'px only for 1px and 999px; use rem / em.';
  if (new RegExp(OFF_GRID).test(v)) return 'off the 0.25rem grid.';
  return 'literal color: use a palette var.';
};

const rules = (withColors) => ({
  'declaration-property-value-disallowed-list': [
    disallowedValues(withColors),
    { message: (prop, value) => `CSS Maniac: "${prop}: ${value}" — ${explain(prop, value)}` },
  ],
  'color-named': withColors ? 'never' : null,
  'function-disallowed-list': [['rgb', 'rgba', 'hsl', 'hsla'], { message: 'CSS Maniac: use oklch().' }],
  'unit-disallowed-list': [['vh'], { message: 'CSS Maniac: use dvh or svh, never vh.' }],
  'declaration-property-value-allowed-list': {
    'z-index': ['/^-?[01]$/', '/^var\\(/', 'auto'],
  },

  // Specificity
  'selector-max-id': 0,
  'declaration-no-important': true,
  'max-nesting-depth': [3, { ignoreAtRules: ['media', 'supports', 'container', 'layer', 'include'] }],

  // Logical properties
  'csstools/use-logical': ['always', { except: ['float', 'clear'] }],

  // Conventions decided per project, not here
  'selector-class-pattern': null, // BEM: '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$'
  'custom-property-pattern': '^_?[a-z][a-z0-9]*(?:-[a-z0-9]+)*$', // --public, --_private
  'media-feature-range-notation': 'prefix', // classic min-width
  'hue-degree-notation': 'number', // OKLCH channel math works on plain numbers
});

export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-use-logical'],
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
        'at-rule-disallowed-list': [['extend'], { message: 'CSS Maniac: @include a mixin, never @extend.' }],
        // SCSS variables only for breakpoints (CSS vars can't live in @media).
        'scss/dollar-variable-pattern': ['^breakpoints$', { ignore: 'local' }],
        // Full, greppable class names: no &__el / &--mod / &_x.
        'scss/selector-no-union-class-name': true,
      },
    },
    {
      // The palette is the one place literal colors live.
      files: ['**/*palette*', '**/*tokens*', '**/*theme*'],
      rules: { 'declaration-property-value-disallowed-list': rules(false)['declaration-property-value-disallowed-list'], 'color-named': null },
    },
  ],
};
