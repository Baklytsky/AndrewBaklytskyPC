'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Returns a Numbers Array starting from `min` and ending at `max`.
 * @param  {Number} min  [The starting number for the list.]
 * @param  {Number} max  [The ending number for the list.]
 * @param  {Number} step [The increment value between each number in the list, until it reaches `max`].
 * @return {Array}
 */
const getNumberedList = (min = 0, max = 50, step = 1) => {
  //Prevents infinite loops if for some reason `step` is not present or provided as 0 or a falsey value.
  step = step || 1;

  const maxMod = max % step;
  const numbersArray = [min];
  let currentItem = min;

  //Sets max to the "true" max in case the provided max value is not divisible by the step.
  max = maxMod > 0 ? max - maxMod : max;

  while (currentItem < max) {
    currentItem += step;

    numbersArray.push(currentItem);
  }

  return numbersArray;
};

/**
 * Returns a Number that is constrained between a `min` and a `max`.
 * Returns `min` when `value` is inferior to it.
 * Returns `max` when `value` exceeds it.
 */
const getConstrainedValue = (value, min, max) => {
  const parsedValue = parseFloat(value);
  const isUnderMin = parsedValue < min || isNaN(parsedValue);
  const isOverMax = parsedValue > max;

  return isUnderMin ? min : isOverMax ? max : parsedValue;
};

/**
 * Returns the label from a selected option,
 * where `target` is a `<select>` DOM node.
 */
const getSelectedOptionLabel = (target) => {
  if (target && target.options && target.options.length > 0) {
    return target.selectedOptions && target.selectedOptions[0]
      ? target.selectedOptions[0].label
      : target.options[0].label;
  }

  return null;
};

exports.getConstrainedValue = getConstrainedValue;
exports.getNumberedList = getNumberedList;
exports.getSelectedOptionLabel = getSelectedOptionLabel;
