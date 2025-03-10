/**
 * Resizes a Shopify image on the frontend.
 * Expects `size` to be formatted like the Liquid filter, e.g. '450x' or 300x200'.
 * @param {*} src
 * @param {*} size
 */
export const getSizedImageFromUrl = (src, size) => {
  const currentSizeRegEx =
    /_(pico|icon|thumb|small|compact|medium|large|grande|original|\d{1,4}x(\d{1,4})?|master)+\./g;
  const extensionRegEx = /\.jpg|\.png|\.gif|\.jpeg|\.webp/g;

  // remove any current image size then add the new image size
  return src
    .replace(currentSizeRegEx, ".")
    .replace(extensionRegEx, (match) => `_${size}${match}`);
};
