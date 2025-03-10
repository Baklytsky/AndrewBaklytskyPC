
const DEFAULTS = {
  prefix: false,
  separator: '.',
  search: null,
  default: null,
};

/**
 * Taken from: https://stackoverflow.com/a/59787588
 * @param ob Object                 The object to flatten
 * @param prefix String (Optional)  The prefix to add before each key, also used for recursion
 **/
export const flatten = (ob, options = {}, result = null) => {
  result = result || {};
  options = { ...DEFAULTS, ...options }

  // Preserve empty objects and arrays, they are lost otherwise
  if (options.prefix && typeof ob === 'object' && ob !== null && Object.keys(ob).length === 0) {
    result[options.prefix] = Array.isArray(ob) ? [] : {};
    return result;
  }

  const prefix = options.prefix ? options.prefix + options.separator : '';

  for (const i in ob) {
    if (Object.prototype.hasOwnProperty.call(ob, i)) {
      if (typeof ob[i] === 'object' && ob[i] !== null) {
        //Use the current name if the current property matches the default (i.e. "DEFAULT").
        options.prefix = i === options.default ? options.prefix : prefix + i;

        // Recursion on deeper objects
        flatten(ob[i], options, result);
      } else if (options.search) {
        if (i === options.search) {
          result[options.prefix] = ob[i];
        }
      } else {
        result[prefix + i] = ob[i];
      }
    }
  }
  return result;
}

export const isObject = (item) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merges two objects by parsing each nested property.
 */
export const mergeDeep = (target, source) => {
  let output = Object.assign({}, target);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}
