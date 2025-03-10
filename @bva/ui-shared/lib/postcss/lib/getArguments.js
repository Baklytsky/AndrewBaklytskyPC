const parser = require('postcss-value-parser');

/**
 * Parse a node to look for the a given `fnName` function.
 *
 * @param {object} node
 *   A node as returned by postcss-value-parser.
 *
 * @return {string|boolean}
 *   The parsed function's argument, or false if it's not a function matching `fnName`.
 */
module.exports = (node, fnName = '') => {
  if (node.type !== 'function' || node.value !== fnName) {
    return false;
  }

  // Use the first arg only.
  const arg = node.nodes[0];

  // Allow arg in "string" or "word" format.
  if (!arg || (arg.type !== 'string' && arg.type !== 'word')) {
    throw `Incorrect or missing argument for ${fnName}() function`
  }

  let parsedArg = parser.stringify(arg);

  // Remove quotes from string.
  if (arg.type === 'string') {
    const search = new RegExp(arg.quote, 'g');

    parsedArg = parsedArg.replace(search, "");
  }

  return parsedArg;
};
