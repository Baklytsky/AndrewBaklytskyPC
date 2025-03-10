/**
 * Validates a `prop` to confirm that its viewport structure matches
 * the items in `validationArray`.
 * Supports:
 * String,
 * Object of format: `{ '<breakpointName>': 'propValue', ...N }`,
 * Array of format: `[ {'<breakpointName>': 'propValue'}, ...N ]`.
 */
export const validateViewportProp = (prop, validationArray = []) => {
  const validate = (value) => {
    return validationArray.includes(value);
  };

  const validateObject = (obj) => {
    return Object.keys(obj).every((key) => validate(obj[key]));
  };

  if (typeof prop === 'string') {
    return validate(prop);
  } else if (Array.isArray(prop)) {
    return prop.every(validateObject);
  } else {
    return validateObject(prop);
  }
};
