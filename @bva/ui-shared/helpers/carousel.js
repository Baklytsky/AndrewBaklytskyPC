
export const getNavIcons = (isVertical, customIcons) => {
  if (Object.keys(customIcons).length > 0) {
    return customIcons;
  } else if (isVertical) {
    return {
      prev: 'arrow_up',
      next: 'arrow_down',
    };
  }

  return {
    prev: 'arrow_left',
    next: 'arrow_right',
  };
};

export const getNavLocation = (isVertical, customLocation) => {
  if (customLocation) {
    return customLocation;
  } else if (isVertical) {
    return 'vertical';
  }

  return 'auto';
};

/**
 * Return the absolute value of the Y/top position of a given `el`.
 */
const _getAbsTop = (el) => {
  return Math.abs(el.getBoundingClientRect().y);
};

/**
 * Sets the CSS `top` position value on the carousel navigation.
 * This is done by getting the live height and bounds of the carousel components.
 * @param {HTMLELement} referenceEl [A reference DOM element to use for calculations.]
 */
export const setNavigationPosition = (referenceEl, carouselEl, navigationEl) => {
  if (referenceEl.clientHeight !== 0) {
    //If both the reference element and the carousel itself have the same height,
    //then there's no need to adjust navigation programatically. CSS is used instead.
    const hasDifference = carouselEl?.clientHeight !== referenceEl?.clientHeight;
    const topAdjustment = Math.abs(_getAbsTop(carouselEl) - _getAbsTop(referenceEl));

    if (navigationEl) {
      navigationEl.style.top = hasDifference
        ? `${referenceEl.clientHeight / 2 + topAdjustment}px`
        : '';
    }
  }
};

/**
 * Attempts to update the navigation positioning based on a "reference" element,
 * such as an image or a designated `[data-carousel-align-item]` target.
 */
export const requestNavigationAlign = (carouselEl, navigationEl) => {
  const baseSelector = '.ra-carousel-item:not(.swiper-slide-duplicate)';
  const referenceEl = carouselEl.querySelector(
    `${baseSelector} [data-carousel-align-reference], ${baseSelector} img`
  );

  if (referenceEl) {
    //If the reference is an image, wait for load or check if its already loaded before setting the layout updates.
    if (referenceEl instanceof HTMLImageElement && !referenceEl.complete) {
      referenceEl.addEventListener('load', () =>
        setNavigationPosition(referenceEl, carouselEl, navigationEl)
      );
    } else {
      setNavigationPosition(referenceEl, carouselEl, navigationEl);
    }
  }
};

/**
 * Returns a CSS Custom property to be used for calculating a thumbnails carousel height.
 */
export const getThumbnailsHeightVars = (thumbHeight, count, gap) => {
  return {
    '--vertical-carousel-height': `calc((((var(--thumbnails-width) * ${thumbHeight}) + ${gap}px) * ${count}) - ${gap}px)`,
  };
};
