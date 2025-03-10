
/**
 * Retrieves the SRC/URL from a given `media` object.
 * If a `property` is provided, searches for said
 * property name within the `media` object.
 */
export const getMediaSRC = (media, property) => {
  if (typeof media === 'string') {
    return media;
  } else if (media) {
    return media[property] || media.src || media.url || media;
  }

  return null;
};

export const getClickPosition = (el, screenX, screenY) => {
  const bounds = el.getBoundingClientRect();

  return {
    x: (screenX - bounds.x) / bounds.width,
    y: (screenY - bounds.y) / bounds.height,
  };
};

/**
 * Updates the scroll position of a given `container` by using
 * a `position` object.
 */
export const setZoomScrollPosition = (container, position) => {
  if (position && position.x && position.y) {
    const scrollWidth = container.scrollWidth;
    const scrollHeight = container.scrollHeight;
    const scrollPosX =
      scrollWidth * position.x - window.innerWidth / 2;
    const scrollPosY =
      scrollHeight * position.y - window.innerHeight / 2;

    container.scrollTo(scrollPosX, scrollPosY);
  }
};

/**
 * Updates the zoom panel by detecting the aspect ratio difference
 * between the current `window` and the provided media dimensions.
 */
export const getZoomLayoutClasses = (mediaWidth, mediaHeight) => {
  const windowRatio = window.innerWidth / window.innerHeight;
  const mediaRatio = mediaWidth / mediaHeight;

  if (mediaRatio >= windowRatio) {
    return 'ra-zoom__image--expand-height';
  }

  return 'ra-zoom__image--expand-width';
};
