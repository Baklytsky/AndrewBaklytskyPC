import { icons } from '../tokens/icons';

export const isExistingIcon =(icon) => {
  if (typeof icon === 'string') {
    return !!icons[icon.trim()];
  }

  return false;
};

export const getViewBox = (icon, override) => {
  return override || (isExistingIcon(icon) ? (icons[icon].viewBox) : undefined);
};

export const getPaths = (icon) => {
  if (isExistingIcon(icon)) {
    return icons[icon].paths;
  } else {
    return Array.isArray(icon) ? icon : [icon];
  }
};

export const getFillPathURL = (coverage = 1) => {
  const fillPathUrl = (index) => `url(#${index})`;

  return coverage === 1 ? '' : fillPathUrl(coverage);
};

export const getSymbol = (icon = '') => {
  if (icon.startsWith('#') && !isExistingIcon(icon)) {
    return icon;
  }

  return undefined;
};
