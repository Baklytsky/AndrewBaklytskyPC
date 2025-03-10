'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resolveConfig = require('../resolveConfig.js');

const { theme, options } = resolveConfig.getCustomConfig();

const REM_CONVERSION = options?.remConversion || 16;
const EM_CONVERSION = options?.emConversion || 16;

const _breakpoints = {
  'unit': 1,
  'min': 1,
  'xs'  : 320,
  'sm'  : 480,
  'md'  : 768,
  'lg'  : 1025,
  'xl'  : 1240,
  '2xl' : 1440,
};

/**
 * Defines the breakpoints for the library.
 */
const breakpoints = {
  px: { ..._breakpoints, ...theme?.breakpoints },
};

/**
 * Returns a breakpoint keys array sorted in ascending order (by breakpoint value).
 * This utility is useful for generating dynamic breakpoint-specific prop configurations.
 */
const _sortBreakpoints = () => {
  return Object.keys(breakpoints.px).sort((a, b) => {
    return breakpoints.px[a] - breakpoints.px[b];
  });
};

const sortedBreakpointKeys = _sortBreakpoints();

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

exports.EM_CONVERSION = EM_CONVERSION;
exports.REM_CONVERSION = REM_CONVERSION;
exports.breakpoints = breakpoints;
exports.sortedBreakpointKeys = sortedBreakpointKeys;
