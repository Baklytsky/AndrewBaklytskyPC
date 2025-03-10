'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var input = require('./input.js');

const getSafeMax = (max) => {
  return parseInt(!max || max <= 0 ? 1 : max, 10);
};

/**
 * Returns the score constrained to a provided `max` and a `min` of 0.
 */
const getScore = (score, max) => {
  const _max = getSafeMax(max);
  const _score = input.getConstrainedValue(score, 0, _max);

  return {
    value: _score,
    decimal: _score % 1,
    max: _max,
    ceil: Math.ceil(_score),
    floor: Math.floor(_score),
    round: Math.round(_score),
  };
};

const getScoreCoverage = (index, score, max) => {
  const _score = getScore(score, max);

  return index === _score.ceil && _score.decimal > 0 ? _score.decimal : 1;
};

const getScoreRemainder = (score, max) => {
  const _score = getScore(score, max);

  return _score.max - _score.ceil;
};

exports.getSafeMax = getSafeMax;
exports.getScore = getScore;
exports.getScoreCoverage = getScoreCoverage;
exports.getScoreRemainder = getScoreRemainder;
