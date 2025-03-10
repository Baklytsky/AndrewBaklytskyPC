
/**
 * Ensures the link is returned formatted as an Object.
 */
export const getFormattedLink = (link) => {
  if (link) {
    const linkObject =
      typeof link === 'string'
        ? { link: link }
        : { ...link };

    return {
      ...linkObject,
    };
  }

  return null;
};

/**
 * Ensures that links are returned as an Array.
 * If `singleLink` is provided, prepends it to the returned Array.
 */
export const getLinks = (linkList, singleLink) => {
  const links = Array.isArray(linkList)
    ? [...linkList]
    : (linkList && Object.keys(linkList).length ? [linkList] : []);

  if (singleLink) {
    links.unshift(singleLink);
  }

  return links;
};

/**
 * For a given `linkList`, filters out items that do not have property matching the `include` argument.
 */
export const getFilteredLinks = (linkList, include) => {
  const links = getLinks(linkList);

  return links.filter(current => !!current[include]);
};

/**
 * Returns the first link object in the `linkList` Array that has a `.link` property.
 * If nothing is found, returns null.
 */
export const getMainLink = (linkList) => {
  return linkList.find((currentLink) => {
    return currentLink && currentLink.link;
  });
};

/**
 * Returns true when the provided `url` contains a `'//'`,
 * i.e. "https://..."
 */
export const getIsAbsoluteURL = (url) => {
  return (typeof url === 'string' && url.search(/(^\/|^#)/g) === -1);
};
