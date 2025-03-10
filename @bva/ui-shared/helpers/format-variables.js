//Set a default set of breakpoints names to loop through when generating CSS Variables.
const BREAKPOINT_PRESETS = ['base', 'md', 'lg'];

/**
 * Outputs a formatted CSS Custom property name.
 */
export const formatVarName = (name, { prefix = '', ...options } = {}) => {
  //Do nothing if the variable name is already formatted.
  if (name?.startsWith('--')) {
    return name;
  }

  const includeName = options.default !== name;

  return `--${prefix}${(prefix && includeName) ? '-' : ''}${includeName ? name : ''}`;
};

/**
 * Formats a standard media query `scope` for use with CSS Variables.
 */
export const formatVarScope = (scope = '', rootScope) => {
  return (scope && scope !== rootScope ? `-${scope}` : '').toLowerCase();
};

/**
 * Output a formatted CSS Custom Property key/value pair for a given property name and scope.
 */
export const formatVarByScope = (name = 'custom-var', scope, options = {}) => {
  return `--${name}${formatVarScope(scope, options.rootScope)}`;
};

/**
 * Searches a given `map` for a `name` property.
 * Returns the property name or undefined if none is found.
 */
export const getVarValueFromMap = (name = '', map = {}) => {
  return map[name]?.var || map[name] || name || undefined;
};

/**
 * Processes a breakpoint configuration `config` to provide an object with Custom CSS properties.
 * These properties are individually scoped for each breakpoint defined in the `BREAKPOINT_PRESETS` array.
 * @param  {String, Number, Array, Object} config  [description]
 * @param  {String} varName [The variable name to use as part of the returned Custom CSS Property Object.]
 * @param  The `options.map` property allows retrieving property values off of an existing reference object.
 */
export const getFormattedVars = (config = {}, varName, options = {}) => {
  const result = {};
  const defaults = {
    rootScope: 'base',
  };

  options = { ...defaults, ...options };

  if (typeof config === 'string' || typeof config === 'number') {
    result[formatVarByScope(varName, BREAKPOINT_PRESETS[0], options)] = getVarValueFromMap(config, options.map);
  } else if (Array.isArray(config)) {
    config.forEach((value, index) => {
      result[formatVarByScope(varName, BREAKPOINT_PRESETS[index], options)] = getVarValueFromMap(value, options.map);
    });
  } else {
    for (let key in config) {
      result[formatVarByScope(varName, key, options)] = getVarValueFromMap(config[key], options.map);
    }
  }

  return result;
};

/**
 * Returns an array of applicable scopes (i.e. base, md, lg) for a given `config`.
 * This allows for styling components per-breakpoints while avoiding CSS Variable leaks.
 */
export const getAppliedScope = (config, options = {}) => {
  const result = [];
  const defaults = {
    separator: '-',
    rootScope: '*',
  };

  options = { ...defaults, ...options };

  if (typeof config === 'string' || typeof config === 'number') {
    result.push(`${options.separator}${options.rootScope}`);
  } else if (Array.isArray(config)) {
    config.forEach((value, index) => {
      result.push(`${options.separator}${BREAKPOINT_PRESETS[index]}`);
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
export const getCSSVarsFromMap = (map, { prefix, stringify = true } = {}) => {
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
export const getMergedVarGroups = (map = {}, { config = {}, allowed = [] } = {}) => {
  const result = [];

  if (allowed.length > 0) {
    allowed.forEach(key => {
      if (map[key]) {
        result.push(getCSSVarsFromMap(map[key], config[key]));
      }
    });
  } else {
    for (let key in map) {
      result.push(getCSSVarsFromMap(map[key], config[key]));
    }
  }

  return result.join(';');
};

/**
 * Merges two or more string CSS vars or groups of vars passed as arguments.
 */
export function getMergedVars() {
  return [...arguments].filter(Boolean).join(';');
}

export const getForegroundVars = (value, valueMD) => {
  return getFormattedVars([value, valueMD], 'component-fg-color');
};

export const getBackgroundVars = (value, valueMD) => {
  return getFormattedVars([value, valueMD], 'component-bg-color');
};
