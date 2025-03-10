#!/usr/bin/env node

'use strict';

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const minimist = require('minimist');

const cwd = process.cwd();
const processArgs = minimist(process.argv);

const DEFAULTS = {
  styles: {
    fileType: '+(css|scss)',
    output: 'styles/components.css',
    context: 'styles/components',
  },
  components: {
    fileType: '+(tsx|jsx|vue)',
    output: 'index.js',
    context: 'src/components',
  }
};

const buildType = processArgs['build'] || 'components';
const sharedPackageName = 'ui-shared';

function createIndexFiles(options = {}) {
  //Default to detecting context when invoked from the `ui-shared` package.
  options.build = options.build || (cwd.includes(sharedPackageName) ? 'styles' : buildType);

  const isStyles = options.build === 'styles';
  const fileType = processArgs['fileType'] || DEFAULTS[options.build].fileType;
  const outputFile = processArgs['output'] || DEFAULTS[options.build].output;
  const context = processArgs['context'] || DEFAULTS[options.build].context;

  const contextCWD = isStyles ? path.resolve(cwd, `../${sharedPackageName}`) : cwd;
  const outputPath = path.resolve(contextCWD, outputFile);

  _saveIndexFile(outputPath, _generateContent({
    isStyles,
    fileType,
    context,
    cwd: contextCWD,
  }).fileContent);
}

function _generateContent(options = {}) {
  const exportsArray = [];
  const prefix = processArgs['prefix'] || 'Ra';
  const contextPath = path.resolve(options.cwd, options.context);
  const componentRegEx = new RegExp(`.*/(${prefix}.+).${options.fileType}`);

  const componentsPaths = glob.sync(`*/**/${prefix}*.${options.fileType}`, {
    cwd: contextPath,
    ignore: ['*/**/*.stories.*', '*/**/*.spec.*'],
  });

  for (const currentPath of componentsPaths) {
    const componentName = currentPath.replace(componentRegEx, '$1');
    let exportLine;

    if (options.isStyles) {
      exportLine = `@import "./components/${currentPath}";`;
    } else {
      exportLine = `export { default as ${componentName} } from './src/components/${currentPath}';`;
    }

    exportsArray.push(exportLine);
  }

  const fileContent =
    '/* DO NOT EDIT MANUALLY */\n' +
    '/* Generated using the `br-index` command (scripts/index-components.js). */\n' +
    exportsArray.join('\n') +
    '\n';

  return {
    fileContent,
  };
}

function _saveIndexFile(outputPath, content) {
  fs.writeFileSync(outputPath, content);

  process.on('exit', code => {
    if (code === 0) {
      console.log('\x1b[36m%s\x1b[0m', `\n✓ Indexing completed. File saved at: ${outputPath}\n`);
    }
  });
}

if (require.main === module) {
  createIndexFiles();
}

module.exports = {
  createIndexFiles,
};
