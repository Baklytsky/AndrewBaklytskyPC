import { invertFocalPoint, getInvertedOffsetVars } from './inversion';

export const getTagDimensions = (el) => {
  if (el) {
    const { clientHeight, clientWidth } = el;

    return { clientHeight, clientWidth };
  } else {
    return { clientHeight: 0, clientWidth: 0 };
  }
};

/**
 * Gets CSS vars and position styles for Spatial Tagging Product Info overlay
 * @param {Object} options
 * @returns {Object}
 */
export const getSpatialPopupOffset = ({tagDimensions, offset, position}) => {
  const { x: offsetX, y: offsetY } = offset;
  const { x: posX, y: posY } = position;
  const { clientHeight, clientWidth } = tagDimensions;
  
  //If either value is negative we want to calc our offset with all negative numbers
  const yAdjustment = offsetY >= 0 ? 1 : -1;
  const xAdjustment = offsetX >= 0 ? 1 : -1;
  const calculatedYOffset = ((clientHeight / 2) * yAdjustment) + offsetY;
  const calculatedXOffset = ((clientWidth / 2) * xAdjustment) + offsetX;

  let buttonVars = {
    '--overlay-offsetX': `${calculatedXOffset}px`,
    '--overlay-offsetY': `${calculatedYOffset}px`,
  };

  const { x, y } = invertFocalPoint({
    x: calculatedXOffset,
    y: calculatedYOffset,
  });

  buttonVars = { ...buttonVars, ...getInvertedOffsetVars(x, y) };

  return {
    ...buttonVars,
    '--overlay-top': `${posY}%`,
    '--overlay-left': `${posX}%`,
  };
}
