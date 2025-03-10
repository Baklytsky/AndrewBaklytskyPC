import { getToken } from './getToken';

export const getColorToken = (colorName) => {
  if (colorName) {
    const matchingColor =
      getToken(`colors.${colorName}.DEFAULT`, 'var') ||
      getToken(`colors.${colorName}`, 'var');

    return matchingColor || colorName;
  }

  return null;
};
