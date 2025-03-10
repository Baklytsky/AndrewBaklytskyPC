import { getBreakpoint } from './breakpoints';
import { stripUnit, getUnit } from './units';

/**
 * Returns a matching breakpoint from the `$breakpoints-map` if any is found.
 * Otherwise returns the provided `val`.
 */
const getBreakpointValue = (val, unit = 'rem') => {
  if (typeof val === 'number') {
    return val;
  }

  return getBreakpoint(val, unit);
}

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
export const fluidType = (sizeMin, sizeMax, vmin = 'md', vmax = '2xl') => {
  const minUnit = getUnit(sizeMin);
  const maxUnit = getUnit(sizeMax);

  //Attempt to grab an existing breakpoint if the provided values are non-numeric.
  const minBreakpoint = getBreakpointValue(vmin, minUnit);
  const maxBreakpoint = getBreakpointValue(vmax, maxUnit);

  const vminUnit = getUnit(minBreakpoint);
  const vmaxUnit = getUnit(maxBreakpoint);

  //Ensure all units are the same, since otherwise the math would be all wrong.
  if (vminUnit === vmaxUnit && vminUnit === minUnit && vminUnit === maxUnit) {
    const sizeDiff = stripUnit(sizeMax) - stripUnit(sizeMin);
    const breakpointDiff = stripUnit(maxBreakpoint) - stripUnit(minBreakpoint);

    //Calculates a pixel value to transition smoothly between `sizeMin` and `sizeMax`.
    const targetFontSize = `calc(${sizeMin} + ${sizeDiff} * ((100vw - ${minBreakpoint}) / ${breakpointDiff}))`;

    return `clamp(${sizeMin}, ${targetFontSize}, ${sizeMax})`;
  }
}
