'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var breakpoints = require('./breakpoints.js');
var units = require('./units.js');

/**
 * Returns a matching breakpoint from the `$breakpoints-map` if any is found.
 * Otherwise returns the provided `val`.
 */
const getBreakpointValue = (val, unit = 'rem') => {
  if (typeof val === 'number') {
    return val;
  }

  return breakpoints.getBreakpoint(val, unit);
};

/**
 * Generates font sizes that automatically respond to viewport resizing.
 * These help accommodate text in ways that would otherwise require 3 or more breakpoint-specific font-size definitions.
 *
 * @param  {Numeric} sizeMin  [Minimum font size.]
 * @param  {Numeric} sizeMax  [Maximum font size.]
 * @param  {String or Numeric} vmin: Default: md. [Minimum viewport width.]
 * @param  {String or Numeric} vmax: Default: xl. [Maximum viewport width.]
 * @return {Function}          [A CSS clamp() function with the two ends set to sizeMin and sizeMax respectively.]
 *
 * Requirements: All units passed must be of the same type, i.e. all px, or all rem, etc.
 */
const fluidType = (sizeMin, sizeMax, vmin = 'md', vmax = '2xl') => {
  const minUnit = units.getUnit(sizeMin);
  const maxUnit = units.getUnit(sizeMax);

  //Attempt to grab an existing breakpoint if the provided values are non-numeric.
  const minBreakpoint = getBreakpointValue(vmin, minUnit);
  const maxBreakpoint = getBreakpointValue(vmax, maxUnit);

  const vminUnit = units.getUnit(minBreakpoint);
  const vmaxUnit = units.getUnit(maxBreakpoint);

  //Ensure all units are the same, since otherwise the math would be all wrong.
  if (vminUnit === vmaxUnit && vminUnit === minUnit && vminUnit === maxUnit) {
    const sizeDiff = units.stripUnit(sizeMax) - units.stripUnit(sizeMin);
    const breakpointDiff = units.stripUnit(maxBreakpoint) - units.stripUnit(minBreakpoint);

    //Calculates a pixel value to transition smoothly between `sizeMin` and `sizeMax`.
    const targetFontSize = `calc(${sizeMin} + ${sizeDiff} * ((100vw - ${minBreakpoint}) / ${breakpointDiff}))`;

    return `clamp(${sizeMin}, ${targetFontSize}, ${sizeMax})`;
  }
};

exports.fluidType = fluidType;
