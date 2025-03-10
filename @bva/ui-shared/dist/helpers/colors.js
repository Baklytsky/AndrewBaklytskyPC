'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var getToken = require('./getToken.js');

const getColorToken = (colorName) => {
  if (colorName) {
    const matchingColor =
      getToken.getToken(`colors.${colorName}.DEFAULT`, 'var') ||
      getToken.getToken(`colors.${colorName}`, 'var');

    return matchingColor || colorName;
  }

  return null;
};

exports.getColorToken = getColorToken;
