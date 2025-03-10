import { stripUnit } from './units';

/**
 * Returns an array with the values of vertically-affecting CSS properties,
 * such as padding and border, in the context of the box-size of a given `el`.
 */
export const getVerticalBounds = (el) => {
  const computedStyles = getComputedStyle(el);
  const pTop = computedStyles.getPropertyValue('padding-top');
  const pBottom = computedStyles.getPropertyValue('padding-bottom');
  const bTop = computedStyles.getPropertyValue('border-top-width');
  const bBottom = computedStyles.getPropertyValue('border-bottom-width');

  return [
    parseInt(stripUnit(pTop)),
    parseInt(stripUnit(pBottom)),
    parseInt(stripUnit(bTop)),
    parseInt(stripUnit(bBottom)),
  ];
};

/**
 * Flattens and sums the list of values returned by `getVerticalBounds(el)`.
 */
export const getTotalVerticalBounds = (el) => {
  const bounds = getVerticalBounds(el);
  let  boundsSum = 0;

  bounds.forEach(current => (boundsSum += current));

  return boundsSum;
};

export const getElementHeight = (el) => {
  return el.scrollHeight;
};

export const setElementHeight = (el, { inreaseBy = 0, height } = {}) => {
  el.style.height = height || `${getElementHeight(el) + inreaseBy}px`;
};

export const resetElementHeight = (el) => {
  el.style.height = '';
};

/**
 * Returns TRUE when the `el` HTMLElement is scrollable.
 */
export const getHasScroll = (el) => {
  return el.scrollWidth > el.clientWidth;
};

/**
 * Returns the sum of the `el` HTMLElement child nodes that are overflowing.
 */
export const getOverflownChildrenCount = (el, offsetX = 0) => {
  return [].reduce.call(el.childNodes, (result, current) => {
    if (current.offsetLeft + current.clientWidth + offsetX > el.clientWidth) {
      result++;
    }

    return result;
  }, 0);
};
