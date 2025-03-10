const { getMediaQueryFromStr } = require('@bva/ui-shared/dist/helpers');
const { getCustomConfig } = require('@bva/ui-shared/dist/resolveConfig');
const parseBreakpoint = require('./lib/parseBreakpoint');

const { options } = getCustomConfig();

/**
 * Expands a `@media breakpoint()` rule into a functional @media query.
 * i.e.: '@media breakpoint(sm-to-lg)' expands to '@media (min-width: 30rem) and (max-width: 64rem)'
 * The breakpoints and their ranges are generated from the `@bva/ui-shared/helpers/breakpoints` config file.
 */
const processAtRule = (atRule) => {
  if (!atRule._once) {
    //Prevents rule from being processed twice, which produces malformed media queries.
    atRule.assign({ _once: true });

    const mqOptions = {
      unit: options?.mediaQueryUnit,
    };

    if (atRule.name === 'media') {
      if (atRule.params.includes('breakpoint(')) {
        atRule.params = parseBreakpoint(atRule.params, mqOptions);
      } else {
        return false;
      }
    } else {
      atRule.name = 'media';
      atRule.params = getMediaQueryFromStr(atRule.params, mqOptions);
    }
  }
};

module.exports = {
  processAtRule,
};
