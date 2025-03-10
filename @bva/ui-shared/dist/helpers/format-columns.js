'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var breakpoints = require('../tokens/breakpoints.js');
var units = require('./units.js');

const getFormattedColumns = (config, base = 12) => {
  const units$1 = {};
  const auto = {};

  Object.keys(config).map(key => {
    const isValidConfig = breakpoints.breakpoints.px[key] || key === 'size';

    if (isValidConfig) {
      if (isNaN(config[key])) {
        if (config[key] === 'auto') {
          auto[key] = config[key];
        } else {
          units$1[key] = config[key];
        }
      } else if (config[key]) {
        const portion = config[key] / base;

        units$1[key] = units.formatPercent(portion);
      }
    }
  });

  return {
    units: units$1,
    auto
  };
};

exports.getFormattedColumns = getFormattedColumns;
