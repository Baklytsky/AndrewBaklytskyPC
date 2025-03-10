import { breakpoints, sortedBreakpointKeys } from '../tokens/breakpoints';

/**
 * Gets a min/max-width ready breakpoint value for use within a template.
 * @param  {[String]} size     Size name. Examples: 'xs', 'sm', 'lg'
 * @param  {[String]} type     'px' or 'rem'
 * @param  {Boolean} useMaxWidth  If true, substracts the `breakpoint.unit` value to the target breakpoint.
 * @return {[String]}          Concatenated string name of the target breakpoint value.
 */
export const getBreakpoint = (size, type, useMaxWidth, rawValue) => {
  let displayUnit = rawValue ? '' : type;
  let unitAdjustment = useMaxWidth ? -breakpoints[type].unit : 0;

  return `${(breakpoints[type][size] ? (breakpoints[type][size] + unitAdjustment) : size)}${displayUnit}`;
};

export const getRemBreakpoint = (size, useMaxWidth, rawValue) => {
  return getBreakpoint(size, 'rem', useMaxWidth, rawValue);
};

export const getPxBreakpoint = (size, useMaxWidth, rawValue) => {
  return getBreakpoint(size, 'px', useMaxWidth, rawValue);
};

/**
 * Returns a formatted media query that can be used on the client-side.
 * This is useful when combined with the `window.matchMedia()` method.
 * @param  {String | Object} range   [
 *                                     * A String with a breakpoint name that matches `breakpoints`, outputs a max-width.
 *                                     * An Object with either a `max` or `min` property, or both. Outputs a min, max, or range width.
 *                                   ]
 * @param  {Object} options [description]
 * @return {String}         [description]
 */
export const getMediaQuery = (range, options = {}) => {
  const unit = options.unit || 'rem';

  if (typeof range === 'string' || typeof range === 'number') {
    return getMediaQueryFromStr(range, options);
  } else if (typeof range === 'object') {
    const mediaQueries = [];

    Object.keys(range).forEach((key) => {
      if (range[key]) {
        mediaQueries.push(`(${key}-width: ${getBreakpoint(range[key], unit, key === 'max')})`);
      }
    });

    return mediaQueries.join(' and ');
  }
};

/**
 * Returns the left and right edges of a provided `query`,
 * where the `needle` dictates which side is which.
 */
const _getEdgesFromStr = (query, needle) => {
  const needleIndex = query.indexOf(needle);

  return {
    left: query.slice(0, needleIndex),
    right: query.slice(needleIndex + needle.length),
  };
};

/**
 * Outputs a media-query range using strings.
 * Example: `getMediaQueryFromStr('sm-to-lg')` => '(min-width: 30rem) and (max-width: 64rem)'.
 * This is equivalent to calling `getMediaQuery({ min: 'sm', max: 'lg' })`.
 */
export const getMediaQueryFromStr = (query, options) => {
  const range = {};

  if (typeof query === 'number') {
    query = query.toString();
  }

  if (query.includes('-to-')) {
    const edges = _getEdgesFromStr(query, '-to-');

    range.min = edges.left;
    range.max = edges.right;
  } else if (query.includes('-max')) {
    const edges = _getEdgesFromStr(query, '-max');

    range.max = edges.left;
  } else {
    range.min = query;
  }

  return getMediaQuery(range, options);
};

/**
 * Takes a `config` array or object and returns a sorted list of breakpoints
 * by comparing the object keys to the `sortedBreakpointKeys` array.
 */
export const getApplicableBreakpoints = (config) => {
  //If an array is provided, respect the order and return as-is.
  if (Array.isArray(config)) {
    return config;
  }

  //Otherwise try to match against the sorted breakpoint list.
  //This however only supports single breakpoint values, i.e. non-ranges.
  return sortedBreakpointKeys.reduce((result, item) => {
    if (Object.keys(config).includes(item)) {
      result.push({ [item]: config[item] });
    }

    return result;
  }, []);
};

/**
 * Returns the prop value that applies to the current breakpoint.
 * @param  {[Array]} config [An array of `key: value` pairs where the keys are the breakpoint names and the value is the prop value to apply when the given breakpoint is active.]
 */
export const getPerBreakpointPropValue = (config) => {
  for (let i = config.length - 1; i >= 0; i--) {
    const currentItem = config[i];
    const breakpointName = Object.keys(currentItem)[0];

    if (typeof window !== 'undefined' && window.matchMedia(getMediaQueryFromStr(breakpointName)).matches) {
      return currentItem[breakpointName];
    }
  }
};

/**
 * Returns a range (min -> max) between the breakpoint key at `currentIndex`
 * and the breakpoint key at `endIndex`.
 */
const _getBreakpointRanges = (currentIndex = 0, endIndex = 0, unit) => {
  const result = {};
  const currentKey = sortedBreakpointKeys[currentIndex];

  for (let i = endIndex; i >= currentIndex + 1; i--) {
    const nextKey = sortedBreakpointKeys[i];

    result[`${currentKey}-to-${nextKey}`] = {
      min: getBreakpoint(currentKey, unit),
      max: getBreakpoint(nextKey, unit, true),
    };
  }

  return result;
};

/**
 * Returns all of the possible breakpoint combinations from the configured `breakpoints` tokens.
 * The result is an object that's sorted by the given order of `sortedBreakpointKeys`:
 * min-width: From smallest to largest,
 * max-width: From largest to smallest,
 * ranges: From smallest to largest at the top level, and then from widest to narrowest within each "bucket".
 */
export const getAllBreakpoints = ({ unit = 'rem', max = true, ranges = true } = {}) => {
  const result = {
    min: {},
    max: {},
    range: {},
  };
  const breakpointsLen = sortedBreakpointKeys.length - 1;

  sortedBreakpointKeys.forEach((key, keyIndex) => {
    //Get the key off the opposite end of the array.
    //This prevents adding an extra loop.
    const maxWidthKey = sortedBreakpointKeys[breakpointsLen - keyIndex];

    //Skip unit breakpoints
    if (breakpoints[unit][key] > 1) {
      result.min[key] = getBreakpoint(key, unit);

      if (ranges) {
        result.range = {
          ...result.range,
          ..._getBreakpointRanges(keyIndex, breakpointsLen, unit)
        };
      }
    }

    if (max && breakpoints[unit][maxWidthKey] > 1) {
      result.max[`${maxWidthKey}-max`] = {
        max: getBreakpoint(maxWidthKey, unit, true)
      };
    }
  });

  return result;
};
