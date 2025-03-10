'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resolveConfig = require('../resolveConfig.js');
var tokenVars = require('../helpers/tokenVars.js');

const { theme } = resolveConfig.getCustomConfig();

const _zindex = {
  'above-modal': 6,
  'modal': 5,
  'above-overlay': 4,
  'overlay': 3,
  'above-base': 2,
  'base': 1,
  'reset': 0,
  'negative': -1
};

const zindex = tokenVars.toVars({ ..._zindex, ...theme?.zindex }, { prefix: 'z-index' });

exports.zindex = zindex;
