const parseTokenResult = require('./lib/parseTokenResult');

const processAtRule = (atRule) => {
  if (!atRule.params.includes('token(')) {
    return false;
  }

  atRule.params = parseTokenResult(atRule.params);
};

module.exports = {
  processAtRule,
};
