'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const deprecationWarning = (componentName, msg) => {
  process.env.NODE_ENV !== 'production' &&
    process.env.APP_NO_DEPRECATED_WARNINGS !== 'no-deprecated-warnings' &&
    console.warn(`[BedrockUI][${componentName}] ${msg}`);
};

exports.deprecationWarning = deprecationWarning;
