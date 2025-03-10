'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var units = require('./units.js');

/**
 * Returns an array with the values of vertically-affecting CSS properties,
 * such as padding and border, in the context of the box-size of a given `el`.
 */
const getVerticalBounds = (el) => {
  const computedStyles = getComputedStyle(el);
  const pTop = computedStyles.getPropertyValue('padding-top');
  const pBottom = computedStyles.getPropertyValue('padding-bottom');
  const bTop = computedStyles.getPropertyValue('border-top-width');
  const bBottom = computedStyles.getPropertyValue('border-bottom-width');

  return [
    parseInt(units.stripUnit(pTop)),
    parseInt(units.stripUnit(pBottom)),
    parseInt(units.stripUnit(bTop)),
    parseInt(units.stripUnit(bBottom)),
  ];
};

/**
 * Flattens and sums the list of values returned by `getVerticalBounds(el)`.
 */
const getTotalVerticalBounds = (el) => {
  const bounds = getVerticalBounds(el);
  let  boundsSum = 0;

  bounds.forEach(current => (boundsSum += current));

  return boundsSum;
};

const getElementHeight = (el) => {
  return el.scrollHeight;
};

const setElementHeight = (el, inreaseBy = 0) => {
  el.style.height = `${getElementHeight(el) + inreaseBy}px`;
};

const resetElementHeight = (el) => {
  el.style.height = '';
};

/**
 * Returns TRUE when the `el` HTMLElement is scrollable.
 */
const getHasScroll = (el) => {
  return el.scrollWidth > el.clientWidth;
};

/**
 * Returns the sum of the `el` HTMLElement child nodes that are overflowing.
 */
const getOverflownChildrenCount = (el, offsetX = 0) => {
  return [].reduce.call(el.childNodes, (result, current) => {
    if (current.offsetLeft + current.clientWidth + offsetX > el.clientWidth) {
      result++;
    }

    return result;
  }, 0);
};

exports.getElementHeight = getElementHeight;
exports.getHasScroll = getHasScroll;
exports.getOverflownChildrenCount = getOverflownChildrenCount;
exports.getTotalVerticalBounds = getTotalVerticalBounds;
exports.getVerticalBounds = getVerticalBounds;
exports.resetElementHeight = resetElementHeight;
exports.setElementHeight = setElementHeight;
