import { formatVarName } from './format-variables';

const DEFAULTS = {
  default: 'DEFAULT',
};

/**
 * Formats the prefix that is attached to the var names with `formatVarName`.
 */
const formatPrefix = (prefix = '', scope = '') => {
  return `${prefix}${prefix ? '-' : ''}${scope}`;
};

/**
 * Takes the token's `name` and its `value` to output an object
 * with properties for CSS Custom Property and value.
 */
const formatToken = (name, value, options = {}) => {
  const varName = formatVarName(name, options);

  return {
    var: `var(${varName})`,
    varName,
    value,
  };
};

/**
 * Hydrates a `mapped` object by formatting each property of `tokens` into
 * a combination of CSS Variables and values.
 */
const mapVars = (tokens, options = {}) => {
  const mapped = {};

  Object.keys(tokens).forEach((currentVar) => {
    if (typeof tokens[currentVar] === 'string' || typeof tokens[currentVar] === 'number') {
      mapped[currentVar] = formatToken(currentVar, tokens[currentVar], options);
    } else if (Array.isArray(tokens[currentVar])) {
      mapped[currentVar] = formatToken(currentVar, tokens[currentVar].join(options.arraySeparator || ', '), options);
    } else {
      mapped[currentVar] = mapVars(tokens[currentVar], {
        ...options,
        prefix: formatPrefix(options.prefix, currentVar),
      });
    }
  });

  return mapped;
};

/**
 * Takes in a `tokens` map and outputs a map of the same tree structure,
 * but with added `var`, `varName`, and `value` properties for each element
 * in the map.
 */
export const toVars = (tokens, options = {}) => {
  return mapVars(tokens, { ...DEFAULTS, ...options });
};
