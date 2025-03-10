import { getMediaQuery } from './breakpoints';
import { formatDimension, stripUnit } from './units';

export const getSortedSrcSet = (srcSet) => {
  const srcSetArray = [ ...srcSet ];

  srcSetArray.sort((setA, setB) =>
    setA.width && setB.width
      ? Number.parseInt(setA.width) - Number.parseInt(setB.width)
      : Number.parseInt(setA.resolution) - Number.parseInt(setB.resolution)
  );

  return srcSetArray;
};

export const formatSrcSet = (srcSet) => {
  return srcSet.reduce((str, item) =>
    `${formatSrcPrefix(str)}${item.src} ${formatSrcDescriptor(item)}`,
  ''
  );
};

export const formatSizes = (srcSet) => {
  const hasBreakpoints = srcSet.every((item) => item.breakpoint && item.width);

  if (!hasBreakpoints) {
    return null;
  }

  return srcSet.reduce((str, item) =>
    `${formatSrcPrefix(str)}${formatBreakpoint(item.breakpoint)}${formatDimension(item.width)}`,
  ''
  );
};

export const formatResolution = (resolution) => {
  return ('' + resolution).endsWith('x') ? resolution : `${resolution}x`;
};

export const formatBreakpoint = (breakpoint, fallback = '') => {
  return breakpoint ? getMediaQuery(breakpoint, { unit: 'px' }) : fallback;
};

export const formatSrcDescriptor = (item) => {
  return item.width
    ? `${Number.parseInt(item.width) || ''}w`
    : formatResolution(item.resolution);
};

export const formatSrcPrefix = (prefix) => {
  return prefix ? `${prefix}, ` : '';
};

export const getHasWidthOrRes = (srcSet) => {
  return srcSet.every((item) => item.width || item.resolution);
};

export const getMediaVariables = (config, options) => {
  const varsObject = {};

  const varsArray = Object.keys(config).map(key => {
    if (!config[key]) {
      return false;
    }

    const dimension = options.useAspectRatio ?
      stripUnit(config[key]) :
      formatDimension(config[key]);
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
export const getCSSMediaURL = (src) => {
  return (src && !src?.startsWith('url(')) ? `url(${src})` : src;
};
