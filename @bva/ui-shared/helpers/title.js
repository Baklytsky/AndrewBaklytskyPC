import { getToken } from './getToken';

/**
 * Outputs a title variable by using the component's `as` property.
 * If the `as` property is not provided, defaults to `level`.
 */
export const getTitleVars = (hLevel, as) => {
  //Allow setting a custom font size when `as` isn't a number.
  const tokenName = isNaN(hLevel) ? as : `h${hLevel}`;

  return {
    '--title-font-size': getToken(`typography.fontSize.${tokenName}`),
  };
};
