const parser = require('postcss-value-parser');
const getArguments = require('./getArguments');
const { getToken } = require('@bva/ui-shared/dist/helpers');

/**
 * Parse a result string to find a token.
 *
 * @param {string} result
 *   The string to parse.
 *
 * @return {string}
 *   A string suitable to replace the result.
 */
module.exports = (result, stringify = true) => {
  let foundToken;

  const parsedValue = parser(result).walk(node => {
    const token = getArguments(node, 'token');

    if (token) {
      foundToken = getToken(token, 'var');

      node.type = 'word';
      node.value = foundToken;
    }
  });

  return stringify ? parsedValue.toString() : foundToken;
};
