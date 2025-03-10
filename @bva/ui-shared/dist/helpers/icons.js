'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var icons = require('../tokens/icons.js');

const isExistingIcon =(icon) => {
  if (typeof icon === 'string') {
    return !!icons.icons[icon.trim()];
  }

  return false;
};

const getViewBox = (icon, override) => {
  return override || (isExistingIcon(icon) ? (icons.icons[icon].viewBox) : undefined);
};

const getPaths = (icon) => {
  if (isExistingIcon(icon)) {
    return icons.icons[icon].paths;
  } else {
    return Array.isArray(icon) ? icon : [icon];
  }
};

const getFillPathURL = (coverage = 1) => {
  const fillPathUrl = (index) => `url(#${index})`;

  return coverage === 1 ? '' : fillPathUrl(coverage);
};

const getSymbol = (icon = '') => {
  if (icon.startsWith('#') && !isExistingIcon(icon)) {
    return icon;
  }

  return undefined;
};

exports.getFillPathURL = getFillPathURL;
exports.getPaths = getPaths;
exports.getSymbol = getSymbol;
exports.getViewBox = getViewBox;
exports.isExistingIcon = isExistingIcon;
