const parseTokenResult = require('./lib/parseTokenResult');

const processDeclaration = (declaration) => {
  if (!declaration.value) {
    return false;
  }

  declaration.value = parseTokenResult(declaration.value);
};

module.exports = {
  processDeclaration,
};
