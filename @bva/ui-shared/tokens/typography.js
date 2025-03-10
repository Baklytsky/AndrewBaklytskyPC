import { getCustomConfig } from '../resolveConfig';
import { fluidType } from '../helpers/typography';
import { toVars } from '../helpers/tokenVars';

const { theme } = getCustomConfig();

// Static font sizes.
const _fontSize = {
  'xs': '.6875rem', //11px
  'sm': '.8125rem', //13px
  DEFAULT: '1rem', //16px
  'md': '1.125rem', //18px
  'md20': '1.3125rem', //21px
  'lg': '1.75rem', //28px
  'lg20': '2.3125rem', //37px
  'xl': '3.125rem', //50px
  'xl20': '4.1875rem', //67px
  'xl30': '5.5625rem', //89px
};

//Programatically calculated font sizes based on the current viewport width.
const _fontSizeFluid = {
  'xs-to-sm': fluidType(_fontSize.xs, _fontSize.sm),
  'xs-to-base': fluidType(_fontSize.xs, _fontSize.DEFAULT),
  'sm-to-base': fluidType(_fontSize.sm, _fontSize.DEFAULT),
  'sm-to-md': fluidType(_fontSize.sm, _fontSize.md),
  'base-to-md': fluidType(_fontSize.DEFAULT, _fontSize.md),
  'md-to-md20': fluidType(_fontSize.md, _fontSize.md20),
  'md20-to-lg': fluidType(_fontSize.md20, _fontSize.lg),
};

// Heading font sizes.
const _fontSizeHeading = {
  'h6': fluidType(_fontSize.DEFAULT, _fontSize.md20),
  'h5': fluidType(_fontSize.md, _fontSize.lg),
  'h4': fluidType(_fontSize.md20, _fontSize.lg20),
  'h3': fluidType(_fontSize.lg, _fontSize.xl),
  'h2': fluidType(_fontSize.lg20, _fontSize.xl20),
  'h1': fluidType(_fontSize.xl, _fontSize.xl30),
};

const _fontFamily = {
  'primary': ['canada-type-gibson', 'sans-serif'],
  'secondary': ['input-mono', 'serif'],
};

const _fontWeight = {
  'light': 200,
  'normal': 300,
  'medium': 400,
  'bold': 500,
};

const _lineHeight = {
  DEFAULT: 1,
  'md': 1.15,
  'lg': 1.3,
  'xl': 1.5,
};

const _letterSpacing = {
  'sm': '.04em',
  DEFAULT: '.06em',
  'lg': '.08em',
};

/**
 * Transforms fluid font-size definitions to their static representation.
 */
const formatFontSizes = () => {
  const result = {};

  if (theme?.fontSize) {
    for (const size in theme.fontSize) {
      if (Array.isArray(theme.fontSize[size])) {
        result[size] = fluidType(...theme.fontSize[size]);
      } else if (typeof theme.fontSize[size] === 'object') {
        result[size] = fluidType(
          theme.fontSize[size].min,
          theme.fontSize[size].max,
          theme.fontSize[size].vmin,
          theme.fontSize[size].vmax,
          theme.fontSize[size].unit,
        );
      } else {
        result[size] = theme.fontSize[size];
      }
    }
  }

  return result;
};

export const fontSize = toVars({
  ..._fontSize,
  ..._fontSizeHeading,
  ..._fontSizeFluid,
  ...formatFontSizes()
}, { prefix: 'font-size' });
export const fontFamily = toVars({ ..._fontFamily, ...theme?.fontFamily }, { prefix: 'font-family' });
export const fontWeight = toVars({ ..._fontWeight, ...theme?.fontWeight }, { prefix: 'font-weight' });
export const lineHeight = toVars({ ..._lineHeight, ...theme?.lineHeight }, { prefix: 'line-height' });
export const letterSpacing = toVars({ ..._letterSpacing, ...theme?.letterSpacing }, { prefix: 'letter-spacing' });

export const typography = { fontSize, fontFamily, fontWeight, lineHeight, letterSpacing };
