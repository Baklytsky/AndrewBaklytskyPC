'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var breakpoints = require('./breakpoints.js');
var units = require('./units.js');

const getSortedSrcSet = (srcSet) => {
  const srcSetArray = [ ...srcSet ];

  srcSetArray.sort((setA, setB) =>
    setA.width && setB.width
      ? Number.parseInt(setA.width) - Number.parseInt(setB.width)
      : Number.parseInt(setA.resolution) - Number.parseInt(setB.resolution)
  );

  return srcSetArray;
};

const formatSrcSet = (srcSet) => {
  return srcSet.reduce((str, item) =>
    `${formatSrcPrefix(str)}${item.src} ${formatSrcDescriptor(item)}`,
  ''
  );
};

const formatSizes = (srcSet) => {
  const hasBreakpoints = srcSet.every((item) => item.breakpoint && item.width);

  if (!hasBreakpoints) {
    return null;
  }

  return srcSet.reduce((str, item) =>
    `${formatSrcPrefix(str)}${formatBreakpoint(item.breakpoint)}${units.formatDimension(item.width)}`,
  ''
  );
};

const formatResolution = (resolution) => {
  return ('' + resolution).endsWith('x') ? resolution : `${resolution}x`;
};

const formatBreakpoint = (breakpoint, fallback = '') => {
  return breakpoint ? breakpoints.getMediaQuery(breakpoint, { unit: 'px' }) : fallback;
};

const formatSrcDescriptor = (item) => {
  return item.width
    ? `${Number.parseInt(item.width) || ''}w`
    : formatResolution(item.resolution);
};

const formatSrcPrefix = (prefix) => {
  return prefix ? `${prefix}, ` : '';
};

const getHasWidthOrRes = (srcSet) => {
  return srcSet.every((item) => item.width || item.resolution);
};

const getMediaVariables = (config, options) => {
  const varsObject = {};

  const varsArray = Object.keys(config).map(key => {
    if (!config[key]) {
      return false;
    }

    const dimension = options.useAspectRatio ?
      units.stripUnit(config[key]) :
      units.formatDimension(config[key]);
    const varName = `--media-${key}`;

    //Populate a separate object to be returned when needed.
    varsObject[varName] = dimension;

    return `${varName}: ${dimension}`;
  });

  return options.stringify ? varsArray.filter(Boolean).join(';') : varsObject;
};

/**
 * Returns a CSS-ready url property value.
 */
const getCSSMediaURL = (src) => {
  return (src && !src?.startsWith('url(')) ? `url(${src})` : src;
};

exports.formatBreakpoint = formatBreakpoint;
exports.formatResolution = formatResolution;
exports.formatSizes = formatSizes;
exports.formatSrcDescriptor = formatSrcDescriptor;
exports.formatSrcPrefix = formatSrcPrefix;
exports.formatSrcSet = formatSrcSet;
exports.getCSSMediaURL = getCSSMediaURL;
exports.getHasWidthOrRes = getHasWidthOrRes;
exports.getMediaVariables = getMediaVariables;
exports.getSortedSrcSet = getSortedSrcSet;
