const { processAtRule: bedrock } = require('./atRuleBedrock');
const { processAtRule: breakpoint } = require('./atRuleBreakpoint');
const { processAtRule: variant } = require('./atRuleVariant');
const { processDeclaration: token } = require('./declarationToken');
const { processAtRule: mediaToken } = require('./atRuleMediaToken');

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = () => {
  return {
    postcssPlugin: 'bedrock',
    AtRule: {
      bedrock,
      breakpoint,
      variant,
      media(atRule) {
        mediaToken(atRule);
        breakpoint(atRule);
      },
      'custom-media': mediaToken,
    },
    Declaration: {
      '*': token,
    },
    /*
    Root (root, postcss) {
      // Transform CSS AST here
    }
    */

    /*
    Declaration (decl, postcss) {
      // The faster way to find Declaration node
    }
    */

    /*
    Declaration: {
      color: (decl, postcss) {
        // The fastest way find Declaration node if you know property name
      }
    }
    */
  }
}

module.exports.postcss = true