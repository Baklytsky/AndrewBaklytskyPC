
export const getRespectMediaRatio = (aspectRatio) => {
  return aspectRatio === 'respect-media';
};

export const getAspectRatioClasses = (aspectRatio) => {
  return aspectRatio ? `set--aspect-ratio-${aspectRatio}` : '';
};

export const getHasSrc = (src) => {
  if (src) {
    if (typeof src === 'string') {
      return true;
    }

    if (Array.isArray(src) && src.length) {
      return Object.prototype.hasOwnProperty.call(src[0], 'src');
    } else {
      return Object.prototype.hasOwnProperty.call(src, 'src')
    }
  }

  return false;
};
