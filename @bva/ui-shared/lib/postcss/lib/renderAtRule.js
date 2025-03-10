const { Declaration } = require('postcss');

const getDeclaration = (name, value) => {
  return new Declaration({
    prop: name,
    value,
  });
};

/**
 * Returns a declarations array by flattening each property in the `tokens` object.
 * Each item in the array is of type `Declaration`, where its prop is the token's `varName` name,
 * and its value is the token's `value`.
 */
const getDeclarations = (tokens) => {
  let declarations = [];

  if (typeof tokens === 'object') {
    Object.keys(tokens).forEach((currentVar) => {
      if (tokens[currentVar].value && tokens[currentVar].varName) {
        declarations.push(getDeclaration(tokens[currentVar].varName, tokens[currentVar].value));
      } else {
        const nested = getDeclarations(tokens[currentVar]);

        declarations = declarations.concat(nested);
      }
    });
  }

  return declarations;
};

module.exports = {
  getDeclarations,
};
