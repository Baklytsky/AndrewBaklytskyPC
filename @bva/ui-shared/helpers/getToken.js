import * as tokens from '../tokens/index';

/**
 * Returns the value of a `token` reference.
 * In the case the `token` is a nested object, returns an array of values. Example:
 *   token => colors.primary => ['#hex', '#hex', '#hex'];
 *
 * @param {string} defaultProp
 * The property to access from the `token` reference.
 */
export const getTokenList = (token, defaultProp = 'var') => {
  if (token[defaultProp]) {
    return [token[defaultProp]];
  } else {
    return Object.keys(token).map(current => {
      return token[current][defaultProp];
    });
  }
};

/**
 * Retrieve the token value from the tokens object.
 *
 * @param {string} tokenID
 *   The token name, using dot notation for nested values. Some examples:
 *     blue
 *     colors.blue
 *     colors.brand.blue
 * @param {object} tokens
 *   The object of tokens to search within.
 *
 * @return {string|undefined}
 *   The token value or undefined if it wasn't found.
 */
export const getToken = (tokenID, defaultProp = 'var') => {
  // Attempt to get the token value by splitting the string.
  let token = tokenID.split('.').reduce((o, i) => o ? o[i] : undefined, tokens);

  //If the token contains a property with the value of `defaultProp`, use it.
  if (token && token[defaultProp]) {
    token = token[defaultProp];
  }

  if (!token) {
    return undefined;
  }

  return token;
};
