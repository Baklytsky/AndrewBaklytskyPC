'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resolveConfig = require('../resolveConfig.js');
var tokenVars = require('../helpers/tokenVars.js');

const { theme } = resolveConfig.getCustomConfig();

const _transitionDuration = {
  'fast': '107ms',
  'default': '213ms',
  'medium': '426ms',
  'slow': '852ms',
};

const _transitionFunction = {
  'default': 'ease-in-out',
  'bezier-ease': 'cubic-bezier(.4, .9, .25, 1)',
  'bounce': 'cubic-bezier(.4, .9, .25, 1.5)',
  'bounce-lg': 'cubic-bezier(.4, .9, .25, 2)',
};

const transitionDuration = tokenVars.toVars({
  ..._transitionDuration,
  ...theme?.transition?.duration,
  ...theme?.transitionDuration
}, { prefix: 'transition-duration' });

const transitionFunction = tokenVars.toVars({
  ..._transitionFunction,
  ...theme?.transition?.function,
  ...theme?.transitionFunction
}, { prefix: 'transition-function' });

const transition = {
  duration: transitionDuration,
  function: transitionFunction,
};

exports.transition = transition;
exports.transitionDuration = transitionDuration;
exports.transitionFunction = transitionFunction;
