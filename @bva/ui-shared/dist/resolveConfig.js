'use strict';

const { lilconfigSync } = require('lilconfig');

const getCustomConfig = () => {
  try {
    const result = lilconfigSync('bedrock').search();

    return result.config;
  } catch(e) {
    return {};
  }
};

exports.getCustomConfig = getCustomConfig;
