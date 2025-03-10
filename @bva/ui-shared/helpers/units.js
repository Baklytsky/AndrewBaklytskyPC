/**
 * List of supported CSS units and keywords to search for
 * when parsing a component's dimensions.
 */
export const CSSUnitKeywords = ['%', 'px', 'rem', 'em', 'var(', 'vw', 'vh'];

/**
 * Determines whether or not the provided `value` contains a
 * CSS unit or keyword.
 */
export const hasCSSKeyword = (value) => {
  return CSSUnitKeywords.some((key) => value.includes(key));
};

/**
 * Strips the unit ('px', 'rem', etc.) from a provided `value`.
 * i.e. "25rem" returns "25".
 */
export const stripUnit = (value) => {
  return isNaN(value) ? value.replace(/\D+(?!.)/g, '') : value;
};
/**
 * Removes any numeric characters from a provided value,
 * returning only the unit portion, i.e. %, px, rem, em, vw, etc.
 */
export const getUnit = (value) => {
  return value ? value.toString().replace(/[\d.-]+/g, '') : '';
};

export const formatDimension = (value, unit = 'px') => {
  return isNaN(value) ? value : `${value}${unit}`;
};

export const formatPercent = (value) => {
  return isNaN(value) ? value : `${Math.abs(value) * 100}%`;
};

/**
 * Returns a standard dimension object to be used by components
 * who share a similar sizing configuration options.
 */
export const getDimensions = (value) => {
  const dimension = {
    preset: null,
    size: null,
    width: null,
    height: null,
  };

  if (value) {
    if (typeof value === 'string') {
      dimension[hasCSSKeyword(value) ? 'size' : 'preset'] = value;
    } else if (value.width || value.height || value.w || value.h) {
      dimension.width = value.width || value.w || '';
      dimension.height = value.height || value.h || '';
    }
  }

  return dimension;
};
