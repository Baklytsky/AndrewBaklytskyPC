'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resolveConfig = require('../resolveConfig.js');
var tokenVars = require('../helpers/tokenVars.js');
var objects = require('../helpers/objects.js');

const { theme } = resolveConfig.getCustomConfig();

/**
 * Base color variables.
 * Body and text defaults.
 */
const _colors = {
  'black': '#000',
  'white': '#FFF',
  'highlight': '#FFFCFA',
  'contrast': '#534D4D',
  'body': 'var(--c-white)',
  'panel': 'var(--c-body)',
  'copy': {
    DEFAULT: 'var(--c-black)',
    overlay: 'var(--c-copy)',
    muted: 'var(--c-gray-800)',
    disabled: 'var(--c-gray-500)',
  },
  'border': {
    primary: 'var(--c-gray-300)',
    secondary: 'var(--c-gray-600)',
  },
  'link': {
    DEFAULT: 'var(--c-primary)',
    interact: 'var(--c-primary-interact)',
  },
  'focus': {
    outline: 'var(--c-danger)',
  },
};

const _grayscale = {
  gray: {
    100: '#E6E3E1',
    200: '#CCCAC8',
    300: '#B3B0AF',
    400: '#999796',
    500: '#807E7D',
    600: '#B2B0AC',
    700: '#8A8784',
    800: '#87847D',
    900: 'var(--c-contrast)',
  }
};

/**
 * Use these for driving attention to the main tasks of the app.
 * Works best on major interactive elements of a page.
 */
const _uiColors = {
  'primary': {
    DEFAULT: '#576041',
    interact: '#989F85',
    contrast: 'var(--c-white)',
  },
  'secondary': {
    DEFAULT: '#C4952B',
    interact: '#EFD089',
    contrast: 'var(--c-white)',
  },
  'tertiary': {
    DEFAULT: 'var(--c-white)',
    interact: '#87847D',
    contrast: 'var(--c-contrast)',
  },
  'success': {
    DEFAULT: '#547857',
    interact: '#67936b',
    contrast: 'var(--c-white)',
  },
  'warning': {
    DEFAULT: '#FCD162',
    interact: '#fcd87a',
    contrast: '#000',
  },
  'danger': {
    DEFAULT: '#BF5830',
    interact: '#d16d47',
    contrast: 'var(--c-white)',
  },
};

const baseColors = tokenVars.toVars({ ..._colors, ...theme?.colors, }, { prefix: 'c' });
const grayscale = tokenVars.toVars({ ..._grayscale, ...theme?.grayscale, }, { prefix: 'c' });
const UIColors = tokenVars.toVars({ ..._uiColors, ...theme?.UIColors, }, { prefix: 'c' });

const colors = { ...UIColors, ...grayscale, ...baseColors, };
//This is a flattened version of the `colors` object using only the nested `var` props.
const colorVars = objects.flatten(colors, { separator: '-', search: 'var', default: 'DEFAULT', });

const colorNames = Object.keys(colors);
const UIColorNames = Object.keys(UIColors);

exports.UIColorNames = UIColorNames;
exports.UIColors = UIColors;
exports.baseColors = baseColors;
exports.colorNames = colorNames;
exports.colorVars = colorVars;
exports.colors = colors;
exports.grayscale = grayscale;
