'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

//Set a default set of breakpoints names to loop through when generating CSS Variables.
const BREAKPOINTS = ['sm', 'md', 'lg'];

const DEFAULTS = {
  default: 'sm',
};

/**
 * Outputs a formatted CSS Custom property name.
 */
const formatVarName = (name, options) => {
  //Do nothing if the variable name is already formatted.
  if (name?.startsWith('--')) {
    return name;
  }

  const useName = options.default !== name;

  return `--${options.prefix}${useName ? '-' : ''}${useName ? name : ''}`;
};

/**
 * Formats a standard media query `scope` for use with CSS Variables.
 */
const formatVarScope = (scope = '', defaultScope) => {
  return (scope && scope !== defaultScope ? `-${scope}` : '').toLowerCase();
};

/**
 * Output a formatted CSS Custom Property key/value pair for a given property name and scope.
 */
const formatVarByScope = (name = 'custom-var', scope, options = {}) => {
  return `--${name}${formatVarScope(scope, options.default)}`;
};

/**
 * Searches a given `map` for a `name` property.
 * Returns the property name or undefined if none is found.
 */
const getVarValueFromMap = (name = '', map = {}) => {
  return map[name]?.var || map[name] || name || undefined;
};

/**
 * Processes a breakpoint configuration `config` to provide an object with Custom CSS properties.
 * These properties are individually scoped for each breakpoint defined in the `BREAKPOINTS` array.
 * @param  {String, Number, Array, Object} config  [description]
 * @param  {String} varName [The variable name to use as part of the returned Custom CSS Property Object.]
 * @param  The `options.map` property allows retrieving property values off of an existing reference object.
 */
const getFormattedVars = (config = {}, varName, options = {}) => {
  const result = {};

  options = { ...DEFAULTS, ...options };

  if (typeof config === 'string' || typeof config === 'number') {
    result[formatVarByScope(varName, BREAKPOINTS[0], options)] = getVarValueFromMap(config, options.map);
  } else if (Array.isArray(config)) {
    config.forEach((value, index) => {
      result[formatVarByScope(varName, BREAKPOINTS[index], options)] = getVarValueFromMap(value, options.map);
    });
  } else {
    for (let key in config) {
      result[formatVarByScope(varName, key, options)] = getVarValueFromMap(config[key], options.map);
    }
  }

  return result;
};

/**
 * Returns an array of applicable scopes (i.e. sm, md, lg) for a given `config`.
 * This allows for styling components per-breakpoints while avoiding CSS Variable leaks.
 */
const getAppliedScope = (config, options = {}) => {
  const result = [];
  const defaults = {
    separator: '-',
    defaultScope: '*',
  };

  options = { ...defaults, ...options };

  if (typeof config === 'string' || typeof config === 'number') {
    result.push(`${options.separator}${options.defaultScope}`);
  } else if (Array.isArray(config)) {
    config.forEach((value, index) => {
      result.push(`${options.separator}${BREAKPOINTS[index]}`);
    });
  } else {
    for (let key in config) {
      if (config[key]) {
        result.push(`${options.separator}${key}`);
      }
    }
  }

  return result.length > 0 ? result : undefined;
};

/**
 * Takes a CSS Var `map` and returns an array of key:value string pairs, i.e.:
 * `['key: value', 'key2: value2', ...]`
 *
 * The `stringify` option formats the output as a concatenated string.
 * This may also prevent SSR FOUC.
 */
const getCSSVarsFromMap = (map, { prefix, stringify = true } = {}) => {
  const result = [];

  for (let key in map) {
    result.push(`${formatVarName(key, { prefix })}: ${map[key]}`);
  }

  return stringify ? result.join(';') : result;
};

/**
 * This utility is mainly used for theme parsing and rendering.
 * Recursively parses a `map` that is structured by "groups" or "buckets", i.e.:
 * `{ colors: {...}, typography: {...}, N: {...} }`
 *
 * Returns a string of the merged CSS variables within each "group".
 * The `allowed` array filters out any unwanted "groups".
 */
const getMergedVarGroups = (map = {}, allowed = []) => {
  let result = '';

  if (allowed.length > 0) {
    allowed.forEach(current => {
      const name = current.name || current;
      const prefix = current.prefix;

      if (map[name]) {
        result += getCSSVarsFromMap(map[name], { prefix });
      }
    });
  } else {
    for (let key in map) {
      result += getCSSVarsFromMap(map[key]);
    }
  }

  return result;
};

/**
 * Merges two or more string CSS vars or groups of vars passed as arguments.
 */
function getMergedVars() {
  return [...arguments].filter(Boolean).join(';');
}

const getForegroundVars = (value, valueMD) => {
  return getFormattedVars([value, valueMD], 'component-fg-color');
};

const getBackgroundVars = (value, valueMD) => {
  return getFormattedVars([value, valueMD], 'component-bg-color');
};

exports.formatVarByScope = formatVarByScope;
exports.formatVarName = formatVarName;
exports.formatVarScope = formatVarScope;
exports.getAppliedScope = getAppliedScope;
exports.getBackgroundVars = getBackgroundVars;
exports.getCSSVarsFromMap = getCSSVarsFromMap;
exports.getForegroundVars = getForegroundVars;
exports.getFormattedVars = getFormattedVars;
exports.getMergedVarGroups = getMergedVarGroups;
exports.getMergedVars = getMergedVars;
exports.getVarValueFromMap = getVarValueFromMap;
