'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var formatVariables = require('./format-variables.js');

const INVERTED_CONSTANTS = {
  inverted: 'inverted',
  horizontal: 'inverted--horizontally',
  vertical: 'inverted--vertically',
};

/**
 * Checks it a targetEl overflows or spills outside of a containerEl and then returns the appropriate 
 * CSS class so the taragetEl is "contained" in the contailerEl
 * @param {HTMLElement} containerEl
 * @param {HTMLElement} targetEl
 * @returns {String} class name for handling inversion
 */
const getInvertedClass = (containerEl, targetEl) => {
  const containerRect = containerEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  const exceedsYBound = targetRect.bottom > containerRect.bottom;
  const exceedsXBound = targetRect.right > containerRect.right;
  const exceedsBounds = exceedsYBound && exceedsXBound;

  //Check if the target el already has an inversion class.
  //This prevents an edge case where the popup is stuck in a constant position change,
  //when an edge popup is visible and the viewport is resized.
  const isYInverted = targetEl.classList.contains(INVERTED_CONSTANTS.vertical);
  const isXInverted = targetEl.classList.contains(INVERTED_CONSTANTS.horizontal);

  if (exceedsBounds || (exceedsXBound && isYInverted) || (exceedsYBound && isXInverted)) {
    return INVERTED_CONSTANTS.inverted;
  } else if (exceedsXBound) {
    return INVERTED_CONSTANTS.horizontal;
  } else if (exceedsYBound) {
    return INVERTED_CONSTANTS.vertical;
  }

  return null;
};

/**
 * Creates CSS fromatted vars for inverted transform
 * @param {Number} height 
 * @param {Number} width 
 * @returns {Object} CSS Vars
 */
const getInvertedOffsetVars = (height, width) => {
  return formatVariables.getFormattedVars(
    {
      yoffset: `${height}px`,
      xoffset: `${width}px`,
    },
    'inversion'
  );
};

/**
 * Takes an X,Y coordicante and inverts it. Swaps them and makes negative or positive
 * @param {Object} focalPoint {x, y} 
 * @returns {Object} focalPoint {x = y, y = x} 
 */
const invertFocalPoint = ({x, y}) => {
  let invertedFocalPoint = {
    x: 0,
    y: 0,
  };
  if ((x > 0 && y > 0) || (x < 0 && y < 0)) {
    //if both positive or negative then can just do a swap
    invertedFocalPoint.x = y;
    invertedFocalPoint.y = x;
  } else {
    //If one of the values is negative and other positive need to invert those too
    invertedFocalPoint.x = y * -1;
    invertedFocalPoint.y = x * -1;
  }

  return invertedFocalPoint;
};

exports.INVERTED_CONSTANTS = INVERTED_CONSTANTS;
exports.getInvertedClass = getInvertedClass;
exports.getInvertedOffsetVars = getInvertedOffsetVars;
exports.invertFocalPoint = invertFocalPoint;
