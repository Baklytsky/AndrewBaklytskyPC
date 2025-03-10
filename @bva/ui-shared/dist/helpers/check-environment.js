'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isClient = (() =>
  typeof window !== 'undefined' || typeof document !== 'undefined')();

exports.isClient = isClient;
