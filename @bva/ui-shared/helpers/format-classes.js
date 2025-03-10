
export const formatModifier = (base = 'set', modifier, prefix) => {
  return modifier
    ? `${base}--${prefix ? `${prefix}-` : ''}${modifier}`
    : '';
};

export const getViewportModifiers = (type, value, valueMD) => {
  if (value === valueMD || !valueMD) {
    return `set--${type}-${value}`;
  } else {
    //Set separate flags when there are per-viewport configurations.
    return `set--${type}-${value}-sm set--${type}-${valueMD}-md`;
  }
};

export const getBoundarySizeClasses = (value) => {
  return value ? [`max-width--${value}`] : [];
};

/**
 * REFACTOR: These need to be converted to leverage a generic `getViewportFlags` method.
 */
export const getForegroundClasses = (value, valueMD) => {
  return {
    'set--has-foreground': !!value,
    'set--has-foreground-md': !value && !!valueMD,
  };
};

export const getBackgroundClasses = (value, valueMD) => {
  return {
    'set--has-background': !!value,
    'set--has-background-md': !value && !!valueMD,
  };
};

/**
 * Return a common details location helper class.
 * Example: "set--details-before", "set--details-after", etc.
 * Use this class on a per-component basis to alter their layout using CSS.
 */
export const getDetailsLocationClasses = (value, valueMD) => {
  return getViewportModifiers('details', value, valueMD);
};

/**
 * Return a common vertical alignment helper class.
 * Example: "set--v-align-top", "set--v-align-center", etc.
 * Use this class on a per-component basis to vertically position content using CSS.
 */
export const getVerticalAlignClasses = (value, valueMD) => {
  return getViewportModifiers('v-align', value, valueMD);
};

/**
 * Return a common horizontal alignment helper class.
 * Example: "set--h-align-left", "set--h-align-center", etc.
 * Use this class on a per-component basis to horizontally position content using CSS.
 */
export const getHorizontalAlignClasses = (value, valueMD) => {
  return getViewportModifiers('h-align', value, valueMD);
};

