import { getCustomConfig } from '../resolveConfig';

const { theme, options } = getCustomConfig();

export const REM_CONVERSION = options?.remConversion || 16;
export const EM_CONVERSION = options?.emConversion || 16;

const _reservedBreakpoints = {
  'unit': 1,
  'min': 1, // Deprecated and will be removed.
  'base': 1, // Equals to the root scope. Use `base` instead of `min`.
}

const _defaultBreakpoints = {
  'xs'  : 320,
  'sm'  : 480,
  'md'  : 768,
  'lg'  : 1025,
  'xl'  : 1240,
  '2xl' : 1440,
};

const _breakpoints = {
  ..._defaultBreakpoints,
  ...theme?.breakpoints
};

/**
 * Returns a breakpoint keys array sorted in ascending order (by breakpoint value).
 * This utility is useful for generating dynamic breakpoint-specific prop configurations.
 */
const _getSortedBreakpointKeys = (reference) => {
  return Object.keys(reference).sort((a, b) => {
    return reference[a] - reference[b];
  });
};

/**
 * Ensures that the returned object is in value ascending order.
 */
const _getSortedBreakpoints = (reference) => {
  const result = {};

  _getSortedBreakpointKeys(reference)?.forEach(key => {
    result[key] = reference[key];
  });

  return result;
};

/** Used by PostCSS @variant atRule. This will be replaced with just `breakpoints` in the future. */
export const sortedBreakpoints = _getSortedBreakpoints(_breakpoints);

/**
 * Defines the breakpoints for the library.
 */
export const breakpoints = {
  px: { ..._reservedBreakpoints, ...sortedBreakpoints },
};

export const sortedBreakpointKeys = _getSortedBreakpointKeys(breakpoints.px);

/**
 * Generate new breakpoint types based on a conversion type and unit.
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
function _makeBreakpointType(type, conversion) {
  breakpoints[type] = {};

  for (let key in breakpoints.px) {
    breakpoints[type][key] = breakpoints.px[key] / conversion;
  }
}

_makeBreakpointType('em', EM_CONVERSION);
_makeBreakpointType('rem', REM_CONVERSION);
