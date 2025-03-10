const parser = require('postcss-value-parser');
const getArguments = require('./getArguments');
const { getMediaQueryFromStr } = require('@bva/ui-shared/dist/helpers');

/**
 * Parse a result string to find a breakpoint.
 *
 * @param {string} result
 *   The string to parse.
 *
 * @return {string}
 *   A string suitable to replace the result.
 */
module.exports = (result, options) => {
  const parsedValue = parser(result).walk(node => {
    const breakpoint = getArguments(node, 'breakpoint');

    if (breakpoint) {
      node.type = 'word';
      node.value = getMediaQueryFromStr(breakpoint, options);
    }
  });

  return parsedValue.toString();
};
