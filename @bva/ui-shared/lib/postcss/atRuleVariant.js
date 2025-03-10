const postcss = require('postcss');
const vars = require('postcss-simple-vars');
const parseTokenResult = require('./lib/parseTokenResult');
const { flatten } = require('@bva/ui-shared/dist/helpers');

const SEPARATOR = /\s+in\s+/;

const tokenize = (str) => {
  return postcss.list.comma(str).map(str => str.replace(/^\$/, ''));
}

const parseParams = (params) => {
  let [names, values] = params.split(SEPARATOR).map(tokenize);

  values = values.map(value => {
    const parsedValues = parseTokenResult(value, false);

    const match = value.match(/^\((.*)\)$/);

    if (match) {
      return postcss.list.comma(match[1]);
    } else if (parsedValues) {
      return parsedValues;
    }

    return value;
  });

  return {
    values,
    names,
    indexName: names[values.length],
  };
}

const replaceEscaped = (str) => {
  if (str) {
    return str.replace(/#/g, '$');
  }

  return str;
}

const getArrayVariables = (params, values, paramIndex) => {
  const variables = {};

  if (params.names.length > 1) {
    params.names.forEach((name, j) => {
      variables[name] = values[j];
    });
  } else {
    variables[params.names[0]] = values[paramIndex];
  }

  if (params.indexName) {
    variables[params.indexName] = paramIndex;
  }

  return variables;
};

const getKeyedVariables = (params, values, key) => {
  let variables = {};

  params.names.forEach((name, j) => {
    if (j === 0) {
      variables[name] = key;
    } else {
      if (typeof values[key] === 'object') {
        variables = { ...variables, ...flatten(values[key], { prefix: name, separator: '-' }) }
      } else {
        variables[name] = values[key];
      }
    }
  });

  return variables;
};

const processArrayRules = (rule, values, params) => {
  values.forEach((_, i) => {
    renderRules(rule, getArrayVariables(params, values, i));
  });
};

const processKeyedRules = (rule, values, params) => {
  Object.keys(values).forEach((key) => {
    renderRules(rule, getKeyedVariables(params, values, key));
  });
};

const renderRules = (rule, variables) => {
  rule.nodes.forEach(node => {
    //Updates special characters in the loop's selector
    //so that the variable replacement can kick-in.
    node.selector = replaceEscaped(node.selector);

    const proxy = postcss.rule({ nodes: [node] });
    const { root } = postcss([vars({ only: variables })]).process(proxy);

    rule.parent.insertBefore(rule, root.nodes[0].nodes[0]);
  });
};

const processValues = (rule, params) => {
  params.values.forEach((currentValue, i) => {
    if (Array.isArray(currentValue)) {
      processArrayRules(rule, currentValue, params);
    } else if (typeof currentValue === 'object') {
      processKeyedRules(rule, currentValue, params);
    } else {
      renderRules(rule, getArrayVariables(params, params.values, i));
    }
  });
}

/**
 * Expands a `@bedrock` rule into a list of Custom CSS properties.
 * Each property is mapped from the available `tokens` object.
 */
const processAtRule = (atRule) => {
  processValues(atRule, parseParams(atRule.params));

  atRule.remove();
};

module.exports = {
  processAtRule,
};
