'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resolveConfig = require('../resolveConfig.js');
var tokenVars = require('../helpers/tokenVars.js');

const { theme } = resolveConfig.getCustomConfig();

const _spacing = {
  DEFAULT: '1.25rem',
  '3xs': '.125rem',
  '2xs': '.25rem',
  'xs': '.5rem',
  'sm': '1rem',
  'md': '1.5rem',
  'lg': '2rem',
  'xl': '2.5rem',
  '2xl': '4rem',
  '3xl': '5rem',
};

const _maxWidth = {
  min : '20rem', // 320
  tiny : '30rem', // 480
  small : '48rem', // 768
  xsmall : '56rem', // 896
  medium : '64rem', // 1024
  xmedium : '77.5rem', // 1240
  large : '90rem', // 1440
  xlarge : '102.5rem', // 1640
  max : '160rem' // 2560
};

const spacing = tokenVars.toVars({ ..._spacing, ...theme?.spacing }, { prefix: 'spacing' });

const maxWidth = tokenVars.toVars({ ..._maxWidth, ...theme?.maxWidth }, { prefix: 'max-width' });

const layout = { spacing, maxWidth };

exports.layout = layout;
exports.maxWidth = maxWidth;
exports.spacing = spacing;
