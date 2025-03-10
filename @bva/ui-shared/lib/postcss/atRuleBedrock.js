const tokens = require('@bva/ui-shared/dist/tokens');
const { getDeclarations } = require('./lib/renderAtRule');

/**
 * Expands a `@bedrock` rule into a list of Custom CSS properties.
 * Each property is mapped from the available `tokens` object.
 */
const processAtRule = (atRule, postcss) => {
  //Bail early if the current rule param is not an existing token.
  if (!tokens[atRule.params]) {
    return false;
  }

  const declarations = getDeclarations(tokens[atRule.params]);

  if (atRule.parent?.selector) {
    atRule.after(declarations);
  } else {
    //Create a `:root` node if @bedrock rule is used outside of a node.
    const newNode = postcss.rule({selector: ':root', source: atRule.source});

    newNode.prepend(declarations);

    atRule.after(newNode);
  }

  atRule.remove();
};

module.exports = {
  processAtRule,
};
