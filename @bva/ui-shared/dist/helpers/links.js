'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Ensures the link is returned formatted as an Object.
 */
const getFormattedLink = (link) => {
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
const getLinks = (linkList, singleLink) => {
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
const getFilteredLinks = (linkList, include) => {
  const links = getLinks(linkList);

  return links.filter(current => !!current[include]);
};

/**
 * Returns the first link object in the `linkList` Array that has a `.link` property.
 * If nothing is found, returns null.
 */
const getMainLink = (linkList) => {
  return linkList.find((currentLink) => {
    return currentLink && currentLink.link;
  });
};

/**
 * Returns true when the provided `url` contains a `'//'`,
 * i.e. "https://..."
 */
const getIsAbsoluteURL = (url) => {
  return (typeof url === 'string' && url.search(/(^\/|^#)/g) === -1);
};

exports.getFilteredLinks = getFilteredLinks;
exports.getFormattedLink = getFormattedLink;
exports.getIsAbsoluteURL = getIsAbsoluteURL;
exports.getLinks = getLinks;
exports.getMainLink = getMainLink;
